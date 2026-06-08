"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";

// ── API Config ────────────────────────────────────────────────
const BASE_URL = "https://udaanscore-api.onrender.com";

// ── Types ─────────────────────────────────────────────────────
type TaskStatus = "completed" | "in_progress" | "pending";

interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number;
  scoreBoost: number;
  dueLabel?: string;
  icon: React.ReactNode;
  color: string;
}

interface CreditBuilderData {
  borrower_name: string;
  current_score: number;
  current_risk_band: string;
  milestone_target: number;
  milestone_label: string;
  predicted_score_if_all_done: number;
  tasks: { task: string; score_impact: string; category: string }[];
  total_tasks: number;
  estimated_days: number;
}

interface BorrowerData {
  trust_score: number;
  loan_limit: number;
  risk_band: string;
  nano_loan_stage: number;
  total_loans_repaid: number;
}

// ── Icon map by category ──────────────────────────────────────
const categoryIcons: Record<string, React.ReactNode> = {
  Bills: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Savings: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  "UPI Activity": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" />
    </svg>
  ),
  Assessment: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  "Cash Flow": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" /><path d="M7 16l4-8 4 5 5-9" />
    </svg>
  ),
  Stability: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  "Loan Repayment": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
};

const categoryColors: Record<string, string> = {
  Bills: "#22c55e",
  Savings: "#3b96f2",
  "UPI Activity": "#f59e0b",
  Assessment: "#a78bfa",
  "Cash Flow": "#06b6d4",
  Stability: "#f97316",
  "Loan Repayment": "#ec4899",
};

// ── Loan unlock levels (dynamic based on current score) ───────
function getLoanUnlockLevels(currentScore: number) {
  return [
    { minScore: 400, amount: "₹2,000",  rate: "Nano Starter", unlocked: currentScore >= 400 },
    { minScore: 500, amount: "₹5,000",  rate: "Small Loan",   unlocked: currentScore >= 500 },
    { minScore: 600, amount: "₹15,000", rate: "Growth Loan",  unlocked: currentScore >= 600 },
    { minScore: 700, amount: "₹50,000", rate: "Scale Loan",   unlocked: currentScore >= 700 },
  ];
}

function statusLabel(status: TaskStatus) {
  if (status === "completed")  return { text: "Completed",  className: "bg-green-400/10 text-green-400 border-green-400/30"    };
  if (status === "in_progress") return { text: "In progress", className: "bg-primary-500/10 text-primary-300 border-primary-500/30" };
  return { text: "Pending", className: "bg-white/5 text-slate-400 border-white/10" };
}

