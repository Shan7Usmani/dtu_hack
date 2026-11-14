import React from 'react';
import { AlertTriangle, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function RiskGauge({ score = 15, level = 'LOW' }) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Determine colors and status badges based on score threshold
  let color = '#10B981'; // Green
  let bgGlow = 'rgba(16, 185, 129, 0.15)';
  let statusText = 'SAFE / LOW RISK';
  let Icon = ShieldCheck;

  if (normalizedScore > 60 || level === 'CRITICAL' || level === 'HIGH') {
    color = '#EF4444'; // Red
    bgGlow = 'rgba(239, 68, 68, 0.2)';
    statusText = 'CRITICAL / HIGH RISK';
    Icon = AlertOctagon;
  } else if (normalizedScore > 30 || level === 'WARNING' || level === 'MEDIUM') {
    color = '#F59E0B'; // Amber
    bgGlow = 'rgba(245, 158, 11, 0.15)';
    statusText = 'WARNING / MODERATE';
    Icon = AlertTriangle;
  }

  // SVG Circular progress math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
      
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DRIVER RISK SCORE</span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: bgGlow, color: color }}>
          <Icon className="w-3.5 h-3.5" />
          <span>{level}</span>
        </div>
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative w-40 h-40 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1E293B"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Numerical Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">{normalizedScore}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Status Footer Badge */}
      <div className="mt-2 w-full py-1.5 px-3 rounded-lg text-center font-mono text-xs font-bold transition-colors" style={{ backgroundColor: bgGlow, color: color }}>
        {statusText}
      </div>

    </div>
  );
}
