import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertOctagon, MapPin, Ambulance, Navigation, Flame, PhoneCall, CheckCircle2, RefreshCw, Radio, FileText, User } from 'lucide-react';
import EmergencyMap from '../components/EmergencyMap';
import EmergencyTimeline from '../components/EmergencyTimeline';
import EmergencyModal from '../components/EmergencyModal';
import { fetchActiveIncident, fetchIncidents, cancelEmergency, requestEmergencyHelp, resolveEmergency, runEmergencyTest, simulateEmergencyAccident } from '../services/api';

export default function EmergencyPage() {
  const [activeIncident, setActiveIncident] = useState(null);
  const [incidentsHistory, setIncidentsHistory] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadIncidents = async () => {
    const res = await fetchActiveIncident();
    if (res && res.active_incident) {
      setActiveIncident(res.active_incident);
    } else {
      setActiveIncident(null);
    }
    const history = await fetchIncidents();
    if (history) setIncidentsHistory(history);
  };

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(loadIncidents, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    await simulateEmergencyAccident();
    await loadIncidents();
    setLoading(false);
  };

  const handleRunTest = async () => {
    setLoading(true);
    const res = await runEmergencyTest();
    setTestResult(res);
    setLoading(false);
  };

  const handleCancel = async (id) => {
    await cancelEmergency(id);
    await loadIncidents();
  };

  const handleRequestHelp = async (id) => {
    await requestEmergencyHelp(id);
    await loadIncidents();
  };

  const handleResolve = async (id) => {
    await resolveEmergency(id);
    await loadIncidents();
  };

  let statusBadgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let statusText = '🟢 SYSTEM NORMAL -- STANDBY MONITORING';

  if (activeIncident) {
    if (activeIncident.status === 'VERIFYING') {
      statusBadgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      statusText = '🟡 INCIDENT UNDER REVIEW -- VERIFYING ACCIDENT';
    } else {
      statusBadgeStyle = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      statusText = '🔴 ACTIVE EMERGENCY INCIDENT DISPATCHED';
    }
  }

  return (
    <div className="min-h-screen space-y-6 pb-12">
      
      {/* Top Header Command Bar */}
      <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">Emergency Response Command Center</h1>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">Real-time accident detection, location lock, and dispatch workflow</p>
        </div>

        {/* Action Controls & Simulation Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Trigger simulated accident for presentation"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Accident (Demo)</span>
          </button>

          <button
            onClick={handleRunTest}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Run Emergency Diagnostic Test"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run System Test</span>
          </button>
        </div>

      </div>

      {/* System Status Banner */}
      <div className={`px-4 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${statusBadgeStyle}`}>
        <span>{statusText}</span>
        {activeIncident && (
          <span className="text-[10px] uppercase font-sans">INCIDENT ID: {activeIncident.incident_id}</span>
        )}
      </div>

      {/* Main Command Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Map & Active Incident Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Incident Details Card */}
          {activeIncident ? (
            <div className="glass-card rounded-2xl p-5 border-2 border-red-500/80 glow-red space-y-4">
              <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-500 animate-spin" />
                  <span className="font-extrabold text-white text-sm">🚨 ACTIVE ACCIDENT INCIDENT RECORD</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                  {activeIncident.severity} ({activeIncident.confidence}% Confidence)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Incident ID</span>
                  <span className="font-bold text-white text-sm">{activeIncident.incident_id}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Incident Time</span>
                  <span className="font-bold text-amber-400 text-sm">{activeIncident.timestamp}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Driver State</span>
                  <span className="font-bold text-red-400 text-sm">{activeIncident.driver_condition}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Response Status</span>
                  <span className="font-bold text-emerald-400 text-sm">{activeIncident.status}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleCancel(activeIncident.incident_id)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
                >
                  I'M SAFE -- CANCEL
                </button>
                <button
                  onClick={() => handleRequestHelp(activeIncident.incident_id)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 transition-colors flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>DISPATCH HELP NOW</span>
                </button>
                <button
                  onClick={() => handleResolve(activeIncident.incident_id)}
                  className="px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors"
                >
                  MARK RESOLVED
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-extrabold text-white">NO ACTIVE EMERGENCY</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Netrakshak Edge AI is monitoring vehicle sensors and camera feeds in real time.
              </p>
            </div>
          )}

          {/* Interactive Incident & Responder Map */}
          <EmergencyMap incident={activeIncident} />

          {/* Nearest Help Facilities */}
          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              NEAREST EMERGENCY RESPONDER STATIONS
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Ambulance className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Trauma Hospital</span>
                  <span className="text-slate-400 text-[11px]">3.2 km | ETA 6 mins</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Navigation className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Police Patrol</span>
                  <span className="text-slate-400 text-[11px]">2.4 km | ETA 8 mins</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Fire Station</span>
                  <span className="text-slate-400 text-[11px]">4.1 km | ETA 10 mins</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Timeline & Notifications (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dispatch Progress Timeline */}
          <EmergencyTimeline
            timeline={activeIncident?.timeline || []}
            incidentStatus={activeIncident?.status || 'NORMAL'}
          />

          {/* Notifications Feed Card */}
          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              DISPATCH NOTIFICATION STATUS
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {activeIncident?.notifications ? (
                activeIncident.notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{n.service}</span>
                      <span className="text-[10px] text-slate-500">{n.delivery_channel}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/30 font-bold">
                      {n.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No active dispatch notifications logged.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* System Test Output Modal */}
      {testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-blue-500/40 rounded-2xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">EMERGENCY SYSTEM DIAGNOSTIC RESULTS</h3>
              <span className="text-[10px] font-mono font-bold text-blue-400">TEST MODE</span>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
            <button
              onClick={() => setTestResult(null)}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Close Diagnostic Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
