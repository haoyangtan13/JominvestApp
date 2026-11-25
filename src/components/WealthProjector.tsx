import { useMemo, useState } from 'react';
import {
  BarChart3,
  Coffee,
  Coins,
  RotateCcw,
  Target,
  TrendingUp,
  Clock,
  Wallet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Switch } from './ui/switch';
import {
  computeWealthProjection,
  HORIZON_OPTIONS,
  STEP_UP_OPTIONS,
  STUDENT_GOAL_PRESETS,
  type GoalPreset,
} from '../lib/wealthProjector';

interface WealthProjectorProps {
  language: 'ENG' | 'BM';
  portfolioEquityRM?: number;
}

export function WealthProjector({ language, portfolioEquityRM }: WealthProjectorProps) {
  const [initialCapital, setInitialCapital] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState<number>(10);
  const [riskLevel, setRiskLevel] = useState(5);
  const [annualStepUpPct, setAnnualStepUpPct] = useState<number>(0);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const activePreset = useMemo<GoalPreset | null>(
    () => STUDENT_GOAL_PRESETS.find((preset) => preset.id === activePresetId) || null,
    [activePresetId]
  );

  const summary = useMemo(
    () =>
      computeWealthProjection({
        initialCapital,
        monthlyContribution,
        years,
        riskLevel,
        annualStepUpPct,
        inflationAdjusted,
        targetGoalRM: activePreset ? activePreset.targetRM : null,
      }),
    [initialCapital, monthlyContribution, years, riskLevel, annualStepUpPct, inflationAdjusted, activePreset]
  );

  const maxInitialSlider = useMemo(() => {
    const equity = Math.round(portfolioEquityRM || 0);
    return Math.max(20000, Math.ceil(equity / 500) * 500);
  }, [portfolioEquityRM]);

  const applyPreset = (preset: GoalPreset) => {
    setActivePresetId(preset.id);
    setInitialCapital(preset.initialCapital);
    setMonthlyContribution(preset.monthlyContribution);
    setYears(preset.years);
    setRiskLevel(preset.riskLevel);
    setAnnualStepUpPct(preset.annualStepUpPct);
  };

  const resetCustom = () => {
    setActivePresetId(null);
    setInitialCapital(1000);
    setMonthlyContribution(500);
    setYears(10);
    setRiskLevel(5);
    setAnnualStepUpPct(0);
    setInflationAdjusted(false);
  };

  const clearPresetSelection = () => {
    if (activePresetId) setActivePresetId(null);
  };

  const isEng = language === 'ENG';

  const riskProfileDesc =
    riskLevel <= 3
      ? isEng
        ? 'Conservative: Sukuk / Blue-Chip Dividends'
        : 'Konservatif: Sukuk / Dividen Saham Mewah'
      : riskLevel <= 7
        ? isEng
          ? 'Balanced: Diversified Bursa Equities'
          : 'Seimbang: Ekuiti Bursa Terpelbagai'
        : isEng
          ? 'Aggressive: Growth & Tech Counters'
          : 'Agresif: Kaunter Pertumbuhan & Teknologi';

  const roundedEquity = portfolioEquityRM ? Math.round(portfolioEquityRM / 100) * 100 : 0;

  return (
    <section className="jomi-card jomi-card-pad jomi-stack-md">
      {/* Header */}
      <div className="jomi-between">
        <div className="jomi-cluster">
          <div className="jomi-ticker-badge">
            <BarChart3 size={19} />
          </div>
          <div>
            <h3 className="jomi-display jomi-title-lg">
              {isEng ? 'AI Compound Wealth Projector' : 'Unjuran Kekayaan Kompaun AI'}
            </h3>
            <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
              {isEng
                ? 'Compare Bursa compounding against Bank FD (3.0%) and EPF/ASB (5.5%)'
                : 'Bandingkan kompaun Bursa dengan Deposit Tetap (3.0%) dan KWSP/ASB (5.5%)'}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 800, textTransform: 'uppercase' }}>
            {isEng ? `${years}-Year Projection` : `Unjuran ${years} Tahun`}
          </p>
          <p className="jomi-display jomi-nums" style={{ fontSize: '1.85rem', fontWeight: 700, color: '#047857' }}>
            RM {summary.finalWealth.toLocaleString()}
          </p>
          <span
            className={summary.beatFdBy >= 0 ? 'jomi-pill-gain jomi-nums' : 'jomi-pill-loss jomi-nums'}
            style={{ marginTop: '0.2rem' }}
          >
            {summary.beatFdBy >= 0
              ? isEng
                ? `Beat FD by +RM ${summary.beatFdBy.toLocaleString()}`
                : `Atasi FD +RM ${summary.beatFdBy.toLocaleString()}`
              : isEng
                ? `vs FD: -RM ${Math.abs(summary.beatFdBy).toLocaleString()}`
                : `berbanding FD: -RM ${Math.abs(summary.beatFdBy).toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Student Goal Presets */}
      <div className="jomi-card-soft jomi-stack-xs" style={{ padding: '0.85rem 1rem' }}>
        <div className="jomi-between">
          <span className="jomi-cluster jomi-text-xs" style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f766e' }}>
            <Target size={14} />
            <span>{isEng ? 'Malaysian Student Goal Presets' : 'Pratetap Matlamat Pelajar Malaysia'}</span>
          </span>
          {activePreset && (
            <span className={summary.goalHitYear !== null ? 'jomi-pill-gain jomi-nums' : 'jomi-pill-neutral jomi-nums'}>
              {summary.goalHitYear !== null
                ? isEng
                  ? `Goal RM ${(activePreset.targetRM / 1000).toFixed(0)}k reached in Year ${summary.goalHitYear}`
                  : `Sasaran RM ${(activePreset.targetRM / 1000).toFixed(0)}k dicapai Tahun ${summary.goalHitYear}`
                : isEng
                  ? `Increase monthly or horizon to hit RM ${(activePreset.targetRM / 1000).toFixed(0)}k`
                  : `Tingkatkan bulanan atau tempoh untuk capai RM ${(activePreset.targetRM / 1000).toFixed(0)}k`}
            </span>
          )}
        </div>

        <div className="jomi-cluster" style={{ gap: '0.45rem' }}>
          {STUDENT_GOAL_PRESETS.map((preset) => {
            const isActive = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`jomi-btn jomi-btn-sm ${isActive ? 'jomi-btn-primary' : 'jomi-btn-outline'}`}
              >
                <span>{isEng ? preset.labelEng : preset.labelBm}</span>
                <span className="jomi-nums" style={{ opacity: isActive ? 0.95 : 0.75 }}>
                  RM {(preset.targetRM / 1000).toFixed(0)}k
                </span>
              </button>
            );
          })}
          {activePresetId && (
            <button type="button" onClick={resetCustom} className="jomi-btn jomi-btn-ghost jomi-btn-sm">
              <RotateCcw size={13} />
              <span>{isEng ? 'Reset' : 'Tetap Semula'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="jomi-bento-main">
        {/* Left: Chart + KPI Cards + Habit Swap */}
        <div className="jomi-stack-md">
          {/* Legend Pills */}
          <div className="jomi-cluster" style={{ gap: '0.5rem' }}>
            <span className="jomi-pill-gain">
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#0d9488' }} />
              {isEng ? 'Your Portfolio' : 'Portfolio Anda'} ({summary.effectiveRatePct}%)
            </span>
            <span className="jomi-pill-neutral">
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#f59e0b' }} />
              {isEng ? 'EPF / ASB (5.5%)' : 'KWSP / ASB (5.5%)'}
            </span>
            <span className="jomi-pill-sector">
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#64748b' }} />
              {isEng ? 'Bank FD (3.0%)' : 'FD Bank (3.0%)'}
            </span>
            <span className="jomi-pill-sector">
              <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#94a3b8' }} />
              {isEng ? 'Cash Invested' : 'Modal Dilabur'}
            </span>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.points} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="jomiWealthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6f4ef" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#527972' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(value) => `RM${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#527972' }}
                  axisLine={false}
                  tickLine={false}
                  width={58}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const row = payload[0]?.payload as {
                      wealth: number;
                      epfBenchmark: number;
                      fdBenchmark: number;
                      invested: number;
                      gain: number;
                    };
                    return (
                      <div className="jomi-chart-tooltip jomi-nums">
                        <div style={{ fontSize: '0.72rem', color: '#a7f3d0', marginBottom: '4px' }}>{label}</div>
                        <div>
                          {isEng ? 'Portfolio' : 'Portfolio'}: RM {row.wealth.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#fcd34d' }}>
                          {isEng ? 'EPF / ASB' : 'KWSP / ASB'}: RM {row.epfBenchmark.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
                          {isEng ? 'Bank FD' : 'FD Bank'}: RM {row.fdBenchmark.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          {isEng ? 'Invested' : 'Modal'}: RM {row.invested.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6ee7b7', marginTop: '2px' }}>
                          {isEng ? 'Gain' : 'Untung'}: +RM {row.gain.toLocaleString()}
                        </div>
                      </div>
                    );
                  }}
                />
                {activePreset && (
                  <ReferenceLine
                    y={activePreset.targetRM}
                    stroke="#b45309"
                    strokeDasharray="4 4"
                    label={{
                      value: `RM ${(activePreset.targetRM / 1000).toFixed(0)}k`,
                      position: 'insideTopRight',
                      fill: '#b45309',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="wealth"
                  stroke="#0d9488"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#jomiWealthGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="epfBenchmark"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="fdBenchmark"
                  stroke="#64748b"
                  strokeWidth={1.75}
                  strokeDasharray="3 3"
                  fillOpacity={0}
                />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stroke="#94a3b8"
                  strokeWidth={1.75}
                  strokeDasharray="5 5"
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 4-Card KPI Summary */}
          <div className="jomi-grid-4">
            <div className="jomi-card-soft jomi-stack-xs" style={{ padding: '0.8rem 0.9rem' }}>
              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 800 }}>
                {isEng ? 'PROJECTED WEALTH' : 'NILAI UNJURAN'}
              </span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#047857' }}>
                RM {summary.finalWealth.toLocaleString()}
              </span>
              <span className="jomi-text-xs jomi-muted jomi-nums" style={{ fontWeight: 700 }}>
                {summary.effectiveRatePct}% p.a. {inflationAdjusted ? (isEng ? 'real' : 'benar') : (isEng ? 'nominal' : 'nominal')}
              </span>
            </div>

            <div className="jomi-card-gold jomi-stack-xs" style={{ padding: '0.8rem 0.9rem' }}>
              <span className="jomi-text-xs" style={{ fontWeight: 800, color: 'var(--jomi-gold-ink)' }}>
                {isEng ? 'COMPOUND GAIN' : 'UNTUNG KOMPAUN'}
              </span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--jomi-gold-ink)' }}>
                +RM {summary.compoundGain.toLocaleString()}
              </span>
              <span className="jomi-text-xs jomi-nums" style={{ fontWeight: 700, color: 'var(--jomi-gold-ink)' }}>
                {isEng ? 'on' : 'atas'} RM {summary.finalInvested.toLocaleString()}
              </span>
            </div>

            <div className="jomi-card-soft jomi-stack-xs" style={{ padding: '0.8rem 0.9rem', backgroundColor: 'var(--jomi-canvas)', borderColor: 'var(--jomi-border)' }}>
              <span className="jomi-text-xs jomi-muted jomi-cluster" style={{ fontWeight: 800, gap: '0.25rem' }}>
                <Coins size={12} />
                <span>{isEng ? 'EST. DIVIDEND' : 'ANGG. DIVIDEN'}</span>
              </span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                RM {summary.estimatedMonthlyDividend.toLocaleString()}/mo
              </span>
              <span className="jomi-text-xs jomi-muted" style={{ fontWeight: 700 }}>
                {isEng ? 'at 5% Bursa yield' : 'pada hasil 5% Bursa'}
              </span>
            </div>

            <div
              className="jomi-card-soft jomi-stack-xs"
              style={{
                padding: '0.8rem 0.9rem',
                backgroundColor: 'var(--jomi-coral-soft)',
                borderColor: 'var(--jomi-coral-border)',
              }}
            >
              <span className="jomi-text-xs jomi-cluster" style={{ fontWeight: 800, color: '#b91c1c', gap: '0.25rem' }}>
                <Clock size={12} />
                <span>{isEng ? '3-YR DELAY COST' : 'KOS TANGGUH 3 THN'}</span>
              </span>
              <span className="jomi-display jomi-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#b91c1c' }}>
                -RM {summary.delayCost3Yr.toLocaleString()}
              </span>
              <span className="jomi-text-xs" style={{ fontWeight: 700, color: '#991b1b' }}>
                {isEng ? 'lost if starting 3y late' : 'hilang jika lewat 3 thn'}
              </span>
            </div>
          </div>

          {/* Habit Swap Insight */}
          <div className="jomi-row" style={{ cursor: 'default' }}>
            <div className="jomi-cluster" style={{ flexWrap: 'nowrap' }}>
              <Coffee size={18} color="#0d9488" style={{ flexShrink: 0 }} />
              <p className="jomi-text-sm" style={{ fontWeight: 700 }}>
                {isEng
                  ? `Daily Habit Swap: Saving RM ${summary.swapComparison.dailyRM}/day (RM ${summary.swapComparison.monthlyRM}/mo) compounds to `
                  : `Tukar Tabiat Harian: Simpan RM ${summary.swapComparison.dailyRM}/hari (RM ${summary.swapComparison.monthlyRM}/bln) berkembang menjadi `}
                <span className="jomi-nums" style={{ color: '#047857', fontWeight: 800 }}>
                  RM {summary.swapComparison.projectedRM.toLocaleString()}
                </span>
                {isEng ? ` in ${years} years.` : ` dalam ${years} tahun.`}
              </p>
            </div>
            <TrendingUp size={16} color="#047857" style={{ flexShrink: 0 }} />
          </div>
        </div>

        {/* Right: Controls Panel */}
        <div className="jomi-card-soft jomi-stack-md">
          {/* Horizon Selector */}
          <div className="jomi-stack-xs">
            <span className="jomi-text-sm" style={{ fontWeight: 800 }}>
              {isEng ? 'Time Horizon' : 'Tempoh Pelaburan'}
            </span>
            <div className="jomi-tabs-bar" style={{ width: '100%', justifyContent: 'space-between' }}>
              {HORIZON_OPTIONS.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    clearPresetSelection();
                    setYears(yr);
                  }}
                  className={`jomi-tab-btn jomi-nums ${years === yr ? 'jomi-tab-btn-active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', padding: '0.4rem 0.35rem' }}
                >
                  {yr}{isEng ? 'Y' : 'T'}
                </button>
              ))}
            </div>
          </div>

          {/* Starting Capital */}
          <div>
            <div className="jomi-between" style={{ marginBottom: '0.4rem' }}>
              <span className="jomi-text-sm" style={{ fontWeight: 800 }}>
                {isEng ? 'Starting Capital' : 'Modal Permulaan'}
              </span>
              <span className="jomi-pill-gain jomi-nums">RM {initialCapital.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxInitialSlider}
              step="500"
              value={initialCapital}
              onChange={(e) => {
                clearPresetSelection();
                setInitialCapital(parseInt(e.target.value, 10));
              }}
              className="jomi-slider"
            />
            {roundedEquity > 0 && (
              <div style={{ marginTop: '0.45rem' }}>
                <button
                  type="button"
                  className="jomi-btn jomi-btn-outline jomi-btn-sm"
                  onClick={() => {
                    clearPresetSelection();
                    setInitialCapital(roundedEquity);
                  }}
                >
                  <Wallet size={13} />
                  <span>
                    {isEng
                      ? `Use My Equity (RM ${roundedEquity.toLocaleString()})`
                      : `Guna Ekuiti Saya (RM ${roundedEquity.toLocaleString()})`}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Monthly Contribution */}
          <div>
            <div className="jomi-between" style={{ marginBottom: '0.4rem' }}>
              <span className="jomi-text-sm" style={{ fontWeight: 800 }}>
                {isEng ? 'Monthly Contribution' : 'Caruman Bulanan'}
              </span>
              <span className="jomi-pill-gain jomi-nums">RM {monthlyContribution.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={monthlyContribution}
              onChange={(e) => {
                clearPresetSelection();
                setMonthlyContribution(parseInt(e.target.value, 10));
              }}
              className="jomi-slider"
            />
          </div>

          {/* Risk Level */}
          <div>
            <div className="jomi-between" style={{ marginBottom: '0.4rem' }}>
              <span className="jomi-text-sm" style={{ fontWeight: 800 }}>
                {isEng ? 'Risk & Return Profile' : 'Profil Risiko & Pulangan'}
              </span>
              <span className={`jomi-nums ${riskLevel > 7 ? 'jomi-pill-loss' : riskLevel > 4 ? 'jomi-pill-neutral' : 'jomi-pill-gain'}`}>
                {riskLevel}/10 · {summary.nominalRatePct}%
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={riskLevel}
              onChange={(e) => {
                clearPresetSelection();
                setRiskLevel(parseInt(e.target.value, 10));
              }}
              className="jomi-slider"
            />
            <p className="jomi-text-xs jomi-muted" style={{ marginTop: '0.45rem', fontWeight: 700 }}>
              {riskProfileDesc} ({summary.nominalRatePct}% p.a.)
            </p>
          </div>

          {/* Annual Step-Up */}
          <div className="jomi-stack-xs">
            <span className="jomi-text-sm" style={{ fontWeight: 800 }}>
              {isEng ? 'Annual Salary Step-Up' : 'Kenaikan Caruman Tahunan'}
            </span>
            <div className="jomi-cluster" style={{ gap: '0.45rem' }}>
              {STEP_UP_OPTIONS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => {
                    clearPresetSelection();
                    setAnnualStepUpPct(step);
                  }}
                  className={`jomi-btn jomi-btn-sm jomi-nums ${annualStepUpPct === step ? 'jomi-btn-primary' : 'jomi-btn-outline'}`}
                  style={{ flex: 1 }}
                >
                  {step === 0 ? '0%' : `+${step}%/yr`}
                </button>
              ))}
            </div>
            <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>
              {isEng
                ? 'Automatically increases monthly investing each year as income grows.'
                : 'Menaikkan jumlah pelaburan bulanan setiap tahun apabila gaji meningkat.'}
            </p>
          </div>

          {/* Inflation Adjusted Switch */}
          <div
            className="jomi-between"
            style={{ paddingTop: '0.85rem', borderTop: '1.5px solid var(--jomi-emerald-border)' }}
          >
            <div>
              <p className="jomi-text-sm" style={{ fontWeight: 800 }}>
                {isEng ? 'Inflation Adjusted' : 'Dilaras Inflasi'}
              </p>
              <p className="jomi-text-xs jomi-muted" style={{ fontWeight: 600 }}>
                {isEng ? 'Real purchasing power (-3.0% p.a.)' : 'Kuasa beli sebenar (-3.0% setahun)'}
              </p>
            </div>
            <Switch checked={inflationAdjusted} onCheckedChange={setInflationAdjusted} />
          </div>
        </div>
      </div>
    </section>
  );
}
