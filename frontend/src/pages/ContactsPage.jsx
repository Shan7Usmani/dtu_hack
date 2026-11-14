import React, { useState, useEffect } from 'react';
import { User, Phone, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { fetchEmergencyContacts, createEmergencyContact } from '../services/api';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState(1);

  const loadContacts = async () => {
    const data = await fetchEmergencyContacts();
    if (data) setContacts(data);
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    await createEmergencyContact({ name, relationship, phone, priority });
    setName('');
    setRelationship('');
    setPhone('');
    loadContacts();
  };

  return (
    <div className="min-h-screen space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-blue-400" />
            <span>Emergency Contacts Directory</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">Configured primary contacts and fleet dispatch dispatchers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Contact List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              CONFIGURED EMERGENCY RECIPIENTS
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {contacts.map((cnt) => (
                <div key={cnt.id} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                      P{cnt.priority}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">{cnt.name}</span>
                      <span className="text-[11px] text-slate-400">{cnt.relationship}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-blue-400 text-sm block">{cnt.phone}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add New Contact Form (4 Cols) */}
        <div className="lg:col-span-4">
          <form onSubmit={handleAddContact} className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              ADD EMERGENCY CONTACT
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Relationship / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Family Physician"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dispatch Priority (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Emergency Contact</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
