export interface PensionParams {
  salaryNet: number;
  currentAge: number;
  startWorkAge: number;
  departureAge: number;
}

export interface PensionResult {
  monthlyPension: number;
  replacementRate: number;
  monthlyShortfall: number;
  annualShortfall: number;
  yearsWorked: number;
  quartersContributed: number;
  fullRateQuarters: number;
  missingQuarters: number;
  pensionRatePct: number;
  survivalScore: number;
  twentyYearLoss: number;
}

export function calculatePension(p: PensionParams): PensionResult {
  const yearsWorked = Math.max(0, p.departureAge - p.startWorkAge);
  const quartersContributed = yearsWorked * 4;
  const fullRateQuarters = 172;

  const missingQuarters = Math.max(0, fullRateQuarters - quartersContributed);
  const extraQuarters = Math.max(0, quartersContributed - fullRateQuarters);
  const pensionRate =
    Math.min(0.5, Math.max(0.25, 0.5 - missingQuarters * 0.0125)) +
    extraQuarters * 0.0125;

  const grossSalary = p.salaryNet * 1.22;
  const SAM = grossSalary * 0.88;
  const prorata = Math.min(1, quartersContributed / fullRateQuarters);
  const annualGross = SAM * pensionRate * prorata;
  const monthlyNet = (annualGross * 0.83) / 12;

  const monthlyPension = Math.round(Math.min(monthlyNet, 1981));
  const replacementRate = Math.round((monthlyPension / p.salaryNet) * 100);
  const monthlyShortfall = Math.round(p.salaryNet - monthlyPension);
  const annualShortfall = monthlyShortfall * 12;

  return {
    monthlyPension,
    replacementRate,
    monthlyShortfall,
    annualShortfall,
    yearsWorked,
    quartersContributed,
    fullRateQuarters,
    missingQuarters,
    pensionRatePct: Math.round(pensionRate * 1000) / 10,
    survivalScore: Math.min(100, Math.max(0, replacementRate)),
    twentyYearLoss: annualShortfall * 20,
  };
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function getSurvivalStatus(score: number) {
  if (score >= 75) return { label: 'Maintien acceptable', color: '#10b981', ring: 'rgba(16,185,129,0.3)' };
  if (score >= 60) return { label: 'Niveau de vie dégradé', color: '#f59e0b', ring: 'rgba(245,158,11,0.3)' };
  if (score >= 45) return { label: 'Risque de précarité', color: '#f97316', ring: 'rgba(249,115,22,0.3)' };
  return { label: 'Zone de danger', color: '#ef4444', ring: 'rgba(239,68,68,0.3)' };
}
