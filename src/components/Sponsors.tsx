import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const sponsors = [
  { 
    name: 'Apple', 
    image: '/src/components/assets/sponsors/apple.png',
    website: 'https://www.apple.com'
  },
  { 
    name: 'Google', 
    image: '/src/components/assets/sponsors/google_logo.png',
    website: 'https://www.google.com'
  },
  { 
    name: 'Meta', 
    image: '/src/components/assets/sponsors/Meta-Logo.png',
    website: 'https://www.meta.com'
  }
];

// Magical particle effect
const MagicalSparkle = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`absolute w-1 h-1 bg-white rounded-full ${className}`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      filter: [
        'blur(0px)',
        'blur(2px)',
        'blur(0px)'
      ],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut"
    }}
  />
);

export default function Sponsors() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create floating runes effect
    const container = containerRef.current;
    if (!container) return;

    const createRune = () => {
      const rune = document.createElement('div');
      rune.className = 'absolute text-white/20 text-2xl font-["Harry_Potter"]';
      rune.style.left = `${Math.random() * 100}%`;
      rune.style.top = `${Math.random() * 100}%`;
      rune.style.opacity = '0';
      rune.style.transform = 'scale(0)';
      rune.textContent = '⚡';
      
      container.appendChild(rune);

      // Animate the rune
      const animation = rune.animate([
        { opacity: 0, transform: 'scale(0) translateY(0)' },
        { opacity: 0.3, transform: 'scale(1) translateY(-20px)' },
        { opacity: 0, transform: 'scale(0) translateY(-40px)' }
      ], {
        duration: 3000,
        easing: 'ease-out'
      });

      animation.onfinish = () => {
        rune.remove();
      };
    };

    const interval = setInterval(createRune, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative py-20 overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
      </div>

      {/* Floating Runes Container */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />

      <div className="relative z-10">
        {/* Title */}
        <motion.h2 
          className="text-6xl text-center mb-20 font-['Harry_Potter'] text-white glow-text-intense"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Our Magical Patrons
        </motion.h2>

        {/* Sponsors Grid */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {/* Magical Frame */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content Container */}
                <a 
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-black/40 backdrop-blur-sm rounded-lg p-6 transition-transform duration-500 group-hover:scale-[1.02]"
                >
                  {/* Sparkles */}
                  <MagicalSparkle className="top-0 left-1/4" />
                  <MagicalSparkle className="top-1/4 right-1/4" />
                  <MagicalSparkle className="bottom-1/4 left-1/3" />
                  
                  {/* Image */}
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <img 
                      src={sponsor.image}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}