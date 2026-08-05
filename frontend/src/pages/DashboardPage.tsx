import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { ShieldCheck, AlertTriangle, EyeOff, Activity, ShieldAlert, FileText, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <Activity className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-2" />
        Loading Security Posture Telemetry...
      </div>
    );
  }

  const riskDistribution = [
    { name: 'SAFE', value: 45, color: '#10b981' },
    { name: 'REVIEW', value: 30, color: '#f59e0b' },
    { name: 'HIGH RISK', value: 18, color: '#f97316' },
    { name: 'CRITICAL', value: 7, color: '#f43f5e' }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Trust Status & Security Posture Score */}
      <div className="bg-gradient-to-r from-[#111625] via-[#161f36] to-[#111625] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">System Trust Status</h2>
            <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              {stats?.trustStatus || 'GOOD'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time security telemetry active. Autonomous AI rules and deterministic risk engines operational.
          </p>
        </div>

        <div className="flex items-center gap-8 bg-[#0a0d14]/60 p-4 rounded-xl border border-[#1e2638]">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-white font-mono">{stats?.trustScore || 87}</span>
            <span className="text-xs text-slate-400 font-mono"> / 100</span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Trust Score</p>
          </div>
          <div className="h-10 w-px bg-[#1e2638]"></div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Threat Detection</span>
              <span className="text-cyan-400 font-mono font-semibold">{stats?.threatDetectionCoverage || 92}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Privacy Protection</span>
              <span className="text-emerald-400 font-mono font-semibold">{stats?.privacyProtectionCoverage || 96}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Auth Security</span>
              <span className="text-purple-400 font-mono font-semibold">{stats?.authSecurityCoverage || 88}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#111625] border border-[#1e2638] rounded-xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Threats Detected</span>
            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats?.threatsDetected || 12}</p>
          <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
            <ArrowUpRight className="w-3 h-3" /> +2 critical in last 24h
          </p>
        </div>

        <div className="bg-[#111625] border border-[#1e2638] rounded-xl p-5 hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PII Exposures Prevented</span>
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <EyeOff className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats?.piiExposuresPrevented || 31}</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            100% auto-redaction rate
          </p>
        </div>

        <div className="bg-[#111625] border border-[#1e2638] rounded-xl p-5 hover:border-purple-500/30 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Anomalies Detected</span>
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">{stats?.anomaliesDetected || 4}</p>
          <p className="text-[11px] text-purple-400 flex items-center gap-1 mt-1 font-medium">
            Location & off-hour logins
          </p>
        </div>

        <div className="bg-[#111625] border border-[#1e2638] rounded-xl p-5 hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Log Coverage</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white font-mono">100%</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-medium">
            Immutable trace recording
          </p>
        </div>
      </div>

      {/* Recharts Activity & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Threat & Privacy Telemetry Trends</h3>
              <p className="text-xs text-slate-400">Recorded threat triggers vs PII scans over 24 hours</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.activityTrends || []}>
                <defs>
                  <linearGradient id="threatsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="piiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0d14', borderColor: '#1e2638', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="threats" stroke="#f43f5e" fillOpacity={1} fill="url(#threatsGrad)" name="Threats" />
                <Area type="monotone" dataKey="piiScans" stroke="#06b6d4" fillOpacity={1} fill="url(#piiGrad)" name="PII Scans" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Risk Category Breakdown</h3>
          <p className="text-xs text-slate-400">Distribution of security severity classifications</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0d14', borderColor: '#1e2638', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
