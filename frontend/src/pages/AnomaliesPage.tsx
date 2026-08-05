import React, { useEffect, useState } from 'react';
import { fetchAnomalies, analyzeAnomaly } from '../services/api';
import RiskBadge from '../components/common/RiskBadge';
import { Activity, ShieldAlert, Sparkles, MapPin, Clock, Smartphone } from 'lucide-react';

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testLocation, setTestLocation] = useState('Moscow, RU');
  const [testTimeHour, setTestTimeHour] = useState(3);
  const [testDevice, setTestDevice] = useState('Chrome on Linux (Unrecognized)');

  const loadAnomalies = () => {
    setLoading(true);
    fetchAnomalies()
      .then(res => {
        if (res.success) setAnomalies(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  const handleTestAnomaly = async () => {
    await analyzeAnomaly({
      loginLocation: testLocation,
      loginTimeHour: testTimeHour,
      deviceFingerprint: testDevice,
      failedAttemptsCount: 3
    });
    loadAnomalies();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" /> Authentication & Baseline Anomaly Detector
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Rule-based behavioral anomaly scoring inspecting geo-location, access timeframe, and hardware fingerprints.
        </p>
      </div>

      {/* Simulator Panel */}
      <div className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Test Behavioral Telemetry Vector
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Login Geo Location</label>
            <input
              type="text"
              value={testLocation}
              onChange={e => setTestLocation(e.target.value)}
              className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Time of Day (0-23 Hour)</label>
            <input
              type="number"
              value={testTimeHour}
              onChange={e => setTestTimeHour(Number(e.target.value))}
              className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Hardware Fingerprint</label>
            <input
              type="text"
              value={testDevice}
              onChange={e => setTestDevice(e.target.value)}
              className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleTestAnomaly}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-purple-500/20"
        >
          Evaluate Anomaly Risk Score
        </button>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {anomalies.map((anom) => (
          <div key={anom.id} className="bg-[#111625] border border-[#1e2638] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cyan-400">{anom.user_email || 'admin@acme.corp'}</span>
                <span className="text-xs font-mono text-slate-400">({anom.anomaly_type})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-rose-400">Risk Score: {anom.risk_score}/100</span>
                <RiskBadge level={anom.risk_score >= 75 ? 'CRITICAL' : anom.risk_score >= 50 ? 'HIGH' : 'MEDIUM'} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {anom.factors?.map((f: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#0a0d14] border border-[#1e2638] rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-mono font-bold text-amber-400">
                    <span>{f.factor}</span>
                    <span className="text-rose-400">+{f.penalty}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
