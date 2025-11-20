'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Loader2, ShieldCheck, Globe, Zap } from 'lucide-react';
import { DeTransferLogo } from './Logos';

interface BridgePageProps {
  onConnect?: () => void;
}

const BridgePage: React.FC<BridgePageProps> = ({ onConnect }) => {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      // Trigger navigation to upload page
      if (onConnect) {
        onConnect();
      } else {
        router.push('/upload');
      }
    }, 2000);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 md:px-6 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-eco-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Glass Card */}
        <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          
          {/* Decorative sheen */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

          <div className="flex flex-col items-center text-center">
            
            {/* Icon Badge */}
            <div className="w-20 h-20 flex items-center justify-center mb-8">
              <DeTransferLogo className="h-6 md:h-8 w-auto text-white" />
            </div>

            <h1 className="text-3xl md:text-4xl font-sans text-white mb-4 tracking-tight">
              Connect to Bridge
            </h1>
            <p className="text-gray-400 mb-10 leading-relaxed font-light">
              Access the Portal Bridge to transfer files securely across Sui with zero-knowledge privacy.
            </p>

            {/* Action Button */}
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-4 bg-white text-black rounded-xl font-medium text-lg flex items-center justify-center gap-3 hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isConnecting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connecting Wallet...
                </>
              ) : (
                <>
                  Connect Wallet
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 w-full mt-10 pt-8 border-t border-white/5">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck size={16} className="text-gray-500" />
                <span className="text-[10px] uppercase tracking-wider text-gray-600 font-mono">Audited</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Globe size={16} className="text-gray-500" />
                <span className="text-[10px] uppercase tracking-wider text-gray-600 font-mono">Global</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap size={16} className="text-gray-500" />
                <span className="text-[10px] uppercase tracking-wider text-gray-600 font-mono">Instant</span>
              </div>
            </div>

          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-xs text-gray-600 font-sans">
            By connecting your wallet, you agree to our <a href="#" className="text-gray-500 hover:text-white transition-colors underline underline-offset-2">Terms of Service</a>.
          </p>
        </div>

      </motion.div>
    </section>
  );
};

export default BridgePage;
