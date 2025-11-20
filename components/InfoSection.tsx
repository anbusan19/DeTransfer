'use client'

import React from 'react';
import { motion } from 'framer-motion';

const InfoSection: React.FC = () => {
  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-transparent to-[#080808]/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
        
        {/* Left: Main Value Prop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-sans font-normal text-white leading-tight">
            DeTransfer is a decentralized file-transfer network enabling 

            <span className="text-eco-accent/80"> secure, real-time, and private</span> movement of data across users.
          </h2>
        </motion.div>


 
        {/* Right: Detailed text */}
        <div className="space-y-12 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-gray-400 font-inter font-light leading-relaxed">
              DeTransfer makes file sharing seamless in a Web3 world — combining client-side encryption, decentralized storage, and on-chain access control.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-gray-400 font-inter font-light leading-relaxed">
              DeTransfer’s programmable access policies and routing ensure flexible, secure, and efficient transfer of files under your control.
            </p>
          </motion.div>

           <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="h-[1px] w-full bg-gradient-to-r from-gray-800 to-transparent mt-12"
          />
        </div>
      </div>
    </section>
  );
};

export default InfoSection;