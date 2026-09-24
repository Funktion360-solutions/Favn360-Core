"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type TrendPoint = {
  date: string;
  fatigue: number | null;
  mental: number | null;
  pain: number | null;
  pressure: number | null;
  functionLevel: number | null;
  workMinutes: number | null;
};

type Props = {
  data: TrendPoint[];
};

function ChartBlock({
  title,
  dataKey,
  data
}: {
  title: string;
  dataKey: keyof TrendPoint;
  data: TrendPoint[];
}) {
  return (
    <div className="rounded border border-funktion-line bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-funktion-blue">
        {title}
      </h3>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis domain={[0, 10]} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#141969"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TrendCharts({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded border border-funktion-line p-4 text-sm text-black/70">
        Der er endnu ikke nok data til at vise trends.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartBlock
        title="Træthed over tid"
        dataKey="fatigue"
        data={data}
      />

      <ChartBlock
        title="Mentalt niveau / belastning"
        dataKey="mental"
        data={data}
      />

      <ChartBlock
        title="Smerteudvikling"
        dataKey="pain"
        data={data}
      />

      <ChartBlock
        title="Belastning i praktik"
        dataKey="pressure"
        data={data}
      />

      <ChartBlock
        title="Funktionsniveau"
        dataKey="functionLevel"
        data={data}
      />

      <ChartBlock
        title="Arbejdstid (minutter)"
        dataKey="workMinutes"
        data={data}
      />
    </div>
  );
}