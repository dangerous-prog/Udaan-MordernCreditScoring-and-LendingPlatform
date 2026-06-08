"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ── Feature card data ───────────────────────────────────── */
const features = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    title:  "AI Trust Score",
    desc:   "Your Trust Score refreshed continuously from UPI behavior, utilities, GST, and cash-flow signals — not legacy bureau files alone.",
    color:  "#3b96f2",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title:  "Consent Vault",
    desc:   "You decide who sees your data. Granular permissions with full audit trail and instant revocation.",
    color:  "#8b5cf6",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
    title:  "Trust Score Simulator",
    desc:   "Model the impact of any financial action before you take it. Know your Trust Score before the lender does.",
    color:  "#22c55e",
  },
];

const flowSteps = [
  {
    num: "01",
    title: "User Consent",
    desc: "Users securely grant permission to access alternative financial data.",
    href: "/consent",
    icon: (
      <svg className="w-7 h-7 text-primary-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L4 5v6c0 5 4 9 8 9s8-4 8-9V5l-8-3z" />
        <path d="M8 11c1.5 2 3 3 4 3s2.5-1 4-3" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Alternate Data Collection",
    desc: "UPI transactions, utility payments, GST records and cash-flow signals are analyzed.",
    href: "/dashboard",
    icon: (
      <svg className="w-7 h-7 text-primary-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="6" rx="2" />
        <rect x="3" y="14" width="18" height="6" rx="2" />
        <path d="M7 8v8" />
        <path d="M17 8v8" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "AI Trust Score",
    desc: "Behavioral and financial signals are converted into a transparent Trust Score.",
    href: "/simulator",
    icon: (
      <svg className="w-7 h-7 text-primary-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
        <path d="M8 12h1.5m5 0H16M12 8v1.5M12 14V16" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Loan Approval",
    desc: "Partner lenders use the Trust Score for fair and inclusive credit decisions.",
    href: "/journey",
    icon: (
      <svg className="w-7 h-7 text-primary-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </svg>
    ),
  },
];

/* ── Testimonials ────────────────────────────────────────── */
const testimonials = [
  { name: "Priya Sharma",    role: "Entrepreneur, Mumbai",     quote: "My Trust Score jumped 87 points in 3 months using UdaanScore's action plan. Got a ₹20L business loan at 9.5%!", avatar: "PS" },
  { name: "Rahul Mehta",     role: "IT Professional, Bengaluru", quote: "The simulator showed me exactly what to improve first. Zero guesswork — just a clearer Trust Score.", avatar: "RM" },
  { name: "Anjali Krishnan", role: "Teacher, Chennai",          quote: "Finally a fintech app that explains my Trust Score in plain language. The consent vault gives me peace of mind.", avatar: "AK" },
];

/* ── Mini floating card ──────────────────────────────────── */
function FloatingCard() {
  return (
    <div className="glass rounded-2xl p-5 w-60 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <span className="text-xs font-semibold text-white">Trust Score Updated</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-display font-bold text-white">742</span>
        <span className="text-green-400 text-sm font-semibold mb-1">+23 ↑</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10">
        <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-primary-500 to-primary-300" />
      </div>
      <p className="text-xs text-slate-400 mt-1.5">Very Good · Updated just now</p>
    </div>
  );
}

const marketStats = [
  { value: "190M+", label: "Thin-file borrowers", sub: "Underserved by traditional credit" },
  { value: "63M+",  label: "MSMEs unserved",      sub: "Lack formal credit history" },
  { value: "₹20L Cr", label: "Credit gap",        sub: "Unmet demand across India" },
];

export default function LandingPage() {
  const flowRef = useRef<HTMLElement | null>(null);
  const [flowVisible, setFlowVisible] = useState(false);

  useEffect(() => {
    if (!flowRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFlowVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(flowRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    nodes.forEach((node) => sectionObserver.observe(node));

    return () => sectionObserver.disconnect();
  }, []);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center overflow-hidden py-16 md:py-20"
        style={{ background: "radial-gradient(ellipse 90% 70% at 50% -5%, #1d60d4 0%, #0a0f1e 55%)" }}
      >
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-700/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-primary-900/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-800/10 blur-3xl" />
        </div>

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-10 animate-pan-grid"
          style={{
            backgroundImage: "linear-gradient(rgba(59,150,242,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,150,242,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 page-container text-center py-12 md:py-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass mb-10 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-sm text-slate-300 font-medium">AI-Powered Alternative Trust Scoring</span>
          </div>

          <h1 className="heading-hero text-white mb-8 max-w-4xl mx-auto">
            <span className="gradient-text-white">Credit should be earned continuously,</span>
            <br />
            <span className="gradient-text">not denied permanently.</span>
          </h1>

          <p className="body-lg max-w-2xl mx-auto mb-12">
            AI-powered alternative credit scoring using UPI behavior, utility payments, GST compliance,
            and cash-flow stability.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16 md:mb-20">
            <Link href="/dashboard" id="hero-cta-primary" className="btn-primary text-lg px-10 py-4 font-bold tracking-tight shadow-[0_0_40px_rgba(37,120,230,0.4)]">
              Check My Trust Score Free →
            </Link>
            <Link href="/simulator" id="hero-cta-secondary" className="btn-outline text-lg px-10 py-4 font-bold tracking-tight bg-white/[0.03]">
              Try the Simulator
            </Link>
          </div>

          {/* Floating cards */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
            <div className="animate-float">
              <FloatingCard />
            </div>
            <div className="animate-float" style={{ animationDelay: "1s" }}>
              <div className="glass rounded-2xl p-5 w-60 shadow-[var(--shadow-card)]">
                <p className="text-xs text-slate-400 mb-2 font-medium">Pre-Approved Offer</p>
                <p className="text-white font-display font-bold text-lg">₹5,00,000</p>
                <p className="text-green-400 text-xs mt-0.5 font-medium">@ 10.5% p.a. · Instant</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-green-500 to-green-300" />
                  </div>
                  <span className="text-xs text-slate-400">75%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Eligibility</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-xs text-slate-400">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/50 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────── */}
      <section className="section-spacing relative overflow-hidden" data-reveal>
        <div className="absolute inset-0 bg-navy-800/60 border-y border-white/[0.04] pointer-events-none" />
        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {marketStats.map((stat, i) => (
              <div key={stat.label} className="glass-card group hover:-translate-y-2 transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="font-display text-5xl md:text-6xl font-bold gradient-text tracking-tight mb-3 group-hover:scale-105 transition-transform duration-500">{stat.value}</p>
                <p className="text-white font-semibold text-lg">{stat.label}</p>
                <p className="text-slate-400 text-sm mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Flow ────────────────────────────────────── */}
      <section
        ref={flowRef}
        className="section-spacing relative overflow-hidden rounded-[2rem] border border-white/10 px-4 py-12 md:px-8 md:py-16"
        data-reveal
        style={{ background: "linear-gradient(180deg, rgba(4,14,36,0.96), rgba(7,24,54,0.98) 45%, rgba(2,9,20,0.95))" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-700/20 blur-3xl" />
          <div className="absolute bottom-10 right-0 h-56 w-56 rounded-full bg-primary-500/15 blur-3xl" />
          <div className="absolute top-1/2 left-10 h-40 w-40 rounded-full bg-primary-400/10 blur-3xl" />
        </div>

        <div className="page-container relative z-10 text-center">
          <p className="section-label">How UdaanScore Works</p>
          <h2 className="heading-section text-white max-w-3xl mx-auto">
            From consent to credit approval in four simple steps
          </h2>
        </div>

        <div className="page-container relative z-10 mt-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[repeat(7,minmax(0,1fr))] items-center">
            {flowSteps.map((step, index) => (
              <Fragment key={step.num}>
                <Link
                  href={step.href}
                  className={`flow-card group lg:col-span-2 ${flowVisible ? "flow-visible" : "flow-hidden"}`}
                >
                  <div className="flow-card-inner">
                    <div className="flow-badge mb-5">{step.num}</div>
                    <div className="flow-icon mb-6">{step.icon}</div>
                    <h3 className="text-xl font-display font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </Link>

                {index < flowSteps.length - 1 ? (
                  <div className="hidden lg:flex items-center justify-center">
                    <div className="flow-connector" aria-hidden="true" />
                  </div>
                ) : null}
              </Fragment>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-base font-semibold text-slate-300 mb-4">Ready to build your Trust Score?</p>
            <Link href="/journey" className="btn-primary px-10 py-4 inline-flex items-center justify-center">
              Start Your Journey
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="section-spacing" data-reveal>
        <div className="page-container">
          <div className="text-center section-header max-w-2xl mx-auto">
            <p className="section-label">Why UdaanScore</p>
            <h2 className="heading-section text-white">
              Everything you need to <span className="gradient-text">fly higher</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass-card group h-full flex flex-col"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-8"
                  style={{ background: `${f.color}14`, border: `1px solid ${f.color}28`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="heading-card text-white mb-4">{f.title}</h3>
                <p className="body-md">{f.desc}</p>

                <div className="mt-auto flex items-center gap-2 text-sm font-medium" style={{ color: f.color }}>
                  <Link href="/dashboard">Learn more</Link>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="section-spacing" data-reveal>
        <div className="page-container">
          <div className="text-center section-header max-w-2xl mx-auto">
            <p className="section-label">Trusted by Millions</p>
            <h2 className="heading-section text-white">
              Real people, <span className="gradient-text">real results</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="glass-card glass-card-static h-full flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                    </svg>
                  ))}
                </div>

                <p className="text-slate-300 body-md mb-8 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-caption">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="section-spacing pb-28" data-reveal>
        <div className="page-container-tight mx-auto">
        <div
          className="rounded-2xl p-12 md:p-16 text-center relative overflow-hidden border border-white/[0.08] shadow-[var(--shadow-elevated)]"
          style={{ background: "linear-gradient(160deg, #1a4a9e 0%, #0f2d6b 45%, #080c18 100%)" }}
        >
          <div className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(96,183,247,0.2) 0%, transparent 55%), radial-gradient(circle at 70% 50%, rgba(59,150,242,0.15) 0%, transparent 55%)" }}
          />
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="heading-section text-white mb-5">
              Your financial flight starts today
            </h2>
            <p className="body-lg text-primary-100/90 mb-10">
              Build your Trust Score from real financial behavior — and unlock credit you actually deserve.
            </p>
            <Link href="/dashboard" id="cta-banner-btn" className="btn-primary px-10 py-3.5 inline-block">
              Get My Free Trust Score →
            </Link>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
