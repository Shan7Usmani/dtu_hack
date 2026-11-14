import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AlertsPage from './pages/AlertsPage';
import SystemPage from './pages/SystemPage';
import DriverPage from './pages/DriverPage';
import Technology from './pages/Technology';

import EmergencyPage from './pages/EmergencyPage';
import ContactsPage from './pages/ContactsPage';

export default function App() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
        
        {/* Navbar */}
        <Navbar isDemoMode={isDemoMode} setIsDemoMode={setIsDemoMode} />

        {/* Demo Mode Notification Strip */}
        {isDemoMode && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>DEMO MODE -- SIMULATED EMERGENCY DATA ACTIVE</span>
          </div>
        )}

        {/* Page Content Routes */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard isDemoMode={isDemoMode} />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/emergency/contacts" element={<ContactsPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/system" element={<SystemPage />} />
            <Route path="/driver" element={<DriverPage />} />
            <Route path="/technology" element={<Technology />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />

      </div>
    </Router>
  );
}
