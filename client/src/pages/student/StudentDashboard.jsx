import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  QrCode,
  Calendar,
  ArrowRight,
  Radio,
  BookOpen,
  Info,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AttendanceDonutChart from "../../components/charts/AttendanceDonutChart";
import { formatDateTime } from "../../utils/helpers";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get("/student/dashboard");
        setData(res.data);
      } catch {
        toast.error("Failed to load attendance statistics");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Retrieving attendance record..." />;
  }

  const { overallStats, courseStats, recentRecords, hasActiveSession } = data || {};
  const hasOverallData = (overallStats?.totalSessions || 0) > 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Active Session Banner */}
      {hasActiveSession && (
        <div className="card-hover flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-brand-500/30 bg-brand-500/5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-brand-500/15 border border-brand-500/30 text-brand-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Lecture In Progress — Live Roll Call</span>
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">
                An active dynamic QR code is broadcasting for your enrolled class.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/student/scan-attend")}
            className="btn-primary flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Now</span>
          </button>
        </div>
      )}

      {/* Risk Warning */}
      {overallStats?.isAtRisk && (
        <div className="card-hover p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-300">
                Attention Required
              </p>
              <p className="text-xs text-rose-200/80 mt-1">
                Your aggregate attendance is{" "}
                <strong className="text-rose-400">{overallStats?.percentage}%</strong>, strictly below the
                mandatory 75% threshold. Please meet with your academic advisor.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Attendance"
          value={hasOverallData ? `${overallStats.percentage}%` : "—"}
          subtitle={
            !hasOverallData
              ? "No completed lectures yet"
              : overallStats?.isAtRisk
                ? "Below the 75% threshold"
                : "Compliant"
          }
          icon={CheckCircle}
          color={
            !hasOverallData ? "brand" : overallStats?.isAtRisk ? "danger" : "success"
          }
        />
        <StatCard
          title="Classes Attended"
          value={overallStats?.present || 0}
          subtitle={`Out of ${overallStats?.totalSessions || 0} total held`}
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Late Arrivals"
          value={overallStats?.late || 0}
          subtitle="Partial attendance logged"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Enrolled Courses"
          value={courseStats?.length || 0}
          subtitle="Active curriculum subjects"
          icon={BookOpen}
          color="info"
        />
      </div>

      {/* Course Breakdown + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-hover space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-400" />
              Subject Turnout
            </h3>
            <span className="text-xs text-slate-400">
              Minimum required: 75% in every subject
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courseStats?.map((c) => {
              const hasLectures = c.totalSessions > 0;
              const isAtRisk = hasLectures && c.percentage < 75;
              return (
                <div
                  key={c.courseId}
                  className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30">
                        {c.code}
                      </span>
                      <Badge
                        variant={
                          !hasLectures ? "slate" : isAtRisk ? "danger" : "success"
                        }
                        size="sm"
                      >
                        {hasLectures ? `${c.percentage}%` : "No data"}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2.5 truncate">{c.name}</h4>
                    <p className="text-xs text-slate-400">Faculty: {c.facultyName}</p>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        Attended: {c.present + c.late}/{c.totalSessions}
                      </span>
                      <span
                        className={
                          !hasLectures
                            ? "text-slate-500"
                            : isAtRisk
                              ? "text-rose-400 font-bold"
                              : "text-emerald-400"
                        }
                      >
                        {hasLectures ? `${c.percentage}%` : "—"}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={
                          isAtRisk
                            ? "bg-rose-500"
                            : hasLectures
                              ? "bg-emerald-500"
                              : "bg-slate-600"
                        }
                        style={{
                          width: hasLectures ? `${Math.min(c.percentage, 100)}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Composition Donut */}
        <div className="card rounded-2xl">
          <div className="p-5 border-b border-slate-800/60">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" />
              Attendance Composition
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Breakdown of how each lecture was verified.
            </p>
          </div>
          <div className="h-56 flex items-center justify-center">
            <AttendanceDonutChart data={courseStats || []} />
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            Recent Attendance Log
          </h3>
          <Link
            to="/student/attendance-history"
            className="text-xs font-semibold text-brand-400 hover:underline"
          >
            View full history
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-800/60">
          {recentRecords && recentRecords.length > 0 ? (
            recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="py-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-950/40">
                    <QrCode className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {rec.session.course.code} — {rec.session.course.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateTime(rec.timestamp)} • {rec.method}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    rec.status === "PRESENT"
                      ? "success"
                      : rec.status === "LATE"
                        ? "warning"
                        : "danger"
                  }
                  size="sm"
                >
                  {rec.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No attendance activity recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
