import React from "react";

const variants = {
  brand: {
    bg: "bg-brand-100/80",
    color: "text-brand-700",
    border: "border-brand-400/30",
  },
  success: {
    bg: "bg-success-100/80",
    color: "text-success-700",
    border: "border-success-400/30",
  },
  warning: {
    bg: "bg-warning-100/80",
    color: "text-warning-700",
    border: "border-warning-400/30",
  },
  danger: {
    bg: "bg-danger-100/80",
    color: "text-danger-700",
    border: "border-danger-400/30",
  },
  info: {
    bg: "bg-info-100/80",
    color: "text-info-700",
    border: "border-info-400/30",
  },
  slate: {
    bg: "bg-slate-100/80",
    color: "text-slate-600",
    border: "border-slate-400/40",
  },
};

const sizes = {
  sm: "text-xs px-2.5 py-1",
  md: "text-xs px-3 py-1.5",
  lg: "text-sm px-4 py-2",
};

export default function Badge({ children, variant = "slate", size = "md", className = "" }) {
  const style = variants[variant] || variants.slate;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${style.bg} ${style.color} ${style.border} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}
