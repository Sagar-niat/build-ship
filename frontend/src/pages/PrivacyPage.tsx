import React, { useState } from 'react';
import { scanPII, redactPII } from '../services/api';
import { EyeOff, ShieldCheck, Copy, Check, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const [inputText, setInputText] = useState(`Hello team, please process refund for customer John Smith.
My email is john.smith@acme-corp.com and contact number is +91 9876543210.
Card ending in 4532-8901-2345-6789.
Aadhaar identifier: 4589 1234 9876.`);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleRedact = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await scanPII(inputText);
      if (res.success) setScanResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRedacted = () => {
    if (scanResult?.redactedText) {
      navigator.clipboard.writeText(scanResult.redactedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <EyeOff className="w-6 h-6 text-amber-400" /> PII Privacy Protection Workspace
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Automatic pattern detection and redaction of sensitive identifiers (Email, Phone, Card, Aadhaar, PAN, IP).
        </p>
      </div>

      <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-5">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Unfiltered Sensitive Input Document</label>
        <textarea
          rows={6}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none transition-all font-mono"
        />

        <button
          onClick={handleRedact}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Redacting PII...' : 'Scan & Redact Sensitive PII'}
        </button>
      </div>

      {scanResult && (
        <div className="space-y-6">
          {/* Detected Tags Bar */}
          <div className="p-4 bg-[#111625] border border-[#1e2638] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400">PII Telemetry Detected</span>
              <div className="flex items-center gap-2 mt-1">
                {scanResult.piiTypesDetected?.map((t: string, i: number) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {scanResult.detectedCount} elements scrubbed
            </span>
          </div>

          {/* Side by Side Diff Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Original Raw Text
              </h3>
              <div className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl font-mono text-xs text-rose-300 leading-relaxed min-h-[140px]">
                {scanResult.originalText}
              </div>
            </div>

            <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safe Redacted Version
                </h3>
                <button
                  onClick={handleCopyRedacted}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#192033] hover:bg-[#232c45] border border-[#2c3754] text-xs text-slate-300 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Redacted'}
                </button>
              </div>
              <div className="p-4 bg-[#0a0d14] border border-emerald-500/30 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed min-h-[140px]">
                {scanResult.redactedText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
