export const FD_NOMINAL_RATE = 0.03;
export const EPF_ASB_NOMINAL_RATE = 0.055;
export const INFLATION_RATE = 0.03;
export const ASSUMED_DIVIDEND_YIELD = 0.05;
export const HORIZON_OPTIONS = [5, 10, 15, 20, 30] as const;
export const STEP_UP_OPTIONS = [0, 5, 10] as const;

export interface GoalPreset {
  id: string;
  labelEng: string;
  labelBm: string;
  targetRM: number;
  initialCapital: number;
  monthlyContribution: number;
  years: number;
  riskLevel: number;
  annualStepUpPct: number;
}

export interface ProjectorInputs {
  initialCapital: number;
  monthlyContribution: number;
  years: number;
  riskLevel: number;
  annualStepUpPct: number;
  inflationAdjusted: boolean;
  targetGoalRM: number | null;
}

export interface ProjectionPoint {
  year: number;
  label: string;
  wealth: number;
  epfBenchmark: number;
  fdBenchmark: number;
  invested: number;
  gain: number;
}

export interface ProjectionSummary {
  points: ProjectionPoint[];
  nominalRatePct: number;
  effectiveRatePct: number;
  finalWealth: number;
  finalInvested: number;
  compoundGain: number;
  finalFdWealth: number;
  finalEpfWealth: number;
  beatFdBy: number;
  beatEpfBy: number;
  estimatedMonthlyDividend: number;
  delayCost3Yr: number;
  goalHitYear: number | null;
  swapComparison: {
    dailyRM: number;
    monthlyRM: number;
    projectedRM: number;
  };
}

export const STUDENT_GOAL_PRESETS: GoalPreset[] = [
  {
    id: 'emergency',
    labelEng: 'Emergency Fund',
    labelBm: 'Tabung Kecemasan',
    targetRM: 10000,
    initialCapital: 500,
    monthlyContribution: 200,
    years: 5,
    riskLevel: 4,
    annualStepUpPct: 0,
  },
  {
    id: 'car',
    labelEng: 'First Car Deposit',
    labelBm: 'Deposit Kereta',
    targetRM: 15000,
    initialCapital: 1000,
    monthlyContribution: 300,
    years: 5,
    riskLevel: 5,
    annualStepUpPct: 5,
  },
  {
    id: 'ptptn',
    labelEng: 'PTPTN Payoff',
    labelBm: 'Langsai PTPTN',
    targetRM: 30000,
    initialCapital: 1000,
    monthlyContribution: 450,
    years: 5,
    riskLevel: 6,
    annualStepUpPct: 5,
  },
  {
    id: 'home',
    labelEng: 'First Home Deposit',
    labelBm: 'Deposit Rumah',
    targetRM: 60000,
    initialCapital: 2000,
    monthlyContribution: 450,
    years: 10,
    riskLevel: 6,
    annualStepUpPct: 5,
  },
  {
    id: 'club100k',
    labelEng: 'RM 100k Club',
    labelBm: 'Kelab RM 100k',
    targetRM: 100000,
    initialCapital: 2000,
    monthlyContribution: 550,
    years: 10,
    riskLevel: 7,
    annualStepUpPct: 5,
  },
];

interface SimulatedYear {
  year: number;
  balance: number;
  invested: number;
}

/**
 * Simulates monthly compounded balances and total invested principal over a horizon.
 */
function simulateSeries(
  initialCapital: number,
  monthlyContribution: number,
  years: number,
  annualStepUpPct: number,
  annualRate: number
): SimulatedYear[] {
  let bal = Math.max(0, initialCapital);
  let invested = Math.max(0, initialCapital);
  const monthlyRate = annualRate / 12;
  const series: SimulatedYear[] = [
    {
      year: 0,
      balance: Math.round(bal),
      invested: Math.round(invested),
    },
  ];

  for (let y = 1; y <= years; y += 1) {
    const monthly =
      Math.max(0, monthlyContribution) * Math.pow(1 + annualStepUpPct / 100, y - 1);
    for (let m = 0; m < 12; m += 1) {
      bal = (bal + monthly) * (1 + monthlyRate);
      invested += monthly;
    }
    series.push({
      year: y,
      balance: Math.round(bal),
      invested: Math.round(invested),
    });
  }

  return series;
}

