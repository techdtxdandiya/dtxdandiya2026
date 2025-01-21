import React from 'react';
import { motion } from 'framer-motion';

export default function Livestream() {
  return (
    <div className="bg-black relative overflow-hidden py-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black">
          <div className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.08), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(220, 38, 38, 0.08), transparent 70%)
              `
            }}
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text inline-block relative">
            Live Stream
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 rounded-lg blur-lg -z-10"></div>
          </h2>
        </motion.div>

        {/* Video Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-red-500/20">
            <div className="space-y-6">
              {/* YouTube Embed */}
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-red-500/20">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/VpE0IVrtri0"
                  title="DTX Dandiya 2025 Livestream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute -inset-px pointer-events-none">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-red-500/20 rounded-tl-lg"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-red-500/20 rounded-tr-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-red-500/20 rounded-bl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-red-500/20 rounded-br-lg"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 