import React, { useEffect, useState } from 'react';
import { fetchDecisions, updateDecision } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { CheckSquare, ShieldAlert, ThumbsUp, ThumbsDown, AlertCircle, MessageSquare } from 'lucide-react';

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const loadDecisions = () => {
    setLoading(true);
    fetchDecisions()
      .then(res => {
        if (res.success) setDecisions(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  const handleDecisionAction = async (id: string, action: 'APPROVED' | 'REJECTED' | 'ESCALATED') => {
    const notes = notesMap[id] || '';
    await updateDecision(id, action, notes);
    loadDecisions();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-cyan-400" /> Human Operator Decision Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Governance gate requiring explicit human confirmation before executing high-risk security actions.
        </p>
      </div>

      <div className="space-y-6">
        {decisions.map((dec) => {
          const isPending = dec.operator_decision === 'PENDING';

          return (
            <div
              key={dec.id}
              className={`bg-[#111625] border rounded-2xl p-6 space-y-5 transition-all ${
                isPending ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' : 'border-[#1e2638]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs text-slate-400">Decision ID: #{dec.id}</span>
                  <h3 className="text-base font-bold text-white font-mono mt-0.5">{dec.proposed_action}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-rose-400">Risk Score: {dec.risk_score}/100</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    dec.operator_decision === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                    dec.operator_decision === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                    'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    {dec.operator_decision}
                  </span>
                </div>
              </div>

              {dec.security_events?.details && (
                <div className="p-3.5 bg-[#0a0d14] border border-[#1e2638] rounded-xl text-xs font-mono text-slate-300">
                  <span className="text-slate-500">// Event Telemetry Evidence</span>{'\n'}
                  {JSON.stringify(dec.security_events.details, null, 2)}
                </div>
              )}

              {isPending && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Operator Review Notes (Optional):</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Approved quarantine under security policy sec-4.1"
                    value={notesMap[dec.id] || ''}
                    onChange={e => setNotesMap({ ...notesMap, [dec.id]: e.target.value })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
                  />

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleDecisionAction(dec.id, 'APPROVED')}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Confirm & Approve Action
                    </button>
                    <button
                      onClick={() => handleDecisionAction(dec.id, 'REJECTED')}
                      className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" /> Reject Proposed Action
                    </button>
                  </div>
                </div>
              )}

              {!isPending && dec.operator_notes && (
                <p className="text-xs text-slate-400 italic bg-[#0a0d14] p-3 rounded-lg border border-[#1e2638]">
                  Operator Note: "{dec.operator_notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
