import React, { useState, useEffect } from 'react';
import { User, Truck, ShieldCheck, Award, MapPin, Calendar, Activity } from 'lucide-react';
import { fetchDriver } from '../services/api';

export default function DriverPage() {
  const [driver, setDriver] = useState({
    driver_id: 'DRV-8842',
    name: 'Capt. Rajesh Sharma',
    vehicle_id: 'VH-9021',
    vehicle_model: 'Freightliner Cascadia ADAS-Ready',
    registration: 'KA-01-MJ-4920',
    safety_score: 94,
    total_trips: 142,
    total_distance_km: 18450,
    status: 'ACTIVE_SHIFT'
  });

  useEffect(() => {
    async function load() {
      const res = await fetchDriver();
      if (res) setDriver(res);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            <span>Driver Profile & Vehicle Information</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Driver safety credentials, vehicle assignment, and shift record</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Driver Profile Card (5 Cols) */}
        <div className="lg:col-span-5 glass-card rounded-xl p-6 border border-slate-800 space-y-6 text-center">
          
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 mx-auto shadow-xl">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">{driver.name}</h2>
            <span className="text-xs font-mono text-slate-400">{driver.driver_id}</span>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{driver.status}</span>
            </div>
          </div>

          {/* Safety Score Rating */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Overall Safety Rating</span>
              <span className="text-xs text-slate-300">Top 5% Fleet Safety</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-400">{driver.safety_score}</span>
              <span className="text-xs text-slate-500"> / 100</span>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Safety Badges</span>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> 100+ Safe Shifts
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero Violations
              </span>
            </div>
          </div>

        </div>

        {/* Assigned Vehicle & Trip Specs (7 Cols) */}
        <div className="lg:col-span-7 glass-card rounded-xl p-6 border border-slate-800 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>ASSIGNED VEHICLE SPECIFICATIONS</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Vehicle ID</span>
              <span className="font-bold text-white text-sm">{driver.vehicle_id}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Registration Number</span>
              <span className="font-bold text-blue-400 text-sm">{driver.registration}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2">
              <span className="text-slate-500 block text-[10px] uppercase">Vehicle Model</span>
              <span className="font-bold text-slate-200 text-sm">{driver.vehicle_model}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Total Completed Trips</span>
              <span className="font-bold text-white text-sm">{driver.total_trips} Trips</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Total Distance Logged</span>
              <span className="font-bold text-emerald-400 text-sm">{driver.total_distance_km.toLocaleString()} km</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
