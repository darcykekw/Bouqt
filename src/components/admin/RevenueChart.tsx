"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = { date: string; revenue: number; orders: number };

export default function RevenueChart({ data }: { data: DataPoint[] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-stone-400 text-sm">
        No confirmed orders yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#a8a29e" }} />
        <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} tickFormatter={(v) => `₱${v}`} />
        <Tooltip
          formatter={(value) => [`₱${Number(value).toFixed(2)}`, "Revenue"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 12 }}
        />
        <Bar dataKey="revenue" fill="#E8748A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
