import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Clock, ShieldCheck, AlertOctagon, Zap, TrendingUp } from 'lucide-react';
import { fetchAnalytics } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState({
    total_drive_time: '04:12:00',
    safe_driving_percent: 96.4,
    drowsiness_events: 2,
    distraction_events: 1,
    overspeed_events: 0,
    critical_events: 1,
    average_risk_score: 18,
    hourly_risk_trend: [
      { time: '08:00', score: 12, events: 0 },
      { time: '09:00', score: 15, events: 0 },
      { time: '10:00', score: 14, events: 0 },
      { time: '11:00', score: 28, events: 1 },
      { time: '12:00', score: 45, events: 1 },
      { time: '13:00', score: 18, events: 0 },
      { time: '14:00', score: 15, events: 0 },
    ]
  });

  useEffect(() => {
    async function load() {
      const res = await fetchAnalytics();
      if (res) setData(res);
    }
    load();
  }, []);

  const eventDistribution = [
    { type: 'Drowsiness', count: data.drowsiness_events || 2, color: '#EF4444' },
    { type: 'Distraction', count: data.distraction_events || 1, color: '#F59E0B' },
    { type: 'Overspeed', count: data.overspeed_events || 0, color: '#3B82F6' },
    { type: 'Critical', count: data.critical_events || 1, color: '#F97316' },
  ];

  return (
    <div className="min-h-screen space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>Driver Safety Analytics</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Driving behavior performance & risk event history</p>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { title: 'Drive Time', val: data.total_drive_time, icon: Clock, color: 'text-blue-400' },
          { title: 'Safe Driving', val: `${data.safe_driving_percent}%`, icon: ShieldCheck, color: 'text-emerald-400' },
          { title: 'Drowsy Events', val: data.drowsiness_events, icon: AlertOctagon, color: 'text-red-400' },
          { title: 'Distractions', val: data.distraction_events, icon: Zap, color: 'text-amber-400' },
          { title: 'Overspeeding', val: data.overspeed_events, icon: Activity, color: 'text-blue-400' },
          { title: 'Avg Risk Score', val: `${data.average_risk_score}/100`, icon: TrendingUp, color: 'text-emerald-400' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
              </div>
              <span className="text-xl font-extrabold font-mono text-white">{kpi.val}</span>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hourly Risk Score Trend Line Chart */}
        <div className="lg:col-span-8 glass-card rounded-xl p-5 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 border-b border-slate-800 pb-2">
            HOURLY RISK SCORE TREND (0-100)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.hourly_risk_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Type Frequency Bar Chart */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 border-b border-slate-800 pb-2">
            EVENT DISTRIBUTION BY TYPE
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="type" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
