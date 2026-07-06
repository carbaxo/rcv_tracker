"use client";

import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  week: string;
  volumen: number;
  sesiones: number;
  km: number;
}

export default function WeeklyChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#1f2e3f" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="vol"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis yAxisId="km" orientation="right" hide />
          <Tooltip
            contentStyle={{
              background: "#16212e",
              border: "1px solid #2b3d52",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(value: number, name: string) => {
              if (name === "volumen") return [`${value.toLocaleString("es-ES")} kg`, "Volumen"];
              if (name === "km") return [`${value} km`, "Cardio"];
              return [value, name];
            }}
          />
          <Bar
            yAxisId="vol"
            dataKey="volumen"
            fill="#34d399"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Line
            yAxisId="km"
            dataKey="km"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{ fill: "#f97316", r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
