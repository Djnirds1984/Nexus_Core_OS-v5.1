import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Users, 
  Activity, 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Ticket, 
  LayoutGrid,
  Search,
  Monitor,
  Zap,
  ShieldAlert,
  Server,
  Key,
  FileCode,
  Save,
  Layout,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLocalization } from '../context/LocalizationContext';
import {
  subscribeToHotspotServers,
  addHotspotServer,
  deleteHotspotServer,
  subscribeToHotspotVouchers,
  generateBatchVouchers,
  deleteHotspotVoucher,
  subscribeToHotspotActive,
  terminateHotspotSession,
  simulateHotspotLogin,
  subscribeToHotspotPortals,
  updateHotspotPortal,
  addHotspotPortal
} from '../services/networkService';

const PREMADE_PORTAL = `<!DOCTYPE html>
<html>
<head>
    <title>Hotspot Login</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); width: 100%; max-width: 400px; text-align: center; border: 1px solid #334155; }
        h1 { color: #f59e0b; margin-top: 0; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.1em; }
        p { color: #94a3b8; font-size: 0.875rem; margin-bottom: 2rem; }
        input { width: 100%; padding: 0.875rem; margin: 1rem 0; border-radius: 0.75rem; border: 1px solid #334155; background: #0f172a; color: white; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
        input:focus { border-color: #f59e0b; }
        button { width: 100%; padding: 0.875rem; border-radius: 0.75rem; border: none; background: #f59e0b; color: white; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em; transition: transform 0.1s, background 0.2s; }
        button:hover { background: #d97706; }
        button:active { transform: scale(0.98); }
        .footer { margin-top: 2rem; font-size: 0.75rem; color: #475569; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Nexus Gateway</h1>
        <p>Premium High-Speed Connectivity</p>
        <form action="$(link-login-only)" method="post">
            <input type="hidden" name="dst" value="$(link-orig)" />
            <input type="hidden" name="popup" value="true" />
            <input name="username" type="text" placeholder="Enter Voucher Code" required />
            <button type="submit">Authenticate Session</button>
        </form>
        <div class="footer">Powered by NexusOS Linux v4.2</div>
    </div>
</body>
</html>`;

