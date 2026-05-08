import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Plus, 
  ArrowRight, 
  ChevronDown, 
  Trash2, 
  Activity,
  Filter,
  Eye,
  AlertTriangle,
  Server,
  X,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { 
  subscribeToFirewallRules, 
  addFirewallRule, 
  deleteFirewallRule,
  subscribeToVPNConfigs,
  addVPNConfig 
} from '../services/networkService';

export default function FirewallVPN() {
  const [rules, setRules] = useState<any[]>([]);
  const [vpnConfigs, setVpnConfigs] = useState<any[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newRule, setNewRule] = useState({
    name: '',
    action: 'accept',
    protocol: 'tcp',
    src_ip: 'any',
    src_port: 'any',
    dst_ip: 'any',
    dst_port: 'any',
    application: 'general',
    priority: 100,
    logging: true,
    enabled: true
  });

  useEffect(() => {
    let unsubFirewall: (() => void) | undefined;
    let unsubVPN: (() => void) | undefined;
    
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubFirewall = subscribeToFirewallRules(setRules);
        unsubVPN = subscribeToVPNConfigs(setVpnConfigs);
      } else {
        if (unsubFirewall) unsubFirewall();
        if (unsubVPN) unsubVPN();
        unsubFirewall = undefined;
        unsubVPN = undefined;
      }
    });
    
    return () => {
      unsubAuth();
      if (unsubFirewall) unsubFirewall();
      if (unsubVPN) unsubVPN();
    };
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addFirewallRule(newRule);
      setShowRuleModal(false);
      setNewRule({
        name: '',
        action: 'accept',
        protocol: 'tcp',
        src_ip: 'any',
        src_port: 'any',
        dst_ip: 'any',
        dst_port: 'any',
        application: 'general',
        priority: rules.length > 0 ? Math.max(...rules.map(r => r.priority)) + 10 : 100,
        logging: true,
        enabled: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Permanently delete this security rule?')) {
      await deleteFirewallRule(id);
    }
  };

  const handleToggleVPN = (id: string) => {
    setVpnConfigs(prev => prev.map(vpn => {
      if (vpn.id === id) {
        const newStatus = vpn.status === 'connected' ? 'disconnected' : 'connected';
        return { ...vpn, status: newStatus, usage: newStatus === 'connected' ? '1.2 GB' : vpn.usage };
      }
      return vpn;
    }));
  };

  const handleCreateVPN = () => {
    const name = prompt('Enter Peer Name:');
    if (!name) return;
    const newVPN = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.toUpperCase(),
      type: 'WireGuard-L3',
      status: 'disconnected',
      usage: '0.0 B'
    };
    setVpnConfigs(prev => [...prev, newVPN]);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Firewall Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Security Engine</h1>
            <p className="text-slate-500 text-sm max-w-xl font-medium uppercase tracking-tighter">
              OSI Layer-3/4 packet filtering, NAT translation, and L7 application aware forwarding.
            </p>
          </div>
          <button 
            onClick={() => setShowRuleModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Security Rule</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <Filter className="w-4 h-4 text-blue-500" />
              <span>Chain: PREROUTING</span>
            </div>
            <div className="flex-1 min-w-[100px]" />
            <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-tighter">
              <span className="flex items-center gap-2 text-rose-400">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                Active Drops: 1,429
              </span>
              <span className="flex items-center gap-2 text-emerald-400 border-l border-slate-800 pl-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Accepted Flow: 12.4k
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-950/50">
                  <th className="p-4 font-bold">Rank</th>
                  <th className="p-4 font-bold">Rule Metadata</th>
                  <th className="p-4 font-bold">Protocol / App</th>
                  <th className="p-4 font-bold">Src / Port</th>
                  <th className="p-4 font-bold">Dst / Port</th>
                  <th className="p-4 font-bold">Policy</th>
                  <th className="p-4 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest">
                       No active rules found in registry.
                    </td>
                  </tr>
                )}
                {rules.map((row, i) => (
                  <tr key={row.id} className="group hover:bg-slate-800/30 transition-colors uppercase tracking-widest">
                    <td className="p-4 text-slate-600 font-bold">#{row.priority}</td>
                    <td className="p-4 text-white font-bold tracking-tighter">{row.name}</td>
                    <td className="p-4 text-slate-500">
                       <span className="text-blue-400">{row.protocol}</span> / {row.application}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-blue-400 font-bold uppercase tracking-widest text-[9px]">{row.src_ip}</span>
                      {row.src_port !== 'any' && <span className="text-slate-600 ml-1">:{row.src_port}</span>}
                    </td>
                    <td className="p-4 text-slate-400">
                      {row.dst_ip}
                      {row.dst_port !== 'any' && <span className="text-slate-600">:{row.dst_port}</span>}
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "font-black text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800", 
                        row.action === 'accept' ? 'text-emerald-500' : 'text-rose-500'
                      )}>
                        {row.action}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => alert(`Reviewing packet match statistics for ${row.name}`)}
                           className="p-1.5 hover:bg-slate-800 rounded border border-transparent hover:border-slate-700 transition-all font-bold"
                         >
                           <Eye className="w-3.5 h-3.5 text-slate-400" />
                         </button>
                         <button 
                           onClick={() => handleDeleteRule(row.id)}
                           className="p-1.5 hover:bg-rose-500/10 rounded border border-transparent hover:border-rose-500/20 transition-all"
                         >
                           <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rule Creation Modal */}
      <AnimatePresence>
        {showRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowRuleModal(false)}
               className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
                 <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Security Policy Injection</h2>
                 <button onClick={() => setShowRuleModal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <form onSubmit={handleCreateRule} className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rule Label</label>
                       <input 
                         required
                         value={newRule.name}
                         onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:border-blue-500/50 outline-none transition-all" 
                         placeholder="e.g. ALLOW_DB_ACCESS"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Policy Action</label>
                       <select 
                         value={newRule.action}
                         onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:border-blue-500/50 outline-none transition-all uppercase font-bold"
                       >
                          <option value="accept">ACCEPT</option>
                          <option value="drop">DROP (SILENT)</option>
                          <option value="reject">REJECT (ICMP)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">L4 Protocol</label>
                       <select 
                         value={newRule.protocol}
                         onChange={(e) => setNewRule({...newRule, protocol: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:border-blue-500/50 outline-none transition-all uppercase font-bold"
                       >
                          <option value="tcp">TCP</option>
                          <option value="udp">UDP</option>
                          <option value="icmp">ICMP</option>
                          <option value="any">GLOBAL ANY</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Application Node</label>
                       <input 
                         value={newRule.application}
                         onChange={(e) => setNewRule({...newRule, application: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-white focus:border-blue-500/50 outline-none transition-all font-mono" 
                         placeholder="L7 Signature..."
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source_IP</label>
                       <input 
                         value={newRule.src_ip}
                         onChange={(e) => setNewRule({...newRule, src_ip: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-blue-400 focus:border-blue-500/50 outline-none transition-all font-mono" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source_Port</label>
                       <input 
                         value={newRule.src_port}
                         onChange={(e) => setNewRule({...newRule, src_port: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-slate-400 focus:border-blue-500/50 outline-none transition-all font-mono" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dest_IP</label>
                       <input 
                         value={newRule.dst_ip}
                         onChange={(e) => setNewRule({...newRule, dst_ip: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-blue-400 focus:border-blue-500/50 outline-none transition-all font-mono" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dest_Port</label>
                       <input 
                         value={newRule.dst_port}
                         onChange={(e) => setNewRule({...newRule, dst_port: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs text-slate-400 focus:border-blue-500/50 outline-none transition-all font-mono" 
                       />
                    </div>
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-[0.2em] rounded shadow-lg shadow-blue-600/20 transition-all font-mono"
                    >
                       {isSubmitting ? 'PROCESSING_INJECT...' : 'APPLY_SECURITY_RULE'}
                    </button>
                    <button 
                      onClick={() => setShowRuleModal(false)}
                      type="button"
                      className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest rounded transition-all"
                    >
                       CANCEL
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VPN Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Encrypted Fabric</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">WireGuard & OpenVPN Site-to-Site</p>
            </div>
            <button 
              onClick={handleCreateVPN}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Peer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {vpnConfigs.map((vpn) => (
              <div key={vpn.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group overflow-hidden hover:border-slate-700 transition-all">
                <div className="absolute top-0 right-0 p-4">
                  <div className={`flex items-center gap-2 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-bold uppercase tracking-widest ${vpn.status === 'connected' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${vpn.status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                    {vpn.status}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white uppercase tracking-tight mb-1">{vpn.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-8">{vpn.type}</p>
                
                <div className="space-y-3 mb-8 font-mono">
                  <div className="flex justify-between text-[10px] border-b border-slate-800 pb-2">
                    <span className="text-slate-500 uppercase">TRANSFER RX/TX</span>
                    <span className="text-slate-300 font-bold">{vpn.usage || '0.0 B'}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500 uppercase">LATENCY</span>
                    <span className="text-blue-400 font-bold">{vpn.status === 'connected' ? '24ms' : '---'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => alert(`Reviewing encryption keys and handshake metadata for ${vpn.name}`)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-300 transition-all"
                  >
                    Specs
                  </button>
                  <button 
                    onClick={() => handleToggleVPN(vpn.id)}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                      vpn.status === 'connected' 
                        ? "bg-rose-600/10 border-rose-500/20 text-rose-500 hover:bg-rose-600/20" 
                        : "bg-blue-600/10 border-blue-600/20 text-blue-400 hover:bg-blue-600/20"
                    )}
                  >
                    {vpn.status === 'connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
            
            {vpnConfigs.length === 0 && (
               <div className="p-10 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2">
                  <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">No tunnels defined in mesh ecosystem.</p>
               </div>
            )}
            
            <button 
              onClick={handleCreateVPN}
              className="border border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-slate-600 hover:bg-slate-900 hover:border-slate-700 transition-all group"
            >
              <div className="w-12 h-12 rounded bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-slate-700">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Provision Peer Link</span>
            </button>
          </div>
        </div>

        {/* VPN Security Insight */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Lock className="w-32 h-32" />
          </div>
          <div>
            <div className="w-14 h-14 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center mb-8">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-tighter uppercase">Algorithm Specs</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Kernel tunnels currently utilize <span className="text-blue-500 font-bold italic">ChaCha20-Poly1305</span> for AEAD, 
              ensuring L3 packets are encapsulated with sub-millisecond encryption overhead.
            </p>
          </div>
          <div className="mt-10 space-y-5">
             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-500">Node Population</span>
                <span className="text-emerald-400">{vpnConfigs.filter(v => v.status === 'connected').length} Active Nodes</span>
             </div>
             <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(vpnConfigs.filter(v => v.status === 'connected').length / (vpnConfigs.length || 1)) * 100}%` }}
                  className="h-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                />
             </div>
             <p className="text-[9px] text-slate-600 font-mono italic">Nexus-VPN Cluster: TITAN_ENV_PROD</p>
          </div>
        </div>
      </section>
    </div>
  );
}

