import { motion } from 'framer-motion';

const SPONSORS = [
  {
    name: "City of Richardson",
    logo: "/assets/sponsors/richardson.png",
    url: "https://www.cor.net/home"
  },
  {
    name: "Raising Cane's Chicken Fingers",
    logo: "/assets/sponsors/canes.png",
    url: "https://www.raisingcanes.com/home/"
  },
  {
    name: "Dunkin'",
    logo: "/assets/sponsors/dunkin.png",
    url: "https://www.dunkindonuts.com"
  },
  {
    name: "Gopal",
    logo: "/assets/sponsors/gopal.png",
    url: "https://www.newgopal.com/"
  }
];

export default function Sponsors() {
  return (
    <div className="relative py-20 overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
      </div>

      <div className="relative z-10">
        {/* Title */}
        <motion.h2 
          className="text-6xl text-center mb-20 font-['Harry_Potter'] text-white glow-text-intense"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          Magical Patrons
        </motion.h2>

        {/* Sponsors Grid */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
            {SPONSORS.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                {/* Magical Frame */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content Container */}
                <a 
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-white/5 backdrop-blur-sm rounded-lg p-6 transition-transform duration-500 group-hover:scale-[1.02]"
                >
                  {/* Image */}
                  <div className="relative aspect-square flex items-center justify-center p-4">
                    <img 
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-500"
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