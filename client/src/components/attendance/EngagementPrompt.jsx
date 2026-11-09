import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import api from '../../api/axios';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

export default function EngagementPrompt() {
  const { socket } = useSocket();
  const [activePing, setActivePing] = useState(null);
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handlePing = (pingData) => {
      setActivePing(pingData);
      setSecondsLeft(pingData.durationSeconds || 60);
      setCode('');
      setConfirmed(false);
      toast('Active Lecture Engagement Check Initiated! 60s to respond.', {
        icon: '⚡',
        duration: 6000,
      });
    };

    socket.on('engagement:ping', handlePing);
    return () => {
      socket.off('engagement:ping', handlePing);
    };
  }, [socket]);

  useEffect(() => {
    if (!activePing || confirmed) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActivePing(null);
          toast.error('Engagement ping expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activePing, confirmed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim() || !activePing?.sessionId) return;

    setSubmitting(true);
    try {
      const res = await api.post('/student/engagement/respond', {
        sessionId: activePing.sessionId,
        code: code.trim(),
      });

      if (res.data?.success) {
        setConfirmed(true);
        toast.success('Active engagement presence confirmed!');
        setTimeout(() => setActivePing(null), 3500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!activePing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl shadow-indigo-950/80 space-y-6 relative overflow-hidden">
        {/* Animated Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-indigo-400 to-accent-400 animate-pulse" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Zap className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Live Attendance Check
              </h3>
              <p className="text-xs text-slate-400">
                Online / Hybrid Active Presence Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-sm font-bold">
            <Timer className="w-4 h-4 animate-spin" />
            <span>{secondsLeft}s</span>
          </div>
        </div>

        {confirmed ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Presence Acknowledged</h4>
            <p className="text-xs text-slate-300">
              Your active participation in this lecture has been cryptographically recorded.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
              Enter the <strong>4-digit challenge code</strong> broadcast by your instructor
              to prove active attention.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                4-Digit Challenge Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 7429"
                required
                autoFocus
                className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || code.length < 4}
              className="btn-primary w-full justify-center py-3 text-sm font-bold disabled:opacity-50"
            >
              {submitting ? 'Validating...' : 'Confirm Active Presence'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
