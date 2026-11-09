import React from "react";
import { QrCode, ArrowRight, CheckCircle, AlertTriangle, Radio } from "lucide-react";
import QrScanner from "../../components/attendance/QrScanner";

export default function ScanAttend() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2.5">
          <QrCode className="w-7 h-7 text-brand-400" />
          Scan &amp; Attend
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Scan the dynamic rotating QR code projected in your classroom. Geofencing and device
          fingerprinting will authenticate your presence.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 sm:p-8 shadow-2xl shadow-black/20">
        <QrScanner />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-400 mt-1.5">In-Person</p>
          <p className="text-xs text-slate-500 mt-0.5">Geofenced &amp; authenticated</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <AlertTriangle className="w-5 h-5 text-warning-400 mx-auto" />
          <p className="text-xs text-slate-400 mt-1.5">Proxy Detection</p>
          <p className="text-xs text-slate-500 mt-0.5">Device &amp; network checks active</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <Radio className="w-5 h-5 text-accent-400 mx-auto" />
          <p className="text-xs text-slate-400 mt-1.5">Always-On</p>
          <p className="text-xs text-slate-500 mt-0.5">Live feed updates every 7s</p>
        </div>
      </div>
    </div>
  );
}
