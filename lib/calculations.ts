// Formule officielle CNAV 2024
// Source: https://www.legislation.cnav.fr, rapport COR 2023

export interface PensionParams {
  salaryNet: number;   // salaire net mensuel actuel
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
  hasDecote: boolean;
  hasSurcote: boolean;
  extraQuarters: number;
}

const PASS_2024 = 46_368;          // Plafond Annuel Sécurité Sociale 2024
const FULL_RATE_QUARTERS = 172;    // 43 ans, nés après 1973 (réforme 2023)
const AGE_FULL_RATE = 67;          // âge automatique du taux plein
const DECOTE_PER_QUARTER = 0.0125; // 1.25% par trimestre manquant
const MAX_DECOTE_QUARTERS = 20;    // plafond décote
const SURCOTE_PER_QUARTER = 0.0125;
const MINIMUM_CONTRIBUTIF = 847.57; // montant majoré 2024 (en €/mois brut, pleine carrière)
const ASPA = 961.08;               // Allocation de Solidarité aux Personnes Agées 2024

export function calculatePension(p: PensionParams): PensionResult {
  const yearsWorked = Math.max(0, p.departureAge - p.startWorkAge);
  const quartersContributed = yearsWorked * 4;

  // --- Décote ---
  // Nombre de trimestres manquants = min(manque durée, manque âge)
  const missingByDuration = Math.max(0, FULL_RATE_QUARTERS - quartersContributed);
  const missingByAge = Math.max(0, (AGE_FULL_RATE - p.departureAge) * 4);
  const missingQuarters = Math.min(
    Math.min(missingByDuration, missingByAge),
    MAX_DECOTE_QUARTERS
  );
  const hasDecote = missingQuarters > 0;

  // --- Surcote ---
  // Active uniquement si durée >= 172 ET âge >= 64 (légal)
  const extraQuarters =
    quartersContributed > FULL_RATE_QUARTERS && p.departureAge >= 64
      ? Math.max(0, quartersContributed - FULL_RATE_QUARTERS)
      : 0;
  const hasSurcote = extraQuarters > 0;

  // --- Taux de pension ---
  const pensionRate =
    Math.max(0.25, 0.5 - missingQuarters * DECOTE_PER_QUARTER) +
    extraQuarters * SURCOTE_PER_QUARTER;

  // --- SAM (Salaire Annuel Moyen des 25 meilleures années) ---
  // Net → Brut : cotisations salariales ~22% du brut → brut = net / 0.78
  // SAM plafonné à 1× PASS (seule la part < PASS est prise en compte au régime général)
  const monthlyGross = p.salaryNet / 0.78;
  const annualGross = monthlyGross * 12;
  const SAM = Math.min(annualGross, PASS_2024);

  // --- Prorata durée ---
  const prorata = Math.min(1, quartersContributed / FULL_RATE_QUARTERS);

  // --- Pension brute annuelle ---
  let annualPensionGross = SAM * pensionRate * prorata;

  // Minimum contributif (garanti si taux plein atteint)
  if (!hasDecote) {
    const minGross = MINIMUM_CONTRIBUTIF * prorata * 12;
    annualPensionGross = Math.max(annualPensionGross, minGross);
  }

  // Plafond régime général : 50% du PASS
  const maxGross = PASS_2024 * 0.5; // 23 184 €/an brut
  const cappedGross = Math.min(annualPensionGross, maxGross);

  // --- Prélèvements sociaux sur pension ---
  // CSG 8.3% + CRDS 0.5% + CASA 0.3% = 9.1% si revenu > seuil (~22 120 €/an)
  // CSG taux réduit 3.8% + CRDS 0.5% = 4.3% si revenu < seuil
  const deductionRate = cappedGross > 22_120 ? 0.091 : 0.043;
  const annualPensionNet = cappedGross * (1 - deductionRate);
  const monthlyPensionRaw = annualPensionNet / 12;

  // Plancher ASPA (minimum vieillesse 2024)
  const monthlyPension = Math.round(Math.max(monthlyPensionRaw, ASPA));

  const replacementRate = Math.round((monthlyPension / p.salaryNet) * 100);
  const monthlyShortfall = Math.round(Math.max(0, p.salaryNet - monthlyPension));

  return {
    monthlyPension,
    replacementRate,
    monthlyShortfall,
    annualShortfall: monthlyShortfall * 12,
    yearsWorked,
    quartersContributed,
    fullRateQuarters: FULL_RATE_QUARTERS,
    missingQuarters,
    pensionRatePct: Math.round(pensionRate * 1000) / 10,
    survivalScore: Math.min(100, Math.max(0, replacementRate)),
    twentyYearLoss: monthlyShortfall * 12 * 20,
    hasDecote,
    hasSurcote,
    extraQuarters,
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
  if (score >= 75)
    return { label: 'Maintien acceptable', color: '#10b981', ring: 'rgba(16,185,129,0.3)' };
  if (score >= 60)
    return { label: 'Niveau de vie dégradé', color: '#f59e0b', ring: 'rgba(245,158,11,0.3)' };
  if (score >= 45)
    return { label: 'Risque de précarité', color: '#f97316', ring: 'rgba(249,115,22,0.3)' };
  return { label: 'Zone de danger', color: '#ef4444', ring: 'rgba(239,68,68,0.3)' };
}
