import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Globe, Shield, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  urlAnalysis?: any;
}

export default function GeminiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemini',
      text: "Hello! I am your TrustGuard Gemini 3.6 Flash AI Security Assistant. You can ask me any security questions, paste raw telemetry, or enter URLs for real-time web threat and privacy analysis.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `gem-${Date.now()}`,
        sender: 'gemini',
        text: data.reply || data.data?.explanation || 'Gemini AI generated response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urlAnalysis: data.data?.urlAnalysis
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'gemini',
        text: `Error processing request with Gemini 3.6 Flash: ${e?.message || 'Connection failed'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    "Analyze URL http://verify-sec-login.com for phishing",
    "Explain how TrustGuard calculates Trust Scores",
    "How does PII auto-redaction protect sensitive customer data?",
    "What are the indicators of a credential harvesting attack?"
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0b0e17] text-slate-100 font-sans">
      {/* Gemini Header */}
      <div className="h-14 border-b border-[#1b2336] px-8 flex items-center justify-between bg-[#101524]/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0b0e17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Gemini Security Platform</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                v3.6 Flash Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Conversational AI Security & Web Telemetry Analyst</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Web Access & Live AI Ready
        </div>
      </div>

      {/* Chat Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'gemini' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold flex-shrink-0 mt-1 shadow-md shadow-cyan-500/10">
                <Sparkles className="w-4 h-4 text-slate-950" />
              </div>
            )}

            <div className={`space-y-1.5 max-w-2xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1">
                <span>{msg.sender === 'user' ? 'You' : 'Gemini 3.6 Flash'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-500/10'
                    : 'bg-[#121827] border border-[#1e273a] text-slate-200 rounded-tl-none space-y-3'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.urlAnalysis && (
                  <div className="p-3 bg-[#0a0d14] border border-[#1f2a3f] rounded-xl space-y-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-cyan-400 font-bold">
                      <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Web Target Analyzed</span>
                      <span>Trust Score: {msg.urlAnalysis.trustScore}/100</span>
                    </div>
                    <p className="text-slate-300">Domain Status: <span className={msg.urlAnalysis.riskLevel === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{msg.urlAnalysis.riskLevel}</span></p>
                  </div>
                )}

                {msg.sender === 'gemini' && (
                  <div className="pt-2 flex items-center justify-between border-t border-[#1b2336] text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-cyan-400" /> Verified by TrustGuard Engine</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-[#1d273a] border border-[#2a3752] flex items-center justify-center text-cyan-400 font-bold flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div className="p-4 bg-[#121827] border border-[#1e273a] rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              Gemini 3.6 Flash is analyzing web telemetry and synthesizing security insights...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="max-w-4xl mx-auto w-full px-6 mb-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-mono">Suggested AI Queries</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="text-left text-xs bg-[#111726] hover:bg-[#182035] border border-[#1d273c] hover:border-cyan-500/40 text-slate-300 p-2.5 rounded-xl transition-all flex items-center justify-between group"
              >
                <span className="truncate">{qp}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 border-t border-[#1b2336] bg-[#101524]/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto w-full relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Gemini anything about security, paste code, or enter a URL (e.g. http://domain.com)..."
            className="w-full bg-[#070910] border border-[#1e2638] focus:border-cyan-500/50 text-slate-200 text-xs pl-4 pr-12 py-3.5 rounded-xl focus:outline-none shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 rounded-lg transition-all shadow-md shadow-cyan-500/10"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
