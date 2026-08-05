import React, { useState } from 'react';
import { analyzeThreat } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface AnalyzePageProps {
  initialText?: string;
}

export default function AnalyzePage({ initialText = '' }: AnalyzePageProps) {
  const [inputText, setInputText] = useState(initialText || 'URGENT: Your account has been suspended today. Verify your credentials immediately using the link below: http://login-verify-account.com/auth');
  const [inputType, setInputType] = useState('MESSAGE');
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setError('');
    setResult(null);
    setLoadingStep('ANALYZING THREAT WITH GEMINI');

    try {
      const res = await analyzeThreat(inputText, inputType);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error?.message || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingStep(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-cyan-400" /> Security Analysis Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect suspicious content, emails, or URLs with deterministic rule engines and Gemini AI intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Workspace */}
        <div className="lg:col-span-5 bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Input Content</label>
            <select
              value={inputType}
              onChange={e => setInputType(e.target.value)}
              className="bg-[#0a0d14] border border-[#1e2638] rounded-lg px-2.5 py-1 text-xs text-cyan-400 font-mono focus:outline-none"
            >
              <option value="MESSAGE">MESSAGE</option>
              <option value="EMAIL">EMAIL</option>
              <option value="URL">URL</option>
              <option value="TEXT">TEXT</option>
            </select>
          </div>

          <textarea
            rows={7}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste suspicious message, email headers, or URL here..."
            className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all font-mono"
          />

          <button
            onClick={handleAnalyze}
            disabled={!!loadingStep}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingStep ? (
              <span className="flex items-center gap-2 font-mono text-xs">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                {loadingStep}...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Analyze Threat
              </>
            )}
          </button>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg font-mono">
              {error}
            </p>
          )}
        </div>

        {/* Right Analysis Output Workspace */}
        <div className="lg:col-span-7 bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-6">
          {!result ? (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#1e2638] rounded-xl text-slate-500">
              <ShieldAlert className="w-12 h-12 stroke-1 text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">No Active Analysis Loaded</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter suspicious telemetry on the left and click "Analyze Threat" to run security pipeline.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Score Ring */}
              <div className="flex items-center justify-between p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Calculated Trust Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-white">{result.trustScore}</span>
                    <span className="text-xs text-slate-500 font-mono">/ 100</span>
                  </div>
                </div>
                <RiskBadge level={result.riskLevel} />
              </div>

              {/* Redacted Version */}
              {result.piiDetected?.length > 0 && (
                <div className="p-4 bg-[#0a0d14] border border-amber-500/30 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> PII Automatically Redacted ({result.piiDetected.length})
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{result.piiDetected.join(', ')}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 bg-[#111625] p-2.5 rounded-lg border border-[#1e2638]">
                    {result.redactedText}
                  </p>
                </div>
              )}

              {/* Identified Risk Indicators */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Identified Security Indicators ({result.indicators?.length || 0})</h4>
                {result.indicators?.length === 0 ? (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Zero suspicious threat indicators detected.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {result.indicators.map((ind: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs font-bold text-cyan-400">{ind.type}</span>
                          <span className="font-mono text-xs text-rose-400 font-semibold">Impact Penalty: -{ind.impact}</span>
                        </div>
                        <p className="text-xs text-slate-300">{ind.explanation}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Evidence: "{ind.evidence}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Explainable Security Decisions */}
              <div className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Why This Decision Was Made
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>

              {/* Recommended Action */}
              <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 rounded-xl space-y-1">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Recommended Operator Action</h4>
                <p className="text-xs text-cyan-200">{result.recommendedAction}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
