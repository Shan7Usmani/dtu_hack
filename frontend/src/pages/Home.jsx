import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Shield, Radio, Cpu, Zap, Activity, CheckCircle2, AlertTriangle, ArrowRight, Video, Layers, Lock, ShieldAlert } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>AI Driver Safety & Accident Rescue System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Your Vehicle Can See the Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Before You Do.</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Netrakshak uses AI-powered computer vision and sensor fusion to detect driver fatigue, distraction, collision impacts, and emergency accident events in real time.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/dashboard"
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 group"
                >
                  <Radio className="w-4 h-4 text-blue-200 group-hover:animate-ping" />
                  <span>Launch Live Monitor</span>
                  <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/emergency"
                  className="px-6 py-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-sm transition-all flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Emergency Response</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-2xl p-4 border border-slate-700/80 shadow-2xl relative group">
                <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img
                    src="/video_feed"
                    alt="Netrakshak AI Live Stream Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden flex-col items-center justify-center gap-3 p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-mono text-slate-300 font-bold">NETRAKSHAK AI SAFETY CAMERA</span>
                    <span className="text-[11px] text-slate-500">Connect camera to launch live tracking</span>
                  </div>

                  {/* HUD Overlay Preview */}
                  <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 text-[11px] font-mono flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>AI MONITORING: ACTIVE</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                  <span>MODEL: MediaPipe 468 Mesh</span>
                  <span>EAR: 0.31 (SAFE)</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRUST / VALUE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Real-Time', desc: 'Continuous driver monitoring at 30 FPS', icon: Zap },
            { title: 'Edge AI', desc: 'Low-latency local computer vision & accident detection', icon: Cpu },
            { title: 'Retrofit', desc: 'Designed for any existing vehicle fleet', icon: Layers },
            { title: 'Preventive', desc: 'Warn before risk becomes an accident', icon: Shield },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card rounded-xl p-4 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW SECTION: WHEN EVERY SECOND MATTERS -- ACCIDENT RESCUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card rounded-3xl p-8 border-2 border-red-500/40 glow-red relative overflow-hidden bg-gradient-to-r from-red-950/30 via-slate-900 to-blue-950/30">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>WHEN EVERY SECOND MATTERS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              An accident shouldn't have to wait for someone to make a call.
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              When Netrakshak detects a serious collision, its Edge AI triggers an emergency-response workflow using the vehicle's location and incident data, enabling configured emergency contacts and response channels to be notified instantly.
            </p>

            {/* 5-Step Visual Emergency Rescue Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4 font-mono text-xs text-center">
              {[
                { step: '01', text: 'Impact' },
                { step: '02', text: 'Edge AI Detection' },
                { step: '03', text: 'GPS Lock' },
                { step: '04', text: 'Alert Created' },
                { step: '05', text: 'Dispatch' },
                { step: '06', text: 'Rescue' },
              ].map((s, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-red-400 font-bold block text-[10px]">{s.step}</span>
                  <span className="text-white text-[11px] font-bold">{s.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/emergency"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-xl shadow-red-600/30 transition-all"
              >
                <span>Explore Emergency Response →</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEM & ADAS COMPARISON SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            The biggest safety risk is often behind the wheel.
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Human factors such as drowsiness, fatigue, distraction, and impairment contribute to over 90% of road accidents. Existing safety systems are expensive and vehicle-specific.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Traditional ADAS */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 opacity-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-slate-300">TRADITIONAL FACTORY ADAS</h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">EXPENSIVE</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-400 font-medium">
              <li className="flex items-center gap-2 text-slate-400">
                <span className="text-red-400">✕</span> Factory-installed only on luxury models
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="text-red-400">✕</span> High cost ($3,000 - $8,000 per vehicle)
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="text-red-400">✕</span> Proprietary closed vehicle ecosystems
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="text-red-400">✕</span> Cannot be installed on existing fleets
              </li>
            </ul>
          </div>

          {/* Netrakshak Solution */}
          <div className="glass-card rounded-2xl p-6 border border-blue-500/40 glow-green relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <span>NETRAKSHAK RETROFIT</span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">PREFERABLE</span>
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AFFORDABLE</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Universal retrofit for any existing commercial or personal vehicle
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Low cost Edge AI hardware (Raspberry Pi / Webcam compatible)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time 468 landmark computer vision tracking & accident rescue
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% On-device processing for maximum privacy
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* FINAL LIVE MONITOR CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-blue-500/40 text-center relative overflow-hidden bg-gradient-to-r from-blue-900/20 via-slate-900 to-emerald-900/20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            See Netrakshak in Action
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
            Connect to the live monitoring system and see AI analyze driver behavior and emergency workflows in real time.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-2xl shadow-blue-600/40 transition-all"
          >
            <span>Open Live Monitor →</span>
          </Link>
        </div>
      </section>

    </div>
  );
}
