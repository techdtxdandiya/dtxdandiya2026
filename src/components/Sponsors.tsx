import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

// Sponsors in alphabetical order
const SPONSORS = [
  {
    name: "City of Richardson",
    logo: "/assets/sponsors/richardson.png",
    url: "https://www.cor.net/home",
    tier: "primary"
  },
  {
    name: "Costco Wholesale",
    logo: "/assets/sponsors/costco.png",
    url: "https://www.costco.com/",
    tier: "primary"
  },
  {
    name: "Dunkin'",
    logo: "/assets/sponsors/dunkin.png",
    url: "https://www.dunkindonuts.com",
    tier: "secondary"
  },
  {
    name: "Gopal",
    logo: "/assets/sponsors/gopal.png",
    url: "https://www.newgopal.com/",
    tier: "secondary"
  },
  {
    name: "Raising Cane's",
    logo: "/assets/sponsors/canes.png",
    url: "https://www.raisingcanes.com/home/",
    tier: "secondary"
  }
];

export default function Sponsors() {
  const primarySponsors = SPONSORS.filter(s => s.tier === "primary");
  const secondarySponsors = SPONSORS.filter(s => s.tier === "secondary");

  return (
    <div className="relative py-16 overflow-hidden bg-black">
      {/* Magical Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black">
          {/* Animated Stars */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(2px 2px at 20px 30px, white, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 40px 70px, white, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 50px 160px, white, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 90px 40px, white, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 130px 80px, white, rgba(0,0,0,0))
              `,
              backgroundSize: '200px 200px'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-5xl">
        {/* Title */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-['Harry_Potter'] text-white glow-text-intense inline-block relative">
            Our Magical Patrons
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 rounded-lg blur-lg -z-10"></div>
          </h2>
        </motion.div>

        {/* Primary Sponsors */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {primarySponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500/20 via-purple-500/40 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700"></div>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-purple-500/10 transition-all duration-500 group-hover:border-purple-500/30"
                >
                  <div className="relative aspect-[3/2] flex items-center justify-center p-4">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    />
                    <FaExternalLinkAlt className="absolute top-2 right-2 text-purple-400/0 group-hover:text-purple-400/70 transition-all duration-500" />
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Secondary Sponsors */}
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {secondarySponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (index + 2) * 0.2 }}
              >
                <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-500/10 via-purple-500/30 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700"></div>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-purple-500/5 transition-all duration-500 group-hover:border-purple-500/20"
                >
                  <div className="relative aspect-square flex items-center justify-center p-3">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                    />
                    <FaExternalLinkAlt className="absolute top-2 right-2 text-purple-400/0 group-hover:text-purple-400/70 transition-all duration-500" />
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