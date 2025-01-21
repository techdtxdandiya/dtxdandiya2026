import React from 'react';
import { motion } from 'framer-motion';

export default function Livestream() {
  return (
    <div className="bg-black relative overflow-hidden py-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black">
          <div className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.15), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.15), transparent 70%)
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
          <h2 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text-intense inline-block relative">
            Magical Mirror Stream
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 rounded-lg blur-lg -z-10"></div>
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
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20">
            <div className="space-y-6">
              {/* YouTube Embed */}
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-purple-500/20">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/VpE0IVrtri0"
                  title="DTX Dandiya 2025 Livestream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Watch on YouTube Button */}
              <div className="flex justify-center">
                <a
                  href="https://www.youtube.com/watch?v=VpE0IVrtri0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-all duration-300 border border-purple-500/30 hover:border-purple-500/50"
                >
                  <span className="text-white font-['Harry_Potter']">Watch on YouTube</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-300 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute -inset-px pointer-events-none">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-purple-500/30 rounded-tl-lg"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-purple-500/30 rounded-tr-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-purple-500/30 rounded-bl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-lg"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 