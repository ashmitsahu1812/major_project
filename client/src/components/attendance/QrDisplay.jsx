import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, RefreshCw, Clock, Copy, Check, WifiOff, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

export default function QrDisplay({ sessionId, initialToken, sessionName, sessionEnded = false }) {
  const { socket, connected } = useSocket();
  const [token, setToken] = useState(initialToken || null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(7);
  const [refreshCount, setRefreshCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [ended, setEnded] = useState(false);
  const isEnded = ended || sessionEnded;

  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit('join:session', { sessionId });

    const handleQrRefresh = (data) => {
      if (data?.sessionId !== sessionId || !data?.qrPayload) return;

      const lifetime = Number(data.expiresIn) > 0 ? Number(data.expiresIn) : 7000;
      setToken(data.qrPayload);
      setExpiresAt(Date.now() + lifetime);
      setSecondsLeft(Math.max(1, Math.ceil(lifetime / 1000)));
      setRefreshCount((count) => count + 1);
    };

    const handleSessionEnded = (data) => {
      if (data?.sessionId && data.sessionId !== sessionId) return;
      setEnded(true);
      setToken(null);
      toast('Lecture session ended', { icon: '⏹️' });
    };

    const handleSessionError = (data) => {
      toast.error(data?.message || 'Could not join the lecture session');
    };

    socket.on('qr:refresh', handleQrRefresh);
    socket.on('session:ended', handleSessionEnded);
    socket.on('session:error', handleSessionError);

    return () => {
      socket.off('qr:refresh', handleQrRefresh);
      socket.off('session:ended', handleSessionEnded);
      socket.off('session:error', handleSessionError);
      socket.emit('leave:session', { sessionId });
    };
  }, [socket, sessionId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(
        expiresAt > 0 ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 7
      );
    }, 250);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const handleCopyToken = useCallback(() => {
    if (!token) return;
    navigator.clipboard
      .writeText(token)
      .then(() => {
        setCopied(true);
        toast.success('Active QR token copied');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Could not copy the token'));
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold text-white tracking-wide">
            Dynamic Cryptographic QR
          </span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-semibold ${
            isEnded
              ? 'bg-slate-800 border-slate-700 text-slate-400'
              : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
          }`}
        >
          {isEnded ? (
            <>
              <Square className="w-3.5 h-3.5" />
              <span>Ended</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" />
              <span>Rolling: {secondsLeft}s</span>
            </>
          )}
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center relative transition-all duration-300">
        {token && !isEnded ? (
          <QRCodeSVG value={token} size={220} level="H" marginSize={2} />
        ) : (
          <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className={`w-8 h-8 text-indigo-500 ${isEnded ? '' : 'animate-spin'}`} />
            <span className="text-xs">{isEnded ? 'Session ended' : 'Generating token...'}</span>
          </div>
        )}
      </div>

      <div className="mt-6 text-center space-y-3">
        <button
          onClick={handleCopyToken}
          disabled={!token || isEnded}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition disabled:opacity-40"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{copied ? 'Token copied!' : 'Copy active token (quick test)'}</span>
        </button>

        <p className="text-xs text-slate-400 max-w-xs">
          The token rotates every few seconds over Socket.io with a SHA-256 signature, so
          screenshots and forwarded images expire almost immediately.
        </p>

        {!connected && (
          <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-400">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Real-time connection lost — the code will not rotate until reconnected.</span>
          </div>
        )}

        <div className="text-[11px] font-mono text-slate-500">
          Refreshed: #{refreshCount} cycles | Session: {sessionName || sessionId?.slice(0, 8)}
        </div>
      </div>
    </div>
  );
}
