import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, Sparkles, AlertOctagon, CheckCircle2, Unlock, RefreshCw } from 'lucide-react';

export default function QuarantinePage() {
  const [quarantined, setQuarantined] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuarantine = async () => {
    try {
      const res = await fetch('/api/device/quarantine');
      const data = await res.json();
      if (data.success) {
        setQuarantined(data.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuarantine();
  }, []);

  const handleUnblock = async (id: string) => {
    try {
      await fetch(`/api/device/unblock/${id}`, { method: 'POST' });
      fetchQuarantine();
    } catch (e) {}
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            AUTO-BLOCKED VAULT
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
          <Lock className="w-6 h-6 text-rose-400" /> Quarantined Threat Vault
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          All high-risk phishing, spam, and OTP scams are automatically blocked and safely stored. Zero messages are ever deleted.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 bg-[#111625] border border-[#1e2638] rounded-2xl text-center text-xs font-mono text-slate-400">
            Loading quarantine vault...
          </div>
        ) : quarantined.length === 0 ? (
          <div className="p-12 bg-[#111625] border border-[#1e2638] rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No Active Threats Quarantined</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your device shield is active. Any incoming spam or OTP scams will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quarantined.map((item) => (
              <div key={item.id} className="p-6 bg-[#170e16] border border-rose-500/40 rounded-2xl space-y-4 shadow-lg shadow-rose-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> AUTO-BLOCKED BY TRUSTGUARD AI
                    </span>
                    <span className="text-xs font-bold text-slate-200">{item.senderName || item.sender}</span>
                    <span className="text-[10px] font-mono text-slate-400">({item.channel})</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-400">{new Date(item.receivedAt).toLocaleTimeString()}</span>
                    <button
                      onClick={() => handleUnblock(item.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3 text-cyan-400" /> Allow / Unblock
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl font-mono text-xs text-slate-200">
                  {item.rawText}
                </div>

                {item.explanation && (
                  <div className="p-4 bg-[#0a0d14] border border-rose-500/20 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-cyan-400 font-bold text-[11px]">
                      <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Gemini 3.6 Flash Block Rationale</span>
                      <span>Trust Score: {item.trustScore}/100</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{item.explanation}</p>
                    <p className="text-rose-300 text-[10px] font-mono pt-1">
                      Action Required: {item.recommendedAction}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
