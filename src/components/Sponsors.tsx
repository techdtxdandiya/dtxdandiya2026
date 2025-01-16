import { motion } from 'framer-motion';

const TOP_SPONSORS = [
  {
    name: "City of Richardson",
    logo: "/assets/sponsors/richardson.png",
    url: "https://www.cor.net/home"
  },
  {
    name: "Costco Wholesale",
    logo: "/assets/sponsors/costco.png",
    url: "https://www.costco.com/"
  }
];

const BOTTOM_SPONSORS = [
  {
    name: "Dunkin'",
    logo: "/assets/sponsors/dunkin.png",
    url: "https://www.dunkindonuts.com"
  },
  {
    name: "Gopal",
    logo: "/assets/sponsors/gopal.png",
    url: "https://www.newgopal.com/"
  },
  {
    name: "Raising Cane's Chicken Fingers",
    logo: "/assets/sponsors/canes.png",
    url: "https://www.raisingcanes.com/home/"
  }
];

export default function Sponsors() {
  return (
    <div className="relative py-12 overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)', backgroundSize: '3px 3px' }}></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Title with Magical Border */}
        <div className="relative max-w-fit mx-auto mb-12">
          <motion.h2 
            className="text-4xl md:text-5xl text-center font-['Harry_Potter'] text-white glow-text-intense relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            Our Magical Patrons
          </motion.h2>
          <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg blur-md"></div>
        </div>

        {/* Sponsors Grid */}
        <div className="max-w-4xl mx-auto px-4">
          {/* Top Row - 2 Sponsors */}
          <div className="grid grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-12">
            {TOP_SPONSORS.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <a 
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-white/5 backdrop-blur-sm rounded-lg p-4 md:p-6 transition-all duration-500 group-hover:scale-[1.02] group-hover:bg-white/10"
                >
                  <div className="relative aspect-[3/2] flex items-center justify-center">
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

          {/* Bottom Row - 3 Sponsors */}
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {BOTTOM_SPONSORS.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index + 2) * 0.2 }}
              >
                <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <a 
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-white/5 backdrop-blur-sm rounded-lg p-3 md:p-4 transition-all duration-500 group-hover:scale-[1.02] group-hover:bg-white/10"
                >
                  <div className="relative aspect-square flex items-center justify-center">
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