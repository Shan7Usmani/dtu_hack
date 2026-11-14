import React, { useState, useEffect, useRef } from 'react';
import { AlertOctagon, Volume2, ShieldAlert, CheckCircle, PhoneCall, XCircle } from 'lucide-react';
import { cancelEmergency, requestEmergencyHelp } from '../services/api';

export default function EmergencyModal({ incident, telemetry, onAcknowledge, onCancel }) {
  const [countdown, setCountdown] = useState(15);
  const [canceling, setCanceling] = useState(false);
  const audioRef = useRef(null);

  const activeInc = incident || (telemetry?.status === 'DROWSY' ? {
    incident_id: 'NTK-VERIFY-01',
    confidence: 78,
    severity: 'HIGH',
    location: { address: 'Rajiv Chowk, New Delhi' },
    verification_seconds_remaining: 15
  } : null);

  useEffect(() => {
    if (!activeInc) return;

    // Play YouTube Short alarm audio in browser
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/assets/alarm.wav');
        audioRef.current.loop = true;
      }
      audioRef.current.play().catch(e => console.log("Audio autoplay prevented:", e));
    } catch(e) {}

    setCountdown(activeInc.verification_seconds_remaining || 15);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [activeInc]);

  if (!activeInc) return null;

  const handleCancelClick = async () => {
    setCanceling(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (activeInc.incident_id) {
      await cancelEmergency(activeInc.incident_id);
    }
    if (onCancel) onCancel();
    if (onAcknowledge) onAcknowledge();
    setCanceling(false);
  };

  const handleRequestHelpClick = async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (activeInc.incident_id) {
      await requestEmergencyHelp(activeInc.incident_id);
    }
    if (onAcknowledge) onAcknowledge();
  };

  const isCritical = activeInc.confidence >= 90 || activeInc.severity === 'CRITICAL';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-red-500 rounded-2xl max-w-lg w-full p-6 shadow-2xl glow-red relative overflow-hidden text-center">
        
        {/* Top Header Warning Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-3 animate-bounce">
          <AlertOctagon className="w-9 h-9 text-red-500" />
        </div>

        <h2 className="text-xl font-extrabold text-white uppercase tracking-tight mb-1">
          {isCritical ? '🚨 CRITICAL ACCIDENT DETECTED' : '⚠ POSSIBLE IMPACT DETECTED'}
        </h2>
        
        <p className="text-red-400 font-mono text-xs font-bold mb-3">
          {isCritical
            ? 'Emergency assistance workflow initiated!'
            : `Assistance will be dispatched automatically in ${countdown} seconds.`}
        </p>

        {/* Countdown Badge */}
        {!isCritical && (
          <div className="w-20 h-20 rounded-full border-4 border-red-500 bg-red-500/10 flex items-center justify-center mx-auto my-3">
            <span className="text-3xl font-extrabold font-mono text-red-400">{countdown}s</span>
          </div>
        )}

        {/* Incident Details Card */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 mb-5 text-left text-xs text-slate-200 space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Incident ID:</span>
            <span className="font-bold text-white">{activeInc.incident_id || 'NTK-2026-00124'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Accident Confidence:</span>
            <span className="font-bold text-red-400">{activeInc.confidence || 85}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">GPS Location:</span>
            <span className="font-bold text-slate-200 truncate max-w-[200px]">{activeInc.location?.address || 'Rajiv Chowk, New Delhi'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Audible Alarm:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" /> YOUTUBE SHORT ALARM ACTIVE
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCancelClick}
            disabled={canceling}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-wider border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4 text-emerald-400" />
            <span>I'M SAFE -- CANCEL</span>
          </button>

          <button
            onClick={handleRequestHelpClick}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>REQUEST HELP NOW</span>
          </button>
        </div>

      </div>
    </div>
  );
}
