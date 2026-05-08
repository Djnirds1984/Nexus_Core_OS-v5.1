import React from 'react';
import { 
  Network, 
  Plus, 
  Trash2, 
  Activity, 
  Settings2, 
  Wifi, 
  Cpu,
  RefreshCcw,
  Zap,
  Globe,
  MoreHorizontal,
  PlusCircle,
  ToggleLeft as Toggle,
  Braces
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Interface {
  id: string;
  name: string;
  type: 'ethernet' | 'wifi' | 'bridge' | 'virtual' | 'vlan';
  status: 'up' | 'down';
  ipv4: string;
  mac: string;
  speed: string;
}

export default function Interfaces() {
  const [interfaces, setInterfaces] = React.useState<Interface[]>([
    { id: '1', name: 'eth0 (WAN)', type: 'ethernet', status: 'up', ipv4: '203.0.113.45', mac: '00:0c:29:ab:cd:ef', speed: '10G SFP+' },
    { id: '2', name: 'eth1 (LAN)', type: 'ethernet', status: 'up', ipv4: '192.168.1.1', mac: '00:0c:29:ab:cd:f0', speed: '2.5G RJ45' },
    { id: '3', name: 'wlan0 (WIFI)', type: 'wifi', status: 'up', ipv4: '192.168.2.1', mac: '00:0c:29:ab:cd:f1', speed: 'Wi-Fi 6' },
    { id: '4', name: 'br0 (VLAN1)', type: 'bridge', status: 'up', ipv4: '192.168.10.1', mac: '00:0c:29:ab:cd:f3', speed: 'Virtual' },
  ]);

  const [isAddingInterface, setIsAddingInterface] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newType, setNewType] = React.useState<'bridge' | 'vlan' | 'virtual'>('bridge');

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('Hardware scan complete. No new unprovisioned physical ports detected.');
    }, 2000);
  };

  const handleDetach = (id: string) => {
    if (confirm('Permanently detach this logical interface? Kernel resources will be reclaimed.')) {
      setInterfaces(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleCreate = () => {
    if (!newName) return;
    const newIface: Interface = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${newName} (${newType.toUpperCase()})`,
      type: newType === 'vlan' ? 'vlan' : newType === 'bridge' ? 'bridge' : 'virtual',
      status: 'up',
      ipv4: '172.16.' + Math.floor(Math.random() * 255) + '.1',
      mac: '00:0c:29:ab:' + Math.floor(Math.random() * 255).toString(16).padStart(2, '0') + ':' + Math.floor(Math.random() * 255).toString(16).padStart(2, '0'),
      speed: 'Virtual'
    };
    setInterfaces(prev => [...prev, newIface]);
    setIsAddingInterface(false);
    setNewName('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wifi': return Wifi;
      case 'bridge': return Braces;
      case 'virtual': return Cpu;
      case 'vlan': return Zap;
      default: return Network;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Interfaces & Bridging</h1>
          <p className="text-slate-500 text-sm">Manage physical ports, VLANs, and software bridges.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors border border-slate-800 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-3.5 h-3.5", isScanning && "animate-spin")} />
            <span>{isScanning ? 'Probing...' : 'Scan Hardware'}</span>
          </button>
          <button 
            onClick={() => setIsAddingInterface(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 uppercase tracking-widest"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Link</span>
          </button>
        </div>
      </div>

      {/* Interface Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interfaces.map((iface) => {
          const Icon = getTypeIcon(iface.type);
          return (
            <motion.div
              layout
              key={iface.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group relative overflow-hidden"
            >
              {/* Status Indicator */}
              <div className="absolute top-0 right-0 p-3">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                  iface.status === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  <div className={`w-1 h-1 rounded-full ${iface.status === 'up' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-rose-400'}`} />
                  {iface.status}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase tracking-wide">{iface.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{iface.type}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 uppercase">IPv4 Address</span>
                  <span className="text-slate-300 font-bold">{iface.ipv4}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 uppercase">Physical MAC</span>
                  <span className="text-slate-300 font-bold uppercase">{iface.mac}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 uppercase">Link Speed</span>
                  <span className="text-blue-400 font-bold">{iface.speed}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert(`Showing real-time telemetry for ${iface.name}`)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button 
                    onClick={() => alert(`Configuring hardware parameters for ${iface.name}`)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
                <button 
                  onClick={() => handleDetach(iface.id)}
                  className="text-[10px] font-bold uppercase tracking-widest text-rose-500/50 hover:text-rose-500 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Detach
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Create Card placeholder */}
        <button 
          onClick={() => setIsAddingInterface(true)}
          className="border border-dashed border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-slate-900 hover:border-slate-700 transition-all text-slate-500 hover:text-slate-400"
        >
          <div className="w-12 h-12 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Connect Matrix</span>
        </button>
      </div>

      {/* Action Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-10 font-mono">
        {/* Bridge Manager */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bridge Management</h4>
              <p className="text-[9px] text-slate-500 mt-1 uppercase">L2 Soft Switching Matrix</p>
            </div>
            <button 
              onClick={() => alert('Bridge designer initialized.')}
              className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-3 py-1 bg-blue-400/10 rounded border border-blue-400/20 shadow-lg shadow-blue-400/5"
            >
              New Bridge
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'br0 (Local Network)', ports: ['lan0', 'wlan0', 'tap0'], stp: true },
              { name: 'br1 (Guest Isolated)', ports: ['wlan1', 'vlan10'], stp: false }
            ].map((bridge, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase">{bridge.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500 lowercase italic">stp: {bridge.stp ? 'enabled' : 'disabled'}</span>
                    <button onClick={() => alert('Configuring bridge spanning tree protocols...')}>
                      <Settings2 className="w-3.5 h-3.5 text-slate-600 hover:text-slate-200 cursor-pointer" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {bridge.ports.map((port) => (
                    <span key={port} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 uppercase tracking-tighter">
                      {port}
                    </span>
                  ))}
                  <button 
                    onClick={() => alert(`Adding port membership to ${bridge.name}`)}
                    className="px-2 py-0.5 rounded border border-slate-800 border-dashed text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    + add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global WAN Stats */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-blue-500" />
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Gateway Uplink</h2>
            </div>
            <div className="space-y-4 font-mono">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
                <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Active Connected</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Protocol Matrix</span>
                <span className="text-white/80 text-xs font-bold underline decoration-blue-500/50 underline-offset-4 uppercase tracking-tighter cursor-pointer hover:text-white">DHCP Autoconfig</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Link Weight</span>
                <span className="text-blue-400 text-xs font-bold uppercase">Priority 0</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => alert('WAN Matrix Logic exported to terminal.')}
            className="mt-8 w-full py-2 bg-slate-800 border border-slate-700 rounded text-[10px] uppercase font-bold tracking-widest hover:bg-slate-700 transition-colors text-white"
          >
            Link Configuration Matrix
          </button>
        </section>
      </div>

      {/* Interface Modal (Simplified) */}
      <AnimatePresence>
        {isAddingInterface && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingInterface(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-1 text-white">Initialize Link</h2>
              <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-widest font-bold">L2 Interface Provisioning</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Logical Symbol</label>
                  <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    type="text" 
                    placeholder="e.g. storage0" 
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Matrix Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                  >
                    <option value="bridge">Bridge Matrix</option>
                    <option value="vlan">802.1Q Virtual Tag</option>
                    <option value="virtual">TUN/TAP Kernel Device</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsAddingInterface(false)}
                    className="flex-1 py-2 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold transition-all uppercase tracking-widest text-slate-400"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleCreate}
                    className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-500 text-[10px] font-bold transition-all uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
                  >
                    Apply Specs
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
