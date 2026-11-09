import React from "react";
import { Outlet } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-accent-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-500 flex items-center justify-center shadow-xl shadow-brand-900/25 text-white mb-4">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white">
          Edu<span className="text-brand-400">Pulse</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto">
          Attendance automation &amp; proxy prevention for modern campuses
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-slate-900/80 py-8 px-6 shadow-2xl border border-slate-800/80 rounded-2xl sm:px-10 backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
