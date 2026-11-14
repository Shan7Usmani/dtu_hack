import React from 'react';
import { Eye, UserCheck, Phone, AlertCircle, Wine, Gauge } from 'lucide-react';

export default function DetectionCards({ detections, telemetry }) {
  const isPhoneDetected = telemetry?.phone_detected || false;

  const channels = [
    {
      id: 'eyes',
      title: 'Eyes Aperture (EAR)',
      icon: Eye,
      status: telemetry?.is_eyes_closed ? 'CLOSED' : 'OPEN',
      val: `EAR ${(telemetry?.average_ear || 0.305).toFixed(3)}`,
      connected: true,
      color: telemetry?.is_eyes_closed ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      id: 'phone',
      title: 'Phone Usage Detection',
      icon: Phone,
      status: isPhoneDetected ? 'PHONE DETECTED' : 'NO PHONE DETECTED',
      val: isPhoneDetected ? '📱 Mobile Distraction (ALARM)' : 'No Phone Distraction Detected',
      connected: true,
      color: isPhoneDetected ? 'text-red-400 border-red-500/30 bg-red-500/10 font-bold animate-pulse' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      id: 'fatigue',
      title: 'Drowsiness State',
      icon: AlertCircle,
      status: telemetry?.status || 'AWAKE',
      val: `Closure ${(telemetry?.closed_duration || 0).toFixed(1)}s`,
      connected: true,
      color: telemetry?.status === 'DROWSY' ? 'text-red-400 border-red-500/30 bg-red-500/10' : telemetry?.status === 'CAUTION' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      id: 'attention',
      title: 'Driver Attention',
      icon: UserCheck,
      status: telemetry?.status === 'NO_DRIVER' ? 'NO DRIVER' : 'FOCUSED',
      val: 'Forward Road Focus',
      connected: true,
      color: telemetry?.status === 'NO_DRIVER' ? 'text-slate-400 border-slate-700 bg-slate-800/40' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      id: 'speed',
      title: 'Vehicle Overspeed',
      icon: Gauge,
      status: 'SAFE',
      val: '65 km/h (Limit 80)',
      connected: true,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    },
    {
      id: 'alcohol',
      title: 'Alcohol Sensor',
      icon: Wine,
      status: 'NOT CONNECTED',
      val: 'Hardware Sensor Offline',
      connected: false,
      note: 'V7 Sensor Fusion',
      color: 'text-slate-400 border-slate-800 bg-slate-900/40'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
      {channels.map((ch) => {
        const Icon = ch.icon;
        return (
          <div
            key={ch.id}
            className={`glass-card rounded-xl p-3.5 flex flex-col justify-between border transition-all ${
              ch.connected ? 'hover:border-slate-700' : 'opacity-75'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-300 tracking-tight">{ch.title}</span>
              </div>
              {!ch.connected && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {ch.note || 'SOON'}
                </span>
              )}
            </div>

            <div>
              <div className={`text-xs font-extrabold font-mono px-2 py-1 rounded w-fit border ${ch.color}`}>
                {ch.status}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-1.5">{ch.val}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
