import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownLeft, Network, Shield, 
  Activity, Users, Zap, Search, ChevronRight,
  Monitor, Smartphone, Laptop
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

// Simulated data hooks
const useStats = () => {
  const [data, setData] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    const generatePing = () => {
      setData(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          rx: Math.floor(Math.random() * 400) + 100,
          tx: Math.floor(Math.random() * 150) + 50,
        }].slice(-20);
        return newData;
      });
    };

    const interval = setInterval(generatePing, 2000);
    return () => clearInterval(interval);
  }, []);

  return data;
};

const StatCard = ({ title, value, unit, icon: Icon, color, trend }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group">
    <div className="flex items-start justify-between mb-4">
      <div className={cn("p-2 rounded-lg bg-opacity-10", color)}>
        <Icon className={cn("w-5 h-5", color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <span className={cn("text-[10px] font-mono flex items-center gap-0.5 font-bold", trend > 0 ? "text-emerald-400" : "text-rose-400")}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{title}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        <span className="text-xs text-slate-500 font-mono">{unit}</span>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const stats = useStats();
  const [isRebooting, setIsRebooting] = React.useState(false);
  const [isBackingUp, setIsBackingUp] = React.useState(false);
  const [firmwareStatus, setFirmwareStatus] = React.useState<'idle' | 'checking' | 'latest'>('idle');

  const handleReboot = () => {
    if (confirm('System-wide reboot requested. All active tunnel connections will be dropped. Proceed with kernel reset?')) {
      setIsRebooting(true);
      setTimeout(() => {
        setIsRebooting(false);
        alert('Kernel reset successful. All modules back online.');
      }, 3000);
    }
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      alert('Vault state exported. Registry backup complete.');
    }, 2000);
  };

  const handleFirmwareCheck = () => {
    setFirmwareStatus('checking');
    setTimeout(() => setFirmwareStatus('latest'), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white uppercase italic">Nexus_Core_OS <span className="text-blue-500">v5.1</span></h1>
          <p className="text-slate-500 text-sm max-w-lg font-medium tracking-tighter uppercase">
            Real-time telemetry and OSI Layer-7 packet analysis. Kernel: 6.10.x-RT
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-slate-400 hover:text-white"
          >
            <Activity className={cn("w-3.5 h-3.5", isBackingUp && "animate-spin")} />
            <span>{isBackingUp ? 'Exporting...' : 'Backup'}</span>
          </button>
          <button 
            onClick={handleFirmwareCheck}
            disabled={firmwareStatus !== 'idle'}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-slate-400 hover:text-white"
          >
            <Shield className={cn("w-3.5 h-3.5", firmwareStatus === 'checking' && "animate-pulse")} />
            <span>
              {firmwareStatus === 'idle' ? 'Check FW' : 
               firmwareStatus === 'checking' ? 'Querying...' : 'LATEST'}
            </span>
          </button>
          <button 
            onClick={handleReboot}
            disabled={isRebooting}
            className="px-4 py-2 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600/20 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-rose-500"
          >
            <Zap className={cn("w-3.5 h-3.5", isRebooting && "animate-spin")} />
            <span>{isRebooting ? 'Resetting...' : 'Reboot'}</span>
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Internet Inbound" 
          value="42.8" unit="Mbps" 
          icon={ArrowDownLeft} 
          color="bg-emerald-500" 
          trend={12.4} 
        />
        <StatCard 
          title="Internet Outbound" 
          value="8.2" unit="Mbps" 
          icon={ArrowUpRight} 
          color="bg-blue-500" 
          trend={-2.1} 
        />
        <StatCard 
          title="Active Sessions" 
          value="1,284" unit="CONNS" 
          icon={Activity} 
          color="bg-purple-500" 
          trend={4.8} 
        />
        <StatCard 
          title="PPPoE Tunnels" 
          value="12" unit="LIVE" 
          icon={Monitor} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="IPoE Leases" 
          value="45" unit="DHCP" 
          icon={Network} 
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Threats" 
          value="0" unit="BLOCKED" 
          icon={Shield} 
          color="bg-rose-500" 
        />
      </div>

      {/* Main Graph Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Internet Real-time Throughput (Aggregated)</h3>
            <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest uppercase">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-blue-400">▼ 842 Mbps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                <span className="text-purple-400">▲ 124 Mbps</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats}>
                <defs>
                  <linearGradient id="colorRx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} 
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rx" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRx)" 
                  animationDuration={1000}
                />
                <Area 
                  type="monotone" 
                  dataKey="tx" 
                  stroke="#a855f7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTx)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-4 border-t border-slate-800 pt-6">
            <div className="text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PACKET RATE</div>
              <div className="font-mono text-sm font-bold text-white">128k p/s</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">LATENCY</div>
              <div className="font-mono text-sm font-bold text-white">14ms</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">DNS REQ</div>
              <div className="font-mono text-sm font-bold text-white">4.2k/m</div>
            </div>
            <div className="text-center border-l border-slate-800">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">WAN IP</div>
              <div className="font-mono text-sm font-bold text-blue-400 underline decoration-blue-500/30">82.14.99.12</div>
            </div>
          </div>
        </div>

        {/* Sidebar Mini-Dash */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">System Resources</h4>
            <div className="space-y-5">
              {[
                { label: 'CPU (Core i7-11700K)', val: 14, color: 'bg-emerald-500' },
                { label: 'RAM (DDR4 32GB)', val: 22, color: 'bg-blue-500' },
                { label: 'Temp (System)', val: 38, color: 'bg-yellow-500' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-slate-400 uppercase tracking-tighter">{item.label}</span>
                    <span className="text-white">{item.val}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Firewall Log (Live)</h3>
            <div className="space-y-2 font-mono text-[9px] h-32 overflow-hidden relative">
              {[
                { type: 'DROP', cls: 'text-rose-500', src: '192.168.1.12', dst: '104.22.1.8 (443)' },
                { type: 'PASS', cls: 'text-emerald-500', src: '82.1.2.34', dst: '192.168.10.5 (80)' },
                { type: 'DROP', cls: 'text-rose-500', src: '45.1.2.99', dst: 'SysPort (22)' },
                { type: 'PASS', cls: 'text-emerald-500', src: '192.168.1.5', dst: 'VPN Gateway' },
                { type: 'DROP', cls: 'text-rose-500', src: '103.2.14.8', dst: 'Block (RU)' }
              ].map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className={cn("uppercase font-bold w-10", log.cls)}>[{log.type}]</span>
                  <span className="text-slate-500">{log.src}</span>
                  <span className="text-slate-300">→ {log.dst}</span>
                </div>
              ))}
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
            </div>
            <button className="w-full mt-4 py-2 bg-slate-800 border border-slate-700 rounded text-[10px] uppercase font-bold tracking-widest hover:bg-slate-700 transition-colors text-white">
              Open Security Center
            </button>
          </div>
        </div>
      </div>

      {/* Traffic Analysis Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Traffic Analysis (OSI L7)</h3>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Top bandwidth consumers by protocol</p>
          </div>
          <button className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors uppercase tracking-widest">
            Full Metrics <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 uppercase tracking-widest border-b border-slate-800">
                <th className="pb-4 font-mono font-bold">Source Host</th>
                <th className="pb-4 font-mono font-bold">Protocol Matrix</th>
                <th className="pb-4 font-mono font-bold">Bandwidth</th>
                <th className="pb-4 font-mono font-bold text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[
                { host: 'MacBook Pro (192.168.1.45)', app: 'HTTPS/SSL', usage: '12.4 MB/s', p: 80, c: 'bg-blue-500' },
                { host: 'NAS-Storage (192.168.1.2)', ip: 'WIREGUARD', usage: '28.1 MB/s', p: 40, c: 'bg-emerald-500' },
                { host: 'Smart TV (192.168.1.18)', app: 'VOIP/UDP', usage: '18.2 MB/s', p: 25, c: 'bg-purple-500' },
              ].map((row, i) => (
                <tr key={i} className="group hover:bg-slate-800/30 transition-colors font-mono">
                  <td className="py-4 font-bold text-slate-300 uppercase tracking-tighter">{row.host}</td>
                  <td className="py-4 text-slate-500">{row.app || row.ip}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", row.c)} style={{ width: `${row.p}%` }} />
                      </div>
                      <span className="font-bold text-slate-300">{row.usage}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <span className={cn("px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white/50 text-[9px] font-bold uppercase tracking-widest")}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
