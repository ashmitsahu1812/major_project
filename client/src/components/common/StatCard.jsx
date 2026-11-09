import React from "react";
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "brand",
  trend,
  action,
}) {
  const colorMap = {
    brand: {
      iconBg: "bg-brand-500/15",
      iconBorder: "border-brand-500/30",
      iconColor: "text-brand-400",
      accent: "border-brand-500/20",
    },
    success: {
      iconBg: "bg-success-500/15",
      iconBorder: "border-success-500/30",
      iconColor: "text-success-400",
      accent: "border-success-500/20",
    },
    warning: {
      iconBg: "bg-warning-500/15",
      iconBorder: "border-warning-500/30",
      iconColor: "text-warning-400",
      accent: "border-warning-500/20",
    },
    danger: {
      iconBg: "bg-danger-500/15",
      iconBorder: "border-danger-500/30",
      iconColor: "text-danger-400",
      accent: "border-danger-500/20",
    },
    info: {
      iconBg: "bg-info-500/15",
      iconBorder: "border-info-500/30",
      iconColor: "text-info-400",
      accent: "border-info-500/20",
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex items-start justify-between p-5 rounded-2xl bg-slate-900/70 border border-slate-800/60 shadow-lg shadow-black/20 relative overflow-hidden group hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl border ${scheme.iconBg} ${scheme.iconBorder}`}>
          {Icon && <Icon className={`w-5 h-5 ${scheme.iconColor}`} />}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
        </div>
      </div>

      {action && <div className="ml-4">{action}</div>}

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/40 text-xs font-semibold text-success-400">
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 10l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {trend}
        </div>
      )}
    </motion.div>
  );
}
