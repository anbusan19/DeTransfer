'use client'

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DeTransferLogo } from './Logos';
const Footer: React.FC = () => {
  return (
    <footer className="relative pt-32 pb-12 px-6 md:px-12 bg-black/20 overflow-hidden">
      
      {/* Background Radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-eco-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center mb-32">
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           className="mb-6 font-mono text-xs tracking-[0.2em] text-gray-500 uppercase"
        >
          One Click. Full Send.
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-sans text-white mb-12"
        >
          Privacy is not a Choice
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="relative w-full max-w-md group"
        >
          <input 
            type="email" 
            placeholder="Stay updated" 
            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button className="absolute right-2 top-2 bottom-2 aspect-square bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors">
            <ArrowRight size={16} />
          </button>
        </motion.div>
        <p className="mt-4 text-gray-600 text-xs">By submitting your email you agree to the <span className="text-gray-400 hover:text-white cursor-pointer">privacy policy</span></p>
      </div>

      {/* Links Grid */}
      <div className="relative z-10 max-w-7xl mx-auto border-t border-white/10 pt-12 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-0">
        <div className="md:col-span-2 flex items-start">
          <a href="#" className="flex items-center gap-2 text-2xl font-sans font-medium text-white">
             <DeTransferLogo className="h-6 md:h-8 w-auto text-white" />
             DeTransfer
          </a>
        </div>

        <div className="space-y-4">
          <h4 className="font-mono text-white text-sm mb-6">Socials</h4>
          <ul className="space-y-3 font-sans text-sm text-gray-400">
            <li><a href="#" className="hover:text-white transition-colors">X</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
            <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
            <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-mono text-white text-sm mb-6">DeTransfer</h4>
          <ul className="space-y-3 font-sans text-sm text-gray-400">
             <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Jobs</a></li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto mt-24 flex justify-between text-xs text-gray-600 font-sans">
        <p>© 2025 DeTransfer. All Rights Reserved.</p>
        <p>Site by AlphaTaco</p>
      </div>
    </footer>
  );
};

export default Footer;