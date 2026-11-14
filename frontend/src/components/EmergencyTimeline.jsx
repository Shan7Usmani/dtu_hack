import React from 'react';
import { Clock, CheckCircle2, Circle, AlertOctagon } from 'lucide-react';

export default function EmergencyTimeline({ timeline = [], incidentStatus = 'VERIFYING' }) {
  const defaultSteps = [
    { title: 'Accident Detected', done: true },
    { title: 'Location Acquired', done: true },
    { title: 'Emergency Services Notified', done: incidentStatus === 'CONFIRMED' || incidentStatus === 'EN_ROUTE' },
    { title: 'Responder Acknowledged', done: incidentStatus === 'EN_ROUTE' },
    { title: 'Responder En Route', done: incidentStatus === 'EN_ROUTE' },
    { title: 'On Scene', done: incidentStatus === 'ON_SCENE' },
    { title: 'Incident Resolved', done: incidentStatus === 'RESOLVED' },
  ];

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">RESPONSE DISPATCH TIMELINE</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Step Progress</span>
      </div>

      {/* Vertical Timeline Steps */}
      <div className="space-y-3 font-mono text-xs">
        {timeline && timeline.length > 0 ? (
          timeline.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 relative">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px] shrink-0 mt-0.5">
                ✓
              </div>
              <div className="flex-1 border-b border-slate-800/60 pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{item.title}</span>
                  <span className="text-[10px] text-slate-500">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))
        ) : (
          defaultSteps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {step.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span className={step.done ? 'text-white font-bold' : 'text-slate-500'}>{step.title}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
