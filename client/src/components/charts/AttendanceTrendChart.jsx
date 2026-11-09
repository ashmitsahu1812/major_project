import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AttendanceTrendChart({ data = [] }) {
  const COLORS = {
    present: "url(#presentGrad)",
    flagged: "url(#flaggedGrad)",
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="flaggedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(71, 85, 105, 0.25)"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            stroke="#475569"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#475569"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-lg px-4 py-3 pointer-events-none">
                  <p className="text-xs font-bold text-white">{p.date}</p>
                  <div className="flex gap-4 mt-1.5">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                      Present: {p.present}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Flagged: {p.flagged}
                    </span>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="present"
            name="Present Students"
            stroke="#6366F1"
            strokeWidth={2.5}
            fill="url(#presentGrad)"
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="flagged"
            name="Proxy Flags"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#flaggedGrad)"
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
