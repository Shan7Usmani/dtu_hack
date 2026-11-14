import React from 'react';
import { Cpu, Eye, Shield, Zap, Layers, Code, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Technology() {
  return (
    <div className="min-h-screen space-y-10 pb-16">
      
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>TECHNICAL SPECIFICATIONS & ROADMAP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Computer Vision & Edge AI Architecture
        </h1>
        <p className="text-slate-400 text-sm mt-2 leading-relaxed">
          How Netrakshak uses high-density facial landmark detection, mathematical Eye Aspect Ratio modeling, and multi-sensor accident fusion.
        </p>
      </div>

      {/* Edge Intelligence Architecture Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">EDGE INTELLIGENCE. FASTER DECISIONS.</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Netrakshak performs critical detection locally on the vehicle's edge device. This reduces dependence on cloud connectivity and allows immediate local decisions when every second matters.
        </p>

        {/* Edge Pipeline Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono text-xs text-center pt-2">
          {[
            { label: 'Vehicle Sensors' },
            { label: 'Edge Device' },
            { label: 'AI Analysis' },
            { label: 'Accident Detection' },
            { label: 'Emergency Workflow' },
            { label: 'Response Network' },
          ].map((node, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-blue-400">
              {node.label}
            </div>
          ))}
        </div>
      </div>

      {/* 3 Core Tech Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pillar 1 */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">MediaPipe 468 Mesh</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Continuously tracks 468 3D facial landmarks in real time. Isolates 6 sub-landmarks per eye for pupil and contour aperture computation.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">6-Point Vectorized EAR</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Calculates Euclidean distances between top/bottom eye contour points normalized by horizontal width to determine precise eye closure ratio.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-white text-base">Monotonic Time Machine</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Distinguishes normal blinks (&lt;0.5s) from fatigue caution (0.5s–2.0s) and true drowsiness alerts (&ge;2.0s) using high-precision hardware timestamps.
          </p>
        </div>

      </div>

      {/* Mathematical Formula Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
          EYE ASPECT RATIO (EAR) MATHEMATICAL MODEL
        </h3>
        
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-sm text-blue-400">
          EAR = ( ||P2 - P6|| + ||P3 - P5|| ) / ( 2.0 * ||P1 - P4|| )
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
          <p>
            <strong className="text-white">P1, P4:</strong> Horizontal eye corner endpoints defining horizontal width.
          </p>
          <p>
            <strong className="text-white">P2, P3, P5, P6:</strong> Vertical top and bottom eyelid landmarks.
          </p>
        </div>
      </div>

    </div>
  );
}
