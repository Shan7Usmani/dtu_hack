import React from 'react';
import { MapPin, Navigation, Ambulance, ShieldAlert, Flame, Cross } from 'lucide-react';

export default function EmergencyMap({ incident }) {
  const address = incident?.location?.address || "Rajiv Chowk, Connaught Place, New Delhi";
  const lat = incident?.location?.latitude || 28.6139;
  const lng = incident?.location?.longitude || 77.2090;

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-800 flex flex-col h-full relative overflow-hidden">
      
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">LIVE INCIDENT & RESPONDER MAP</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          GPS LOCK: {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>

      {/* Map Visual Box */}
      <div className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-6 text-center group">
        
        {/* Simulated SVG Radar Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Central Vehicle & Accident Marker HUD */}
        <div className="relative z-10 space-y-3">
          
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-ping absolute inset-0"></div>
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-red-500 shadow-2xl flex items-center justify-center relative">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-white font-mono block">ACCIDENT SITE: {address}</span>
            <span className="text-[10px] font-mono text-slate-400">GPS Accuracy: ±4.5 meters</span>
          </div>

          {/* Responder Markers Grid */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-md text-[11px] font-mono text-blue-400">
              <Ambulance className="w-3.5 h-3.5" />
              <span>Ambulance (3.2km - ETA 6m)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Police Patrol (2.4km - ETA 8m)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md text-[11px] font-mono text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span>Fire Rescue (4.1km - Standby)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
