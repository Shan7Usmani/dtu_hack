import React from 'react';
import { Bell, AlertOctagon, AlertTriangle, Info, Check } from 'lucide-react';
import { acknowledgeAlert } from '../services/api';

export default function AlertCenter({ alerts = [], onRefresh }) {

  const handleAck = async (id) => {
    await acknowledgeAlert(id);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="glass-card rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">LIVE SAFETY ALERT FEED</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">{alerts.length} Records</span>
      </div>

      {/* Scrollable Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-64 pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No risk alerts logged in current session.
          </div>
        ) : (
          alerts.map((alt) => {
            let Icon = Info;
            let badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

            if (alt.severity === 'CRITICAL') {
              Icon = AlertOctagon;
              badgeStyle = 'bg-red-500/15 text-red-400 border-red-500/30 font-bold animate-pulse';
            } else if (alt.severity === 'WARNING') {
              Icon = AlertTriangle;
              badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
            }

            return (
              <div
                key={alt.id}
                className={`p-2.5 rounded-lg border bg-slate-900/60 flex items-center justify-between gap-3 transition-colors ${
                  alt.acknowledged ? 'border-slate-800 opacity-60' : 'border-slate-700/80'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-md border ${badgeStyle} mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{alt.type}</span>
                      <span className="text-[10px] font-mono text-slate-400">{alt.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{alt.message}</p>
                  </div>
                </div>

                {!alt.acknowledged ? (
                  <button
                    onClick={() => handleAck(alt.id)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1 transition-colors shrink-0"
                    title="Acknowledge alert"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Ack</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">Acked</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
