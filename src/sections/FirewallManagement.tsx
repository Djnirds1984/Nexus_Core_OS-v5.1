import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Plus, 
  Trash2, 
  Filter,
  Eye,
  X,
  Activity,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { 
  subscribeToFirewallRules, 
  addFirewallRule, 
  deleteFirewallRule
} from '../services/networkService';
import { useLocalization } from '../context/LocalizationContext';

export default function FirewallManagement() {
  const { t } = useLocalization();
  const [rules, setRules] = useState<any[]>([]);
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
    
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubFirewall = subscribeToFirewallRules(setRules);
      } else {
        if (unsubFirewall) unsubFirewall();
        unsubFirewall = undefined;
      }
    });
    
    return () => {
      unsubAuth();
      if (unsubFirewall) unsubFirewall();
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Firewall Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-rose-500 font-mono flex items-center gap-3">
             <ShieldCheck className="w-8 h-8" />
             Security Engine
          </h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium tracking-wide">
             Edge security orchestration. L3/L4 packet filtering, NAT translation, and deep packet inspection rules.
          </p>
        </div>
        
        <button 
          onClick={() => setShowRuleModal(true)}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-black transition-all flex items-center gap-3 uppercase tracking-widest text-white shadow-xl shadow-rose-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="md:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                     <Filter className="w-3 h-3 text-rose-500" />
                     <span>Chain: IP_FILTER</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                     <Activity className="w-3 h-3 text-emerald-500" />
                     <span>Logging: Enabled</span>
                   </div>
                </div>
                <div className="flex items-center gap-6 text-[10px] uppercase font-black tracking-widest">
                  <span className="flex items-center gap-2 text-rose-400">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    Drops: 1.4k
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="text-slate-500 text-[9px] uppercase tracking-widest border-b border-slate-800 bg-slate-950/50">
                      <th className="p-4 font-black italic">Rank</th>
                      <th className="p-4 font-black">Designation</th>
                      <th className="p-4 font-black">Proto / App</th>
                      <th className="p-4 font-black">Source</th>
                      <th className="p-4 font-black">Destination</th>
                      <th className="p-4 font-black">Action</th>
                      <th className="p-4 text-right">Ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {rules.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-20 text-center text-slate-600 font-black uppercase tracking-widest italic opacity-50">
                           Critical: No security policies registered in chain.
                        </td>
                      </tr>
                    )}
                    {rules.map((row) => (
                      <tr key={row.id} className="group hover:bg-slate-800/30 transition-colors uppercase tracking-widest text-[10px]">
                        <td className="p-4 text-slate-600 font-black italic">#{row.priority}</td>
                        <td className="p-4 text-white font-black">{row.name}</td>
                        <td className="p-4">
                           <span className="text-rose-400 font-black">{row.protocol}</span>
                           <span className="text-slate-600 mx-1">/</span>
                           <span className="text-slate-500">{row.application}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-black text-blue-400">{row.src_ip}</span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {row.dst_ip}
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "font-black text-[9px] px-2 py-0.5 rounded-md border", 
                            row.action === 'accept' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          )}>
                            {row.action}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => handleDeleteRule(row.id)}
                               className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-all"
                             >
                               <Trash2 className="w-3.5 h-3.5" />
                             </button>
                             <Eye className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 cursor-pointer" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5">
                  <ShieldAlert className="w-24 h-24 text-rose-500" />
               </div>
               <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                  <Zap className="w-5 h-5 text-rose-500" />
               </div>
               <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tighter italic">Firewall Stats</h3>
               <div className="space-y-4 pt-4 mt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <span>Banned IPs</span>
                     <span className="text-rose-500 animate-pulse">402</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <span>Threat Score</span>
                     <span className="text-amber-500">LOW</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                     <span>Rule Count</span>
                     <span className="text-blue-400">{rules.length}</span>
                  </div>
               </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
               <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">Security Events</h4>
               <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 items-start border-l-2 border-rose-500 pl-3">
                       <div className="flex-1">
                          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">Port Scan Detected</p>
                          <p className="text-[8px] text-slate-600 font-mono">SourceIP: 192.168.100.22</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Rule Creation Modal */}
      <AnimatePresence>
        {showRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                 <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-rose-500" />
                    Forge Security Policy
                 </h2>
                 <button onClick={() => setShowRuleModal(false)} className="text-slate-500 hover:text-white">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <form onSubmit={handleCreateRule} className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Rule Label</label>
                       <input 
                         required
                         value={newRule.name}
                         onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 outline-none transition-all" 
                         placeholder="e.g. BLOCK_ICMP_FLOOD"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Action</label>
                       <select 
                         value={newRule.action}
                         onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 outline-none transition-all uppercase font-black"
                       >
                          <option value="accept">ACCEPT</option>
                          <option value="drop">DROP</option>
                          <option value="reject">REJECT</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">L4 Protocol</label>
                       <select 
                         value={newRule.protocol}
                         onChange={(e) => setNewRule({...newRule, protocol: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 outline-none transition-all uppercase font-black"
                       >
                          <option value="tcp">TCP</option>
                          <option value="udp">UDP</option>
                          <option value="icmp">ICMP</option>
                          <option value="any">ANY</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Source IP</label>
                       <input 
                         value={newRule.src_ip}
                         onChange={(e) => setNewRule({...newRule, src_ip: e.target.value})}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-blue-400 font-mono outline-none focus:border-rose-500 transition-all" 
                       />
                    </div>
                 </div>

                 <div className="pt-6 flex gap-4">
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
                    >
                       {isSubmitting ? 'PROCESSING...' : 'Commit Policy'}
                    </button>
                    <button 
                      onClick={() => setShowRuleModal(false)}
                      type="button"
                      className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                       Abort
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
