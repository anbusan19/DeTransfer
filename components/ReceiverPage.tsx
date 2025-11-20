'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Lock, Unlock, FileText, Clock, RefreshCw, Shield, CheckCircle2, HardDrive, Zap } from 'lucide-react';

// --- Decryption Simulation Component ---
const DecryptionSimulation: React.FC = () => {
  const rows = 12;
  const cols = 8;
  const [grid, setGrid] = useState<number[][]>(
    Array(rows).fill(0).map(() => Array(cols).fill(0))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid((prevGrid) =>
        prevGrid.map((row) => {
          // Matrix rain effect: shift down, add new random value at top
          const newValue = Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : 1) : 0;
          return [newValue, ...row.slice(0, -1)];
        })
      );
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#080808] rounded-2xl border border-white/10 p-6 relative overflow-hidden">
      {/* Blue Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-eco-accent/5 to-transparent h-[200%] w-full animate-[scan_2s_linear_infinite] pointer-events-none" />
      
      <div className="flex justify-between w-full mb-6 px-2">
        <div className="flex flex-col gap-1">
           <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Process</span>
           <span className="text-xs font-mono text-eco-accent animate-pulse">DECRYPTING</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
           <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Validation</span>
           <span className="text-xs font-mono text-white">VERIFYING</span>
        </div>
      </div>

      {/* Digital Sprite Grid - Transposed for visual variety from Upload */}
      <div className="flex gap-1.5">
        {Array(cols).fill(0).map((_, colIndex) => (
           <div key={colIndex} className="flex flex-col gap-1.5">
              {grid.map((row, rowIndex) => {
                 const val = row[colIndex];
                 return (
                    <div
                        key={`${colIndex}-${rowIndex}`}
                        className={`w-3 h-3 rounded-[1px] transition-colors duration-150 ${
                        val === 2
                            ? 'bg-eco-accent shadow-[0_0_8px_rgba(42,112,241,0.8)]'
                            : val === 1
                            ? 'bg-eco-accent/30'
                            : 'bg-[#111]'
                        }`}
                    />
                 );
              })}
           </div>
        ))}
      </div>

      {/* Bottom Info */}
      <div className="mt-8 w-full flex items-center justify-between border-t border-white/5 pt-4">
         <div className="flex items-center gap-2">
            <Shield size={12} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 font-mono">Seal Protocol</span>
         </div>
         <div className="flex items-center gap-2">
            <HardDrive size={12} className="text-gray-500" />
             <span className="text-[10px] text-gray-500 font-mono">Reassembling</span>
         </div>
      </div>
    </div>
  );
};

interface IncomingFile {
  id: string;
  name: string;
  size: string;
  sender: string;
  timestamp: string;
  status: 'locked' | 'decrypting' | 'ready';
}

const ReceiverPage: React.FC = () => {
  const [files, setFiles] = useState<IncomingFile[]>([
    { id: '1', name: 'Project_Nebula_Specs.pdf', size: '4.2 MB', sender: '0x71C...9A21', timestamp: '2 mins ago', status: 'locked' },
    { id: '2', name: 'Q3_Financial_Report.xlsx', size: '1.8 MB', sender: '0x3D2...B4C9', timestamp: '1 hour ago', status: 'locked' },
    { id: '3', name: 'audit_logs_v2.json', size: '840 KB', sender: '0x9F1...E2E2', timestamp: '3 hours ago', status: 'ready' },
  ]);
  
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const handleDecrypt = (id: string) => {
    // Set file to decrypting
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'decrypting' } : f));
    setActiveFileId(id);

    // Simulate decryption time
    setTimeout(() => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'ready' } : f));
      setActiveFileId(null);
    }, 3000);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 md:px-6 relative overflow-hidden">
       {/* Background Ambient Glow - Matched to Landing/Upload Blue */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-eco-accent/5 blur-[120px] rounded-full pointer-events-none" />

       <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-start justify-center gap-6 md:gap-8">
          
          {/* Main Dashboard Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-sans text-white mb-1">Incoming Transfers</h2>
                    <p className="text-gray-400 font-light text-sm">Manage and decrypt your secure files.</p>
                </div>
                <button className="p-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                    <RefreshCw size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                </button>
            </div>

            <div className="space-y-4">
                {files.map((file, index) => (
                    <motion.div 
                        key={file.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                            file.status === 'decrypting' 
                                ? 'bg-white/5 border-eco-accent/30' 
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                        }`}
                    >
                         {/* Progress Bar Background for Decrypting */}
                         {file.status === 'decrypting' && (
                             <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3, ease: "linear" }}
                                className="absolute inset-0 bg-eco-accent/10 z-0"
                             />
                         )}

                        <div className="relative z-10 p-4 flex items-center justify-between gap-4">
                            {/* File Info */}
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    file.status === 'ready' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500'
                                }`}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className={`font-medium text-sm ${file.status === 'ready' ? 'text-white' : 'text-gray-300'}`}>
                                        {file.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-mono">
                                        <span>{file.size}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-700" />
                                        <span>{file.sender}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="flex items-center justify-end gap-1.5 mb-0.5">
                                        {file.status === 'locked' && <Lock size={10} className="text-gray-500" />}
                                        {file.status === 'ready' && <Unlock size={10} className="text-white" />}
                                        {file.status === 'decrypting' && <Zap size={10} className="text-eco-accent" />}
                                        <span className={`text-[10px] font-mono uppercase tracking-wider ${
                                            file.status === 'decrypting' ? 'text-eco-accent animate-pulse' : 
                                            file.status === 'ready' ? 'text-white' : 'text-gray-500'
                                        }`}>
                                            {file.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-600">{file.timestamp}</p>
                                </div>

                                {file.status === 'locked' && (
                                    <button 
                                        onClick={() => handleDecrypt(file.id)}
                                        className="px-4 py-2 bg-white/5 hover:bg-eco-accent border border-white/10 hover:border-eco-accent/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all font-medium flex items-center gap-2 group"
                                    >
                                        <Shield size={14} className="group-hover:scale-110 transition-transform" />
                                        Decrypt
                                    </button>
                                )}
                                
                                {file.status === 'decrypting' && (
                                     <div className="px-4 py-2 flex items-center gap-2 text-eco-accent">
                                        <div className="w-4 h-4 border-2 border-eco-accent/30 border-t-eco-accent rounded-full animate-spin" />
                                     </div>
                                )}

                                {file.status === 'ready' && (
                                    <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                        <Download size={14} />
                                        Download
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
          </motion.div>

          {/* Side Simulation Panel */}
          <AnimatePresence>
             {activeFileId && (
                <motion.div
                    initial={{ opacity: 0, x: 20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 300 }}
                    exit={{ opacity: 0, x: 20, width: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="hidden md:block h-[420px] z-10 shrink-0 overflow-hidden"
                >
                    <DecryptionSimulation />
                </motion.div>
             )}
          </AnimatePresence>

       </div>
    </section>
  );
};

export default ReceiverPage;
    