import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, ShieldAlert, Radio, ToggleLeft, ToggleRight } from 'lucide-react';
import { toggleDemoMode, fetchActiveIncident } from '../services/api';

export default function Navbar({ isDemoMode, setIsDemoMode }) {
  const location = useLocation();
  const [activeInc, setActiveInc] = useState(null);

  useEffect(() => {
    async function checkInc() {
      const res = await fetchActiveIncident();
      if (res && res.active_incident) {
        setActiveInc(res.active_incident);
      } else {
        setActiveInc(null);
      }
    }
    checkInc();
    const interval = setInterval(checkInc, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDemoToggle = async () => {
    const nextState = !isDemoMode;
    setIsDemoMode(nextState);
    await toggleDemoMode(nextState);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Live Monitor', path: '/dashboard', badge: 'LIVE' },
    { label: 'Emergency', path: '/emergency', emergencyBadge: activeInc ? '🔴' : '🟢' },
    { label: 'Contacts', path: '/emergency/contacts' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'System', path: '/system' },
    { label: 'Technology', path: '/technology' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">NETRAKSHAK</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AI V1.0</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Driver Safety & Rescue System</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-slate-800/80 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
                {item.emergencyBadge && (
                  <span className="text-xs">{item.emergencyBadge}</span>
                )}
                {item.badge && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Demo Switch */}
        <div className="flex items-center gap-3">
          
          {/* Demo Mode Switch */}
          <button
            onClick={handleDemoToggle}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
              isDemoMode
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle presentation demo data mode"
          >
            {isDemoMode ? (
              <>
                <ToggleRight className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">DEMO MODE</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">LIVE CAMERA</span>
              </>
            )}
          </button>

          {/* Launch Dashboard CTA */}
          <Link
            to="/emergency"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span>Emergency Center</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
