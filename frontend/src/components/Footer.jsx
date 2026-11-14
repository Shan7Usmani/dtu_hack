import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Cpu, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F19] border-t border-slate-800 text-slate-400 text-xs py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight font-mono">NETRAKSHAK</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Detect the Risk. Prevent the Crash.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md w-fit font-medium">
              <Lock className="w-3 h-3" />
              <span>100% On-Device Privacy</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition-colors">Overview</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Live Command Center</Link></li>
              <li><Link to="/analytics" className="hover:text-white transition-colors">Safety Analytics</Link></li>
              <li><Link to="/alerts" className="hover:text-white transition-colors">Alert History</Link></li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Technology</h4>
            <ul className="space-y-2">
              <li><Link to="/technology" className="hover:text-white transition-colors">MediaPipe 468 Mesh</Link></li>
              <li><Link to="/technology" className="hover:text-white transition-colors">6-Point EAR Algorithm</Link></li>
              <li><Link to="/system" className="hover:text-white transition-colors">Edge AI Hardware</Link></li>
              <li><Link to="/system" className="hover:text-white transition-colors">System Telemetry</Link></li>
            </ul>
          </div>

          {/* Principles */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Mission</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Netrakshak bridges the gap between expensive factory ADAS and millions of existing commercial vehicles through affordable edge AI.
            </p>
            <p className="text-[11px] text-slate-500">
              Built for safer roads with AI.
            </p>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} Netrakshak AI Safety System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors">Automotive ADAS MVP V1</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
