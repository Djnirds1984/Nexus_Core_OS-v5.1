import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { LogIn, Shield, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-600/20">
            <Cpu className="w-10 h-10" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Titan Nexus</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Network Orchestration Core</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/20 font-black uppercase tracking-widest text-xs"
        >
          <LogIn className="w-5 h-5" />
          Authenticate with Google
        </button>

        <div className="mt-8 flex items-center gap-3 justify-center">
          <Shield className="w-4 h-4 text-slate-700" />
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">Zero Trust Identity Assurance</p>
        </div>
      </motion.div>
    </div>
  );
}
