import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LogOut,
  Wifi,
  WifiOff,
  Menu,
  X,
} from "lucide-react";
import Sidebar from "./Sidebar";
import NotificationBell from "../components/common/NotificationBell";
import EngagementPrompt from "../components/attendance/EngagementPrompt";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 w-64 flex-col h-full border-r border-slate-800/80 bg-slate-900/60">
        <Sidebar />
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 flex flex-col h-full bg-slate-900">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 px-4 lg:px-6 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-400 text-[11px] font-semibold uppercase tracking-wider border border-brand-500/20">
                EduPulse
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">
                {connected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-500 leading-tight">
                {user?.role || user?.department || "No department"}
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-400 text-slate-300 text-sm font-medium transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-950">
          <Outlet />
        </main>
        <EngagementPrompt />
      </div>
    </div>
  );
}
