'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculatePension, formatEuro, getSurvivalStatus } from '@/lib/calculations';
import SurvivalGauge from './SurvivalGauge';
import SalaryChart from './SalaryChart';
import { AlertTriangle, TrendingDown, Clock, Euro, TrendingUp } from 'lucide-react';

function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
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
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          onBlur={(e) => {
            const v = Number(e.target.value);
            if (isNaN(v) || v < min) onChange(min);
            else if (v > max) onChange(max);
          }}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
          {suffix}
        </span>
      </div>
      <p className="text-xs text-slate-600">{min}–{max} {suffix}</p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  danger,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  danger?: boolean;
  positive?: boolean;
}) {
  const color = danger ? 'text-red-400' : positive ? 'text-emerald-400' : 'text-white';
  const border = danger
    ? 'rgba(239,68,68,0.2)'
    : positive
    ? 'rgba(16,185,129,0.2)'
    : 'rgba(255,255,255,0.07)';
  return (
    <motion.div layout className="card p-5 flex flex-col gap-2" style={{ borderColor: border }}>
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-2xl font-black ${color}`}
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
        salaryNet: Math.max(500, salary),
        currentAge: 40,
        startWorkAge: Math.max(14, startAge),
        departureAge: Math.max(55, departureAge),
      }),
    [salary, startAge, departureAge]
  );

  const status = getSurvivalStatus(result.survivalScore);

  // Déterminer la couleur du slider selon l'âge
  const sliderColor =
    departureAge <= 62 ? '#ef4444' : departureAge <= 65 ? '#f59e0b' : '#10b981';

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Inputs */}
      <div className="card p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <NumericInput
          label="Salaire net mensuel"
          value={salary}
          onChange={setSalary}
          min={500}
          max={30000}
          step={50}
          suffix="€"
        />
        <NumericInput
          label="Âge de début de carrière"
          value={startAge}
          onChange={setStartAge}
          min={14}
          max={45}
          step={1}
          suffix="ans"
        />

        {/* Slider départ */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Âge de départ en retraite
            </label>
            <span className="text-lg font-black tabular-nums" style={{ color: sliderColor }}>
              {departureAge} ans
            </span>
          </div>
          <input
            type="range"
            className="range-slider mt-2"
            min={55}
            max={75}
            step={1}
            value={departureAge}
            onChange={(e) => setDepartureAge(Number(e.target.value))}
          />
          <div className="flex justify-between text-xs text-slate-600 px-0.5">
            <span>55</span>
            <span>64 (légal)</span>
            <span>67 (plein)</span>
            <span>75</span>
          </div>

          {/* Alertes dynamiques */}
          {result.hasDecote && (
            <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-1 bg-amber-400/10 rounded-lg px-3 py-2">
              <AlertTriangle size={11} className="shrink-0" />
              {result.missingQuarters} trimestre{result.missingQuarters > 1 ? 's' : ''} manquant
              {result.missingQuarters > 1 ? 's' : ''} — décote de{' '}
              {(result.missingQuarters * 1.25).toFixed(1)}%
            </p>
          )}
          {result.hasSurcote && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 mt-1 bg-emerald-400/10 rounded-lg px-3 py-2">
              <TrendingUp size={11} className="shrink-0" />
              {result.extraQuarters} trimestre{result.extraQuarters > 1 ? 's' : ''} supplémentaire
              {result.extraQuarters > 1 ? 's' : ''} — surcote de{' '}
              {(result.extraQuarters * 1.25).toFixed(1)}%
            </p>
          )}
          {departureAge < 64 && (
            <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 bg-red-400/10 rounded-lg px-3 py-2">
              <AlertTriangle size={11} className="shrink-0" />
              Avant 64 ans : uniquement cas de carrière longue, invalidité ou pénibilité
            </p>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stat cards + chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Euro size={13} />}
              label="Salaire actuel"
              value={formatEuro(salary)}
              sub="net / mois"
            />
            <StatCard
              icon={<TrendingDown size={13} />}
              label="Pension estimée"
              value={formatEuro(result.monthlyPension)}
              sub={`à ${departureAge} ans — régime général CNAV`}
              danger={result.replacementRate < 60}
              positive={result.replacementRate >= 75}
            />
            <StatCard
              icon={<AlertTriangle size={13} />}
              label="Manque mensuel"
              value={result.monthlyShortfall > 0 ? `− ${formatEuro(result.monthlyShortfall)}` : '+ aucun'}
              sub="chaque mois de retraite"
              danger={result.monthlyShortfall > 500}
            />
            <StatCard
              icon={<Clock size={13} />}
              label="Perte cumulée sur 20 ans"
              value={result.twentyYearLoss > 0 ? `− ${formatEuro(result.twentyYearLoss)}` : 'Équilibré'}
              sub="durée de retraite estimée"
              danger={result.twentyYearLoss > 50000}
            />
          </div>

          <div className="card p-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Salaire actuel vs Pension
            </h3>
            <SalaryChart
              salary={salary}
              pension={result.monthlyPension}
              departureAge={departureAge}
            />
          </div>
        </div>

        {/* Gauge */}
        <div className="card p-6 flex flex-col items-center justify-center gap-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
            Survie Financière
          </h3>
          <SurvivalGauge
            score={result.survivalScore}
            color={status.color}
            label={status.label}
          />
          <div className="w-full flex flex-col gap-2.5 mt-1">
            {[
              { k: 'Trimestres validés', v: `${result.quartersContributed} / ${result.fullRateQuarters}` },
              { k: 'Taux de pension', v: `${result.pensionRatePct}%` },
              { k: 'Durée de carrière', v: `${result.yearsWorked} ans` },
              { k: 'Taux de remplacement', v: `${result.replacementRate}%` },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-300">{v}</span>
              </div>
            ))}
            <div className="h-px bg-white/5 my-1" />
            <p className="text-xs text-slate-600 text-center">
              CNAV 2024 — 172 trimestres requis (réforme 2023)
            </p>
          </div>
        </div>
      </div>

      {/* Bannière COR */}
      <div
        className="card p-5"
        style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.18)' }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-bold text-red-300 mb-1 text-sm">
              Projection COR 2023 : la situation se dégrade
            </p>
            <p className="text-sm text-slate-400">
              Le taux de remplacement moyen passera de{' '}
              <strong className="text-slate-200">74% aujourd&apos;hui</strong> à{' '}
              <strong className="text-red-300">moins de 65% d&apos;ici 2070</strong>. Pour les
              revenus supérieurs à 2 500€ /mois, la chute est déjà sensible. Sans épargne
              complémentaire (PER, assurance-vie, immobilier), votre niveau de vie s&apos;effondre
              dès le 1er jour de retraite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
