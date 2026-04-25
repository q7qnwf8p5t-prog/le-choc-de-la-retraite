'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePension, formatEuro, getSurvivalStatus } from '@/lib/calculations';
import SurvivalGauge from './SurvivalGauge';
import SalaryChart from './SalaryChart';
import { AlertTriangle, TrendingDown, Clock, Euro } from 'lucide-react';

function InputRow({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type="number"
          className="input-field pr-14"
          value={value}
          min={min}
          max={max}
          step={step ?? 1}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  danger?: boolean;
}) {
  return (
    <motion.div
      layout
      className="card p-5 flex flex-col gap-2"
      style={danger ? { borderColor: 'rgba(239,68,68,0.25)' } : {}}
    >
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-2xl font-black ${danger ? 'text-red-400' : 'text-white'}`}
      >
        {value}
      </motion.p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

export default function Calculator() {
  const [salary, setSalary] = useState(2800);
  const [startAge, setStartAge] = useState(22);
  const [departureAge, setDepartureAge] = useState(64);

  const result = useMemo(
    () =>
      calculatePension({
        salaryNet: salary,
        currentAge: 40,
        startWorkAge: startAge,
        departureAge,
      }),
    [salary, startAge, departureAge]
  );

  const status = getSurvivalStatus(result.survivalScore);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10">
      {/* Inputs */}
      <div className="card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputRow
          label="Salaire net mensuel"
          value={salary}
          onChange={setSalary}
          min={800}
          max={15000}
          suffix="€"
          step={50}
        />
        <InputRow
          label="Âge de début de carrière"
          value={startAge}
          onChange={setStartAge}
          min={16}
          max={35}
          suffix="ans"
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Âge de départ
            </label>
            <span className="text-sm font-bold" style={{ color: departureAge <= 64 ? '#ef4444' : '#10b981' }}>
              {departureAge} ans
            </span>
          </div>
          <input
            type="range"
            className="range-slider mt-3"
            min={60}
            max={70}
            step={1}
            value={departureAge}
            onChange={(e) => setDepartureAge(Number(e.target.value))}
          />
          <div className="flex justify-between text-xs text-slate-600">
            <span>60 ans</span>
            <span>64 ans (légal)</span>
            <span>70 ans</span>
          </div>
          {result.missingQuarters > 0 && (
            <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
              <AlertTriangle size={12} />
              {result.missingQuarters} trimestres manquants → décote de{' '}
              {(result.missingQuarters * 1.25).toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: stat cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Euro size={14} />}
              label="Salaire actuel"
              value={formatEuro(salary)}
              sub="net mensuel"
            />
            <StatCard
              icon={<TrendingDown size={14} />}
              label="Pension estimée"
              value={formatEuro(result.monthlyPension)}
              sub={`à ${departureAge} ans — régime général CNAV`}
              danger
            />
            <StatCard
              icon={<AlertTriangle size={14} />}
              label="Manque mensuel"
              value={`− ${formatEuro(result.monthlyShortfall)}`}
              sub="chaque mois de retraite"
              danger
            />
            <StatCard
              icon={<Clock size={14} />}
              label="Perte sur 20 ans"
              value={`− ${formatEuro(result.twentyYearLoss)}`}
              sub="d’ici la fin de vie estimée"
              danger
            />
          </div>

          {/* Chart */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Salaire actuel vs Pension
            </h3>
            <SalaryChart
              salary={salary}
              pension={result.monthlyPension}
              departureAge={departureAge}
            />
          </div>
        </div>

        {/* Right: gauge */}
        <div className="card p-6 flex flex-col items-center justify-center gap-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">
            Jauge de Survie Financière
          </h3>
          <SurvivalGauge
            score={result.survivalScore}
            color={status.color}
            label={status.label}
          />

          {/* Mini breakdown */}
          <div className="w-full flex flex-col gap-3 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Trimestres validés</span>
              <span className="font-semibold text-slate-300">
                {result.quartersContributed} / {result.fullRateQuarters}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Taux de pension</span>
              <span className="font-semibold text-slate-300">{result.pensionRatePct}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Durée de carrière</span>
              <span className="font-semibold text-slate-300">{result.yearsWorked} ans</span>
            </div>
            <div className="h-px bg-white/5 my-1" />
            <p className="text-xs text-slate-600 text-center">
              Calcul basé sur les règles CNAV 2024. Taux plein à 172 trimestres (réforme 2023).
            </p>
          </div>
        </div>
      </div>

      {/* COR Projection banner */}
      <div
        className="card p-6 border-red-500/20"
        style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}
      >
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-bold text-red-300 mb-1">Projection COR 2023 : la situation empire</p>
            <p className="text-sm text-slate-400">
              Selon le Conseil d&apos;Orientation des Retraites, le taux de remplacement moyen
              passera de{' '}
              <strong className="text-slate-200">74% aujourd&apos;hui</strong> à{' '}
              <strong className="text-red-400">moins de 65% d&apos;ici 2070</strong>. Pour les
              salaires supérieurs à 2 500€/mois, le choc est déjà ressenti maintenant. Sans
              épargne complémentaire, votre niveau de vie s&apos;effondre dès le 1er jour de
              retraite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
