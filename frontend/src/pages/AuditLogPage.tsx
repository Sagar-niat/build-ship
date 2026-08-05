import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { History, FileText, Info, X } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    fetchAuditLogs()
      .then(res => {
        if (res.success) setLogs(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-emerald-400" /> Immutable Security Audit Trail
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete transparent log of all security evaluations, PII redaction actions, decisions, and system events.
        </p>
      </div>

      <div className="bg-[#111625] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e2638] bg-[#0a0d14]/60 text-[11px] font-mono uppercase text-slate-400">
              <th className="p-4">Timestamp</th>
              <th className="p-4">Action Type</th>
              <th className="p-4">Resource</th>
              <th className="p-4">Result</th>
              <th className="p-4">Risk Level</th>
              <th className="p-4">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2638] text-xs text-slate-300">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#182033] transition-colors">
                <td className="p-4 font-mono text-slate-500 text-[11px]">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="p-4 font-mono font-bold text-cyan-400">{log.action_type}</td>
                <td className="p-4 font-mono text-slate-300">{log.resource}</td>
                <td className="p-4 font-mono text-slate-400">{log.result}</td>
                <td className="p-4"><RiskBadge level={log.risk_level} /></td>
                <td className="p-4">
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="p-1.5 bg-[#192033] hover:bg-[#25314d] border border-[#2d3a5a] text-cyan-400 rounded-lg text-xs font-mono transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Log Details Drawer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-end p-6">
          <div className="bg-[#111625] border border-[#1e2638] w-full max-w-lg h-full rounded-2xl p-6 space-y-6 overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-200 bg-[#182033] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs text-cyan-400 font-bold">Audit Record ID: #{selectedLog.id}</span>
              <h3 className="text-xl font-bold text-white">{selectedLog.action_type}</h3>
              <p className="text-xs text-slate-400 font-mono">{new Date(selectedLog.created_at).toISOString()}</p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-1">
                <span className="text-slate-500 uppercase">Resource Target</span>
                <p className="text-slate-200 font-bold">{selectedLog.resource}</p>
              </div>

              <div className="p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-1">
                <span className="text-slate-500 uppercase">IP & Device Telemetry</span>
                <p className="text-slate-200">{selectedLog.ip_address || '127.0.0.1 (Authenticated Analyst Session)'}</p>
              </div>

              <div className="p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl space-y-1">
                <span className="text-slate-500 uppercase">Action Result</span>
                <p className="text-emerald-400 font-bold">{selectedLog.result}</p>
              </div>

              {selectedLog.details && (
                <div className="p-3.5 bg-[#080b12] border border-[#1e2638] rounded-xl space-y-1 overflow-x-auto">
                  <span className="text-purple-400">// Audit Metadata Payload</span>{'\n'}
                  <pre className="text-slate-300 text-[11px]">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
