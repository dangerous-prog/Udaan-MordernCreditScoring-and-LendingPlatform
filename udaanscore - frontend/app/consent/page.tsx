"use client";

import React, { useState, useEffect } from "react";
import ConsentCard from "@/components/ConsentCard";

// ── API Config ────────────────────────────────────────────────
const BASE_URL = "https://udaanscore-api.onrender.com";

// ── Types ─────────────────────────────────────────────────────
interface ConsentItem {
  label: string;
  description: string;
  score_weight: string;
  icon: string;
  consented: boolean;
}

interface ConsentData {
  borrower_name: string;
  consents: Record<string, ConsentItem>;
  total_consented: number;
  out_of: number;
  confidence_level: string;
  message: string;
}

// ── Map API keys to UI icons ───────────────────────────────────
const sourceIcons: Record<string, React.ReactElement> = {
  bank_data: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
    </svg>
  ),
  upi_data: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  utility_bills: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  gst_data: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  location_data: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  psychometric_data: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

// ── Audit log (static for demo) ───────────────────────────────
const auditLog = [
  { action: "Data Accessed",   source: "Bank Data",       by: "UdaanScore",  time: "Today, 10:30 AM",   type: "read"   },
  { action: "Consent Granted", source: "UPI Data",        by: "You",         time: "Yesterday, 3:14 PM", type: "grant"  },
  { action: "Consent Paused",  source: "GST Portal",      by: "You",         time: "2 weeks ago",        type: "pause"  },
  { action: "Consent Revoked", source: "Location Data",   by: "You",         time: "1 month ago",        type: "revoke" },
];

