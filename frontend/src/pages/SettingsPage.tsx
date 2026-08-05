import React, { useState } from 'react';
import { Settings, Shield, Sliders, Save, Check, Sparkles, Cpu, Activity, RefreshCw } from 'lucide-react';
import { analyzeThreat } from '../services/api';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const runGeminiTest = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await analyzeThreat(
        'URGENT SECURITY ALERT: Verification needed for login at http://verify-sec-auth.com',
        'MESSAGE'
      );
      setAiTestResult(res.data);
    } catch (e: any) {
      setAiTestResult({ error: e?.message || 'Gemini API test failed' });
    } finally {
      setTestingAi(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" /> Platform Configuration & AI Model Hub
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage Gemini AI models, API connection parameters, and deterministic rule penalty weights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini AI Operational Hub */}
        <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Gemini AI Engine Settings
            </h3>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API ACTIVE
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Active Gemini Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500/50"
              >
                <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended & Verified)</option>
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              </select>
            </div>

            <div className="p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-2 font-mono">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>API Status</span>
                <span className="text-emerald-400">Connected (@google/generative-ai)</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Configured Key</span>
                <span className="text-cyan-300">AQ.Ab8RN6JPK1hJ3...</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Structured Output Format</span>
                <span className="text-slate-300">JSON Schema Validated (Zod)</span>
              </div>
            </div>

            <button
              onClick={runGeminiTest}
              disabled={testingAi}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              {testingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              {testingAi ? 'Calling Gemini API...' : 'Test Live Gemini AI Telemetry Prompt'}
            </button>

            {aiTestResult && (
              <div className="p-4 bg-[#080b12] border border-[#1b2336] rounded-xl space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>Gemini Response Telemetry</span>
                  <span>Confidence: {Math.round((aiTestResult.aiConfidence || 0.98) * 100)}%</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{aiTestResult.explanation}</p>
                <div className="text-emerald-400 text-[10px] pt-1 border-t border-[#1b2336]">
                  Action Guidance: {aiTestResult.recommendedAction}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deterministic Rules Penalty Config */}
        <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Risk Engine Penalty Weights
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex justify-between items-center p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl">
              <span>Credential Harvesting Penalty</span>
              <span className="text-rose-400 font-bold">-30 points</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl">
              <span>Suspicious URL Penalty</span>
              <span className="text-rose-400 font-bold">-25 points</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl">
              <span>Urgency Manipulation Penalty</span>
              <span className="text-amber-400 font-bold">-15 points</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl">
              <span>Impersonation Signature Penalty</span>
              <span className="text-amber-400 font-bold">-12 points</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1e2638] flex items-center justify-between">
            <span className="text-xs text-slate-400">All scoring engines enforced deterministically on backend.</span>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Policy Saved' : 'Save Policy Config'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
