import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  Radio,
  AlertTriangle,
  BookOpen,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  CircleCheckBig,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDateTime } from "../../utils/helpers";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/faculty/dashboard");
        setData(res.data);
      } catch {
        toast.error("Failed to load faculty portal data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <LoadingSpinner size="lg" text="Loading faculty classroom metrics..." />
      </div>
    );
  }

  const { stats, courses, activeSessions } = data || {};

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Faculty Lecture Terminal
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">
            Classroom management, automated rolling QR launch, and student risk tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="brand" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse mr-1.5" />
            Live Feed
          </Badge>
          <button
            onClick={() => navigate("/faculty/launch-session")}
            className="btn-primary flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            <span>Launch New Session</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Courses"
          value={stats?.totalCourses || 0}
          subtitle="Curriculum subjects"
          icon={BookOpen}
          color="brand"
        />
        <StatCard
          title="Active Live Sessions"
          value={stats?.activeSessionsCount || 0}
          subtitle="Broadcasting QR tokens"
          icon={Radio}
          color="success"
        />
        <StatCard
          title="Average Turnout"
          value={`${stats?.averageAttendance || 0}%`}
          subtitle="Across all assigned lectures"
          icon={Users}
          color="info"
        />
        <StatCard
          title="Students At Risk"
          value={stats?.flaggedStudentsCount || 0}
          subtitle="Below 75% threshold"
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {/* Active Live Sessions */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Live Sessions
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {activeSessions?.length || 0} Session(s) Active
          </span>
        </div>

        {activeSessions && activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="card-hover flex flex-col justify-between space-y-4 p-5 sm:p-6"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30">
                          {session.course.code}
                        </span>
                        <Badge variant={session.sessionType === "ONLINE" ? "info" : "slate"} size="sm">
                          {session.sessionType}
                        </Badge>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2.5">{session.course.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {session.sessionType} • Started {formatDateTime(session.startTime)}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500 rounded-full mr-1.5" />
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">
                      {session._count?.records || 0}
                    </span>{" "}
                    verified check-ins
                  </div>
                  <button
                    onClick={() => navigate(`/faculty/live-attendance?sessionId=${session.id}`)}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-brand-900/20 active:scale-[0.98]"
                  >
                    <span>View Feed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 text-center space-y-3">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No active lecture sessions right now.</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Launch a session to start rolling dynamic QR attendance and proctoring.
            </p>
            <button
              onClick={() => navigate("/faculty/launch-session")}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Launch Session
            </button>
          </div>
        )}
      </div>

      {/* Course Catalog */}
      <Card title="Your Teaching Courses" subtitle="Course catalog with enrollment counts" icon={BookOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses?.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30">
                  {c.code}
                </span>
                <span className="text-[11px] text-slate-500">{c.department}</span>
              </div>
              <h5 className="text-sm font-bold text-white line-clamp-1">{c.name}</h5>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  {c._count?.enrollments || 0} students
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleCheckBig className="w-3 h-3" />
                  {c._count?.sessions || 0} lectures held
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand-400" />
          {title}
        </h3>
        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
