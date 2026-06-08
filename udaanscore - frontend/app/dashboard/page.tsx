"use client";

import { useState, useEffect } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import CreditFactorCard from "@/components/CreditFactorCard";
import Link from "next/link";

// ── API Config ────────────────────────────────────────────────
const BASE_URL = "https://udaanscore-api.onrender.com";

// ── Types ─────────────────────────────────────────────────────
interface BorrowerData {
  name: string;
  trust_score: number;
  risk_band: string;
  loan_limit: number;
  confidence: string;
  bills_score: number;
  upi_score: number;
  cashflow_score: number;
  savings_score: number;
  location_score: number;
  quiz_score: number;
  nano_loan_stage: number;
  total_loans_repaid: number;
  monthly_income: number;
  occupation: string;
  city: string;
}

interface ExplainData {
  positive_factors: { factor: string; detail: string; impact: string }[];
  negative_factors: { factor: string; detail: string; impact: string }[];
  score_breakdown: Record<string, string>;
}

// ── Loan Offers (static — not from API) ───────────────────────
const loanOffers = [
  { bank: "HDFC Bank", type: "Personal Loan", amount: "₹5,00,000", rate: "10.5%", emi: "₹10,747/mo", badge: "Best Rate", color: "#3b96f2" },
  { bank: "Axis Bank", type: "Home Loan", amount: "₹50,00,000", rate: "8.75%", emi: "₹49,624/mo", badge: "Recommended", color: "#8b5cf6" },
  { bank: "Bajaj Finance", type: "Business Loan", amount: "₹8,50,000", rate: "11.2%", emi: "₹18,420/mo", badge: "Trust Match", color: "#22c55e" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "factors" | "offers">("overview");

  // ── State ──────────────────────────────────────────────────
  const [borrower, setBorrower] = useState<BorrowerData | null>(null);
  const [explain, setExplain] = useState<ExplainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Data on Load ─────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch borrower profile and explanation in parallel
        const [borrowerRes, explainRes] = await Promise.all([
          fetch(`${BASE_URL}/borrowers/Raju%20Sharma`),
          fetch(`${BASE_URL}/vault/explain/Raju%20Sharma`),
        ]);

        if (!borrowerRes.ok || !explainRes.ok) {
          throw new Error("Failed to fetch data from API");
        }

        const borrowerData = await borrowerRes.json();
        const explainData = await explainRes.json();

        setBorrower(borrowerData);
        setExplain(explainData);
      } catch (err) {
        setError("Unable to load data. Please try again.");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── Build Trust Factors from API data ─────────────────────
  const trustFactors = borrower
    ? [
        {
          icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
          label: "Utility Bill Consistency",
          value: `${borrower.bills_score}% on-time`,
          percentage: borrower.bills_score,
          trend: borrower.bills_score >= 75 ? "up" as const : "down" as const,
          trendText: borrower.bills_score >= 75 ? "+Good" : "Needs work",
          color: "#22c55e",
        },
        {
          icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 5 5-9" /></svg>,
          label: "Cash Flow Stability",
          value: `${borrower.cashflow_score}% stable`,
          percentage: borrower.cashflow_score,
          trend: borrower.cashflow_score >= 70 ? "up" as const : "stable" as const,
          trendText: borrower.cashflow_score >= 70 ? "+Good" : "Moderate",
          color: "#a78bfa",
        },
        {
          icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></svg>,
          label: "UPI Transaction Behavior",
          value: `${borrower.upi_score}% regular`,
          percentage: borrower.upi_score,
          trend: "stable" as const,
          trendText: `${borrower.upi_score >= 80 ? "High" : "Moderate"} velocity`,
          color: "#f59e0b",
        },
        {
          icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
          label: "Savings Pattern",
          value: `${borrower.savings_score}% score`,
          percentage: borrower.savings_score,
          trend: borrower.savings_score >= 70 ? "up" as const : "down" as const,
          trendText: borrower.savings_score >= 70 ? "Healthy" : "Low",
          color: "#3b96f2",
        },
        {
          icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
          label: "Location Stability",
          value: `${borrower.location_score}% stable`,
          percentage: borrower.location_score,
          trend: borrower.location_score >= 70 ? "up" as const : "stable" as const,
          trendText: borrower.location_score >= 80 ? "+Stable" : "Moderate",
          color: "#06b6d4",
        },
      ]
    : [];

  // ── Build Trust Metrics from API data ─────────────────────
  const trustMetrics = borrower
    ? [
        { label: "Confidence Score", value: borrower.confidence, sub: "Model certainty" },
        {
          label: "Risk Band",
          value: borrower.risk_band.split(" ")[0],
          sub: "Current profile",
          valueColor:
            borrower.risk_band === "Very Low Risk" ? "#22c55e" :
            borrower.risk_band === "Low Risk" ? "#86efac" :
            borrower.risk_band === "Medium Risk" ? "#f59e0b" : "#ef4444",
        },
        {
          label: "Eligible Loan",
          value: `₹${(borrower.loan_limit / 1000).toFixed(0)}K`,
          sub: "Pre-underwritten",
        },
      ]
    : [];

  // ── Build AI Insights from explain API ────────────────────
  const aiInsights = explain
    ? [
        ...explain.positive_factors.slice(0, 2).map((f) => ({
          type: "positive" as const,
          text: f.detail,
        })),
        ...explain.negative_factors.slice(0, 1).map((f) => ({
          type: "negative" as const,
          text: f.detail,
        })),
      ]
    : [];

  // ── Trust Health ──────────────────────────────────────────
  const trustHealth = borrower
    ? [
        { label: "Data freshness", value: "Live", color: "#22c55e" },
        { label: "Risk Band", value: borrower.risk_band.split(" ")[0], color: "#3b96f2" },
        { label: "Loans Repaid", value: `${borrower.total_loans_repaid}`, color: "#8b5cf6" },
        { label: "Nano Stage", value: `Stage ${borrower.nano_loan_stage}`, color: "#22c55e" },
      ]
    : [];

  // ── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-body flex items-center justify-center min-h-screen" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your Trust Score...</p>
          <p className="text-slate-600 text-xs mt-1">First load may take ~30 seconds</p>
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────
  if (error || !borrower) {
    return (
      <div className="page-body flex items-center justify-center min-h-screen" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
        <div className="text-center glass-card max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-2">Failed to load data</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────
  return (
    <div className="page-body" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #0f1a30 0%, #080c18 55%)" }}>
      <div className="page-container pt-8 md:pt-12">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <p className="section-label">Trust Dashboard</p>
            <h1 className="heading-page text-white mt-1">{borrower.name}</h1>
            <p className="text-caption mt-3">
              {borrower.occupation} · {borrower.city} · Income: ₹{borrower.monthly_income.toLocaleString()}/mo
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/simulator" id="dashboard-simulate-btn" className="btn-outline text-sm !py-2.5 !px-4">
              Simulate Trust Score
            </Link>
            <Link href="/consent" id="dashboard-consent-btn" className="btn-primary text-sm !py-2.5 !px-4">
              Manage Consent
            </Link>
          </div>
        </div>

        <div className="flex gap-1 p-1.5 glass rounded-xl mb-12 w-fit">
          {(["overview", "factors", "offers"] as const).map((tab) => (
            <button
              key={tab}
              id={`dashboard-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left: Trust Score Card */}
          <div className="lg:col-span-1 stack-xl">
            <div className="glass-card glass-card-static flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-10">
                <h2 className="heading-card text-white">Trust Score</h2>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-500/10 text-primary-300 border border-primary-500/30">
                  UdaanScore
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full pointer-events-none" />
                {/* REAL SCORE from API */}
                <ScoreGauge score={borrower.trust_score} maxScore={1000} minScore={0} size={240} />
              </div>

              <div className="mt-8 w-full glass rounded-xl p-4 flex items-center justify-between">
                <span className="text-caption">Risk Band</span>
                <span className={`font-semibold text-sm ${
                  borrower.risk_band === "Very Low Risk" ? "text-green-400" :
                  borrower.risk_band === "Low Risk" ? "text-green-300" :
                  borrower.risk_band === "Medium Risk" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {borrower.risk_band}
                </span>
              </div>

              <div className="mt-4 w-full grid grid-cols-3 gap-3 text-center">
                {trustMetrics.map((m) => (
                  <div key={m.label} className="glass rounded-xl p-3">
                    <p
                      className="text-white font-bold text-sm"
                      style={m.valueColor ? { color: m.valueColor } : undefined}
                    >
                      {m.value}
                    </p>
                    <p className="text-caption mt-1 leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 w-full glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-caption">Loan Eligibility</span>
                  <span className="text-green-400 font-semibold text-sm">
                    ₹{borrower.loan_limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-700 to-primary-400 h-2 rounded-full"
                    style={{ width: `${(borrower.trust_score / 1000) * 100}%` }}
                  />
                </div>
                <p className="text-caption mt-2">{borrower.trust_score} / 1000</p>
              </div>
            </div>

            {/* Activity Feed — from explain API */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Score Breakdown</h2>
              <div className="space-y-3">
                {explain && Object.entries(explain.score_breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-4">
                    <span className="text-sm mt-0.5 text-blue-400">→</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 body-md !text-[0.875rem] capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-caption mt-1">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Content Area */}
          <div className="lg:col-span-2 stack-xl">

            {activeTab === "overview" && (
              <div className="glass-card glass-card-static border border-primary-500/15">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                  <h2 className="heading-card text-white">AI Insights</h2>
                </div>
                <ul className="space-y-3">
                  {aiInsights.length > 0 ? aiInsights.map((item) => (
                    <li key={item.text} className="flex items-start gap-3 text-sm p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className={`font-bold shrink-0 ${item.type === "positive" ? "text-green-400" : "text-amber-400"}`}>
                        {item.type === "positive" ? "↑" : "⚠"}
                      </span>
                      <span className="text-slate-300 font-medium">{item.text}</span>
                    </li>
                  )) : (
                    <p className="text-slate-500 text-sm">No insights available</p>
                  )}
                </ul>
              </div>
            )}

            {/* Trust Factors — from API */}
            {(activeTab === "overview" || activeTab === "factors") && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-card text-white">Trust Factor Breakdown</h2>
                  <Link href="/journey" className="text-primary-400 text-sm font-medium hover:text-primary-300 transition-colors">
                    Improve →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
                  {trustFactors.map((f) => (
                    <CreditFactorCard key={f.label} {...f} />
                  ))}
                </div>
              </div>
            )}

            {/* Loan Offers */}
            {(activeTab === "overview" || activeTab === "offers") && (
              <div>
                <div className="flex items-center justify-between mb-6 gap-4">
                  <h2 className="heading-card text-white">Pre-Approved Offers</h2>
                  <span className="text-caption shrink-0">Based on Trust Score: {borrower.trust_score}</span>
                </div>
                <div className="space-y-5">
                  {loanOffers.map((offer) => (
                    <div key={offer.bank} className="glass-card glass-card-static flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden group hover:border-primary-500/30">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-inner relative z-10"
                        style={{ background: `linear-gradient(135deg, ${offer.color}33, ${offer.color}11)`, border: `1px solid ${offer.color}44`, color: offer.color }}
                      >
                        {offer.bank.split(" ").map((w) => w[0]).join("")}
                      </div>
                      <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-base">{offer.bank}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${offer.color}22`, color: offer.color }}>
                            {offer.badge}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{offer.type}</p>
                      </div>
                      <div className="flex items-center gap-6 text-right relative z-10">
                        <div>
                          <p className="text-white font-display font-bold text-lg">{offer.amount}</p>
                          <p className="text-slate-400 text-xs font-medium">@ {offer.rate}</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-white font-bold text-sm">{offer.emi}</p>
                          <p className="text-slate-400 text-xs font-medium">EMI</p>
                        </div>
                        <button id={`apply-${offer.bank.replace(/\s+/g, "-").toLowerCase()}`} className="btn-primary text-xs py-2.5 px-5 shrink-0 shadow-lg">
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Health Summary — from API */}
            {activeTab === "overview" && (
              <div className="glass-card glass-card-static">
                <h2 className="heading-card text-white mb-8">Trust Health Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-5">
                  {trustHealth.map((item) => (
                    <div key={item.label} className="glass rounded-xl p-5 text-center">
                      <p className="font-semibold text-xl tracking-tight" style={{ color: item.color }}>{item.value}</p>
                      <p className="text-caption mt-2 leading-tight">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
