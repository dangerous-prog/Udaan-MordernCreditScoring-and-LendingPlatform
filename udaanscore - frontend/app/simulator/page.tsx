"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import Link from "next/link";

// ── API Config ────────────────────────────────────────────────
const BASE_URL = "https://udaanscore-api.onrender.com";

// ── Types ─────────────────────────────────────────────────────
interface Factor {
  id: string;
  label: string;
  weight: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  tips: string[];
  color: string;
  icon: React.ReactNode;
}

// ── Factor definitions (weights match backend formula) ────────
const factors: Factor[] = [
  {
    id: "utilityBills",
    label: "Utility Bill Payments",
    weight: 0.20,
    min: 0, max: 100, step: 1, unit: "%",
    color: "#22c55e",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    tips: [
      "Enable auto-pay on electricity, water, and broadband bills.",
      "Missed utility payments reduce Trust Score faster than bureau defaults.",
    ],
  },
  {
    id: "upiActivity",
    label: "UPI Activity",
    weight: 0.20,
    min: 0, max: 100, step: 1, unit: "%",
    color: "#3b96f2",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    tips: [
      "Regular UPI inflows and merchant payments strengthen behavioral signals.",
      "Avoid long gaps with zero transaction velocity.",
    ],
  },
  {
    id: "cashFlow",
    label: "Cash Flow Stability",
    weight: 0.20,
    min: 0, max: 100, step: 1, unit: "%",
    color: "#f59e0b",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" /><path d="M7 16l4-8 4 5 5-9" />
      </svg>
    ),
    tips: [
      "Stable inflows over 6+ months significantly boost your Trust Score.",
      "Large unexplained spikes can trigger risk review.",
    ],
  },
  {
    id: "savings",
    label: "Savings Consistency",
    weight: 0.15,
    min: 0, max: 100, step: 1, unit: "%",
    color: "#a78bfa",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    tips: [
      "Maintain a steady monthly savings rate — even small amounts help.",
      "Volatile savings patterns lower confidence in repayment capacity.",
    ],
  },
  {
    id: "location",
    label: "Location Stability",
    weight: 0.10,
    min: 0, max: 100, step: 1, unit: "%",
    color: "#06b6d4",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    tips: [
      "Long-term residential stability increases lender confidence.",
      "Frequent location changes are flagged as instability risk.",
    ],
  },
  {
    id: "quiz",
    label: "Psychometric Assessment",
    weight: 0.15,
    min: 0, max: 100, step: 1, unit: "%",
    color: "#f97316",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    tips: [
      "Complete the financial discipline quiz to boost confidence score.",
      "High psychometric scores offset weak data signals.",
    ],
  },
];

// ── Fallback defaults if API fails ────────────────────────────
const fallbackDefaults: Record<string, number> = {
  utilityBills: 60,
  upiActivity: 72,
  cashFlow: 65,
  savings: 55,
  location: 80,
  quiz: 58,
};

// ── Score calculation (matches backend formula exactly) ───────
function calcTrustScore(values: Record<string, number>): number {
  const raw =
    values.utilityBills * 0.20 +
    values.upiActivity  * 0.20 +
    values.cashFlow     * 0.20 +
    values.savings      * 0.15 +
    values.location     * 0.10 +
    values.quiz         * 0.15;
  return Math.min(980, Math.max(300, Math.round(raw * 10)));
}

function calcConfidence(score: number): string {
  if (score >= 700) return "High";
  if (score >= 550) return "Medium";
  return "Low";
}

function calcRiskBand(score: number): string {
  if (score >= 800) return "Very Low Risk";
  if (score >= 700) return "Low Risk";
  if (score >= 600) return "Medium Risk";
  if (score >= 500) return "High Risk";
  return "Rejected";
}

function calcLoanLimit(score: number): number {
  if (score >= 800) return 100000;
  if (score >= 700) return 50000;
  if (score >= 600) return 15000;
  if (score >= 500) return 5000;
  return 0;
}

function formatLoan(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function calcApprovalChance(score: number): number {
  if (score >= 800) return 92;
  if (score >= 700) return 78;
  if (score >= 600) return 55;
  if (score >= 500) return 30;
  return 10;
}

const riskColors: Record<string, string> = {
  "Very Low Risk": "#22c55e",
  "Low Risk":      "#86efac",
  "Medium Risk":   "#f59e0b",
  "High Risk":     "#ef4444",
  "Rejected":      "#7f1d1d",
};

// ── Animated number hook ──────────────────────────────────────
function useAnimatedNumber(target: number, duration = 450) {
  const [display, setDisplay] = useState(target);
  const frameRef = useRef<number | null>(null);
  const fromRef  = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) { frameRef.current = requestAnimationFrame(tick); }
      else { fromRef.current = target; }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);

  return display;
}

