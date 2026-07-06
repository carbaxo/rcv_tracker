"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  label: string;
  peso: number;
  rm: number;
}

export default function ProgressChart({ data }: { data: Point[] }) {
  return (
    <div className="mt-3 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#1f2e3f" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#16212e",
              border: "1px solid #2b3d52",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value: number, name: string) => [
              `${value} kg`,
              name === "peso" ? "Mejor peso" : "1RM estimado",
            ]}
          />
          <Line
            dataKey="peso"
            stroke="#34d399"
            strokeWidth={2.5}
            dot={{ fill: "#34d399", r: 3 }}
          />
          <Line
            dataKey="rm"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
