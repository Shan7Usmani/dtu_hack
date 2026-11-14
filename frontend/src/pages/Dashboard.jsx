import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Square, RotateCcw, ShieldCheck, AlertTriangle, AlertOctagon, User, Truck, ShieldAlert, ArrowRight } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import CameraStream from '../components/CameraStream';
import DetectionCards from '../components/DetectionCards';
import AlertCenter from '../components/AlertCenter';
import EmergencyModal from '../components/EmergencyModal';
import { fetchTelemetry, fetchAlerts, fetchActiveIncident, startMonitoring, stopMonitoring, resetSession } from '../services/api';

export default function Dashboard({ isDemoMode }) {
  const [telemetry, setTelemetry] = useState({
    status: 'AWAKE',
    risk_level: 'LOW',
    risk_score: 15,
    average_ear: 0.305,
    left_ear: 0.31,
    right_ear: 0.30,
    closed_duration: 0.0,
    is_eyes_closed: false,
    drowsiness_events: 0,
    longest_closure: 0.0,
    session_avg_ear: 0.305,
    monitoring_duration_formatted: '00:00:00',
    fps: 30.0
  });

  const [alerts, setAlerts] = useState([]);
  const [activeIncident, setActiveIncident] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState(true);

  // Poll telemetry every 200ms
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchTelemetry();
      if (data) {
        setTelemetry(data);
        setIsMonitoring(data.is_monitoring);
      }
      const alts = await fetchAlerts();
      if (alts) {
        setAlerts(alts);
      }
      const incRes = await fetchActiveIncident();
      if (incRes && incRes.active_incident) {
        setActiveIncident(incRes.active_incident);
      } else {
        setActiveIncident(null);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    await startMonitoring();
    setIsMonitoring(true);
  };

  const handleStop = async () => {
    await stopMonitoring();
    setIsMonitoring(false);
  };

  const handleReset = async () => {
    await resetSession();
  };

  const status = telemetry?.status || 'AWAKE';
  const riskLevel = telemetry?.risk_level || 'LOW';
  const riskScore = telemetry?.risk_score || 15;

  let statusBadgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (status === 'DROWSY' || riskLevel === 'CRITICAL' || activeIncident) {
    statusBadgeStyle = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
  } else if (status === 'CAUTION' || riskLevel === 'WARNING') {
    statusBadgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
  }

  return (
    <div className="min-h-screen flex flex-col space-y-4 pb-12">
      
      {/* Active Incident Warning Banner */}
      {activeIncident && (
        <div className="glass-card rounded-xl p-3.5 border-2 border-red-500 bg-red-500/10 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <div>
              <span className="font-extrabold text-white text-xs font-mono block">
                🚨 ACTIVE EMERGENCY INCIDENT DISPATCHED (ID: {activeIncident.incident_id})
              </span>
              <span className="text-[11px] text-red-300">
                Confidence: {activeIncident.confidence}% | Location: {activeIncident.location?.address}
              </span>
            </div>
          </div>
          <Link
            to="/emergency"
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1 shrink-0"
          >
            <span>Open Emergency Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top Header Command Bar */}
      <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        
        {/* Status Badge */}
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg border font-extrabold text-sm tracking-wide uppercase flex items-center gap-2 ${statusBadgeStyle}`}>
            {status === 'DROWSY' || activeIncident ? (
              <AlertOctagon className="w-5 h-5 text-red-500 animate-spin" />
            ) : status === 'CAUTION' ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <span>DRIVER STATUS: {activeIncident ? 'CRITICAL INCIDENT' : status}</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-400" /> DRV-8842 (Rajesh S.)</span>
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-blue-400" /> VH-9021 (Cascadia ADAS)</span>
          </div>
        </div>

        {/* Monitoring Controls */}
        <div className="flex items-center gap-2">
          {isMonitoring ? (
            <button
              onClick={handleStop}
              className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-red-400" />
              <span>STOP MONITORING</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              <span>START MONITORING</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Reset Session Counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Risk Gauge & Live Session Metrics (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Radial Risk Gauge */}
          <RiskGauge score={activeIncident ? 95 : riskScore} level={activeIncident ? 'CRITICAL' : riskLevel} />

          {/* EAR Breakdown & Session Metrics Box */}
          <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              SESSION METRICS TELEMETRY
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Monitoring Time</span>
                <span className="font-bold text-white text-sm">{telemetry.monitoring_duration_formatted || '00:00:00'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Drowsy Events</span>
                <span className="font-bold text-amber-400 text-sm">{telemetry.drowsiness_events || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Longest Closure</span>
                <span className="font-bold text-red-400 text-sm">{(telemetry.longest_closure || 0).toFixed(2)} sec</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Session Avg EAR</span>
                <span className="font-bold text-blue-400 text-sm">{(telemetry.session_avg_ear || 0.305).toFixed(3)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Central & Right Columns (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Central Live Video Camera Stream */}
          <CameraStream telemetry={telemetry} isMonitoring={isMonitoring} isDemoMode={isDemoMode} />

          {/* AI 6-Channel Detection Cards */}
          <DetectionCards telemetry={telemetry} />

          {/* Live Alert Center */}
          <AlertCenter alerts={alerts} onRefresh={async () => setAlerts(await fetchAlerts())} />

        </div>

      </div>

      {/* Emergency Modal Popover */}
      {showEmergencyModal && (
        <EmergencyModal
          incident={activeIncident}
          telemetry={telemetry}
          onAcknowledge={() => setShowEmergencyModal(false)}
        />
      )}

    </div>
  );
}
