'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, X, ArrowRight, CheckCircle2, User, Paperclip, Lock, Database, Wifi } from 'lucide-react';

// --- Transfer Simulation Component ---
const TransferSimulation: React.FC = () => {
  const rows = 12;
  const cols = 8;
  const [grid, setGrid] = useState<number[][]>(
    Array(rows).fill(0).map(() => Array(cols).fill(0))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid((prevGrid) =>
        prevGrid.map((row, rowIndex) => {
          // Create a flowing effect: shift right, add new random value at start
          // Different probabilities based on row index for variety
          const activity = Math.sin(Date.now() / 500 + rowIndex) > 0 ? 0.8 : 0.3;
          const newValue = Math.random() > (1 - activity * 0.5) 
            ? (Math.random() > 0.5 ? 2 : 1) 
            : 0;
          return [newValue, ...row.slice(0, -1)];
        })
      );
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#080808] rounded-2xl border border-white/10 p-6 relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-eco-accent/5 to-transparent h-[200%] w-full animate-[scan_3s_linear_infinite] pointer-events-none" />
      
      <div className="flex justify-between w-full mb-6 px-2">
        <div className="flex flex-col gap-1">
           <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Status</span>
           <span className="text-xs font-mono text-eco-accent animate-pulse">ENCRYPTING</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
           <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Packets</span>
           <span className="text-xs font-mono text-white">SENDING</span>
        </div>
      </div>

      {/* Digital Sprite Grid */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-[1px] transition-colors duration-150 ${
              cell === 2
                ? 'bg-eco-accent shadow-[0_0_8px_rgba(42,112,241,0.8)]'
                : cell === 1
                ? 'bg-eco-accent/40'
                : 'bg-[#111]'
            }`}
          />
        ))}
      </div>

      {/* Bottom Info */}
      <div className="mt-8 w-full flex items-center justify-between border-t border-white/5 pt-4">
         <div className="flex items-center gap-2">
            <Lock size={12} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 font-mono">AES-256-GCM</span>
         </div>
         <div className="flex items-center gap-2">
            <Database size={12} className="text-gray-500" />
             <span className="text-[10px] text-gray-500 font-mono">Walrus Blob</span>
         </div>
      </div>
    </div>
  );
};

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [recipient, setRecipient] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = () => {
    if (!file || !recipient) return;
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setUploadComplete(true);
    }, 3500); // Extended duration to show off animation
  };

  const resetUpload = () => {
    setFile(null);
    setRecipient('');
    setUploadComplete(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-24 px-4 md:px-6 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-eco-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
        
        {/* Main Upload Card */}
        <AnimatePresence mode='wait'>
          {!uploadComplete ? (
            <motion.div 
              layout
              key="upload-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden z-20"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
              
              <h2 className="text-3xl font-sans text-white mb-2">Secure Transfer</h2>
              <p className="text-gray-400 mb-8 font-light text-sm">Encrypt and stream your file to the decentralized network.</p>

              <div className="space-y-6">
                
                {/* Recipient Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <User size={12} />
                    Recipient Address (Sui / ETH / Sol)
                  </label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-eco-accent/50 focus:bg-white/10 transition-all font-mono text-sm"
                    />
                    <div className="absolute inset-0 rounded-xl bg-eco-accent/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                </div>

                {/* File Dropzone */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Paperclip size={12} />
                    Attachment
                  </label>
                  
                  {!file ? (
                    <div 
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group ${
                        isDragOver 
                          ? 'border-eco-accent bg-eco-accent/10' 
                          : 'border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-white/20'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                      <div className={`p-4 rounded-full transition-colors ${isDragOver ? 'bg-eco-accent text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                        <UploadCloud size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-300 font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">Max file size 5GB (Zero-Knowledge Encrypted)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-eco-accent/10 rounded-lg flex items-center justify-center text-eco-accent">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[200px] md:max-w-[300px]">{file.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button 
                  onClick={handleUpload}
                  disabled={!file || !recipient || isUploading}
                  className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                    !file || !recipient 
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed' 
                      : 'bg-eco-accent text-white hover:bg-blue-600 hover:scale-[1.01] shadow-eco-accent/20'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      Transfer File
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="success-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl mx-auto"
            >
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-sans text-white mb-4">Transfer Initiated</h2>
              <p className="text-gray-400 mb-8 font-light">
                Your file has been encrypted and is being broadcasted to the Seal network. The recipient can access it once finality is reached.
              </p>
              <div className="bg-white/5 rounded-xl p-4 mb-8 border border-white/10">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Transaction Hash</p>
                <p className="font-mono text-eco-accent text-xs break-all">0x7f9a...3b2c</p>
              </div>
              <button 
                onClick={resetUpload}
                className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                Send Another File
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side Animation Panel (Appears during upload) */}
        <AnimatePresence>
          {isUploading && !uploadComplete && (
            <motion.div
              initial={{ opacity: 0, x: 40, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: 20, width: 0, transition: { duration: 0.3 } }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden md:block h-[420px] w-[300px] z-10 shrink-0"
            >
              <TransferSimulation />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default UploadPage;
    