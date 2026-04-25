'use client';
import { motion } from 'framer-motion';

interface Props {
  score: number;
  color: string;
  label: string;
}

export default function SurvivalGauge({ score, color, label }: Props) {
  const radius = 80;
  const stroke = 14;
  const normalizedRadius = radius - stroke;
  const circumference = Math.PI * normalizedRadius; // half-circle
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  const bgColor = 'rgba(255,255,255,0.07)';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: radius * 2, height: radius + stroke }}>
        <svg
          width={radius * 2}
          height={radius + stroke}
          viewBox={`0 0 ${radius * 2} ${radius + stroke / 2}`}
          overflow="visible"
        >
          {/* background arc */}
          <path
            d={`M ${stroke} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke} ${radius}`}
            fill="none"
            stroke={bgColor}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* animated fill arc */}
          <motion.path
            d={`M ${stroke} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 - stroke} ${radius}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        {/* center score */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <motion.span
            key={score}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-black"
            style={{ color }}
          >
            {clampedScore}%
          </motion.span>
        </div>
      </div>
      <div
        className="px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      >
        {label}
      </div>
      <p className="text-xs text-slate-400 text-center max-w-[180px]">
        Taux de remplacement net de votre salaire actuel
      </p>
    </div>
  );
}
