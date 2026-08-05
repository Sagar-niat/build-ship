import React, { useEffect, useState } from 'react';
import { fetchSecurityEvents } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { AlertTriangle, Filter, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadEvents = () => {
    setLoading(true);
    fetchSecurityEvents()
      .then(res => {
        if (res.success) setEvents(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(evt => {
    if (severityFilter !== 'ALL' && evt.severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && evt.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-400" /> Enterprise Security Events
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time security telemetry queue with multi-dimensional severity and status filtering.
          </p>
        </div>
        <button
          onClick={loadEvents}
          className="p-2.5 bg-[#111625] border border-[#1e2638] hover:border-cyan-500/40 text-slate-300 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111625] border border-[#1e2638] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase">Filters:</span>
          
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-[#0a0d14] border border-[#1e2638] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">Severity: ALL</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0a0d14] border border-[#1e2638] rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
          >
            <option value="ALL">Status: ALL</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredEvents.length} of {events.length} records
        </span>
      </div>

      {/* Table */}
      <div className="bg-[#111625] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1e2638] bg-[#0a0d14]/60 text-[11px] font-mono uppercase text-slate-400">
              <th className="p-4">Event ID</th>
              <th className="p-4">Type</th>
              <th className="p-4">Severity</th>
              <th className="p-4">Source</th>
              <th className="p-4">Risk Score</th>
              <th className="p-4">Status</th>
              <th className="p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2638] text-xs text-slate-300">
            {filteredEvents.map((evt) => (
              <tr key={evt.id} className="hover:bg-[#182033] transition-colors">
                <td className="p-4 font-mono text-cyan-400 font-semibold">{evt.id}</td>
                <td className="p-4 font-mono font-bold text-slate-200">{evt.event_type}</td>
                <td className="p-4"><RiskBadge level={evt.severity} /></td>
                <td className="p-4 font-mono text-slate-400">{evt.source}</td>
                <td className="p-4 font-mono font-bold text-rose-400">{evt.risk_score}/100</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    evt.status === 'OPEN' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                    evt.status === 'INVESTIGATING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {evt.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-slate-500 text-[11px]">
                  {new Date(evt.created_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
