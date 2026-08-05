import React, { useState } from 'react';
import { analyzePhishing } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { Fish, Sparkles, AlertOctagon, HelpCircle, ShieldCheck } from 'lucide-react';

export default function PhishingPage() {
  const [inputText, setInputText] = useState('FINAL NOTICE: Urgent verification required for your account credentials at http://bit.ly/verify-sec-login');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunPhishingScan = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await analyzePhishing(inputText);
      if (res.success) setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Fish className="w-6 h-6 text-rose-400" /> Dedicated Phishing & Scam Detector
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Specialized engine detecting social engineering, urgency manipulation, and phishing vector signatures.
        </p>
      </div>

      <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Inspect Email / SMS Text for Phishing Indicators</label>
        <textarea
          rows={5}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-rose-500/50 focus:outline-none transition-all font-mono"
        />

        <button
          onClick={handleRunPhishingScan}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Scanning Phishing Vectors...' : 'Detect Phishing Signals'}
        </button>
      </div>

      {result && (
        <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase">Threat Classification</span>
              <h3 className="text-xl font-bold text-rose-400 font-mono mt-0.5">{result.classification}</h3>
            </div>
            <RiskBadge level={result.riskLevel} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.indicators?.map((ind: any, i: number) => (
              <div key={i} className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-1">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-amber-400">
                  <span>WHAT WAS DETECTED: {ind.type}</span>
                  <span className="text-rose-400">-{ind.impact}</span>
                </div>
                <p className="text-xs text-slate-300"><strong>WHY IT MATTERS:</strong> {ind.explanation}</p>
                <p className="text-[11px] text-slate-500 font-mono"><strong>EVIDENCE:</strong> "{ind.evidence}"</p>
                <p className="text-xs text-cyan-400 pt-1"><strong>ACTION:</strong> {ind.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