/**
 * Computes deterministic wealth projection, benchmark comparisons, and milestone metrics.
 */
export function computeWealthProjection(inputs: ProjectorInputs): ProjectionSummary {
  const clampedRisk = Math.min(10, Math.max(1, inputs.riskLevel));
  const clampedYears = Math.min(40, Math.max(1, Math.round(inputs.years)));
  const clampedInitial = Math.max(0, inputs.initialCapital);
  const clampedMonthly = Math.max(0, inputs.monthlyContribution);
  const clampedStepUp = Math.max(0, inputs.annualStepUpPct);

  const nominalRate = 0.04 + clampedRisk * 0.008;
  const effectiveRate = inputs.inflationAdjusted
    ? nominalRate - INFLATION_RATE
    : nominalRate;
  const epfRate = inputs.inflationAdjusted
    ? EPF_ASB_NOMINAL_RATE - INFLATION_RATE
    : EPF_ASB_NOMINAL_RATE;
  const fdRate = inputs.inflationAdjusted
    ? FD_NOMINAL_RATE - INFLATION_RATE
    : FD_NOMINAL_RATE;

  const wealthSeries = simulateSeries(
    clampedInitial,
    clampedMonthly,
    clampedYears,
    clampedStepUp,
    effectiveRate
  );
  const epfSeries = simulateSeries(
    clampedInitial,
    clampedMonthly,
    clampedYears,
    clampedStepUp,
    epfRate
  );
  const fdSeries = simulateSeries(
    clampedInitial,
    clampedMonthly,
    clampedYears,
    clampedStepUp,
    fdRate
  );

  const points: ProjectionPoint[] = wealthSeries.map((entry, idx) => {
    const wealth = entry.balance;
    const invested = entry.invested;
    return {
      year: entry.year,
      label: `Yr ${entry.year}`,
      wealth,
      epfBenchmark: epfSeries[idx].balance,
      fdBenchmark: fdSeries[idx].balance,
      invested,
      gain: Math.round(wealth - invested),
    };
  });

  const finalPoint = points[points.length - 1];
  const finalWealth = finalPoint.wealth;
  const finalInvested = finalPoint.invested;
  const finalFdWealth = finalPoint.fdBenchmark;
  const finalEpfWealth = finalPoint.epfBenchmark;

  const goalHitPoint =
    inputs.targetGoalRM !== null && inputs.targetGoalRM > 0
      ? points.find((point) => point.wealth >= (inputs.targetGoalRM as number))
      : undefined;

  let delayCost3Yr = 0;
  if (clampedYears > 3) {
    const delayedSeries = simulateSeries(
      clampedInitial,
      clampedMonthly,
      clampedYears - 3,
      clampedStepUp,
      effectiveRate
    );
    const delayedFinalWealth = delayedSeries[delayedSeries.length - 1].balance;
    delayCost3Yr = Math.max(0, finalWealth - delayedFinalWealth);
  }

  const swapSeries = simulateSeries(0, 450, clampedYears, 0, effectiveRate);
  const swapProjectedRM = swapSeries[swapSeries.length - 1].balance;

  return {
    points,
    nominalRatePct: Number((nominalRate * 100).toFixed(1)),
    effectiveRatePct: Number((effectiveRate * 100).toFixed(1)),
    finalWealth,
    finalInvested,
    compoundGain: finalWealth - finalInvested,
    finalFdWealth,
    finalEpfWealth,
    beatFdBy: finalWealth - finalFdWealth,
    beatEpfBy: finalWealth - finalEpfWealth,
    estimatedMonthlyDividend: Math.round((finalWealth * ASSUMED_DIVIDEND_YIELD) / 12),
    delayCost3Yr,
    goalHitYear: goalHitPoint ? goalHitPoint.year : null,
    swapComparison: {
      dailyRM: 15,
      monthlyRM: 450,
      projectedRM: swapProjectedRM,
    },
  };
}
