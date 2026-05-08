import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Zap, 
  Settings2, 
  Server, 
  Activity, 
  Clock, 
  Play,
  Square,
  Shield,
  ArrowRight,
  Plus,
  Network,
  Cpu,
  Key,
  Database,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { 
  subscribeToLivePackets, 
  simulatePacket,
  subscribeToPPPoEServers,
  addPPPoEServer,
  deletePPPoEServer,
  updatePPPoEServer,
  subscribeToIPoEConfigs,
  addIPoEConfig,
  deleteIPoEConfig,
  updateIPoEConfig
} from '../services/networkService';

/** 
 * WAN Section
 */
export function WANSetup() {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [policies, setPolicies] = useState([
    { id: '1', name: 'LOAD_BALANCE_GLOBAL', strategy: 'pcc', interfaces: ['eth0', 'wwan0'], weights: { eth0: 70, wwan0: 30 }, status: 'active' },
    { id: '2', name: 'FAILOVER_BACKUP', strategy: 'failover', interfaces: ['eth0', 'wwan0'], status: 'standby' }
  ]);
  const [activePolicyId, setActivePolicyId] = useState('1');

  const handleProvision = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      setIsProvisioning(false);
      alert('Upstream handshake complete. IP lease renewed.');
    }, 3000);
  };

  const handleCreatePolicy = () => {
    const name = prompt('Policy ID:');
    if (!name) return;
    const strategy = prompt('Strategy (ecmp, pcc, failover):', 'ecmp');
    const newPolicy = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      strategy: (strategy || 'ecmp').toLowerCase(),
      interfaces: ['eth0'],
      weights: { eth0: 100 },
      status: 'standby'
    };
    setPolicies([...policies, newPolicy]);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-blue-500">Gateway Matrix</h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium">Orchestrate Multi-WAN distribution, traffic load balancing (ECMP/PCC), and failover logic.</p>
        </div>
        <button 
          onClick={handleCreatePolicy}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white"
        >
          <Plus className="w-4 h-4" />
          <span>New Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Primary Interface */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe className="w-24 h-24" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500">
                  <Globe className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-white tracking-widest uppercase">Master Uplink (eth0)</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Primary_Active</p>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <span className="text-xs font-mono font-bold text-slate-500 block">THROUGHPUT</span>
               <span className="text-lg font-mono font-bold text-blue-400">842 Mbps</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800 font-mono">
             <div>
                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Stratum</label>
                <p className="text-xs font-bold text-slate-200">ECMP_READY</p>
             </div>
             <div>
                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Gateway</label>
                <p className="text-xs font-bold text-slate-200">203.0.113.1</p>
             </div>
             <div>
                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest block mb-1">Uptime</label>
                <p className="text-xs font-bold text-emerald-400">14:22:15</p>
             </div>
          </div>
          
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-6">
             <div className="flex justify-between items-center mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Policy Matrix Distribution</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded bg-blue-500" />
                   <span className="text-[9px] font-bold text-slate-500 uppercase">Load Balanced</span>
                </div>
             </div>
             <div className="space-y-4">
                {policies.map(policy => (
                  <div 
                    key={policy.id} 
                    onClick={() => setActivePolicyId(policy.id)}
                    className={cn(
                      "p-4 rounded border transition-all cursor-pointer group",
                      activePolicyId === policy.id 
                        ? "bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-600/5" 
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest",
                         activePolicyId === policy.id ? "text-white" : "text-slate-500"
                       )}>{policy.name}</span>
                       <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono font-bold text-slate-600 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 uppercase tracking-tighter">{policy.strategy}</span>
                          {activePolicyId === policy.id && <Zap className="w-3 h-3 text-blue-400 animate-pulse" />}
                       </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                       {policy.interfaces.map(iface => (
                         <span key={iface} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-bold text-slate-400">{iface}</span>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Secondary Interface/Failover */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-between shadow-2xl group transition-all">
             <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest">Failover Logic</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-tighter">
                  Kernel failover is monitoring <span className="text-orange-400 font-bold italic text-[10px]">PEER_WLAN0</span>. 
                  Automatic L3 switch triggers if ICMP echo to 1.1.1.1 exceeds 450ms.
                </p>
             </div>
             <div className="mt-8 p-6 rounded-lg bg-slate-950 border border-slate-800 relative">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-600 mb-4 tracking-[0.2em]">
                   <span>Secondary Link (WLAN0)</span>
                   <span className="text-orange-500 animate-pulse">STANDBY</span>
                </div>
                <div className="flex items-center gap-4">
                   <Globe className="w-4 h-4 text-slate-700" />
                   <span className="text-sm font-mono font-bold text-slate-500 uppercase tracking-tighter">5G_MOBILE_UPLINK</span>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col gap-6 shadow-2xl">
             <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Algorithm Specs</h3>
                <Settings2 className="w-4 h-4 text-slate-600" />
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded bg-slate-950 border border-slate-800">
                   <div>
                      <p className="text-xs font-bold text-white uppercase">ECMP Logic</p>
                      <p className="text-[9px] text-slate-600 mt-1 uppercase">Round-robin L3 distribution</p>
                   </div>
                   <div className="w-8 h-4 rounded-full bg-blue-600 flex items-center justify-end px-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                   </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded bg-slate-950 border border-slate-800">
                   <div>
                      <p className="text-xs font-bold text-white uppercase">PCC Hash Mapping</p>
                      <p className="text-[9px] text-slate-600 mt-1 uppercase">Sticky sessions by IP:Port</p>
                   </div>
                   <div className="w-8 h-4 rounded-full bg-slate-800 flex items-center justify-start px-1 cursor-pointer" onClick={() => alert('Activating Per-Connection-Classifier logic...')}>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600 shadow-sm" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DHCP Section
 */
export function DHCPSetup() {
  const handleFeatureAlert = (feature: string) => {
    alert(`${feature} requires administrative clearance on the orchestration node.`);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-blue-500">Address Allocator</h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium">Dynamic L3 address management and reservation registry.</p>
        </div>
        <button 
          onClick={() => handleFeatureAlert('Pool Configuration Designer')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
        >
          <Settings2 className="w-4 h-4" />
          <span>Pool Config</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-5 bg-slate-950/20 border-b border-slate-800 flex items-center gap-8">
               <div className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Lease Ledger (Live)</div>
               <div className="flex items-center gap-6 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-tighter">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded bg-blue-600" />
                    <span>Usage Map: 45 / 254 (18%)</span>
                  </div>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                 <thead>
                    <tr className="text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-950/50">
                       <th className="p-5 font-bold">Subject_Hostname</th>
                       <th className="p-5 font-bold">IPv4_Address</th>
                       <th className="p-5 font-bold">MAC_HWID</th>
                       <th className="p-5 font-bold text-right">TTL_EXPIRY</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 text-slate-300 italic">
                   {[
                     { host: 'XPS-15-Workstation', ip: '192.168.1.45', mac: 'BC:85:56:AB:42:11', time: '14h 22m' },
                     { host: 'Android-Pixel-8', ip: '192.168.1.102', mac: 'A2:C4:44:09:88:FF', time: '2h 10m' },
                     { host: 'Smart-Switch-Living', ip: '192.168.1.201', mac: '00:08:22:91:FA:B2', time: 'STATIC_MAP' },
                     { host: 'Synology-NAS', ip: '192.168.1.10', mac: '00:11:32:04:A1:C9', time: 'STATIC_MAP' },
                   ].map((lease, i) => (
                     <tr key={i} className="hover:bg-slate-800/30 transition-colors uppercase tracking-tight group cursor-crosshair">
                        <td className="p-5 font-bold text-slate-200 uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{lease.host}</td>
                        <td className="p-5 font-bold text-blue-400">{lease.ip}</td>
                        <td className="p-5 text-slate-500 uppercase tracking-tighter">{lease.mac}</td>
                        <td className="p-5 text-right font-bold text-slate-600">{lease.time}</td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-600/20">
                    <Server className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Scope Definition</h3>
               </div>
               <div className="space-y-6 font-mono">
                  <div className="border-b border-slate-800 pb-2">
                     <label className="block text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Range_Start</label>
                     <p className="text-sm font-bold text-slate-300">192.168.1.20</p>
                  </div>
                  <div className="border-b border-slate-800 pb-2">
                     <label className="block text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Range_End</label>
                     <p className="text-sm font-bold text-slate-300">192.168.1.254</p>
                  </div>
                  <div>
                     <label className="block text-[9px] text-slate-500 uppercase font-black mb-1 tracking-widest">Global_TTL</label>
                     <p className="text-sm font-bold text-blue-400">86400 SECONDS</p>
                  </div>
               </div>
            </div>
            <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-slate-950 border border-emerald-500/20 rounded-xl group cursor-pointer hover:border-emerald-500/50 transition-all">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4">DNS_RESOLVER</h4>
               <p className="text-[11px] text-slate-500 mb-6 font-bold leading-relaxed uppercase tracking-tighter">Cluster DNS is currently orchestrating recursive resolution via upstream Peers.</p>
               <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:text-white transition-colors">1.1.1.1</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold hover:text-white transition-colors">8.8.8.8</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

/**
 * Traffic Analysis
 */
export function TrafficAnalysis() {
  const [packets, setPackets] = useState<any[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [protocolStats, setProtocolStats] = useState<any[]>([]);

  const PIE_DATA = [
    { name: 'Multimedia_H265', value: 45, color: '#3b82f6' },
    { name: 'Encrypted_Vault', value: 25, color: '#a855f7' },
    { name: 'Web_Logic_L7', value: 15, color: '#10b981' },
    { name: 'System_Nodes', value: 15, color: '#6366f1' },
  ];

  useEffect(() => {
    let unsubPackets: (() => void) | undefined;
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubPackets = subscribeToLivePackets(setPackets);
      } else {
        if (unsubPackets) unsubPackets();
        unsubPackets = undefined;
      }
    });
    return () => {
      unsubAuth();
      if (unsubPackets) unsubPackets();
    };
  }, []);

  // Simulation effect
  useEffect(() => {
    let interval: any;
    if (isCapturing) {
      interval = setInterval(() => {
        simulatePacket();
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-blue-500">Spectral Analysis</h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium">Deep Packet Inspection (DPI) and protocol distribution architecture.</p>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <button 
            onClick={() => alert('Telemetry window locked to 24H for historical indexing.')}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:text-white hover:border-slate-700 transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>24H WINDOW</span>
          </button>
          <button 
            onClick={() => setIsCapturing(!isCapturing)}
            className={cn(
              "px-4 py-2 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all text-white shadow-lg",
              isCapturing 
                ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20" 
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
            )}
          >
             {isCapturing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
             <span>{isCapturing ? 'Stop Capture' : 'Start Capture'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Application Matrix Distribution</h3>
               <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encrypted: 84.2%</span>
               </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-16">
               <div className="h-[280px] w-full md:w-[320px] relative">
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-black text-white tracking-widest">100%</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Flow Mapping</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={1500}
                      >
                        {PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex-1 space-y-6 w-full">
                  {PIE_DATA.map((item, i) => (
                    <div key={i} className="flex flex-col gap-3 group transition-all">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                             <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.name}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-blue-400">{item.value}%</span>
                       </div>
                       <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }} 
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full rounded-full" 
                            style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }} 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-8 shadow-2xl relative overflow-hidden flex flex-col h-[500px]">
            <div className="flex items-center justify-between shrink-0">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Real-time Flow Map
               </h3>
               {isCapturing && (
                  <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-bold text-emerald-500 uppercase">Live</span>
                  </div>
               )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
               <AnimatePresence initial={false}>
                 {packets.map((pkt, i) => (
                   <motion.div 
                     key={pkt.id} 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center gap-5 py-3 border-b border-slate-800 last:border-0 group cursor-crosshair shrink-0"
                   >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-blue-500/30 transition-all shadow-inner">
                         <Activity className="w-4 h-4 text-slate-700 group-hover:text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0 font-mono">
                         <p className="text-[10px] font-bold text-slate-400 truncate tracking-tighter uppercase">
                            {pkt.src_ip} <ArrowRight className="inline w-3 h-3 mx-1" /> <span className="text-blue-400">{pkt.dst_ip}</span>
                          </p>
                         <p className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em] mt-1">
                            {pkt.protocol} / Port_{pkt.dst_port}
                         </p>
                      </div>
                      <div className="text-right shrink-0">
                         <div className="text-[10px] font-bold text-emerald-500">{pkt.size}B</div>
                         <div className="text-[9px] text-slate-700 font-black tracking-tighter">{new Date(pkt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </div>
                   </motion.div>
                 ))}
                 {packets.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                       <Play className="w-12 h-12 text-slate-800 mb-4" />
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Waiting for traffic injection...</p>
                    </div>
                 )}
               </AnimatePresence>
            </div>
            
            <button 
              onClick={() => alert('Accessing full packet matrix and raw pcap vault.')}
              className="w-full py-3 text-[9px] font-black uppercase tracking-[0.4em] border border-slate-800 hover:border-slate-600 hover:bg-slate-950 rounded transition-all text-slate-500 shrink-0"
            >
               ACCESS_FULL_MATRIX
            </button>
         </div>
      </div>
    </div>
  );
}

/**
 * PPPoE Management Section (CRUD)
 */
export function PPPoEManagement() {
  const [servers, setServers] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newServer, setNewServer] = useState({
    service_name: '',
    interface: 'eth1',
    mtu: 1492,
    authentication: 'mschapv2',
    address_pool: 'pppoe-pool-0',
    enabled: true
  });

  const [sessionsCount, setSessionsCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    const mocks = [
      { service_name: 'FTTH_RESIDENTIAL', interface: 'eth1', mtu: 1492, authentication: 'mschapv2', address_pool: 'pppoe-pool-0', enabled: true },
      { service_name: 'CORP_PREMIUM', interface: 'vlan10', mtu: 1500, authentication: 'mschapv2', address_pool: 'pppoe-pool-static', enabled: true },
      { service_name: 'WIFI_HOTSPOT', interface: 'eth1', mtu: 1480, authentication: 'pap', address_pool: 'pppoe-pool-1', enabled: false }
    ];
    for (const mock of mocks) {
      await addPPPoEServer(mock);
    }
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        unsub = subscribeToPPPoEServers(setServers);
      } else {
        if (unsub) unsub();
        unsub = undefined;
      }
    });
    return () => {
      unsubAuth();
      if (unsub) unsub();
    };
  }, []);

  const handleSimulate = () => {
    setSessionsCount(prev => prev + Math.floor(Math.random() * 5) + 1);
  };

  const handleAddServer = async () => {
    if (!newServer.service_name) return;
    
    setIsDeploying(true);
    setError(null);
    try {
      await addPPPoEServer({
        ...newServer,
        service_name: newServer.service_name.toUpperCase(),
      });
      setIsAdding(false);
      setNewServer({
        service_name: '',
        interface: 'eth1',
        mtu: 1492,
        authentication: 'mschapv2',
        address_pool: 'pppoe-pool-0',
        enabled: true
      });
    } catch (err: any) {
      setError(err.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setIsProcessing(id);
    await updatePPPoEServer(id, { enabled: !current });
    setTimeout(() => setIsProcessing(null), 800);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Decommission this PPPoE server instance?')) {
      await deletePPPoEServer(id);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-blue-500 font-mono">PPPoE Access Concentrator</h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium">Manage subscriber sessions and Layer 2 tunneling endpoints.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeedData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest text-slate-500 hover:text-blue-400"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Seed Templates</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Server</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-1 text-white">Initialize PPPoE</h2>
              <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-widest font-bold">Access Concentrator Provisioning</p>
              
              {error && (
                <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                  Error: {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Service ID</label>
                  <input 
                    value={newServer.service_name}
                    onChange={(e) => setNewServer({...newServer, service_name: e.target.value})}
                    type="text" 
                    placeholder="e.g. CORE_TRANSIT" 
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Host Interface</label>
                  <select 
                    value={newServer.interface}
                    onChange={(e) => setNewServer({...newServer, interface: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                  >
                    <option value="eth1">eth1 (LAN)</option>
                    <option value="eth0">eth0 (WAN)</option>
                    <option value="vlan10">vlan10</option>
                    <option value="br0">br0 (Bridge)</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold transition-all uppercase tracking-widest text-slate-400"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddServer}
                    disabled={isDeploying}
                    className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold transition-all uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
                  >
                    {isDeploying ? 'Deploying...' : 'Deploy'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {servers.map((server) => (
            <div key={server.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group hover:border-blue-500/30 transition-all overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center border",
                    server.enabled ? "bg-blue-600/10 border-blue-600/20 text-blue-500" : "bg-slate-950 border-slate-800 text-slate-700"
                  )}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter">{server.service_name}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">{server.interface} / MTU_{server.mtu}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggle(server.id, server.enabled)}
                    disabled={isProcessing === server.id}
                    className={cn(
                      "px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all min-w-[70px]",
                      server.enabled ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-950 text-slate-500 border border-slate-800"
                    )}
                  >
                    {isProcessing === server.id ? '...' : server.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <button 
                    onClick={() => handleDelete(server.id)}
                    className="p-2 bg-slate-950 hover:bg-rose-900/20 text-slate-700 hover:text-rose-500 border border-slate-800 rounded transition-all"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 font-mono">
                <div>
                  <label className="block text-[9px] text-slate-600 uppercase font-black mb-1">Auth_Logic</label>
                  <p className="text-xs font-bold text-slate-300 uppercase">{server.authentication}</p>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-600 uppercase font-black mb-1">Pool_Label</label>
                  <p className="text-xs font-bold text-blue-400 uppercase">{server.address_pool}</p>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-600 uppercase font-black mb-1">Sessions</label>
                  <p className={cn("text-xs font-bold transition-all", server.enabled && sessionsCount > 0 ? "text-emerald-400" : "text-slate-700")}>
                    {server.enabled ? sessionsCount : 0} LIVE
                  </p>
                </div>
              </div>
            </div>
          ))}

          {servers.length > 0 && (
            <button 
              onClick={handleSimulate}
              className="w-full py-4 border border-dashed border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center justify-center gap-3"
            >
              <Activity className="w-4 h-4" />
              Inject Remote Sessions
            </button>
          )}

          {servers.length === 0 && (
            <div className="border border-dashed border-slate-800 rounded-xl p-20 flex flex-col items-center justify-center text-center">
              <Network className="w-12 h-12 text-slate-800 mb-4" />
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No PPPoE Server Instances Found</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
             <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Security Specs</h3>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-tighter mb-6">
                All subscriber tunnels are currently governed by <span className="text-blue-400 font-bold italic">RADIUS_CLUSTER_A</span> with mandatory CHAP-V2 handshakes.
             </p>
             <div className="space-y-3 font-mono">
                <div className="flex justify-between items-center text-[10px] pb-2 border-b border-slate-800">
                   <span className="text-slate-600 font-bold uppercase tracking-widest">IP Compression</span>
                   <span className="text-emerald-500">ENABLED</span>
                </div>
                <div className="flex justify-between items-center text-[10px] pb-2 border-b border-slate-800">
                   <span className="text-slate-600 font-bold uppercase tracking-widest">Multilink</span>
                   <span className="text-slate-500 uppercase">OFF</span>
                </div>
             </div>
          </div>

          <div className="p-8 bg-slate-950 border border-slate-800 rounded-xl">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Subscriber Distribution</h4>
             <div className="h-[200px] flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
                <Activity className="w-8 h-8 text-slate-800" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * IPoE / DHCP Management System
 */
export function IPoEManagement() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newConfig, setNewConfig] = useState({
    interface: 'vlan20',
    mode: 'server',
    vlan_id: 20,
    auth_type: 'option82',
    address_pool: 'ipoe-vlan20',
    enabled: true
  });

  const [leaseCount, setLeaseCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeedData = async () => {
    const mocks = [
      { interface: 'VLAN_GUEST', mode: 'server', vlan_id: 100, auth_type: 'option82', address_pool: 'ipoe-vlan-100', enabled: true },
      { interface: 'VLAN_VOIP', mode: 'server', vlan_id: 500, auth_type: 'mac', address_pool: 'ipoe-vlan-500', enabled: true },
      { interface: 'STATIC_LAN', mode: 'server', vlan_id: 1, auth_type: 'none', address_pool: 'internal-pool', enabled: true }
    ];
    for (const mock of mocks) {
      await addIPoEConfig(mock);
    }
  };

  useEffect(() => {
    let unsub: (() => void) | undefined;
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        unsub = subscribeToIPoEConfigs(setConfigs);
      } else {
        if (unsub) unsub();
        unsub = undefined;
      }
    });
    return () => {
      unsubAuth();
      if (unsub) unsub();
    };
  }, []);

  const handleSimulate = () => {
    setLeaseCount(prev => prev + Math.floor(Math.random() * 3) + 1);
  };

  const handleAddConfig = async () => {
    if (!newConfig.interface) return;
    
    setIsDeploying(true);
    setError(null);
    try {
      await addIPoEConfig({
        ...newConfig,
        interface: newConfig.interface.toUpperCase(),
      });
      setIsAdding(false);
      setNewConfig({
        interface: 'vlan20',
        mode: 'server',
        vlan_id: 20,
        auth_type: 'option82',
        address_pool: 'ipoe-vlan20',
        enabled: true
      });
    } catch (err: any) {
      setError(err.message || 'Config commit failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setIsProcessing(id);
    await updateIPoEConfig(id, { enabled: !current });
    setTimeout(() => setIsProcessing(null), 800);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this IPoE logical endpoint?')) {
      await deleteIPoEConfig(id);
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-blue-500 font-mono">IPoE Orchestrator</h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium">Configure identifier-based IP allocation and Layer 3 session management.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSeedData}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 uppercase tracking-widest text-slate-500 hover:text-emerald-400"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Seed Templates</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Endpoint</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-1 text-white">Initialize IPoE</h2>
              <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-widest font-bold">L3 Session Entry Point</p>
              
              {error && (
                <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                  Error: {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Target Interface</label>
                  <input 
                    value={newConfig.interface}
                    onChange={(e) => setNewConfig({...newConfig, interface: e.target.value})}
                    type="text" 
                    placeholder="e.g. vlan30" 
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Operating Mode</label>
                  <select 
                    value={newConfig.mode}
                    onChange={(e) => setNewConfig({...newConfig, mode: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                  >
                    <option value="server">DHCP Server (L3 Edge)</option>
                    <option value="client">IPoE Client (Sub-IF)</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold transition-all uppercase tracking-widest text-slate-400"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddConfig}
                    disabled={isDeploying}
                    className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold transition-all uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
                  >
                    {isDeploying ? 'Commiting...' : 'Commit'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {configs.map((cfg) => (
          <div key={cfg.id} className="bg-slate-900 border border-slate-800 rounded-xl p-8 relative group overflow-hidden shadow-2xl">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                   <div className={cn(
                     "w-14 h-14 rounded-lg flex items-center justify-center border",
                     cfg.enabled ? "bg-emerald-600/10 border-emerald-600/20 text-emerald-500" : "bg-slate-950 border-slate-800 text-slate-700"
                   )}>
                      <Database className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-widest">{cfg.interface}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">Mode: {cfg.mode}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest font-mono">VLAN_{cfg.vlan_id}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => handleToggle(cfg.id, cfg.enabled)}
                    disabled={isProcessing === cfg.id}
                    className={cn(
                      "px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all min-w-[100px]",
                      cfg.enabled ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-950 text-slate-500 border border-slate-800"
                    )}
                   >
                     {isProcessing === cfg.id ? 'Applying...' : cfg.enabled ? 'Operational' : 'Halted'}
                   </button>
                   <button 
                    onClick={() => handleDelete(cfg.id)}
                    className="p-2.5 bg-slate-950 hover:bg-rose-900/20 text-slate-700 hover:text-rose-500 border border-slate-800 rounded"
                   >
                     <Square className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8 font-mono mb-8 p-6 bg-slate-950/50 rounded-lg border border-slate-800">
                <div>
                   <label className="block text-[9px] text-slate-600 uppercase font-black mb-1">Mapping_Type</label>
                   <p className="text-xs font-bold text-slate-200 uppercase">{cfg.auth_type}</p>
                </div>
                <div>
                   <label className="block text-[9px] text-slate-600 uppercase font-black mb-1">Assigned_Pool</label>
                   <p className="text-xs font-bold text-blue-400 uppercase">{cfg.address_pool}</p>
                </div>
             </div>

             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <span className={cn("transition-all", cfg.enabled && leaseCount > 0 ? "text-blue-400" : "text-slate-700")}>
                  Lease_State: {cfg.enabled && leaseCount > 0 ? `${leaseCount} ACTIVE` : 'IDLE'}
                </span>
                <span className="text-slate-700 font-mono">Ref: {cfg.id.slice(0, 8)}</span>
             </div>
          </div>
        ))}

        {configs.length > 0 && (
          <button 
            onClick={handleSimulate}
            className="lg:col-span-2 py-4 border border-dashed border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-3"
          >
            <Activity className="w-4 h-4" />
            Simulate DHCP Discovery
          </button>
        )}

        {configs.length === 0 && (
          <div className="lg:col-span-2 border border-dashed border-slate-800 rounded-xl p-24 flex flex-col items-center justify-center text-center">
             <Database className="w-16 h-16 text-slate-800 mb-4" />
             <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">No logical IPoE endpoints defined</p>
          </div>
        )}
      </div>
    </div>
  );
}