export default function JourneyPage() {
  // ── State ──────────────────────────────────────────────────
  const [creditBuilder, setCreditBuilder] = useState<CreditBuilderData | null>(null);
  const [borrower, setBorrower] = useState<BorrowerData | null>(null);
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Data ─────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [builderRes, borrowerRes] = await Promise.all([
          fetch(`${BASE_URL}/features/credit-builder/Raju%20Sharma`),
          fetch(`${BASE_URL}/borrowers/Raju%20Sharma`),
        ]);

        if (!builderRes.ok || !borrowerRes.ok) throw new Error("Failed to fetch journey data");

        const builderData: CreditBuilderData = await builderRes.json();
        const borrowerData: BorrowerData = await borrowerRes.json();

        setCreditBuilder(builderData);
        setBorrower(borrowerData);

        // Convert API tasks to RoadmapTask format
        const roadmapTasks: RoadmapTask[] = builderData.tasks.map((t, i) => ({
          id: `task-${i}`,
          title: t.task,
          description: `Category: ${t.category} · Impact: ${t.score_impact}`,
          status: "pending" as TaskStatus,
          progress: 0,
          scoreBoost: parseInt(t.score_impact.replace(/[^0-9]/g, "")) || 10,
          dueLabel: `Est. ${builderData.estimated_days} days`,
          color: categoryColors[t.category] || "#3b96f2",
          icon: categoryIcons[t.category] || categoryIcons["Assessment"],
        }));

        setTasks(roadmapTasks);
      } catch (err) {
        setError("Unable to load journey data.");
        console.error("Journey API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Computed values ────────────────────────────────────────
  const journeyProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const total = tasks.reduce((sum, t) => sum + t.progress, 0);
    return Math.round(total / tasks.length);
  }, [tasks]);

  const earnedBoost = useMemo(() =>
    tasks.reduce((sum, t) => sum + Math.round((t.progress / 100) * t.scoreBoost), 0),
    [tasks]
  );

  const totalPotentialBoost = useMemo(() =>
    tasks.reduce((sum, t) => sum + t.scoreBoost, 0),
    [tasks]
  );

  const currentScore = borrower?.trust_score ?? 0;
  const remainingBoost = totalPotentialBoost - earnedBoost;
  const projectedScore = creditBuilder?.predicted_score_if_all_done ?? currentScore + totalPotentialBoost;

  const loanUnlockLevels = getLoanUnlockLevels(currentScore);

  // ── Milestones from API ────────────────────────────────────
  const milestones = creditBuilder ? [
    {
      score: 600,
      label: "Medium Risk Band",
      reward: "Unlock ₹15,000 growth loan",
      reached: currentScore >= 600,
    },
    {
      score: 700,
      label: "Low Risk Band",
      reward: "Unlock ₹50,000 scale loan",
      reached: currentScore >= 700,
    },
    {
      score: creditBuilder.milestone_target,
      label: creditBuilder.milestone_label,
      reward: `Projected score: ${projectedScore}`,
      reached: currentScore >= creditBuilder.milestone_target,
    },
    {
      score: 800,
      label: "Very Low Risk Band",
      reward: "Priority lender matching",
      reached: currentScore >= 800,
    },
  ] : [];

  // ── Toggle task progress ───────────────────────────────────
  const toggleTaskProgress = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.progress >= 100) return { ...t, progress: 0, status: "pending" as const };
        const next = Math.min(100, t.progress + 50);
        return {
          ...t,
          progress: next,
          status: next >= 100 ? ("completed" as const) : ("in_progress" as const),
        };
      })
    );
  };

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-body flex items-center justify-center min-h-screen"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your Credit Builder Journey...</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────
  if (error || !creditBuilder || !borrower) {
    return (
      <div className="page-body flex items-center justify-center min-h-screen"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="text-center glass-card max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-2">Failed to load journey</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">Retry</button>
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────
  return (
    <div className="page-body"
      style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
      <div className="page-container pt-8 md:pt-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="section-label">Credit Builder Journey</p>
            <h1 className="heading-page text-white mt-2 mb-4">
              Build trust, <span className="gradient-text">unlock credit</span>
            </h1>
            <p className="body-md max-w-xl">
              Complete guided actions to raise your Trust Score and unlock higher loan tiers — no bureau history required.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/simulator" className="btn-outline text-sm py-2 px-4">Simulate Impact</Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2 px-4">Trust Dashboard</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left panel */}
          <div className="lg:col-span-1 stack-xl">
            <div className="glass-card glass-card-static flex flex-col items-center">
              <p className="text-caption uppercase tracking-widest mb-4 w-full text-center">
                Current Trust Score
              </p>
              {/* REAL score from API */}
              <ScoreGauge score={currentScore} maxScore={1000} minScore={0} size={200} animated={false} />
              <div className="w-full mt-4 glass rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Journey progress</span>
                  <span className="text-white font-semibold tabular-nums">{journeyProgress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 transition-all duration-700 ease-out"
                    style={{ width: `${journeyProgress}%` }}
                  />
                </div>
                {/* Risk Band from API */}
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-slate-400">Risk Band</span>
                  <span className={`font-semibold text-xs ${
                    borrower.risk_band === "Very Low Risk" ? "text-green-400" :
                    borrower.risk_band === "Low Risk" ? "text-green-300" :
                    borrower.risk_band === "Medium Risk" ? "text-yellow-400" : "text-red-400"
                  }`}>{borrower.risk_band}</span>
                </div>
              </div>
            </div>

            {/* Score boost card */}
            <div className="glass-card glass-card-static border border-primary-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[40px] pointer-events-none" />
              <h2 className="heading-card text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Expected Score Increase
              </h2>
              <div className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Earned so far</p>
                    <p className="text-3xl font-display font-bold text-green-400 tabular-nums">+{earnedBoost}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm font-medium">If all complete</p>
                    <p className="text-3xl font-display font-bold gradient-text tabular-nums">+{totalPotentialBoost}</p>
                  </div>
                </div>
                <div className="glass rounded-2xl p-6 text-center border-primary-500/30 bg-primary-500/5 relative shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent rounded-2xl pointer-events-none" />
                  <p className="text-slate-300 text-sm font-medium mb-1 tracking-wider uppercase">Projected Trust Score</p>
                  {/* REAL projected score from API */}
                  <p className="font-display text-5xl font-bold text-white tabular-nums my-2 drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                    {projectedScore}
                  </p>
                  <p className="text-primary-300 text-sm font-medium">+{remainingBoost} pts remaining to unlock</p>
                </div>
              </div>
            </div>

            {/* Loan unlock levels — dynamic from score */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Nano Loan Ladder</h2>
              <div className="space-y-2">
                {loanUnlockLevels.map((tier) => {
                  const isCurrent =
                    currentScore >= tier.minScore &&
                    (loanUnlockLevels.find((t) => t.minScore > tier.minScore && currentScore >= t.minScore) === undefined);
                  return (
                    <div
                      key={tier.minScore}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                        isCurrent
                          ? "border-primary-500/50 bg-primary-500/10"
                          : tier.unlocked
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-white/5 bg-white/[0.02] opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          tier.unlocked ? "bg-green-400/20 text-green-400" : "bg-white/5 text-slate-500"
                        }`}>
                          {tier.unlocked ? "✓" : "🔒"}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{tier.amount}</p>
                          <p className="text-slate-500 text-xs">Score {tier.minScore}+ · {tier.rate}</p>
                        </div>
                      </div>
                      {isCurrent && <span className="text-primary-300 text-xs font-semibold">You are here</span>}
                      {!tier.unlocked && <span className="text-slate-500 text-xs">+{tier.minScore - currentScore} pts</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Roadmap + milestones */}
          <div className="lg:col-span-2 stack-xl">
            {/* Roadmap tasks — from API */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="heading-card text-white text-lg">Your Roadmap</h2>
                <span className="text-slate-400 text-xs">
                  {tasks.filter((t) => t.status === "completed").length} of {tasks.length} complete
                </span>
              </div>
              <div className="space-y-4">
                {tasks.map((task, i) => {
                  const badge = statusLabel(task.status);
                  const earned = Math.round((task.progress / 100) * task.scoreBoost);
                  return (
                    <div
                      key={task.id}
                      className="glass-card glass-card-static"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                          style={{
                            background: `linear-gradient(135deg, ${task.color}33, ${task.color}11)`,
                            border: `1px solid ${task.color}44`,
                            color: task.color,
                          }}
                        >
                          {task.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">{task.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
                              {badge.text}
                            </span>
                            <span className="text-green-400 text-xs font-semibold ml-auto sm:ml-0">
                              +{task.scoreBoost} pts
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{task.description}</p>
                          {task.dueLabel && <p className="text-slate-500 text-xs mb-3">{task.dueLabel}</p>}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${task.progress}%`,
                                  background: `linear-gradient(90deg, ${task.color}88, ${task.color})`,
                                }}
                              />
                            </div>
                            <span className="text-slate-300 text-xs font-medium tabular-nums w-10 text-right">
                              {task.progress}%
                            </span>
                          </div>
                          {earned > 0 && earned < task.scoreBoost && (
                            <p className="text-primary-300 text-xs mt-2">+{earned} pts earned toward this task</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleTaskProgress(task.id)}
                          className="btn-outline text-xs py-2 px-3 shrink-0 self-start sm:self-center"
                        >
                          {task.progress >= 100 ? "Reset" : "Mark progress"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones — from API */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-8">Milestones</h2>
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary-500/50 via-primary-700/30 to-transparent" />
                <div className="space-y-6">
                  {milestones.map((m, i) => {
                    const upcoming = m.score <= projectedScore && !m.reached;
                    return (
                      <div key={m.score} className="flex items-start gap-4 relative"
                        style={{ animationDelay: `${i * 100}ms` }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all duration-300 ${
                          m.reached
                            ? "bg-primary-500 border-primary-300 text-white"
                            : upcoming
                              ? "bg-primary-900/80 border-primary-600/50 text-primary-400"
                              : "bg-navy-800 border-white/10 text-slate-500"
                        }`}>
                          {m.reached ? (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <span className="text-xs font-bold">{m.score}</span>
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-white font-semibold">{m.label}</p>
                            <span className="text-slate-500 text-xs">@ {m.score}</span>
                            {m.reached && <span className="text-green-400 text-xs font-medium">Reached ✓</span>}
                            {!m.reached && upcoming && <span className="text-primary-300 text-xs font-medium">On track</span>}
                          </div>
                          <p className="text-slate-400 text-sm mt-0.5">{m.reward}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div
              className="rounded-2xl p-10 md:p-12 text-center relative overflow-hidden border border-white/[0.08]"
              style={{ background: "linear-gradient(160deg, #1a4a9e 0%, #0f2d6b 45%, #080c18 100%)" }}
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #60b7f7 0%, transparent 50%), radial-gradient(circle at 70% 50%, #3b96f2 0%, transparent 50%)" }}
              />
              <div className="relative z-10">
                <h3 className="heading-card text-white text-xl mb-3">Complete your next action today</h3>
                <p className="text-primary-200 text-sm mb-5 max-w-md mx-auto">
                  {creditBuilder.tasks[0]?.task ?? "Complete your first task"} to move closer to the next loan tier.
                </p>
                <Link href="/consent" className="btn-primary text-sm px-8 py-3 inline-block">
                  Link Accounts & Continue →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
