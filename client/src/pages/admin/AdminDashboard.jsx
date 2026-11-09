import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Layers,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Activity,
  Eye,
  Users as UsersIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import StatCard from "../../components/common/StatCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AttendanceTrendChart from "../../components/charts/AttendanceTrendChart";
import DepartmentComparisonChart from "../../components/charts/DepartmentComparisonChart";
import AttendanceDonutChart from "../../components/charts/AttendanceDonutChart";
import Badge from "../../components/common/Badge";
import { formatDateTime } from "../../utils/helpers";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/admin/dashboard");
        setData(res.data);
      } catch {
        toast.error("Failed to load institution analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Aggregating campus attendance metrics..." />;
  }

  const { metrics, trendData, deptComparison, riskBreakdown, recentAlerts } = data || {};

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Institutional Overview
          </h2>
          <p className="text-sm text-slate-400 mt-1.5">
            Real-time biometric &amp; cryptographic attendance analytics across all faculties.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">
            Anti-Proxy Guard Active
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={metrics?.totalStudents || 0}
          subtitle="Enrolled campus wide"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Overall Attendance"
          value={`${metrics?.overallPercentage || 0}%`}
          subtitle="Aggregated lecture turnout"
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Active Batches"
          value={metrics?.activeBatches || 0}
          subtitle="Departments in session"
          icon={Layers}
          color="info"
        />
        <StatCard
          title="Proxy Alerts"
          value={metrics?.fraudProxyAlertsCount || 0}
          subtitle="Unresolved security events"
          icon={ShieldAlert}
          color="danger"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-hover">
          <div className="p-5 border-b border-slate-800/60">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              14-Day Attendance &amp; Proxy Trends
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Daily turnout volume correlated with anti-proxy violation events.
            </p>
          </div>
          <div className="h-72">
            <AttendanceTrendChart data={trendData || []} />
          </div>
        </div>

        <div className="card-hover">
          <div className="p-5 border-b border-slate-800/60">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Campus Risk Breakdown
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Students segmented by 75% threshold margin.
            </p>
          </div>
          <div className="h-72">
            <AttendanceDonutChart data={riskBreakdown || []} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-hover">
          <div className="p-5 border-b border-slate-800/60">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-info-400" />
              Department Turnout Comparison
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Mean attendance percentages by academic division.
            </p>
          </div>
          <div className="h-72">
            <DepartmentComparisonChart data={deptComparison || []} />
          </div>
        </div>

        <div className="card-hover flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Live Threat Feed
            </h4>
            <Link
              to="/admin/proxy-alerts"
              className="text-xs font-semibold text-brand-400 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto max-h-80 p-5 space-y-3">
            {recentAlerts && recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{alert.student.name}</span>
                        <span className="text-xs text-slate-500">({alert.student.rollNumber || "N/A"})</span>
                      </div>
                      <p className="text-xs text-rose-300/90 mt-1 line-clamp-1">{alert.reason}</p>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {formatDateTime(alert.flaggedAt)} • {alert.session.course.code}
                      </span>
                    </div>
                    <Badge variant={alert.resolved ? "success" : "danger"} size="sm">
                      {alert.resolved ? "Resolved" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">No recent security flags recorded.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
