'use client'

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const BackgroundEffect: React.FC = () => {
  const { scrollY } = useScroll();
  
  // Map scroll position to opacity and scale for the fade-out effect
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.1]);
  const rotate = useTransform(scrollY, [0, 600], [0, -10]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#050505] -z-50 pointer-events-none">
      {/* Static Grain Texture */}
      <div 
        className="absolute inset-0 opacity-[0.07] z-[1] mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div 
        style={{ opacity, scale, rotate }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vh] h-[90vh] md:w-[140vh] md:h-[140vh]"
      >
        <div className="relative w-full h-full">
          {/* Primary Blue Aura Layer - Organic Movement */}
          <motion.div 
            className="absolute inset-0"
            animate={{
              rotate: 360,
              scale: [1, 1.15, 0.9, 1.1, 1],
              x: [0, 60, -40, 50, -20, 0],
              y: [0, -50, 30, -60, 40, 0],
            }}
            transition={{
              rotate: { duration: 60, ease: "linear", repeat: Infinity },
              scale: { duration: 29, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
              x: { duration: 37, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
              y: { duration: 43, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
            }}
          >
             <div className="w-full h-full rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#2A70F1_120deg,transparent_240deg)] blur-[80px] md:blur-[140px] opacity-50 mix-blend-screen" />
          </motion.div>

          {/* Secondary Cyan Aura Layer - Counter Movement */}
          <motion.div 
            className="absolute inset-0"
            animate={{
              rotate: -360,
              scale: [1, 0.85, 1.1, 0.95, 1],
              x: [0, -40, 30, -50, 20, 0],
              y: [0, 40, -20, 50, -30, 0],
            }}
            transition={{
              rotate: { duration: 70, ease: "linear", repeat: Infinity },
              scale: { duration: 31, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
              x: { duration: 41, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
              y: { duration: 47, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
            }}
          >
             <div className="w-full h-full rounded-full bg-[conic-gradient(from_180deg,transparent_0deg,#22d3ee_90deg,transparent_210deg)] blur-[80px] md:blur-[120px] opacity-30 mix-blend-screen" />
          </motion.div>

          {/* Inner Hollow Mask to create the 'Globe' feel */}
          <motion.div 
             className="absolute inset-[25%] bg-[#050505] rounded-full blur-[60px] md:blur-[90px]" 
             animate={{ scale: [0.9, 1.1, 0.95, 1.05, 0.9] }}
             transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default BackgroundEffect;
