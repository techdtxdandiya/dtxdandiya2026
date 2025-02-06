import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

// Sponsors in alphabetical order
const SPONSORS = [
  {
    name: "A Family In Need",
    logo: "/assets/sponsors/family.png",
    url: "https://www.afamilyinneed.org/"
  },
  {
    name: "City of Richardson",
    logo: "/assets/sponsors/richardson.png",
    url: "https://www.cor.net/home"
  },
  {
    name: "Costco Wholesale",
    logo: "/assets/sponsors/costco.png",
    url: "https://www.costco.com/"
  },
  {
    name: "Dunkin'",
    logo: "/assets/sponsors/krispy_kreme.png",
    url: "https://www.krispykreme.com/"
  },
  {
    name: "Gopal",
    logo: "/assets/sponsors/gopal.png",
    url: "https://www.newgopal.com/"
  },
  {
    name: "Raising Cane's",
    logo: "/assets/sponsors/canes.png",
    url: "https://www.raisingcanes.com/home/"
  },
  {
    name: "Smoothie King",
    logo: "/assets/sponsors/smoothieking.png",
    url: "https://locations.smoothieking.com/ll/us/tx/farmers-branch/13901-midway-rd/"
  }
];

export default function Sponsors() {
  return (
    <div className="relative py-16 overflow-hidden bg-black">
      {/* Magical Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
          {/* Ambient Light Effect */}
          <div className="absolute inset-0 opacity-40"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.15), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 70%)
              `
            }}
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
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
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg blur-lg -z-10"></div>
          </h2>
        </motion.div>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
          {SPONSORS.map((sponsor, index) => (
            <motion.div
              key={sponsor.name}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700"></div>
              <a
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative bg-black/20 backdrop-blur-sm rounded-lg p-4 transition-all duration-500 group-hover:bg-black/30"
              >
                <div className="relative aspect-square flex items-center justify-center p-3">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-w-[80%] max-h-[80%] w-auto h-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                  />
                  <FaExternalLinkAlt className="absolute top-2 right-2 text-blue-400/0 group-hover:text-blue-400/70 transition-all duration-500" />
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}