'use client'

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Lock, Shield, Key, Check, FileText, User, Download, Database, Smartphone } from 'lucide-react';
import { WalrusLogo, SealLogo, SuiLogo } from './Logos';

const DemoSection: React.FC = () => {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.4,
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="bg-[#050505] py-32 px-4 overflow-x-auto select-none border-t border-white/5 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-1/3 h-full bg-eco-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-1/3 h-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="min-w-[1200px] max-w-7xl mx-auto relative h-[850px]">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="absolute top-0 right-0 flex items-center gap-4"
        >
            <div className="h-[1px] w-12 bg-eco-accent"></div>
            <span className="text-eco-accent font-mono text-xs tracking-widest uppercase">
                Protocol Workflow
            </span>
        </motion.div>

        {/* --- NODES --- */}

        {/* 1. SENDER (Left) */}
        <motion.div 
            variants={nodeVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="absolute top-[350px] left-10 w-72 z-20"
        >
            <div className="group border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl p-6 hover:border-eco-accent/50 transition-colors duration-300 relative shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <User size={20} className="text-white" />
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400">SENDER</div>
                </div>
                <h3 className="text-xl font-sans text-white mb-2">Local Encryption</h3>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-xs text-gray-400">
                        <div className="mt-0.5 w-1 h-1 rounded-full bg-eco-accent shrink-0" />
                        Generates AES-GCM key
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-400">
                        <div className="mt-0.5 w-1 h-1 rounded-full bg-eco-accent shrink-0" />
                        Encrypts & splits file chunks
                    </li>
                </ul>
            </div>
            <div className="mt-4 flex items-center gap-4 pl-4">
               <div className="h-[1px] w-8 bg-white/20"></div>
               <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Step 01</span>
            </div>
        </motion.div>

        {/* 2. WALRUS (Top Center) */}
        <motion.div 
             variants={nodeVariants}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="absolute top-20 left-[500px] w-72 z-20"
        >
            <div className="group border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl p-6 hover:border-[#99F6C6]/30 transition-colors duration-300 relative shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                   <div className="w-24 opacity-90">
                       <WalrusLogo className="w-full h-auto" />
                   </div>
                   <div className="px-2 py-0.5 rounded-full bg-[#99F6C6]/10 border border-[#99F6C6]/20 text-[10px] font-mono text-[#99F6C6]">STORAGE</div>
                </div>
                <h3 className="text-lg font-sans text-white mb-2">Decentralized Store</h3>
                 <p className="text-xs text-gray-400 leading-relaxed">
                    Stores encrypted file chunks and manifest. Returns a blob ID for on-chain registration.
                 </p>
            </div>
        </motion.div>

        {/* 3. SUI (Middle Center) */}
        <motion.div 
             variants={nodeVariants}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             transition={{ delay: 0.4 }}
             className="absolute top-[350px] left-[500px] w-72 z-20"
        >
             <div className="group border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl p-6 hover:border-[#4DA2FF]/30 transition-colors duration-300 relative shadow-2xl">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-12">
                       <SuiLogo className="w-full h-auto text-white" />
                   </div>
                   <div className="px-2 py-0.5 rounded-full bg-[#4DA2FF]/10 border border-[#4DA2FF]/20 text-[10px] font-mono text-[#4DA2FF]">LEDGER</div>
                 </div>
                 <h3 className="text-lg font-sans text-white mb-2">Metadata & Policy</h3>
                 <p className="text-xs text-gray-400 leading-relaxed mb-3">
                    Stores <code>FileObject</code> with Walrus ID and Seal Policy ID.
                 </p>
                 <div className="bg-white/5 rounded border border-white/5 p-2 text-[10px] font-mono text-gray-500">
                    struct FileObject &#123;<br/>
                    &nbsp;&nbsp;id: UID,<br/>
                    &nbsp;&nbsp;blob_id: String,<br/>
                    &nbsp;&nbsp;policy: PolicyID<br/>
                    &#125;
                 </div>
             </div>
        </motion.div>

        {/* 4. SEAL (Bottom Center) */}
        <motion.div 
             variants={nodeVariants}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             transition={{ delay: 0.6 }}
             className="absolute top-[650px] left-[500px] w-72 z-20"
        >
            <div className="group border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl p-6 hover:border-eco-accent/50 transition-colors duration-300 relative shadow-2xl">
                 <div className="flex items-center justify-between mb-4">
                   <div className="w-20">
                       <SealLogo className="w-full h-auto" />
                   </div>
                   <div className="px-2 py-0.5 rounded-full bg-eco-accent/10 border border-eco-accent/20 text-[10px] font-mono text-eco-accent">ENC / DEC</div>
                 </div>
                 <h3 className="text-lg font-sans text-white mb-2">Key Management</h3>
                 <p className="text-xs text-gray-400 leading-relaxed">
                    Stores symmetric key shares via threshold encryption. Validates access requests against on-chain policies.
                 </p>
            </div>
        </motion.div>

        {/* 5. RECIPIENT (Right) */}
        <motion.div 
             variants={nodeVariants}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             transition={{ delay: 0.8 }}
             className="absolute top-[350px] right-10 w-72 z-20"
        >
            <div className="group border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl p-6 hover:border-green-500/30 transition-colors duration-300 relative shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/5 p-2.5 rounded-lg border border-white/5">
                        <Download size={20} className="text-white" />
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400">RECIPIENT</div>
                </div>
                <h3 className="text-xl font-sans text-white mb-2">Decrypt & Download</h3>
                <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-xs text-gray-400">
                        <div className="mt-0.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                        Authenticates via Wallet
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-400">
                        <div className="mt-0.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                        Fetches chunks from Walrus
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-400">
                        <div className="mt-0.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                        Reassembles & decrypts
                    </li>
                </ul>
            </div>
            <div className="mt-4 flex flex-row-reverse items-center gap-4 pr-4">
               <div className="h-[1px] w-8 bg-white/20"></div>
               <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Final</span>
            </div>
        </motion.div>

        {/* --- LINES SVG LAYER --- */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="white" fillOpacity="0.3" />
                </marker>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2A70F1" stopOpacity="0" />
                    <stop offset="50%" stopColor="#2A70F1" stopOpacity="1" />
                    <stop offset="100%" stopColor="#2A70F1" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Path 1: Sender -> Walrus */}
            <motion.path 
                d="M 360 400 C 400 400, 450 160, 500 160" 
                fill="none" 
                stroke="white" 
                strokeWidth="1" 
                markerEnd="url(#arrowhead)"
                variants={draw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            />
            {/* Label 1 */}
            <motion.text x="380" y="280" fill="gray" fontSize="10" fontFamily="monospace" initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:1}}>
                Encrypted Chunks
            </motion.text>

            {/* Path 2: Sender -> Sui */}
            <motion.path 
                d="M 360 440 L 500 440" 
                fill="none" 
                stroke="white" 
                strokeWidth="1" 
                markerEnd="url(#arrowhead)"
                variants={draw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
            />
            <motion.text x="380" y="430" fill="gray" fontSize="10" fontFamily="monospace" initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:1.2}}>
                Register Metadata
            </motion.text>

            {/* Path 3: Sender -> Seal */}
            <motion.path 
                d="M 360 480 C 400 480, 400 700, 500 700" 
                fill="none" 
                stroke="white" 
                strokeWidth="1" 
                markerEnd="url(#arrowhead)"
                variants={draw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
            />
            <motion.text x="380" y="600" fill="gray" fontSize="10" fontFamily="monospace" initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:1.4}}>
                Key & Policy
            </motion.text>

            {/* Path 4: Seal <-> Sui (Validation) - DRAWING TOP TO BOTTOM */}
            <motion.path 
                d="M 640 480 L 640 650" 
                fill="none" 
                stroke="#2A70F1" 
                strokeWidth="1.5" 
                strokeDasharray="4 4"
                variants={draw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
            />
            <motion.text x="650" y="620" fill="#2A70F1" fontSize="10" fontFamily="monospace" initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:1.6}}>
                Policy Check
            </motion.text>

            {/* Path 5: Recipient -> Seal (Request) */}
            <motion.path 
                d="M 910 480 C 870 480, 870 700, 772 700" 
                fill="none" 
                stroke="white" 
                strokeWidth="1" 
                markerEnd="url(#arrowhead)"
                variants={draw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
            />
            <motion.text x="820" y="600" fill="gray" fontSize="10" fontFamily="monospace" initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:1.8}}>
                Auth & Request
            </motion.text>

            {/* Path 6: Seal -> Recipient (Key Return) */}
            <motion.path 
                d="M 772 720 C 880 720, 880 520, 910 500" 
                fill="none" 
                stroke="#99F6C6" 
                strokeWidth="1" 
                strokeDasharray="2 2"
                variants={draw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 1.0 }}
            />

            {/* Path 7: Walrus -> Recipient */}
            <motion.path 
                d="M 772 160 C 850 160, 850 400, 910 400" 
                fill="none" 
                stroke="white" 
                strokeWidth="1" 
                markerEnd="url(#arrowhead)"
                variants={draw}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: 1.2 }}
            />
             <motion.text x="820" y="280" fill="gray" fontSize="10" fontFamily="monospace" initial={{opacity:0}} whileInView={{opacity:1}} transition={{delay:2.0}}>
                Download
            </motion.text>

        </svg>
      </div>
    </section>
  );
};

export default DemoSection;