const HotspotManagement = () => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'servers' | 'vouchers' | 'active' | 'portal'>('servers');
  const [servers, setServers] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [portals, setPortals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingServer, setIsAddingServer] = useState(false);
  const [isGeneratingVouchers, setIsGeneratingVouchers] = useState(false);
  const [isSavingPortal, setIsSavingPortal] = useState(false);

  // Portal Editor state
  const [portalHtml, setPortalHtml] = useState(PREMADE_PORTAL);

  // Form states
  const [newServer, setNewServer] = useState({ name: '', interface: 'bridge-hotspot', address_pool: 'hs-pool-1', profile: 'default' });
  const [voucherGen, setVoucherGen] = useState({ count: 10, profile: '1h_50mb', dataLimit: 50 });

  useEffect(() => {
    const unsubServers = subscribeToHotspotServers(setServers);
    const unsubVouchers = subscribeToHotspotVouchers(setVouchers);
    const unsubActive = subscribeToHotspotActive(setActiveSessions);
    const unsubPortals = subscribeToHotspotPortals((data) => {
      setPortals(data);
      if (data.length > 0) {
        setPortalHtml(data[0].html);
      }
    });
    return () => {
      unsubServers();
      unsubVouchers();
      unsubActive();
      unsubPortals();
    };
  }, []);

  const handleSavePortal = async () => {
    setIsSavingPortal(true);
    try {
      if (portals.length > 0) {
        await updateHotspotPortal(portals[0].id, { html: portalHtml });
      } else {
        await addHotspotPortal({ name: 'Default Portal', html: portalHtml });
      }
      alert('Portal HTML synchronized successfully.');
    } finally {
      setIsSavingPortal(false);
    }
  };

  const handleResetPortal = () => {
    if (confirm('Reset portal to premade template? All custom edits will be lost.')) {
      setPortalHtml(PREMADE_PORTAL);
    }
  };

  const handleAddServer = async () => {
    await addHotspotServer(newServer);
    setIsAddingServer(false);
    setNewServer({ name: '', interface: 'bridge-hotspot', address_pool: 'hs-pool-1', profile: 'default' });
  };

  const handleGenerateVouchers = async () => {
    await generateBatchVouchers(voucherGen.count, voucherGen.profile, voucherGen.dataLimit);
    setIsGeneratingVouchers(false);
  };

  const handleSimulateLogin = () => {
    const randomVoucher = vouchers.find(v => v.status === 'available');
    if (randomVoucher) {
      simulateHotspotLogin(randomVoucher.code, `70:1A:04:A${Math.floor(Math.random()*9)}:B${Math.floor(Math.random()*9)}:CC`);
    } else {
      simulateHotspotLogin('Guest-' + Math.floor(Math.random()*100), '00:00:00:00:00:00');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-amber-500 font-mono flex items-center gap-3">
             <Wifi className="w-8 h-8" />
             Hotspot Gateway
          </h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium tracking-wide">Configure captive portals, manage pre-paid vouchers, and monitor live wireless users.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSimulateLogin}
             className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-700"
           >
             <RefreshCw className="w-3 h-3" />
             Simulate Host
           </button>
           
           {activeTab === 'servers' ? (
             <button 
               onClick={() => setIsAddingServer(true)}
               className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white shadow-lg shadow-amber-600/20"
             >
               <Plus className="w-4 h-4" />
               New Server
             </button>
           ) : activeTab === 'vouchers' ? (
             <button 
               onClick={() => setIsGeneratingVouchers(true)}
               className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
             >
               <Ticket className="w-4 h-4" />
               Generate Vouchers
             </button>
           ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
        {[
          { id: 'servers', label: 'Servers', icon: Server },
          { id: 'vouchers', label: 'Users/Vouchers', icon: Ticket },
          { id: 'active', label: 'Active Sessions', icon: Activity },
          { id: 'portal', label: 'Portal Editor', icon: FileCode }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-slate-800 text-amber-500 shadow-inner border border-white/5" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {activeTab === 'servers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servers.map(server => (
                <div key={server.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-amber-500/50 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Server className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm tracking-tight">{server.name}</h3>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">{server.interface}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteHotspotServer(server.id)}
                      className="p-2 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 uppercase font-black tracking-widest">Interface</span>
                      <span className="text-slate-300 font-mono">{server.interface}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 uppercase font-black tracking-widest">IP Pool</span>
                        <span className="text-slate-300 font-mono text-blue-400">{server.address_pool}</span>
                      </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 uppercase font-black tracking-widest">Profile</span>
                      <span className="text-amber-500 font-bold">{server.profile}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                     <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded leading-none">Running</span>
                     <Settings className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-pointer" />
                  </div>
                </div>
              ))}
              {servers.length === 0 && (
                <div className="col-span-full py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                  <Server className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">No Hotspot Servers Active</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vouchers' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search codes/profiles..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-300 focus:border-amber-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total: {vouchers.length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/50 border-b border-slate-800">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                      <th className="px-6 py-4">Voucher Code</th>
                      <th className="px-6 py-4">Profile</th>
                      <th className="px-6 py-4">Quota / Limit</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {vouchers.filter(v => v.code.includes(searchTerm) || v.profile.includes(searchTerm)).map(voucher => (
                      <tr key={voucher.id} className="text-xs hover:bg-slate-800/30 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className="p-1.5 bg-blue-500/10 rounded">
                               <Key className="w-3 h-3 text-blue-500" />
                             </div>
                             <span className="font-mono text-white font-bold">{voucher.code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-amber-500 font-bold uppercase tracking-tight">{voucher.profile}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] text-slate-300 font-mono">{voucher.data_limit} MB</span>
                             <span className="text-[8px] text-slate-500 uppercase font-black">{voucher.uptime_limit || 'Unlimited'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                             voucher.status === 'available' ? "bg-emerald-500/10 text-emerald-500" :
                             voucher.status === 'used' ? "bg-blue-500/10 text-blue-500" : "bg-rose-500/10 text-rose-500"
                           )}>
                             {voucher.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-[10px] font-mono whitespace-nowrap">
                          {voucher.createdAt ? new Date(voucher.createdAt).toLocaleDateString() : 'Manual'}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => deleteHotspotVoucher(voucher.id)}
                             className="p-1.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded transition-all opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'active' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map(session => (
                <div key={session.id} className="bg-slate-950 border border-slate-800 rounded-2xl h-[200px] flex flex-col relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-3">
                      <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                   </div>
                   
                   <div className="p-5 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                             <Monitor className="w-5 h-5 text-slate-300" />
                         </div>
                         <div>
                            <h4 className="text-white font-bold text-sm font-mono truncate max-w-[150px]">{session.user}</h4>
                            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{session.mac_address}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block">Address</span>
                            <span className="text-[11px] text-emerald-500 font-mono font-bold">{session.address}</span>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block">Uptime</span>
                            <span className="text-[11px] text-blue-400 font-mono font-bold">{session.uptime}</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                         <span className="flex items-center gap-1 group-hover:text-emerald-500 transition-colors">
                            <Activity className="w-3 h-3" />
                            {Math.floor(session.bytes_in / 1024)} KB
                         </span>
                      </div>
                      <button 
                        onClick={() => terminateHotspotSession(session.id)}
                        className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded text-[8px] font-black uppercase tracking-widest transition-all italic border border-rose-500/20"
                      >
                        Disconnect
                      </button>
                   </div>
                </div>
              ))}
              {activeSessions.length === 0 && (
                <div className="col-span-full py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">No Live Network Sessions</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'portal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
                     <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Code className="w-4 h-4 text-amber-500" />
                           <span className="text-xs font-black text-white uppercase tracking-widest font-mono">portal.html</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={handleResetPortal}
                             className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-slate-700"
                           >
                             <Layout className="w-3.5 h-3.5" />
                             Load Premade
                           </button>
                           <button 
                             onClick={handleSavePortal}
                             disabled={isSavingPortal}
                             className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-amber-600/20"
                           >
                             <Save className="w-3.5 h-3.5" />
                             {isSavingPortal ? 'Syncing...' : 'Sync Portal'}
                           </button>
                        </div>
                     </div>
                     <textarea 
                       value={portalHtml}
                       onChange={(e) => setPortalHtml(e.target.value)}
                       className="flex-1 w-full bg-slate-950 p-6 text-emerald-500 font-mono text-xs resize-none outline-none focus:ring-1 focus:ring-amber-500/50 transition-all custom-scrollbar"
                       spellCheck={false}
                     />
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                           <Monitor className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                           <h3 className="text-sm font-black text-white uppercase tracking-widest">Portal Preview</h3>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">Simulated Viewport</p>
                        </div>
                     </div>
                     
                     <div className="aspect-[3/4] bg-white rounded-xl overflow-hidden shadow-inner border-4 border-slate-800 relative group">
                        <iframe 
                          srcDoc={portalHtml}
                          className="w-full h-full pointer-events-none"
                          title="Portal Preview"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                           <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-black text-white uppercase tracking-widest italic shadow-2xl">Live Render Buffer</span>
                        </div>
                     </div>

                     <div className="mt-6 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Zap className="w-3 h-3 text-amber-500" />
                           Variable Injection
                        </h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                          Nexus Gateway automatically injects Mikrotik-compatible variables like <code className="text-slate-300">{`$(link-login-only)`}</code> and <code className="text-slate-300">{`$(link-orig)`}</code> at runtime.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Server Modal */}
      {isAddingServer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                 <Server className="w-5 h-5 text-amber-500" />
                 Create Gateway
              </h2>
              <button onClick={() => setIsAddingServer(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">&times;</button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Service Name</label>
                <input 
                  value={newServer.name}
                  onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="e.g. Lobby_Hotspot"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Interface</label>
                    <select 
                      value={newServer.interface}
                      onChange={(e) => setNewServer({...newServer, interface: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
                    >
                      <option value="bridge-hotspot">bridge-hotspot</option>
                      <option value="ether3-vlan10">ether3-vlan10</option>
                      <option value="wlan1">wlan1</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Address Pool</label>
                    <select 
                      value={newServer.address_pool}
                      onChange={(e) => setNewServer({...newServer, address_pool: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none transition-all"
                    >
                      <option value="hs-pool-1">hs-pool-1</option>
                      <option value="guest-pool">guest-pool</option>
                    </select>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-slate-950/50 border-t border-slate-800 overflow-hidden">
               <button 
                 onClick={handleAddServer}
                 className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-amber-600/20"
               >
                 Activate Hotspot Server
               </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Voucher Generation Modal */}
      {isGeneratingVouchers && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
          >
             <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                 <Ticket className="w-5 h-5 text-blue-500" />
                 Voucher Forge
              </h2>
              <button onClick={() => setIsGeneratingVouchers(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">&times;</button>
            </div>

            <div className="p-8 space-y-6">
               <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                  <ShieldAlert className="w-5 h-5 text-blue-400 mt-1" />
                  <p className="text-[10px] text-blue-300 font-bold uppercase leading-relaxed tracking-wider">
                    Generating a batch will immediately write randomized, alphanumeric pre-paid codes to the subscriber database.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Profile</label>
                    <select 
                      value={voucherGen.profile}
                      onChange={(e) => setVoucherGen({...voucherGen, profile: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="1h_50mb">1 Hour / 50MB</option>
                      <option value="5h_500mb">5 Hours / 500MB</option>
                      <option value="1d_unli">1 Day / Unlimited</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Data Limit (MB)</label>
                     <input 
                       type="number"
                       value={voucherGen.dataLimit}
                       onChange={(e) => setVoucherGen({...voucherGen, dataLimit: parseInt(e.target.value)})}
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Quantity to Generate</label>
                  <div className="flex items-center gap-4">
                     <input 
                       type="range"
                       min="1"
                       max="100"
                       value={voucherGen.count}
                       onChange={(e) => setVoucherGen({...voucherGen, count: parseInt(e.target.value)})}
                       className="flex-1 accent-blue-500"
                     />
                     <span className="text-xl font-black text-white font-mono w-12">{voucherGen.count}</span>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-slate-950/50 border-t border-slate-800">
               <button 
                 onClick={handleGenerateVouchers}
                 className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
               >
                 <Ticket className="w-4 h-4" />
                 Commit Batch Operations
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HotspotManagement;
