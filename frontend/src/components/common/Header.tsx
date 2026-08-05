import React from 'react';
import { User, LogOut, Play, Sparkles, UserCheck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onLoadDemoThreat?: () => void;
  currentRole?: string;
  onToggleRole?: () => void;
}

export default function Header({ onLoadDemoThreat, currentRole = 'USER', onToggleRole }: HeaderProps) {
  const navigate = useNavigate();
  const isUser = currentRole === 'USER';

  const handleLogout = () => {
    localStorage.removeItem('trustguard_token');
    localStorage.removeItem('trustguard_user');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[#111625]/80 backdrop-blur-md border-b border-[#1e2638] px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/gemini-chat')}
          className="text-xs font-mono text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3.5 py-1.5 rounded-full border border-cyan-500/30 flex items-center gap-2 transition-all shadow-sm shadow-cyan-500/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini 3.6 Flash Active</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        {onToggleRole && (
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              isUser
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
            }`}
          >
            {isUser ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Shield className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{isUser ? 'USER MODE (Consumer Shield)' : 'ADMIN MODE (SOC Console)'}</span>
            <span className="text-[10px] text-slate-400 ml-1 font-sans underline">(Switch)</span>
          </button>
        )}

        {onLoadDemoThreat && !isUser && (
          <button
            onClick={onLoadDemoThreat}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" /> Load Demo Threat
          </button>
        )}

        <div className="flex items-center gap-3 border-l border-[#1e2638] pl-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-semibold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{isUser ? 'Standard User' : 'Security Analyst'}</p>
              <p className="text-[10px] font-mono text-cyan-400">{currentRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#192033] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
