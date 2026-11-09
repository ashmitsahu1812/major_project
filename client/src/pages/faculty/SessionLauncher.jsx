import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, MapPin, Radio, Video, Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function SessionLauncher() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    courseId: '',
    sessionType: 'IN_PERSON',
    latitude: 12.9716,
    longitude: 77.5946,
    radiusMeters: 50.0,
  });

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await api.get('/faculty/dashboard');
        const courseList = res.data.courses || [];
        setCourses(courseList);
        if (courseList.length > 0) {
          setForm((prev) => ({ ...prev, courseId: courseList[0].id }));
        }
      } catch {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    }
    loadCourses();

    // Auto-detect location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }));
        },
        () => {
          // Keep campus default coords
        }
      );
    }
  }, []);

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!form.courseId) {
      toast.error('Please choose a course');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/faculty/sessions', form);
      const session = res.data.session;
      toast.success('Lecture Session Activated!');
      navigate(`/faculty/live-attendance?sessionId=${session.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to launch lecture session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading course options..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Rocket className="w-7 h-7 text-indigo-400" />
          <span>Launch Classroom Session</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Initiate rolling dynamic QR attendance, AI face rec, or hybrid video watermarking.
        </p>
      </div>

      <form onSubmit={handleLaunch} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Course Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Target Course</label>
          <select
            value={form.courseId}
            onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name} ({c.department})
              </option>
            ))}
          </select>
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Attendance Engine Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'IN_PERSON', label: 'In-Person', desc: 'Geofenced Rolling QR & Face Rec', icon: Users },
              { id: 'HYBRID', label: 'Hybrid', desc: 'Classroom + Remote Check-in', icon: Radio },
              { id: 'ONLINE', label: 'Online', desc: 'In-Video Watermark Stream', icon: Video },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setForm({ ...form, sessionType: type.id })}
                  className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition ${
                    form.sessionType === type.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${form.sessionType === type.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-white">{type.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{type.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Geofence Settings (in-person only) */}
        {form.sessionType === 'IN_PERSON' ? (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Anti-Proxy Geofence Radius</span>
              </span>
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {form.radiusMeters} Meters
              </span>
            </div>

            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={form.radiusMeters}
              onChange={(e) => setForm({ ...form, radiusMeters: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>20m (Strict Classroom)</span>
              <span>50m (Standard Hall)</span>
              <span>200m (Campus Wide)</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span>
                Anchor Coordinates: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400">
              <p className="font-bold text-slate-200">Remote check-in mode</p>
              <p className="mt-1">
                The classroom geofence is disabled for {form.sessionType.toLowerCase()} lectures.
                Rolling QR, device fingerprint and rapid-reuse checks remain active.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span>Generating Cryptographic Session Keys...</span>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Start Lecture & Project Dynamic QR</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

