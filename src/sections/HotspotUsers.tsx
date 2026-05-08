import React from 'react';
import { 
  Wifi, 
  Users, 
  ShieldAlert, 
  Settings, 
  Clock, 
  ChevronRight,
  Database,
  Search,
  Plus,
  Key,
  Smartphone,
  Lock,
  UserCheck,
  MoreHorizontal,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function HotspotUsers() {
  const [instances, setInstances] = React.useState([
    { id: 'hs-1', ssid: 'Nexus_Guest_5G', interface: 'wlan0', auth: 'voucher', mode: 'virtual', status: 'active' },
    { id: 'hs-2', ssid: 'Titan_Staff_Bridge', interface: 'br0', auth: 'radius', mode: 'bridge', status: 'standby' }
  ]);
  
  const [sessions, setSessions] = React.useState([
    { id: 1, user: 'Guest_7821', device: 'Terminal: iOS', method: 'Voucher', quota: '4.2 GB', color: 'blue' },
    { id: 2, user: 'John Doe', device: 'Terminal: Win10', method: 'OTP Match', quota: 'UNLIMITED', color: 'emerald' },
    { id: 3, user: 'Visitor_A1', device: 'Terminal: Android', method: 'OAUTH_S', quota: '1.5 GB', color: 'orange' },
    { id: 4, user: 'Staff_Kitchen', device: 'Terminal: POS', method: 'HWID_AUTH', quota: 'UNLIMITED', color: 'purple' },
  ]);

  const [isExporting, setIsExporting] = React.useState(false);
  const [showCreator, setShowCreator] = React.useState(false);

  const handleCreateInstance = () => {
    const ssid = prompt('SSID:');
    if (!ssid) return;
    const iface = prompt('Interface (wlan0, br0, tun0, eth1):', 'wlan0');
    const auth = prompt('Auth Method (voucher, open, oauth):', 'voucher');
    
    const newInst = {
      id: `hs-${Math.random().toString(36).substr(2, 4)}`,
      ssid: ssid.toUpperCase(),
      interface: iface || 'wlan0',
      auth: (auth || 'voucher') as any,
      mode: iface?.startsWith('br') ? 'bridge' : 'virtual',
      status: 'standby'
    };
    setInstances([...instances, newInst] as any);
  };

  const toggleInstance = (id: string) => {
    setInstances(prev => prev.map(inst => {
      if (inst.id === id) {
        return { ...inst, status: inst.status === 'active' ? 'standby' : 'active' };
      }
      return inst;
    }));
  };

  const handleEject = (id: number) => {
    if (confirm('Forcibly terminate this identity session?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Voucher registry exported to encrypted CSV.');
    }, 2500);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hotspot Management Orchestrator */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-500 border border-emerald-600/20">
                <Wifi className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Hotspot Orchestrator</h1>
            </div>
            <p className="text-slate-500 text-sm">Deploy high-availability hotspot instances across physical and logical interfaces.</p>
          </div>
          <button 
            onClick={handleCreateInstance}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Instance</span>
          </button>
        </div>

        {/* Hotspot Instances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {instances.map((inst) => (
            <div key={inst.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group hover:border-emerald-500/30 transition-all overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${inst.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                    <Wifi className="w-4 h-4" />
                 </div>
                 <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${inst.status === 'active' ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}>
                    {inst.status}
                 </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-tighter truncate group-hover:text-emerald-400 transition-colors">{inst.ssid}</h3>
              <div className="space-y-3 font-mono mb-8">
                 <div className="flex justify-between items-center text-[9px] border-b border-slate-800 pb-2">
                    <span className="text-slate-500 uppercase font-bold tracking-widest">Interface</span>
                    <span className="text-slate-300 font-bold">{inst.interface}</span>
                 </div>
                 <div className="flex justify-between items-center text-[9px] border-b border-slate-800 pb-2">
                    <span className="text-slate-500 uppercase font-bold tracking-widest">Auth_L7</span>
                    <span className="text-blue-400 font-bold uppercase">{inst.auth}</span>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => alert(`Configuring L7 logic for ${inst.ssid}`)}
                  className="flex-1 py-1.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:border-slate-700 transition-all"
                 >
                   Design
                 </button>
                 <button 
                  onClick={() => toggleInstance(inst.id)}
                  className={cn(
                    "flex-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all",
                    inst.status === 'active' 
                      ? "bg-rose-600/10 border border-rose-500/20 text-rose-500 hover:bg-rose-600/20" 
                      : "bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20"
                  )}
                 >
                   {inst.status === 'active' ? 'Shutdown' : 'Startup'}
                 </button>
              </div>
            </div>
          ))}
          <button 
            onClick={handleCreateInstance}
            className="border border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-slate-700 hover:bg-slate-900/50 hover:border-emerald-500/20 transition-all group"
          >
             <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-emerald-500/30 group-hover:text-emerald-500">
                <Plus className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Deploy Instance</span>
          </button>
        </div>

        {/* Existing Session List and Token Ledger */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-10 border-t border-slate-800/50">
          <div className="xl:col-span-2 space-y-6 text-white text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-4 mb-2">
               <Users className="w-4 h-4 text-blue-500" />
               <h2>Active Identities</h2>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-5 flex items-center bg-slate-950/20 border-b border-slate-800 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="QUERY: PHONE, EMAIL OR HASH..." className="w-full bg-slate-950 border border-slate-800 rounded px-10 py-2.5 text-[10px] font-bold tracking-widest uppercase focus:border-blue-500/50 outline-none transition-all text-white placeholder:text-slate-700 font-mono" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-950/50">
                      <th className="p-5 font-bold">Authenticated Subject</th>
                      <th className="p-5 font-bold">Exchange</th>
                      <th className="p-5 font-bold">Quota Balance</th>
                      <th className="p-5 font-bold text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {sessions.map((session) => (
                      <tr key={session.id} className="group hover:bg-slate-800/30 transition-colors uppercase tracking-widest">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-blue-500/50 text-slate-500 group-hover:text-blue-400 transition-all">
                              <Smartphone className="w-5 h-5 transition-transform group-hover:scale-110" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-200 tracking-tighter">{session.user}</p>
                               <p className="text-[9px] text-slate-500 mt-0.5">{session.device}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                           <span className={cn("px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-500", 
                            session.color === 'emerald' ? 'group-hover:text-emerald-400 group-hover:border-emerald-500/30' : 
                            session.color === 'blue' ? 'group-hover:text-blue-400 group-hover:border-blue-500/30' : 
                            'group-hover:text-orange-400 group-hover:border-orange-500/30'
                           )}>
                             {session.method}
                           </span>
                        </td>
                        <td className="p-5 font-bold text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className={session.quota === 'UNLIMITED' ? 'text-emerald-500 font-bold italic' : 'text-blue-400'}>{session.quota}</span>
                            {session.quota !== 'UNLIMITED' && <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-1/2" />
                            </div>}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                           <button 
                             onClick={() => handleEject(session.id)}
                             className="text-rose-500 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2"
                           >
                              Eject Node
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Database className="w-24 h-24" />
              </div>
              <h3 className="text-sm font-bold mb-8 flex items-center gap-3 text-white uppercase tracking-widest">
                <div className="w-8 h-8 rounded bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-600/20">
                  <Database className="w-4 h-4" />
                </div>
                Token Ledger
              </h3>
              <div className="grid grid-cols-2 gap-6 mb-8 font-mono">
                 <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-500 uppercase font-black block mb-2 tracking-[0.2em]">IN_STOCK</span>
                    <span className="text-2xl font-bold text-white tracking-widest">142</span>
                 </div>
                 <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[9px] text-slate-500 uppercase font-black block mb-2 tracking-[0.2em]">EXPIRED</span>
                    <span className="text-2xl font-bold text-slate-400 tracking-widest">891</span>
                 </div>
              </div>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-blue-400 text-[10px] font-bold uppercase tracking-[0.3em] rounded border border-blue-500/20 hover:border-blue-500/50 transition-all flex items-center justify-center gap-2"
              >
                {isExporting && <Activity className="w-3 h-3 animate-spin" />}
                {isExporting ? 'EXPORTING...' : 'INIT BATCH EXPORT'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-rose-500/10 to-slate-950 border border-rose-500/20 rounded-xl p-8 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/20">
                  <ShieldAlert className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-widest text-rose-400">Intrusion Guard</h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-8 font-bold leading-relaxed uppercase tracking-tighter">L7 rejection enabled for MAC collision or header injection.</p>
              <div className="space-y-4 font-mono">
                 <div className="flex items-center justify-between text-[10px] border-b border-rose-500/10 pb-2">
                    <span className="text-slate-600 uppercase font-bold text-[9px]">Brute Protection</span>
                    <span className="text-emerald-500 font-bold uppercase italic font-black">LOCKED</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600 uppercase font-bold text-[9px]">Atomic Limit</span>
                    <span className="text-white font-bold tracking-widest">2 SESSIONS / UID</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User RBAC Management */}
      <section className="pt-10 border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
           <div className="flex items-center gap-5">
              <div className="p-3 rounded-xl bg-slate-900 text-blue-500 border border-slate-800 shadow-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Access Matrix</h2>
                <p className="text-slate-500 text-sm mt-1">Hierarchical RBAC for system architects and operators.</p>
              </div>
           </div>
           <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Define Architect</span>
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { user: 'aldrincabanez9@gmail.com', role: 'root', last: '2 mins ago', status: 'Active' },
            { user: 'operator-01@nexus.io', role: 'operator', last: '1 day ago', status: 'Offline' },
            { user: 'audit-read@titan.sys', role: 'readonly', last: 'Never', status: 'Pending' }
          ].map((u, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-8 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:border-blue-500/50 transition-all">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest italic ${
                    u.role === 'root' ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 
                    u.role === 'operator' ? 'bg-slate-950 border border-blue-500/30 text-blue-400' : 
                    'bg-slate-950 border border-slate-800 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 truncate font-mono uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{u.user}</h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-10 font-bold uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-slate-700" />
                  <span>Telemetry: {u.last}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-400' : 'text-slate-600'}`}>{u.status}</span>
                 </div>
                 <button className="p-2 hover:bg-slate-950 rounded text-slate-600 hover:text-white transition-all">
                    <Database className="w-4 h-4" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
