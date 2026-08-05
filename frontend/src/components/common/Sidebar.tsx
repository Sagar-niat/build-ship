import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Smartphone,
  Sparkles,
  ShieldAlert,
  Lock,
  LayoutDashboard, 
  Fish, 
  EyeOff, 
  AlertTriangle, 
  Activity, 
  CheckSquare, 
  History, 
  Settings, 
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentRole?: string;
}

export default function Sidebar({ currentRole = 'USER' }: SidebarProps) {
  const isUser = currentRole === 'USER';

  const userNavItems = [
    { path: '/device-guard', label: 'Autonomous Device Guard', icon: Smartphone },
    { path: '/gemini-chat', label: 'Gemini AI Studio', icon: Sparkles },
    { path: '/analyze', label: 'Security Analysis', icon: ShieldAlert },
    { path: '/quarantine', label: 'Blocked Threat Vault', icon: Lock },
  ];

  const adminNavItems = [
    { path: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/device-guard', label: 'Autonomous Device Guard', icon: Smartphone },
    { path: '/gemini-chat', label: 'Gemini AI Studio', icon: Sparkles },
    { path: '/analyze', label: 'Security Analysis', icon: ShieldAlert },
    { path: '/quarantine', label: 'Blocked Threat Vault', icon: Lock },
    { path: '/phishing', label: 'Phishing Detector', icon: Fish },
    { path: '/privacy', label: 'PII Privacy Center', icon: EyeOff },
    { path: '/security-events', label: 'Security Events Queue', icon: AlertTriangle },
    { path: '/anomalies', label: 'Anomaly Detector', icon: Activity },
    { path: '/decisions', label: 'Decision Center', icon: CheckSquare },
    { path: '/audit-log', label: 'Audit Trail', icon: History },
    { path: '/settings', label: 'Settings & Policy', icon: Settings },
  ];

  const activeNavItems = isUser ? userNavItems : adminNavItems;

  return (
    <aside className="w-64 bg-[#111625] border-r border-[#1e2638] flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1e2638] flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              TrustGuard <span className="text-cyan-400 text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-mono">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              {isUser ? 'Consumer Security Shield' : 'SOC Operations Console'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {activeNavItems.map((item) => {
            const Icon = item.icon;
            const isHighlight = item.path === '/device-guard' || item.path === '/gemini-chat';
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                      : isHighlight
                      ? 'text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#182033]'
                  }`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 ${isHighlight ? 'text-cyan-400' : ''}`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Security Badge */}
      <div className="p-4 border-t border-[#1e2638] bg-[#0a0d14]/50">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {isUser ? 'Auto-Block Active' : 'SOC Active'}
          </span>
          <span className="text-slate-500">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
