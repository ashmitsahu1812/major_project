import { motion } from "framer-motion";

export default function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  }[size] || "w-10 h-10";

  return (
    <div className="flex flex-col items-center justify-center p-10 gap-4">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-12 h-12 border-3 border-slate-700/50 border-t-brand-500/70 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-3 border-slate-700/50 border-t-brand-500/70 rounded-full" />
      </motion.div>
      {text && (
        <span className="text-sm font-medium text-slate-400 tracking-wide">{text}</span>
      )}
    </div>
  );
}
