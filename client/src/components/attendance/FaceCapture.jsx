import { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Scan, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { getDeviceFingerprint } from '../../utils/device';

export default function FaceCapture({ sessionId, onVerified }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  // Initialize WebRTC media stream
  useEffect(() => {
    let stream = null;
    let mounted = true;

    async function initCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStreamActive(false);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' },
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.warn('WebRTC camera error:', err.message);
        if (mounted) setStreamActive(false);
      }
    }

    initCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCaptureAndVerify = async () => {
    if (!sessionId) {
      toast.error('Select an active session first');
      return;
    }
    if (!streamActive || !videoRef.current || videoRef.current.videoWidth === 0) {
      toast.error('Camera access is required for face verification');
      return;
    }

    setVerifying(true);
    setResult(null);

    // Draw frame onto canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 480, 360);

      // Draw simulated bounding box on face
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.strokeRect(140, 80, 200, 200);

      // Draw facial landmark markers
      ctx.fillStyle = '#6366F1';
      ctx.fillRect(190, 140, 8, 8); // Left eye
      ctx.fillRect(280, 140, 8, 8); // Right eye
      ctx.fillRect(235, 180, 10, 10); // Nose tip
      ctx.fillRect(205, 230, 70, 8); // Mouth
    }

    try {
      const res = await api.post('/student/face-verify', {
        sessionId,
        faceDataUrl: canvasRef.current?.toDataURL('image/jpeg') || 'simulated-canvas-data',
        deviceInfo: getDeviceFingerprint(),
      });

      setResult({
        success: true,
        message: 'Face capture accepted and attendance recorded.',
        record: res.data.record,
      });

      toast.success('Biometric Identity Confirmed!');
      if (onVerified) onVerified(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Facial verification failed';
      setResult({ success: false, message: msg });
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simulated biometric verification</span>
        </div>
        <h3 className="text-lg font-bold text-white">Live camera capture</h3>
        <p className="text-xs text-slate-400">
          Position your face in the frame. This demo simulates facial matching; device and
          network checks are still enforced server-side.
        </p>
      </div>

      {/* Video & Canvas Overlay Viewport */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Liveness Target HUD overlay */}
        <div className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-2xl pointer-events-none flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-2 border-indigo-500/50 flex items-center justify-center animate-pulse">
            <Scan className="w-10 h-10 text-indigo-400/60" />
          </div>
        </div>

        {!streamActive && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center">
            <Camera className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-xs text-slate-400">
              Camera unavailable. Grant camera permission over HTTPS (or localhost) to use this
              terminal.
            </p>
          </div>
        )}
      </div>

      {/* Verification Trigger Button */}
      {!sessionId && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Select an active lecture session to enable verification.</span>
        </div>
      )}

      <button
        onClick={handleCaptureAndVerify}
        disabled={verifying || !sessionId}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {verifying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying capture...</span>
          </>
        ) : (
          <>
            <Scan className="w-4 h-4" />
            <span>Verify face match</span>
          </>
        )}
      </button>

      {/* Result Card */}
      {result && (
        <div
          className={`p-4 rounded-2xl border ${
            result.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          } flex items-center gap-3 text-xs font-semibold`}
        >
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{result.message}</span>
        </div>
      )}
    </div>
  );
}