function MetricTile({ label, value, sub, color, }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center transition-all duration-500 ease-out border-b-2"
      style={{ borderBottomColor: color ? `${color}40` : "transparent" }}>
      <p className="font-display font-bold text-2xl transition-colors duration-500"
        style={color ? { color } : { color: "#fff" }}>
        {value}
      </p>
      <p className="text-slate-300 font-medium text-xs mt-1 leading-tight">{label}</p>
      {sub && <p className="text-slate-500 text-[10px] mt-1 font-medium">{sub}</p>}
    </div>
  );
}

export default function SimulatorPage() {
  // ── State ──────────────────────────────────────────────────
  const [values, setValues]     = useState<Record<string, number>>(fallbackDefaults);
  const [baseline, setBaseline] = useState<Record<string, number>>(fallbackDefaults);
  const [loading, setLoading]   = useState(true);
  const [apiLoaded, setApiLoaded] = useState(false);

  // ── Fetch real Raju scores to seed sliders ─────────────────
  useEffect(() => {
    const fetchBorrower = async () => {
      try {
        const res = await fetch(`${BASE_URL}/borrowers/Raju%20Sharma`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        // Map API field names to our factor IDs
        const realValues: Record<string, number> = {
          utilityBills: Math.round(data.bills_score),
          upiActivity:  Math.round(data.upi_score),
          cashFlow:     Math.round(data.cashflow_score),
          savings:      Math.round(data.savings_score),
          location:     Math.round(data.location_score),
          quiz:         Math.round(data.quiz_score),
        };

        setValues(realValues);
        setBaseline(realValues);
        setApiLoaded(true);
      } catch (err) {
        console.error("Simulator API Error:", err);
        // Keep fallback defaults — simulator still works
      } finally {
        setLoading(false);
      }
    };

    fetchBorrower();
  }, []);

  // ── Computed values ────────────────────────────────────────
  const currentScore  = useMemo(() => calcTrustScore(baseline), [baseline]);
  const futureScore   = useMemo(() => calcTrustScore(values),   [values]);
  const delta         = futureScore - currentScore;

  const futureRisk    = calcRiskBand(futureScore);
  const baselineRisk  = calcRiskBand(currentScore);
  const futureLoan    = calcLoanLimit(futureScore);
  const currentLoan   = calcLoanLimit(currentScore);
  const loanUnlock    = Math.max(0, futureLoan - currentLoan);
  const futureApproval = calcApprovalChance(futureScore);
  const futureConfidence = calcConfidence(futureScore);
  const baselineConfidence = calcConfidence(currentScore);

  const animFutureScore = useAnimatedNumber(futureScore);
  const animApproval    = useAnimatedNumber(futureApproval);

  const activeTips = useMemo(() => {
    const tips: string[] = [];
    factors.forEach((f) => {
      if ((values[f.id] / 100) < 0.55) tips.push(f.tips[0]);
    });
    return tips.slice(0, 4);
  }, [values]);

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-body flex items-center justify-center min-h-screen"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading Raju's real scores...</p>
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────
  return (
    <div className="page-body"
      style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
      <div className="page-container pt-8 md:pt-12">

        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="section-label">Trust Score Simulator</p>
          <h1 className="heading-page text-white mt-2 mb-5">
            Model Your <span className="gradient-text">Trust Future</span>
          </h1>
          <p className="body-md max-w-xl mx-auto">
            Sliders are seeded with Raju&apos;s real scores. Adjust to see how each signal
            affects the Trust Score — live, before applying.
          </p>
          {/* Show API badge if real data loaded */}
          {apiLoaded && (
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full glass border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">
                Seeded with Raju&apos;s live data · Score {currentScore}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left: Sliders */}
          <div className="lg:col-span-2 space-y-5">
            {factors.map((f, i) => {
              const v       = values[f.id];
              const fillPct = v; // already 0-100
              const isGood  = fillPct >= 60;

              return (
                <div key={f.id} className="glass-card glass-card-static"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${f.color}22`, border: `1px solid ${f.color}44`, color: f.color }}>
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{f.label}</p>
                        <p className="text-slate-400 text-xs">Weight: {Math.round(f.weight * 100)}% of score</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg tabular-nums transition-colors duration-300"
                        style={{ color: isGood ? "#22c55e" : f.color }}>
                        {v}{f.unit}
                      </span>
                      <div className="text-xs mt-0.5 transition-colors duration-300"
                        style={{ color: isGood ? "#22c55e" : "#f59e0b" }}>
                        {isGood ? "✓ Strong signal" : "⚠ Needs improvement"}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="h-2.5 rounded-full bg-white/10 mb-1 relative overflow-hidden">
                      <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out"
                        style={{
                          width: `${fillPct}%`,
                          background: `linear-gradient(90deg, ${f.color}66, ${f.color})`,
                          boxShadow: `0 0 12px ${f.color}44`,
                        }}
                      />
                    </div>
                    <input
                      id={`slider-${f.id}`}
                      type="range"
                      min={f.min} max={f.max} step={f.step}
                      value={v}
                      onChange={(e) => setValues((prev) => ({ ...prev, [f.id]: +e.target.value }))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-2.5"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{f.min}{f.unit}</span>
                      <span>{f.max}{f.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              id="simulator-reset"
              onClick={() => setValues({ ...baseline })}
              className="btn-outline text-sm w-full py-2.5"
            >
              ↺ Reset to Raju&apos;s Real Profile
            </button>
          </div>

          {/* Right: Results */}
          <div className="stack-xl">

            {/* Score comparison */}
            <div className="glass-card glass-card-static relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 blur-[50px] pointer-events-none" />
              <h2 className="heading-card text-white mb-8 text-center relative z-10">
                Trust Score Projection
              </h2>

              <div className="flex items-center justify-between relative z-10">
                <div className="text-center flex-1">
                  <p className="text-slate-400 text-[10px] font-bold mb-2 uppercase tracking-widest">Current</p>
                  <div className="opacity-60 scale-90">
                    <ScoreGauge score={currentScore} maxScore={1000} minScore={0} size={110} animated={false} />
                  </div>
                </div>

                <div className={`flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-full border-4 shadow-xl z-20 transition-all duration-500 ${
                  delta > 0 ? "bg-navy-900 border-green-500/30 text-green-400" :
                  delta < 0 ? "bg-navy-900 border-red-500/30 text-red-400" :
                              "bg-navy-900 border-slate-700 text-slate-400"
                }`}>
                  <span className="text-lg">{delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}</span>
                  <span className="tabular-nums font-bold text-sm leading-none">
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                </div>

                <div className="text-center flex-1">
                  <p className="text-primary-400 text-[10px] font-bold mb-2 uppercase tracking-widest">Projected</p>
                  <ScoreGauge
                    key={animFutureScore}
                    score={futureScore}
                    maxScore={1000}
                    minScore={0}
                    size={130}
                    animated
                  />
                </div>
              </div>
            </div>

            {/* Live metrics */}
            <div className="glass-card glass-card-static border border-primary-500/12">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                <h2 className="heading-card text-white">Live Outcomes</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MetricTile
                  label="Confidence"
                  value={futureConfidence}
                  sub={futureConfidence !== baselineConfidence ? `Was ${baselineConfidence}` : "Unchanged"}
                  color="#3b96f2"
                />
                <MetricTile
                  label="Risk Band"
                  value={futureRisk.split(" ")[0]}
                  sub={futureRisk !== baselineRisk ? `Was ${baselineRisk.split(" ")[0]}` : "Stable"}
                  color={riskColors[futureRisk]}
                />
                <MetricTile
                  label="Loan Limit"
                  value={formatLoan(futureLoan)}
                  sub="Pre-underwritten cap"
                  color="#22c55e"
                />
                <MetricTile
                  label="Approval Chance"
                  value={`${animApproval}%`}
                  sub="Partner lender estimate"
                  color={animApproval >= 70 ? "#22c55e" : animApproval >= 45 ? "#f59e0b" : "#ef4444"}
                />
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Approval probability</span>
                  <span className="tabular-nums text-slate-300">{animApproval}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 transition-all duration-500 ease-out"
                    style={{ width: `${animApproval}%` }} />
                </div>
              </div>
            </div>

            {/* Loan unlock */}
            <div className={`glass-card glass-card-static ${loanUnlock > 0 ? "border border-green-500/20" : ""}`}>
              <h2 className="heading-card text-white mb-3">Potential Loan Unlock</h2>
              {loanUnlock > 0 ? (
                <>
                  <p className="text-3xl font-display font-bold text-green-400 tabular-nums">
                    +{formatLoan(loanUnlock)}
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    Additional eligibility if Raju reaches this profile ({formatLoan(currentLoan)} → {formatLoan(futureLoan)}).
                  </p>
                </>
              ) : delta < 0 ? (
                <p className="text-amber-400 text-sm">
                  This profile reduces eligibility by {formatLoan(currentLoan - futureLoan)}.
                </p>
              ) : (
                <p className="text-slate-400 text-sm">
                  Raise signals to unlock a higher loan tier.
                </p>
              )}
            </div>

            {/* AI tips */}
            <div className="glass-card glass-card-static">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-7 h-7 rounded-lg bg-primary-700/40 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2 className="heading-card text-white">AI Recommendations</h2>
              </div>
              {activeTips.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-green-400 font-medium text-sm">Strong trust profile!</p>
                  <p className="text-slate-400 text-xs mt-1">All signals are in optimal range.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {activeTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-primary-700/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-primary-400 text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link href="/dashboard" className="btn-primary text-sm w-full py-3 text-center block">
              View Trust Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}