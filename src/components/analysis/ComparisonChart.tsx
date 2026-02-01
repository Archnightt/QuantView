"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ComparisonChartProps {
  data: any[];
  tickerA: string;
  tickerB: string;
}

export default function ComparisonChart({
  data,
  tickerA,
  tickerB,
}: ComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/50 text-neutral-400">
        No chart data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 shadow-xl">
          <p className="mb-2 text-sm font-medium text-neutral-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-semibold text-neutral-200">
                {entry.name}:
              </span>
              <span
                className={`${
                  entry.value >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {entry.value.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[400px] w-full rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <h3 className="mb-4 text-lg font-semibold text-neutral-200">
        Performance Comparison (1 Month)
      </h3>
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#262626"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
              minTickGap={30}
            />
            <YAxis
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Line
              type="monotone"
              dataKey="tickerA"
              name={tickerA}
              stroke="#10b981" // emerald-500
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
            <Line
              type="monotone"
              dataKey="tickerB"
              name={tickerB}
              stroke="#3b82f6" // blue-500
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
