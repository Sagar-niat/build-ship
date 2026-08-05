import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, AlertOctagon, CheckCircle2, Lock, Smartphone, Send, RefreshCw, Zap } from 'lucide-react';

interface DeviceMessage {
  id: string;
  sender: string;
  senderName: string;
  rawText: string;
  redactedText?: string;
  channel: string;
  receivedAt: string;
  trustScore?: number;
  riskLevel?: string;
  status?: string;
  explanation?: string;
  recommendedAction?: string;
  indicators?: any[];
}

export default function DeviceGuardPage() {
  const [messages, setMessages] = useState<DeviceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [simText, setSimText] = useState('');
  const [simSender, setSimSender] = useState('+91 9876543210');
  const [simChannel, setSimChannel] = useState('SMS');
  const [scanning, setScanning] = useState(false);

  const fetchDeviceFeed = async () => {
    try {
      const res = await fetch('/api/device/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceFeed();
    const interval = setInterval(fetchDeviceFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateIncoming = async (textToSend?: string) => {
    const text = textToSend || simText.trim();
    if (!text || scanning) return;

    setScanning(true);
    try {
      const res = await fetch('/api/device/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: simSender,
          senderName: simChannel === 'SMS' ? 'Simulated Contact' : 'Security Alert',
          rawText: text,
          channel: simChannel
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [data.data, ...prev]);
        if (!textToSend) setSimText('');

        // Trigger Native Device Notification if auto-blocked
        if (data.data.status === 'AUTO_BLOCKED' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 TrustGuard AI Threat Auto-Blocked', {
            body: `Blocked scam message from ${data.data.sender}. Trust Score: ${data.data.trustScore}/100`,
            icon: '/favicon.ico'
          });
        }
      }
    } catch (e) {} finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sampleThreats = [
    "URGENT: Please confirm your bank account statement now. Send your 6-digit OTP right now to verify credentials.",
    "Your package delivery failed. Verify address immediately at http://bit.ly/ship-track-verify",
    "Acme Corp IT: Routine password expiration notice. Please update via official internal portal by Friday."
  ];

  const blockedCount = messages.filter(m => m.status === 'AUTO_BLOCKED' || (m.trustScore && m.trustScore < 70)).length;
  const safeCount = messages.length - blockedCount;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111625] border border-[#1e2638] p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AUTONOMOUS DEVICE SHIELD ACTIVE
            </span>
            <span className="text-xs text-slate-400 font-mono">• Zero Manual Copy-Paste Required</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-cyan-400" /> Autonomous Device Guard & Inbox Shield
          </h2>
          <p className="text-xs text-slate-400">
            TrustGuard AI automatically inspects all incoming device SMS, emails, and notifications in real time. Spam and OTP scams are automatically blocked & quarantined.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#0a0d14] p-4 rounded-xl border border-[#1e2638] font-mono text-xs">
          <div className="text-center">
            <p className="text-rose-400 font-bold text-lg">{blockedCount}</p>
            <p className="text-[10px] text-slate-500 uppercase">Auto-Blocked</p>
          </div>
          <div className="h-8 w-px bg-[#1e2638]" />
          <div className="text-center">
            <p className="text-emerald-400 font-bold text-lg">{safeCount}</p>
            <p className="text-[10px] text-slate-500 uppercase">Verified Safe</p>
          </div>
        </div>
      </div>

      {/* Simulator Box for Evaluation */}
      <div className="bg-[#111625] border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> Incoming Device Message Simulator
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Simulate incoming SMS/email to observe auto-block in real time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={simSender}
            onChange={e => setSimSender(e.target.value)}
            placeholder="Sender Phone / Email"
            className="bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none"
          />
          <select
            value={simChannel}
            onChange={e => setSimChannel(e.target.value)}
            className="bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono focus:outline-none"
          >
            <option value="SMS">SMS Message</option>
            <option value="EMAIL">Email</option>
            <option value="WHATSAPP">WhatsApp Message</option>
          </select>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="text"
              value={simText}
              onChange={e => setSimText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSimulateIncoming()}
              placeholder="Enter message (e.g. Bank OTP demand, phishing link)..."
              className="flex-1 bg-[#0a0d14] border border-[#1e2638] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
            <button
              onClick={() => handleSimulateIncoming()}
              disabled={!simText.trim() || scanning}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
            >
              {scanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Send
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400 pt-1 font-mono">
          <span className="text-slate-500">Quick Test Prompts:</span>
          {sampleThreats.map((st, i) => (
            <button
              key={i}
              onClick={() => handleSimulateIncoming(st)}
              className="bg-[#0a0d14] hover:bg-[#151c2e] border border-[#1e2638] hover:border-cyan-500/40 text-slate-300 px-2.5 py-1 rounded-lg transition-all text-[10px] truncate max-w-xs"
            >
              Test #{i + 1}: {st.substring(0, 35)}...
            </button>
          ))}
        </div>
      </div>

      {/* Device Message Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span>Monitored Device Feed ({messages.length})</span>
          <button onClick={fetchDeviceFeed} className="text-xs text-cyan-400 font-mono flex items-center gap-1 hover:underline">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </h3>

        {loading ? (
          <div className="p-8 bg-[#111625] border border-[#1e2638] rounded-2xl text-center text-xs font-mono text-slate-400">
            Connecting to device guard feed...
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isBlocked = msg.status === 'AUTO_BLOCKED' || (msg.trustScore && msg.trustScore < 70);
              return (
                <div
                  key={msg.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isBlocked
                      ? 'bg-[#170e16] border-rose-500/40 shadow-lg shadow-rose-500/5'
                      : 'bg-[#111625] border-[#1e2638]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 ${
                        isBlocked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isBlocked ? <AlertOctagon className="w-3 h-3 text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {isBlocked ? 'AUTO-BLOCKED BY TRUSTGUARD AI' : 'VERIFIED SAFE BY TRUSTGUARD'}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{msg.senderName || msg.sender}</span>
                      <span className="text-[10px] font-mono text-slate-500">({msg.channel})</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-400">{new Date(msg.receivedAt).toLocaleTimeString()}</span>
                      {msg.trustScore !== undefined && (
                        <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          isBlocked ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          Trust Score: {msg.trustScore}/100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0a0d14] border border-[#1e2638] rounded-xl font-mono text-xs text-slate-200 mb-3">
                    {msg.redactedText || msg.rawText}
                  </div>

                  {msg.explanation && (
                    <div className="p-3 bg-[#080b12] border border-[#1b2336] rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" /> Gemini 3.6 Flash Telemetry Verdict
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{msg.explanation}</p>
                      {msg.recommendedAction && (
                        <p className="text-rose-300 text-[10px] font-mono pt-1">
                          Automated Defense Action: {msg.recommendedAction}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
