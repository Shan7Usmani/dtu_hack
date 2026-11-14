import React, { useState, useEffect } from 'react';
import { Bell, Filter, Search, CheckCircle, AlertOctagon, AlertTriangle, Info, Check } from 'lucide-react';
import { fetchAlerts, acknowledgeAlert } from '../services/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAlerts = async () => {
    const data = await fetchAlerts();
    if (data) setAlerts(data);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAck = async (id) => {
    await acknowledgeAlert(id);
    loadAlerts();
  };

  const filteredAlerts = alerts.filter((alt) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'CRITICAL' && alt.severity === 'CRITICAL') ||
      (filterType === 'WARNING' && alt.severity === 'WARNING') ||
      (filterType === 'DROWSINESS' && alt.type.includes('Drowsiness'));

    const matchesSearch =
      alt.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alt.timestamp.includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            <span>Safety Alerts & History</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Complete record of driver safety events and severity logs</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'CRITICAL', 'WARNING', 'DROWSINESS'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                filterType === type
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* Alerts Table */}
      <div className="glass-card rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Event Type</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Driver ID</th>
                <th className="p-3.5">Vehicle ID</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    No alert logs match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alt) => {
                  let badge = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                  if (alt.severity === 'CRITICAL') badge = 'bg-red-500/15 text-red-400 border-red-500/30 font-bold';
                  if (alt.severity === 'WARNING') badge = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

                  return (
                    <tr key={alt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 text-slate-400 font-bold">{alt.timestamp}</td>
                      <td className="p-3.5 text-white font-bold">{alt.type}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded border text-[10px] ${badge}`}>
                          {alt.severity}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-md font-sans text-slate-300">{alt.message}</td>
                      <td className="p-3.5 text-slate-400">{alt.driver_id || 'DRV-8842'}</td>
                      <td className="p-3.5 text-slate-400">{alt.vehicle_id || 'VH-9021'}</td>
                      <td className="p-3.5 text-right">
                        {!alt.acknowledged ? (
                          <button
                            onClick={() => handleAck(alt.id)}
                            className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Check className="w-3 h-3 text-blue-400" />
                            <span>Ack</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-bold">Acknowledged</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
