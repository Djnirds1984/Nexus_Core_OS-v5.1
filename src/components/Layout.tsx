import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Users, 
  Settings, 
  Activity, 
  Cpu, 
  Server,
  Database,
  Lock,
  Wifi,
  MoreVertical,
  LogOut,
  ChevronRight,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../lib/firebase';
import Login from './Login';
import { useLocalization, Language, Currency } from '../context/LocalizationContext';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'ms', label: 'Malaysia', flag: '🇲🇾' },
  { code: 'ar', label: 'العر بية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
];

const CURRENCIES = ['USD', 'IDR', 'MYR', 'SAR', 'INR', 'NGN', 'KES', 'PHP'];

/**
 * Utility for Tailwind class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Monitor', icon: LayoutDashboard, path: '/' },
  { id: 'interfaces', label: 'Interfaces', icon: Network, path: '/interfaces' },
  { id: 'wan', label: 'WAN Setup', icon: Globe, path: '/wan' },
  { id: 'pppoe', label: 'PPPoE Server', icon: Cpu, path: '/pppoe' },
  { id: 'subscribers', label: 'Subscribers', icon: Users, path: '/subscribers' },
  { id: 'ipoe', label: 'IPoE / DHCP', icon: Database, path: '/ipoe' },
  { id: 'dhcp', label: 'DHCP Pool', icon: Server, path: '/dhcp' },
  { id: 'firewall', label: 'Firewall', icon: ShieldCheck, path: '/firewall' },
  { id: 'vpn', label: 'VPN Connect', icon: Lock, path: '/vpn' },
  { id: 'hotspot', label: 'Hotspot Gateway', icon: Wifi, path: '/hotspot' },
  { id: 'stats', label: 'Analysis', icon: Activity, path: '/analysis' },
  { id: 'system', label: 'System', icon: Settings, path: '/system' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();
  const { language, setLanguage, currency, setCurrency, t, isRTL } = useLocalization();

  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: isRTL ? 280 : -280 }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? 280 : -280 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className={cn(
              "fixed inset-y-0 w-70 bg-slate-900 border-slate-800 z-50 flex flex-col",
              isRTL ? "right-0 border-l" : "left-0 border-r"
            )}
          >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
                TR
              </div>
              <span className="font-bold text-lg tracking-tight text-white uppercase">
                TITAN <span className="text-blue-500">Nexus</span>
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">{t('dashboard')}</div>
              {MENU_ITEMS.slice(0, 1).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
                      isActive 
                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 font-medium" 
                        : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                    <span className="text-sm">{t(item.id)}</span>
                  </Link>
                );
              })}

              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mt-6 mb-2">Networking</div>
              {MENU_ITEMS.slice(1, 7).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
                      isActive 
                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 font-medium" 
                        : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                    <span className="text-sm">{t(item.id)}</span>
                  </Link>
                );
              })}

              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mt-6 mb-2">Security & Services</div>
              {MENU_ITEMS.slice(7).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
                      isActive 
                        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 font-medium" 
                        : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                    <span className="text-sm">{t(item.id)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Region Configuration */}
            <div className="p-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic">Region Config</span>
                <Globe className="w-3 h-3 text-slate-700" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-400 outline-none focus:border-blue-500 transition-all appearance-none"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                  ))}
                </select>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-400 outline-none focus:border-blue-500 transition-all appearance-none"
                >
                  {CURRENCIES.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer / User */}
            <div className="p-4 border-t border-slate-800 space-y-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.email === 'aldrincabanez9@gmail.com' ? 'Super Admin' : 'Active User'}</span>
                  <span className="text-[10px] text-emerald-500 font-mono italic px-2 py-0.5 bg-emerald-500/10 rounded">ONLINE</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] font-bold text-slate-300 truncate">{user?.displayName || user?.email?.split('@')[0]}</span>
                    <span className="text-[8px] text-slate-600 uppercase tracking-widest truncate">{user?.email === 'aldrincabanez9@gmail.com' ? 'Architect' : 'Operator'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => auth.signOut()}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400/70 hover:text-rose-400 hover:bg-rose-400/5 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('terminate')}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0",
        isSidebarOpen ? (isRTL ? "pr-70" : "pl-70") : "pl-0"
      )}>
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-500" />
            </button>
            <h2 className="text-xl font-medium tracking-tight text-slate-200">Operational Intelligence</h2>
            <div className="hidden md:flex gap-4 border-l border-slate-700 pl-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">Uplink: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter font-bold">VPN Nodes: 14</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-slate-200">{user?.displayName || 'User'}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {user?.email === 'aldrincabanez9@gmail.com' ? 'Super Admin' : 'Network Operator'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-slate-300 overflow-hidden">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 (user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()
               )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

