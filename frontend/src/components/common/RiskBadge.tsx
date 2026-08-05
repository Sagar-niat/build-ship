import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: 'SAFE' | 'LOW' | 'REVIEW' | 'MEDIUM' | 'HIGH' | 'HIGH_RISK' | 'CRITICAL';
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const normalized = level.toUpperCase();

  if (normalized === 'SAFE' || normalized === 'LOW') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <ShieldCheck className="w-3.5 h-3.5" /> SAFE / TRUSTED
      </span>
    );
  }

  if (normalized === 'REVIEW' || normalized === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" /> REVIEW REQUIRED
      </span>
    );
  }

  if (normalized === 'HIGH' || normalized === 'HIGH_RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30">
        <ShieldAlert className="w-3.5 h-3.5" /> HIGH RISK
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
      <AlertOctagon className="w-3.5 h-3.5" /> CRITICAL THREAT
    </span>
  );
}
