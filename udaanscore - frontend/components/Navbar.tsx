"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",          label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/journey",   label: "Journey" },
  { href: "/simulator", label: "Simulator" },
  { href: "/consent",   label: "Consent Vault" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#080c18]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          : "bg-transparent"
      }`}
    >
      <div className="page-container !py-0 max-w-[76rem]">
        <div className="flex items-center justify-between h-20 min-h-[80px] max-h-[80px] shrink-0">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-[0_2px_12px_rgba(59,150,242,0.2)] transition-shadow group-hover:shadow-[0_4px_20px_rgba(59,150,242,0.28)]">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-lg tracking-tight text-white">
              Udaan<span className="text-primary-400">Score</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full group ${
                    isActive
                      ? "text-white"
                      : "text-slate-400/70 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-primary-500/20 border border-primary-400/30 rounded-full shadow-[0_0_16px_rgba(59,150,242,0.3)] -z-10" />
                  )}
                  {!isActive && (
                    <span className="absolute inset-0 bg-white/[0.04] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 scale-95 group-hover:scale-100" />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/dashboard" className="btn-outline text-sm !py-2.5 !px-4">
              Sign In
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm !py-2.5 !px-5">
              Get Started
            </Link>
          </div>

          <button
            id="navbar-mobile-toggle"
            className="lg:hidden p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        } border-t border-white/[0.06] bg-[#080c18]/95 backdrop-blur-xl`}
      >
        <div className="page-container !pt-4 !pb-6 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-white bg-primary-500/15 border border-primary-500/20 shadow-[inset_0_0_20px_rgba(59,150,242,0.15)]"
                    : "text-slate-400/70 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/dashboard" className="btn-outline text-sm text-center" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
