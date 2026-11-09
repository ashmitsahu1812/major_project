import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function AttendanceDonutChart({ data = [] }) {
  const COLORS = [
    "#6366F1",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#0EA5E9",
    "#8B5CF6",
  ];

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="#1e293b" />
            </pattern>
            <filter id="glow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.4" />
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={1.5}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-xl px-4 py-3 pointer-events-none">
                  <p className="text-xs font-black text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.value} students</p>
                  <p className="text-sm font-bold text-white mt-0.5">{p.payload.percentage}%</p>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconSize={10}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-slate-400">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
