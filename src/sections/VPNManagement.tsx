import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Plus, 
  Trash2, 
  Activity,
  ShieldCheck,
  Settings,
  Server,
  Zap,
  Globe,
  GlobeLock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { 
  subscribeToVPNConfigs,
  addVPNConfig,
  deleteVPNConfig 
} from '../services/networkService';
import { useLocalization } from '../context/LocalizationContext';

export default function VPNManagement() {
  const { t } = useLocalization();
  const [vpnConfigs, setVpnConfigs] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let unsubVPN: (() => void) | undefined;
    
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubVPN = subscribeToVPNConfigs(setVpnConfigs);
      } else {
        if (unsubVPN) unsubVPN();
        unsubVPN = undefined;
      }
    });
    
    return () => {
      unsubAuth();
      if (unsubVPN) unsubVPN();
    };
  }, []);

  const handleToggleVPN = (id: string, currentStatus: string) => {
    // In a real app, this would be a service call
    setVpnConfigs(prev => prev.map(vpn => {
      if (vpn.id === id) {
        const newStatus = currentStatus === 'connected' ? 'disconnected' : 'connected';
        return { ...vpn, status: newStatus, usage: newStatus === 'connected' ? '1.2 GB' : vpn.usage };
      }
      return vpn;
    }));
  };

  const handleCreateVPN = async () => {
    const name = prompt('Enter Peer Name:');
    if (!name) return;
    
    setIsSubmitting(true);
    try {
      await addVPNConfig({
        name: name.toUpperCase(),
        type: 'WireGuard-L3',
        status: 'disconnected',
        usage: '0.0 B',
        endpoint: '203.0.113.5:51820',
        publicKey: 'Z+/m3...sk=',
        allowed_ips: '10.0.0.0/24'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVPN = async (id: string) => {
    if (confirm('Permanently decommission this VPN tunnel?')) {
      await deleteVPNConfig(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-indigo-500 font-mono flex items-center gap-3">
             <GlobeLock className="w-8 h-8" />
             Encrypted Fabric
          </h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium tracking-wide">
            Orchestrate WireGuard and OpenVPN site-to-site tunnels with kernel-level encryption.
          </p>
        </div>
        
        <button 
          onClick={handleCreateVPN}
          disabled={isSubmitting}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black transition-all flex items-center gap-3 uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Tunnel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vpnConfigs.map((vpn) => (
              <div key={vpn.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group overflow-hidden hover:border-indigo-500/50 transition-all shadow-lg hover:shadow-indigo-500/5">
                <div className="absolute top-0 right-0 p-4">
                  <div className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[8px] font-black uppercase tracking-widest",
                    vpn.status === 'connected' ? 'text-emerald-400' : 'text-slate-600'
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      vpn.status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'
                    )} />
                    {vpn.status}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-indigo-500/10 rounded-xl">
                      <Server className="w-5 h-5 text-indigo-500" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tighter">{vpn.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{vpn.type}</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 font-mono">
                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block">Transfer</span>
                    <span className="text-[11px] text-slate-300 font-bold">{vpn.usage || '0.0 B'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block">Latency</span>
                    <span className="text-[11px] text-indigo-400 font-bold">{vpn.status === 'connected' ? '24ms' : '--'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => alert(`Reviewing encryption keys for ${vpn.name}`)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all"
                  >
                    Keys
                  </button>
                  <button 
                    onClick={() => handleToggleVPN(vpn.id, vpn.status)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      vpn.status === 'connected' 
                        ? "bg-rose-600/10 border-rose-500/20 text-rose-500 hover:bg-rose-600/20" 
                        : "bg-indigo-600/10 border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20"
                    )}
                  >
                    {vpn.status === 'connected' ? 'Drop' : 'Up'}
                  </button>
                  <button 
                    onClick={() => handleDeleteVPN(vpn.id)}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {vpnConfigs.length === 0 && (
               <div className="col-span-full py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                  <Globe className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest italic opacity-50 text-center">No Distributed Tunnel Mesh Found</p>
               </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Security Stats Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
              <ShieldCheck className="w-32 h-32" />
            </div>
            
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-indigo-500" />
            </div>
            
            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tighter italic">L3/L4 Security Insight</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide mb-8">
              All active tunnels utilize <span className="text-indigo-500 underline decoration-indigo-500/30 font-black">ChaCha20-Poly1305</span> for AEAD, ensuring packets are encapsulated with minimal kernel jitter.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-600">Mesh Population</span>
                <span className="text-emerald-400">{vpnConfigs.filter(v => v.status === 'connected').length} Connected</span>
              </div>
              <div className="h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(vpnConfigs.filter(v => v.status === 'connected').length / (vpnConfigs.length || 1)) * 100}%` }}
                  className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" 
                />
              </div>
              <div className="flex items-center gap-2 text-[9px] text-slate-600 font-black uppercase italic tracking-tighter">
                <Activity className="w-3 h-3" />
                Cluster Healthy • No Handshake Timout
              </div>
            </div>
          </div>

          <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4">
                <Settings className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Deployment Specs</span>
             </div>
             <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
               Public Endpoint: <span className="text-slate-300">203.0.113.44</span><br/>
               Listen Port: <span className="text-slate-300">UDP/51820</span><br/>
               MTU Size: <span className="text-slate-300">1420 Bytes</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
