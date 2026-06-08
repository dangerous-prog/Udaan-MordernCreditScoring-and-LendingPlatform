"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  minScore?: number;
  maxScore?: number;
  size?: number;
  animated?: boolean;
}

function getScoreLabel(score: number, maxScore: number) {
  const scale = maxScore >= 1000 ? 1000 : 900;
  if (scale === 1000) {
    if (score < 400) return { label: "Poor",      color: "#ef4444" };
    if (score < 550) return { label: "Fair",      color: "#f97316" };
    if (score < 700) return { label: "Good",      color: "#eab308" };
    if (score < 850) return { label: "Very Good", color: "#22c55e" };
    return             { label: "Excellent",      color: "#3b96f2" };
  }
  if (score < 580) return { label: "Poor",      color: "#ef4444" };
  if (score < 670) return { label: "Fair",      color: "#f97316" };
  if (score < 740) return { label: "Good",      color: "#eab308" };
  if (score < 800) return { label: "Very Good", color: "#22c55e" };
  return             { label: "Excellent",      color: "#3b96f2" };
}

export default function ScoreGauge({
  score,
  minScore: minScoreProp,
  maxScore = 900,
  size = 220,
  animated = true,
}: ScoreGaugeProps) {
  const minScore    = minScoreProp ?? (maxScore >= 1000 ? 0 : 300);
  const [displayScore, setDisplayScore] = useState(animated ? minScore : score);
  const [progress,     setProgress    ] = useState(0);
  const frameRef = useRef<number | null>(null);
  const totalRange  = maxScore - minScore;
  const scoreRange  = score - minScore;
  const targetPct   = scoreRange / totalRange;

  const { label, color } = getScoreLabel(displayScore, maxScore);

  // Arc parameters
  const cx         = size / 2;
  const cy         = size / 2 + 10;
  const radius      = (size / 2) - 20;
  const startAngle  = 135; // degrees
  const sweepAngle  = 270;

  const polarToXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const arcPath = (pct: number) => {
    const end   = startAngle + sweepAngle * pct;
    const start = polarToXY(startAngle);
    const endPt = polarToXY(end);
    const large = sweepAngle * pct > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${endPt.x} ${endPt.y}`;
  };

  useEffect(() => {
    if (!animated) return;
    const duration = 1800;
    const start    = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t       = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased   = 1 - Math.pow(1 - t, 3);

      setProgress(eased * targetPct);
      setDisplayScore(Math.round(minScore + eased * scoreRange));

      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [score, animated, targetPct, scoreRange, minScore]);

  // track arc bg
  const trackStart = polarToXY(startAngle);
  const trackEnd   = polarToXY(startAngle + sweepAngle);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`}>
        {/* Gradient defs */}
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#ef4444" />
            <stop offset="25%"  stopColor="#f97316" />
            <stop offset="50%"  stopColor="#eab308" />
            <stop offset="75%"  stopColor="#22c55e" />
            <stop offset="100%" stopColor="#3b96f2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track */}
        <path
          d={`M ${trackStart.x} ${trackStart.y} A ${radius} ${radius} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        {progress > 0.01 && (
          <path
            d={arcPath(progress)}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#glow)"
            style={{ transition: "stroke 0.5s ease" }}
          />
        )}

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const angle = startAngle + sweepAngle * p;
          const inner = { x: cx + (radius - 18) * Math.cos(((angle - 90) * Math.PI) / 180), y: cy + (radius - 18) * Math.sin(((angle - 90) * Math.PI) / 180) };
          const outer = { x: cx + (radius - 8)  * Math.cos(((angle - 90) * Math.PI) / 180), y: cy + (radius - 8)  * Math.sin(((angle - 90) * Math.PI) / 180) };
          return (
            <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
          );
        })}

        {/* Center score */}
        <text x={cx} y={cy - 8} textAnchor="middle" className="font-display" fill="white" fontSize="38" fontWeight="700" fontFamily="system-ui">
          {displayScore}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" fill={color} fontSize="13" fontWeight="600" fontFamily="system-ui">
          {label}
        </text>
        <text x={cx} y={cy + 32} textAnchor="middle" fill="rgba(148,163,184,0.8)" fontSize="10" fontFamily="system-ui">
          out of {maxScore}
        </text>
      </svg>

      {/* Score range labels */}
      <div className="flex justify-between w-full px-4 -mt-2 text-xs text-slate-500">
        <span>{minScore}</span>
        <span>{maxScore}</span>
      </div>
    </div>
  );
}
