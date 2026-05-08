import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Activity, 
  Trash2, 
  Power, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Clock, 
  Download, 
  Upload,
  Search,
  Monitor,
  MoreVertical,
  MapPin,
  Phone,
  CreditCard,
  Info,
  Calendar,
  X,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLocalization } from '../context/LocalizationContext';
import { 
  subscribeToPPPoEUsers, 
  addPPPoEUser, 
  deletePPPoEUser, 
  updatePPPoEUser,
  subscribeToPPPoESessions,
  terminatePPPoESession,
  simulatePPPoESession
} from '../services/networkService';

export default function SubscriberManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'sessions'>('subscribers');
  const { t } = useLocalization();
  
  const generateCID = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ACC-${dateStr}-${random}`;
  };

  const getDefaultExpiry = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    // Format for datetime-local: YYYY-MM-DDThh:mm
    return date.toISOString().slice(0, 16);
  };

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    address: '',
    phone: '',
    service_name: 'DEFAULT',
    profile: 'residential_std',
    remote_address: '',
    cid: generateCID(),
    comment: '',
    rate_limit: '10M/10M',
    enabled: true,
    expiry_date: getDefaultExpiry()
  });

  const resetForm = () => {
    setNewUser({
      username: '',
      password: '',
      full_name: '',
      address: '',
      phone: '',
      service_name: 'DEFAULT',
      profile: 'residential_std',
      remote_address: '',
      cid: generateCID(),
      comment: '',
      rate_limit: '10M/10M',
      enabled: true,
      expiry_date: getDefaultExpiry()
    });
  };

  useEffect(() => {
    const unsubUsers = subscribeToPPPoEUsers(setUsers);
    const unsubSessions = subscribeToPPPoESessions(setSessions);
    return () => {
      unsubUsers();
      unsubSessions();
    };
  }, []);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return;
    await addPPPoEUser(newUser);
    setIsAdding(false);
    resetForm();
  };

  const toggleUser = async (user: any) => {
    await updatePPPoEUser(user.id, { enabled: !user.enabled });
  };

  const deleteUser = async (id: string) => {
    if (confirm('Permanently delete subscriber record?')) {
      await deletePPPoEUser(id);
    }
  };

  const handleSimulate = async (username: string) => {
    await simulatePPPoESession(username);
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.service_name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSessions = sessions.filter(s => 
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    s.remote_ip.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 uppercase italic text-blue-500 font-mono">{t('subscribers')}</h1>
          <p className="text-slate-500 text-sm max-w-xl font-medium tracking-wide">Orchestrate PPPoE authentication and live session lifecycle management.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-300 focus:border-blue-500 outline-none transition-all w-48 font-mono"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest text-white shadow-lg shadow-blue-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('provision')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50 self-start w-fit">
        <button 
          onClick={() => setActiveTab('subscribers')}
          className={cn(
            "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'subscribers' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
          )}
        >
          Subscriber DB ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('sessions')}
          className={cn(
            "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'sessions' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
          )}
        >
          Live Tunnels ({sessions.length})
        </button>
      </div>

      {activeTab === 'subscribers' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={user.id} 
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative group overflow-hidden"
              >
                {/* Background Decor */}
                <div className={cn(
                  "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 blur-3xl rounded-full opacity-10 transition-colors",
                  user.enabled ? "bg-emerald-500" : "bg-rose-500"
                )} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner",
                        user.enabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-slate-950 border-slate-800 text-slate-700"
                      )}>
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-mono text-white text-sm font-bold tracking-tight">{user.username}</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.full_name || 'Generic Subscriber'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                       <button 
                        onClick={() => toggleUser(user)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          user.enabled ? "text-emerald-500 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-slate-800"
                        )}
                        title={user.enabled ? "Disable Subscriber" : "Enable Subscriber"}
                       >
                         <Power className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Remove Record"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-2 flex items-center gap-2">
                       <CreditCard className="w-3 h-3 text-slate-600" />
                       <div className="overflow-hidden">
                         <span className="block text-[7px] text-slate-600 font-black uppercase tracking-widest">{t('cid')}</span>
                         <span className="text-[10px] text-slate-300 font-mono truncate block">{user.cid || 'N/A'}</span>
                       </div>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800/50 rounded-lg p-2 flex items-center gap-2">
                       <Phone className="w-3 h-3 text-slate-600" />
                       <div className="overflow-hidden">
                         <span className="block text-[7px] text-slate-600 font-black uppercase tracking-widest">{t('phone')}</span>
                         <span className="text-[10px] text-slate-300 font-mono truncate block">{user.phone || 'N/A'}</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                       <div className="flex items-center gap-2">
                          <Activity className="w-3 h-3 text-blue-500" />
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest tracking-widest">{t('profile')}: {user.profile || 'std'}</span>
                       </div>
                       <span className="text-[10px] font-mono text-blue-400 font-bold">{user.rate_limit}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px]">
                      <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                      <span className="text-slate-400 truncate">{user.address || 'No address registered'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div className="flex items-center gap-1.5">
                         <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px]", user.enabled ? "bg-emerald-500 shadow-emerald-500/50 animate-pulse" : "bg-rose-500 shadow-rose-500/50")} />
                         <span className={cn("text-[8px] font-black uppercase tracking-widest", user.enabled ? "text-emerald-500" : "text-rose-500")}>
                           {user.enabled ? "AUTH ENABLED" : "SUSPENDED"}
                         </span>
                       </div>
                       <button 
                         onClick={() => handleSimulate(user.username)}
                         className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/20 rounded text-[8px] font-black uppercase tracking-widest transition-all"
                       >
                         {t('testAuth')}
                       </button>
                    </div>

                    {user.expiry_date && (
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                          {t('expiry')}: {new Date(user.expiry_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {users.length === 0 && (
            <div className="col-span-full border border-dashed border-slate-800 rounded-xl p-20 flex flex-col items-center justify-center text-center">
              <Users className="w-16 h-16 text-slate-800 mb-4" />
              <p className="text-slate-500 font-medium mb-6">No subscribers provisioned in core database.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400"
              >
                Open Provisioning Portal
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {filteredSessions.map((session) => (
             <div key={session.id} className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 rounded-xl p-4 flex items-center justify-between transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500 animate-pulse">
                    <Wifi className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white font-mono">{session.username}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest">ESTABLISHED</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                      <span>{session.remote_ip}</span>
                      <span className="text-slate-700">•</span>
                      <span>{session.mac}</span>
                      <span className="text-slate-700">•</span>
                      <span>If: {session.interface}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12 text-right">
                  <div className="hidden lg:flex items-center gap-8">
                     <div className="space-y-1">
                       <span className="block text-[8px] text-slate-600 font-black uppercase tracking-widest text-right">RX Volume</span>
                       <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs font-bold">
                         <Download className="w-3 h-3" />
                         {(session.rx_bytes / 1024 / 1024).toFixed(2)} MB
                       </div>
                     </div>
                     <div className="space-y-1">
                       <span className="block text-[8px] text-slate-600 font-black uppercase tracking-widest text-right">TX Volume</span>
                       <div className="flex items-center gap-2 text-blue-500 font-mono text-xs font-bold">
                         <Upload className="w-3 h-3" />
                         {(session.tx_bytes / 1024 / 1024).toFixed(2)} MB
                       </div>
                     </div>
                     <div className="space-y-1">
                       <span className="block text-[8px] text-slate-600 font-black uppercase tracking-widest text-right">Uptime</span>
                       <div className="flex items-center gap-2 text-slate-400 font-mono text-xs font-bold">
                         <Clock className="w-3 h-3" />
                         {session.uptime}
                       </div>
                     </div>
                  </div>

                  <button 
                    onClick={() => terminatePPPoESession(session.id)}
                    className="p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    title="Terminate Session"
                  >
                    <WifiOff className="w-5 h-5" />
                  </button>
                </div>
             </div>
           ))}

           {sessions.length === 0 && (
             <div className="border border-dashed border-slate-800 rounded-xl p-24 flex flex-col items-center justify-center text-center">
                <Activity className="w-16 h-16 text-slate-800 mb-4" />
                <p className="text-slate-600 font-bold uppercase tracking-[0.2em] italic">No active tunnels detected</p>
             </div>
           )}
        </div>
      )}

      {/* Provisioning Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{t('provision')} ISP Subscriber</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">Full Account Deployment System • Mikrotik Layer 3 Integrated</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Auth Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <ShieldCheck className="w-4 h-4 text-blue-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication</span>
                    </div>
                                   <div className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('username')}</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                          <input 
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                            placeholder="pppoe_user"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('password')}</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-600 font-mono">***</span>
                          <input 
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            type="password"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Static IP assignment (Optional)</label>
                        <div className="relative">
                          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                          <input 
                            value={newUser.remote_address}
                            onChange={(e) => setNewUser({...newUser, remote_address: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                            placeholder="10.0.0.x"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Customer Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                       <Users className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Profile</span>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('fullName')}</label>
                        <input 
                          value={newUser.full_name}
                          onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all text-slate-200"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('phone')}</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                          <input 
                            value={newUser.phone}
                            onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                            placeholder="+63 9xx xxx xxxx"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('accountNumber')}</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                          <input 
                            value={newUser.cid}
                            onChange={(e) => setNewUser({...newUser, cid: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all font-mono text-slate-200 uppercase"
                            placeholder="ACC-XXXX"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="mt-8 space-y-6">
                   <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('address')}</label>
                    <div className="relative">
                       <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                       <textarea 
                        value={newUser.address}
                        onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all text-slate-200 min-h-[80px]"
                        placeholder="Street, Barangay, City, Zip Code"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('profile')}</label>
                      <select 
                        value={newUser.profile}
                        onChange={(e) => setNewUser({...newUser, profile: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                      >
                        <option value="residential_std">RESIDENTIAL STD</option>
                        <option value="residential_plus">RESIDENTIAL PLUS</option>
                        <option value="corporate_prem">CORPORATE PREM</option>
                        <option value="dedicated_dia">DEDICATED DIA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('limits')}</label>
                      <select 
                        value={newUser.rate_limit}
                        onChange={(e) => setNewUser({...newUser, rate_limit: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-xs focus:border-blue-500 outline-none transition-all font-mono text-slate-200"
                      >
                        <option value="5M/5M">5M / 5M</option>
                        <option value="10M/10M">10M / 10M</option>
                        <option value="20M/20M">20M / 20M</option>
                        <option value="50M/50M">50M / 50M</option>
                        <option value="100M/100M">100M / 100M</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{t('expiry')}</label>
                        <button 
                          onClick={() => setNewUser({...newUser, expiry_date: ''})}
                          className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
                        >
                          {t('clear')}
                        </button>
                      </div>
                      <div className="relative group/picker">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover/picker:text-blue-500 transition-colors pointer-events-none" />
                        <input 
                          type="datetime-local"
                          value={newUser.expiry_date}
                          onChange={(e) => setNewUser({...newUser, expiry_date: e.target.value})}
                          onClick={(e) => {(e.target as any).showPicker?.()}}
                          className={cn(
                            "w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-xs focus:border-blue-500 outline-none transition-all font-mono cursor-pointer",
                            newUser.expiry_date ? "text-slate-200" : "text-slate-600"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Administrative Notes</label>
                    <div className="relative">
                       <Info className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                       <textarea 
                        value={newUser.comment}
                        onChange={(e) => setNewUser({...newUser, comment: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all text-slate-200 min-h-[60px]"
                        placeholder="Additional notes for billing or field technicians..."
                       />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-800 bg-slate-900/50 text-right">
                <button 
                  onClick={handleAddUser}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Database className="w-4 h-4 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  {t('commit')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
