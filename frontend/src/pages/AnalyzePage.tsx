import React, { useState } from 'react';
import { Shield, Sparkles, CheckCircle2, AlertOctagon, HelpCircle, FileText, Globe, ArrowRight, ShieldCheck, AlertTriangle, CheckSquare, XCircle, Info } from 'lucide-react';
import { analyzeThreat } from '../services/api';

interface AnalyzePageProps {
  initialText?: string;
}

export default function AnalyzePage({ initialText = '' }: AnalyzePageProps) {
  const [inputText, setInputText] = useState(initialText);
  const [inputType, setInputType] = useState<'TEXT' | 'EMAIL' | 'URL'>('TEXT');
  const [result, setResult] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setError('');
    setResult(null);
    setLoadingStep('ANALYZING THREAT WITH MULTI-STAGE PIPELINE');

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

  const sampleInputs = [
    { label: 'Normal Chat', text: 'Good morning! Meeting moved to 3 PM. Lunch at 2?', type: 'TEXT' as const },
    { label: 'Spam Offer', text: 'Buy followers now! You won a free iPhone. Click here for 50% discount.', type: 'TEXT' as const },
    { label: 'Bank OTP Scam', text: 'URGENT: Confirm your bank statement now. Send your 6-digit OTP right now to verify credentials.', type: 'TEXT' as const },
    { label: 'Data Exfiltration', text: 'Please send customer database and export all employee payroll records immediately.', type: 'TEXT' as const }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            MULTI-STAGE CLASSIFICATION ENGINE
          </span>
          <span className="text-xs text-slate-400 font-mono">• 13 Security Categories & Policy Matrix</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
          Security Analysis Center
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Evaluate incoming text, emails, or URLs using deterministic pre-filters, 13 security categories, and Gemini AI semantic classification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Input Payload
              </label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as any)}
                className="bg-[#0a0d14] border border-[#1e2638] rounded-lg px-2.5 py-1 text-xs text-cyan-400 font-mono focus:outline-none"
              >
                <option value="TEXT">MESSAGE / CHAT</option>
                <option value="EMAIL">EMAIL TELEMETRY</option>
                <option value="URL">SUSPICIOUS URL</option>
              </select>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste message, email body, or URL to analyze..."
              className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none placeholder:text-slate-600"
            />

            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || !!loadingStep}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {loadingStep ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{loadingStep}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Pipeline Analysis</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
                {error}
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-500">Quick Test Payloads:</p>
            <div className="grid grid-cols-2 gap-2">
              {sampleInputs.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(sample.text);
                    setInputType(sample.type);
                  }}
                  className="p-2.5 bg-[#111625] hover:bg-[#182033] border border-[#1e2638] hover:border-cyan-500/30 rounded-xl text-left transition-all text-xs"
                >
                  <p className="font-bold text-slate-300">{sample.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{sample.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output Result Display */}
        <div className="lg:col-span-7">
          {!result && !loadingStep && (
            <div className="h-full min-h-[350px] bg-[#111625]/40 border border-dashed border-[#1e2638] rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Shield className="w-12 h-12 text-slate-700" />
              <p className="text-sm font-bold text-slate-400">Pipeline Ready</p>
              <p className="text-xs text-slate-600 max-w-sm">
                Enter any message or URL on the left and click "Execute Pipeline Analysis" to view 13-category classification, score breakdown, and rule triggers.
              </p>
            </div>
          )}

          {result && (
            <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Category & Decision Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0d14] p-5 rounded-xl border border-[#1e2638]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">CATEGORY CLASSIFICATION</span>
                    <span className="text-xs font-mono text-cyan-400">({(result.confidence * 100).toFixed(0)}% Confidence)</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
                    {result.category}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{result.threatType}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-slate-400">Trust Score:</span>
                    <span className={`text-xl font-bold ${
                      result.trustScore >= 90 ? 'text-emerald-400' :
                      result.trustScore >= 70 ? 'text-cyan-400' :
                      result.trustScore >= 40 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {result.trustScore}/100
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
                    result.decision === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    result.decision === 'WARN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    result.decision === 'REVIEW' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                    'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {result.decision === 'ALLOW' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {result.decision === 'WARN' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {result.decision === 'REVIEW' && <HelpCircle className="w-3.5 h-3.5 text-orange-400" />}
                    {result.decision === 'BLOCK' && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
                    ACTION: {result.decision}
                  </span>
                </div>
              </div>

              {/* Triggered Security Rules */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Rules Triggered ({result.triggeredRules?.length || 0})
                </h4>
                {result.triggeredRules && result.triggeredRules.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {result.triggeredRules.map((rule: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 p-2 bg-[#0a0d14] border border-[#1e2638] rounded-lg text-xs font-mono text-rose-300">
                        <CheckSquare className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{rule}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>No security threats detected. Zero rule violations.</span>
                  </div>
                )}
              </div>

              {/* Gemini Explanation */}
              <div className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs font-mono">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Security Telemetry Explanation
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {result.explanation || "No security threats detected."}
                </p>
              </div>

              {/* Recommended Action */}
              <div className="p-4 bg-[#080b12] border border-[#1e2638] rounded-xl space-y-1">
                <p className="text-[10px] font-mono text-slate-500 uppercase">Recommended Operator Action</p>
                <p className="text-xs font-mono font-bold text-slate-200">
                  {result.recommendedAction || "No security threats detected."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
