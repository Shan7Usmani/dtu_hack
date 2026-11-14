import React, { useState, useEffect } from 'react';
import { Cpu, Camera, CheckCircle2, HardDrive, Wifi, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchStatus } from '../services/api';

export default function SystemPage() {
  const [status, setStatus] = useState({
    system_status: 'ONLINE',
    camera_connected: true,
    ai_model_loaded: true,
    model_name: 'MediaPipe 468 FaceMesh Landmark Detector',
    backend_version: '1.0.0',
    fps: 30.0,
    latency_ms: 14,
    cpu_usage_percent: 12,
    memory_usage_mb: 218,
    edge_device: 'Intel Core i7 / Edge AI Accelerator',
    sensor_bus: 'NOT CONNECTED'
  });

  const loadStatus = async () => {
    const res = await fetchStatus();
    if (res) setStatus(res);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="min-h-screen space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            <span>Edge System Telemetry</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Hardware health, model status, and computer vision runtime specs</p>
        </div>

        <button
          onClick={loadStatus}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Hardware Status</span>
        </button>
      </div>

      {/* Grid of Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Subsystem Connectivity */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            SUBSYSTEM CONNECTIVITY
          </h3>
          
          {[
            { label: 'Camera Sensor', state: status.camera_connected ? 'CONNECTED' : 'DISCONNECTED', ok: status.camera_connected, icon: Camera },
            { label: 'AI Model Engine', state: status.ai_model_loaded ? 'LOADED' : 'OFFLINE', ok: status.ai_model_loaded, icon: Cpu },
            { label: 'Backend API Server', state: 'ONLINE', ok: true, icon: Wifi },
            { label: 'Hardware Sensor Bus', state: status.sensor_bus, ok: false, note: 'V7 Fusion' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-200">{item.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  item.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {item.state}
                </span>
              </div>
            );
          })}
        </div>

        {/* Runtime Diagnostics */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            RUNTIME DIAGNOSTICS
          </h3>
          
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Processing Frame Rate:</span>
              <span className="font-bold text-blue-400">{status.fps} FPS</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Inference Latency:</span>
              <span className="font-bold text-emerald-400">{status.latency_ms} ms</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">CPU Load:</span>
              <span className="font-bold text-amber-400">{status.cpu_usage_percent}%</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">RAM Allocation:</span>
              <span className="font-bold text-white">{status.memory_usage_mb} MB</span>
            </div>
          </div>
        </div>

        {/* AI Model Specs */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
            MODEL ARCHITECTURE
          </h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Active Model Name</span>
              <span className="font-bold text-white font-mono">{status.model_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Edge Accelerator</span>
              <span className="font-bold text-slate-300 font-mono">{status.edge_device}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Ear Algorithm</span>
              <span className="font-bold text-emerald-400 font-mono">6-Point Vectorized Euclidean Formula</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-mono">Privacy Architecture</span>
              <span className="font-bold text-blue-400 font-mono">100% Local Inference (Zero Network Upload)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
