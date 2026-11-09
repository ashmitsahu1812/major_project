import prisma from '../config/db.js';
import { validateQrToken } from '../services/qr.service.js';
import { runAllChecks, checkDeviceFingerprint, checkRapidDuplicate } from '../services/antiProxy.service.js';
import { getStudentAttendanceStats } from '../services/attendance.service.js';
import { getClientIp, getDeviceInfo } from '../utils/request.js';
import { isValidUuid, parseOptionalFloat } from '../utils/validation.js';

/**
 * Student dashboard: overall and per-course attendance, active lectures and
 * recent activity.
 */
export async function getDashboard(req, res, next) {
  try {
    const studentId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            faculty: { select: { id: true, name: true, email: true } },
            sessions: {
              where: { endTime: null },
              select: { id: true, sessionType: true, startTime: true },
            },
          },
        },
      },
    });

    const courseStats = await Promise.all(
      enrollments.map(async (enr) => {
        const stats = await getStudentAttendanceStats(studentId, enr.courseId);
        return {
          courseId: enr.course.id,
          code: enr.course.code,
          name: enr.course.name,
          department: enr.course.department,
          facultyName: enr.course.faculty?.name || 'Faculty',
          activeSessionId: enr.course.sessions[0]?.id || null,
          activeSession: enr.course.sessions.length > 0 ? enr.course.sessions[0] : null,
          ...stats,
        };
      })
    );

    const [overallStats, recentRecords] = await Promise.all([
      getStudentAttendanceStats(studentId),
      prisma.attendanceRecord.findMany({
        where: { studentId },
        take: 8,
        orderBy: { timestamp: 'desc' },
        include: {
          session: { include: { course: { select: { code: true, name: true } } } },
        },
      }),
    ]);

    const activeSessions = enrollments.flatMap((e) =>
      e.course.sessions.map((s) => ({
        id: s.id,
        courseId: e.course.id,
        courseCode: e.course.code,
        courseName: e.course.name,
        sessionType: s.sessionType,
        startTime: s.startTime,
      }))
    );

    return res.json({
      success: true,
      overallStats,
      courseStats,
      recentRecords,
      hasActiveSession: activeSessions.length > 0,
      activeSessions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record a proxy incident and flagged attendance in one transaction.
 */
async function recordProxyIncident({ sessionId, studentId, reasons, ip, deviceInfo, method }) {
  const reasonText = reasons.join('; ');

  const [alert, record] = await prisma.$transaction([
    prisma.proxyAlert.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: { reason: reasonText, resolved: false, flaggedAt: new Date() },
      create: { sessionId, studentId, reason: reasonText, resolved: false },
      include: {
        student: { select: { id: true, name: true, rollNumber: true, email: true, department: true } },
        session: { include: { course: { select: { code: true, name: true } } } },
      },
    }),
    prisma.attendanceRecord.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: { status: 'FLAGGED_PROXY', method, ipAddress: ip, deviceInfo },
      create: { sessionId, studentId, status: 'FLAGGED_PROXY', method, ipAddress: ip, deviceInfo },
    }),
  ]);

  return { alert, record, reasonText };
}

/**
 * Scan the rolling QR token, then run geofence, device and network checks.
 */
export async function scanQR(req, res, next) {
  try {
    const studentId = req.user.id;
    const { qrToken } = req.body;
    const ip = getClientIp(req);
    const deviceInfo = getDeviceInfo(req);

    if (typeof qrToken !== 'string' || qrToken.length === 0) {
      return res.status(400).json({ success: false, message: 'QR token payload is required' });
    }

    const qrValidation = validateQrToken(qrToken);
    if (!qrValidation.valid) {
      return res.status(400).json({
        success: false,
        message: qrValidation.reason || 'Invalid or expired QR code token',
        isProxyRisk: true,
      });
    }

    const sessionId = qrValidation.sessionId;

    const session = await prisma.lectureSession.findUnique({
      where: { id: sessionId },
      include: {
        course: { include: { enrollments: { where: { studentId }, select: { id: true } } } },
      },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Lecture session not found' });
    }
    if (session.endTime) {
      return res.status(400).json({ success: false, message: 'This lecture session has ended' });
    }
    if (session.course.enrollments.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course',
      });
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: { sessionId_studentId: { sessionId, studentId } },
    });

    if (existing && (existing.status === 'PRESENT' || existing.status === 'LATE')) {
      return res.status(409).json({
        success: false,
        message: 'Attendance is already recorded for this lecture',
        record: existing,
      });
    }

    const proxyCheck = await runAllChecks({
      sessionId,
      studentId,
      studentLat: parseOptionalFloat(req.body.latitude),
      studentLng: parseOptionalFloat(req.body.longitude),
      sessionLat: session.latitude,
      sessionLng: session.longitude,
      radius: session.radiusMeters || 50,
      ip,
      deviceInfo,
    });

    if (!proxyCheck.passed) {
      const { alert, record, reasonText } = await recordProxyIncident({
        sessionId,
        studentId,
        reasons: proxyCheck.reasons,
        ip,
        deviceInfo,
        method: 'QR_CODE',
      });

      const io = req.app.get('io');
      if (io) {
        io.to('admin-room').emit('proxy:alert', { alert, sessionId });
        io.to(`session:${sessionId}`).emit('proxy:alert', {
          alert,
          reason: reasonText,
          studentId,
          sessionId,
        });
      }

      return res.status(403).json({
        success: false,
        message: `Anti-Proxy Security Violation Detected: ${reasonText}`,
        isProxyRisk: true,
        reasons: proxyCheck.reasons,
        record,
      });
    }

    const record = await prisma.attendanceRecord.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: {
        status: 'PRESENT',
        method: 'QR_CODE',
        ipAddress: ip,
        deviceInfo,
        timestamp: new Date(),
      },
      create: {
        sessionId,
        studentId,
        status: 'PRESENT',
        method: 'QR_CODE',
        ipAddress: ip,
        deviceInfo,
      },
      include: { student: { select: { id: true, name: true, rollNumber: true } } },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`session:${sessionId}`).emit('attendance:new', { record });
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance marked successfully',
      record,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Biometric-style verification from the HTML5 canvas capture.
 *
 * NOTE: this project simulates facial matching (no biometric model is shipped).
 * Device and burst checks still run so the endpoint cannot be used as an
 * unchecked bypass from a replayed device.
 */