const typeConfig = {
  read:   { color: "text-blue-400",   bg: "bg-blue-400/10",   label: "Read"    },
  grant:  { color: "text-green-400",  bg: "bg-green-400/10",  label: "Granted" },
  pause:  { color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Paused"  },
  revoke: { color: "text-red-400",    bg: "bg-red-400/10",    label: "Revoked" },
};

export default function ConsentVaultPage() {
  // ── State ──────────────────────────────────────────────────
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Consent Data ─────────────────────────────────────
  const fetchConsent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/vault/consent/Raju%20Sharma`);
      if (!res.ok) throw new Error("Failed to fetch consent data");
      const data = await res.json();
      setConsentData(data);
    } catch (err) {
      setError("Unable to load consent data.");
      console.error("Consent API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsent();
  }, []);

  // ── Toggle Consent ─────────────────────────────────────────
  const handleToggle = async (key: string, currentValue: boolean) => {
    try {
      setUpdating(key);
      const res = await fetch(`${BASE_URL}/vault/consent/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrower_name: "Raju Sharma",
          [key]: !currentValue,
        }),
      });
      if (!res.ok) throw new Error("Failed to update consent");
      const updated = await res.json();
      setConsentData(updated);
    } catch (err) {
      console.error("Toggle Error:", err);
    } finally {
      setUpdating(null);
    }
  };

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-body flex items-center justify-center min-h-screen"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #12102a 0%, #080c18 55%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading Consent Vault...</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────
  if (error || !consentData) {
    return (
      <div className="page-body flex items-center justify-center min-h-screen"
        style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #12102a 0%, #080c18 55%)" }}>
        <div className="text-center glass-card max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-2">Failed to load consent data</p>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button onClick={fetchConsent} className="btn-primary text-sm">Retry</button>
        </div>
      </div>
    );
  }

  // ── Build data sources from API ────────────────────────────
  const activeCount = Object.values(consentData.consents).filter((c) => c.consented).length;
  const revokedCount = Object.values(consentData.consents).filter((c) => !c.consented).length;

  return (
    <div className="page-body"
      style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, #12102a 0%, #080c18 55%)" }}>
      <div className="page-container pt-8 md:pt-12">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-12">
          <div className="max-w-lg">
            <p className="section-label">Consent Vault</p>
            <h1 className="heading-page text-white mt-2 mb-4">
              Your Data, <span className="gradient-text">Your Rules</span>
            </h1>
            <p className="body-md max-w-lg">
              You control exactly who can access your financial data. Toggle permissions anytime with full audit transparency.
            </p>
            {/* Confidence level from API */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10">
              <span className={`w-2 h-2 rounded-full ${
                consentData.confidence_level === "High" ? "bg-green-400" :
                consentData.confidence_level === "Medium" ? "bg-yellow-400" : "bg-red-400"
              }`} />
              <span className="text-slate-300 text-xs font-medium">
                Confidence: {consentData.confidence_level} · {consentData.message}
              </span>
            </div>
          </div>

          {/* Stats from API */}
          <div className="flex gap-4 shrink-0">
            {[
              { label: "Connected",  value: activeCount,      color: "text-green-400"  },
              { label: "Revoked",    value: revokedCount,     color: "text-red-400"    },
              { label: "Total",      value: consentData.out_of, color: "text-blue-400" },
            ].map((s) => (
              <div key={s.label} className="glass-card glass-card-static glass-card-compact text-center min-w-[88px]">
                <p className={`font-display text-2xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
                <p className="text-caption mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security badges */}
        <div className="flex flex-wrap gap-3 mb-12">
          {[
            { icon: "🔒", label: "256-bit AES Encrypted" },
            { icon: "🛡",  label: "RBI DPDP Compliant"   },
            { icon: "✓",  label: "ISO 27001 Certified"   },
            { icon: "👁",  label: "Zero Data Selling"     },
          ].map((badge) => (
            <div key={badge.label} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass border border-white/10 text-sm">
              <span>{badge.icon}</span>
              <span className="text-slate-300 font-medium text-xs">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* Left: Consent toggles from API */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-card text-white text-lg">Data Sources</h2>
              <span className="text-caption">{activeCount} of {consentData.out_of} active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
              {Object.entries(consentData.consents).map(([key, item]) => (
                <div key={key} className="glass-card glass-card-static relative">
                  {/* Icon + Label */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.consented ? "bg-primary-500/20 text-primary-400" : "bg-white/5 text-slate-500"
                      }`}>
                        {sourceIcons[key] || (
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{item.label}</p>
                        <p className="text-caption text-xs">{item.score_weight}</p>
                      </div>
                    </div>

                    {/* Toggle button */}
                    <button
                      onClick={() => handleToggle(key, item.consented)}
                      disabled={updating === key}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                        item.consented ? "bg-primary-500" : "bg-white/10"
                      } ${updating === key ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        item.consented ? "translate-x-6" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Status badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.consented
                      ? "bg-green-400/10 text-green-400"
                      : "bg-red-400/10 text-red-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.consented ? "bg-green-400" : "bg-red-400"
                    }`} />
                    {item.consented ? "Active" : "Revoked"}
                    {updating === key && " · Updating..."}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Audit log + Data rights */}
          <div className="stack-xl">

            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Audit Log</h2>
              <div className="space-y-4">
                {auditLog.map((entry, i) => {
                  const cfg = typeConfig[entry.type as keyof typeof typeConfig];
                  return (
                    <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-slate-300 text-xs truncate">{entry.source}</span>
                          </div>
                          <p className="text-slate-500 text-xs">{entry.action} by {entry.by}</p>
                        </div>
                        <span className="text-slate-500 text-xs shrink-0 text-right">{entry.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button id="audit-download" className="btn-outline text-xs w-full py-2 mt-4">
                ↓ Download Full Report
              </button>
            </div>

            {/* Data rights */}
            <div className="glass-card glass-card-static">
              <h2 className="heading-card text-white mb-6">Your Data Rights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "👁", right: "Right to View",    desc: "See all data we hold about you anytime." },
                  { icon: "✏",  right: "Right to Correct", desc: "Fix inaccurate data in your profile."    },
                  { icon: "🗑",  right: "Right to Delete",  desc: "Request permanent deletion of your data." },
                  { icon: "📦", right: "Right to Export",  desc: "Download all your data in JSON format."  },
                ].map((r) => (
                  <div key={r.right} className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <span className="text-xl group-hover:scale-110 transition-transform">{r.icon}</span>
                      <svg className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{r.right}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button id="data-rights-request" className="btn-primary text-sm w-full py-3 mt-6">
                Submit a Data Request
              </button>
            </div>

            {/* DPDP Notice */}
            <div className="glass rounded-xl p-5 border border-primary-500/15">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-primary-400 text-xs font-semibold">DPDP Act 2023</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                UdaanScore is fully compliant with India&apos;s Digital Personal Data Protection Act.
                We never sell your data or share it without your explicit consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
