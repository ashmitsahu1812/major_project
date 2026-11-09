import { Router } from 'express';
import {
  getDashboard,
  createSession,
  endSession,
  getLiveAttendance,
  manualOverride,
  getStudentRisk,
} from '../controllers/faculty.controller.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/rbac.js';

const router = Router();

router.use(authenticate, authorize('FACULTY', 'ADMIN'));

router.get('/dashboard', getDashboard);
router.post('/sessions', createSession);
router.post('/sessions/:id/end', endSession);
router.get('/sessions/:id/live', getLiveAttendance);
router.post('/override', manualOverride);
router.get('/student-risk', getStudentRisk);

export default router;