export async function faceVerify(req, res, next) {
  try {
    const studentId = req.user.id;
    const { sessionId, faceDataUrl } = req.body;
    const ip = getClientIp(req);
    const deviceInfo = getDeviceInfo(req);

    if (!isValidUuid(sessionId)) {
      return res.status(400).json({ success: false, message: 'A valid session ID is required' });
    }
    if (typeof faceDataUrl !== 'string' || faceDataUrl.length < 32) {
      return res.status(400).json({ success: false, message: 'A captured face image is required' });
    }
    if (
      faceDataUrl.length > 3_000_000 ||
      !/^data:image\/(jpeg|jpg|png|webp);base64,/.test(faceDataUrl)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid face image payload' });
    }

    const session = await prisma.lectureSession.findUnique({
      where: { id: sessionId },
      include: {
        course: { include: { enrollments: { where: { studentId }, select: { id: true } } } },
      },
    });

    if (!session || session.endTime) {
      return res.status(400).json({ success: false, message: 'Active lecture session not found' });
    }
    if (session.course.enrollments.length === 0) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: { sessionId_studentId: { sessionId, studentId } },
    });

    if (existing && (existing.status === 'PRESENT' || existing.status === 'LATE')) {
      return res.status(409).json({
        success: false,
        message: 'Attendance is already verified for this lecture',
      });
    }

    const reasons = [];
    const [deviceResult, rapidResult] = await Promise.all([
      checkDeviceFingerprint(deviceInfo, sessionId, studentId),
      checkRapidDuplicate(ip, deviceInfo, sessionId, studentId),
    ]);
    if (!deviceResult.passed && deviceResult.reason) reasons.push(deviceResult.reason);
    if (!rapidResult.passed && rapidResult.reason) reasons.push(rapidResult.reason);

    if (reasons.length > 0) {
      const { alert, reasonText } = await recordProxyIncident({
        sessionId,
        studentId,
        reasons,
        ip,
        deviceInfo,
        method: 'FACIAL_REC',
      });

      const io = req.app.get('io');
      if (io) {
        io.to('admin-room').emit('proxy:alert', { alert, sessionId });
        io.to(`session:${sessionId}`).emit('proxy:alert', {
          alert,
          reason: reasonText,
          studentId,
          sessionId,
        });
      }

      return res.status(403).json({
        success: false,
        message: `Biometric verification blocked: ${reasonText}`,
        isProxyRisk: true,
        reasons,
      });
    }

    const record = await prisma.attendanceRecord.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: {
        status: 'PRESENT',
        method: 'FACIAL_REC',
        ipAddress: ip,
        deviceInfo,
        timestamp: new Date(),
      },
      create: {
        sessionId,
        studentId,
        status: 'PRESENT',
        method: 'FACIAL_REC',
        ipAddress: ip,
        deviceInfo,
      },
      include: { student: { select: { id: true, name: true, rollNumber: true } } },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`session:${sessionId}`).emit('attendance:new', { record });
    }

    return res.json({
      success: true,
      message: 'Biometric face match verified',
      record,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Full attendance history for the signed-in student.
 */
export async function getAttendanceHistory(req, res, next) {
  try {
    const studentId = req.user.id;
    const { courseId } = req.query;

    if (courseId && !isValidUuid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID' });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        ...(courseId && { session: { courseId } }),
      },
      orderBy: { timestamp: 'desc' },
      take: 500,
      include: {
        session: {
          include: { course: { select: { code: true, name: true, department: true } } },
        },
      },
    });

    return res.json({ success: true, records });
  } catch (error) {
    next(error);
  }
}
