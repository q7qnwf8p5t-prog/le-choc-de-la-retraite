'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { formatEuro } from '@/lib/calculations';

interface Props {
  salary: number;
  pension: number;
  departureAge: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-4 py-2 text-sm">
        <p className="font-semibold" style={{ color: payload[0].fill }}>
          {payload[0].name}
        </p>
        <p className="text-white font-bold text-lg">{formatEuro(payload[0].value)}/mois</p>
      </div>
    );
  }
  return null;
};

export default function SalaryChart({ salary, pension, departureAge }: Props) {
  const data = [
    { name: 'Salaire actuel', value: salary, fill: '#6366f1' },
    { name: `Pension à ${departureAge} ans`, value: pension, fill: '#ef4444' },
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="35%" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.fill}
                style={{ filter: `drop-shadow(0 0 8px ${entry.fill}88)` }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
