import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

// Sponsors in alphabetical order
const SPONSORS = [
  {
    name: "Best Western",
    logo: "/assets/sponsors/best_western.png",
    url: "https://www.bestwestern.com/en_US.html"
  },
  {
    name: "India Bazaar",
    logo: "/assets/sponsors/india_bazaar.png",
    url: "https://www.indiabazaardfw.com/"
  },
  {
    name: "Kayura",
    logo: "/assets/sponsors/kayura.png",
    url: "https://kayuraeffect.com/"
  },
  {
    name: "LMNT",
    logo: "/assets/sponsors/LMNT.png",
    url: "https://drinklmnt.com/"
  },
  {
    name: "Milaana Dance",
    logo: "/assets/sponsors/milaana.png",
    url: "https://milaanadance.com/"
  },
  {
    name: "Red Bull",
    logo: "/assets/sponsors/red_bull.png",
    url: "https://www.redbull.com/us-en"
  },
];

export default function Sponsors() {
  return (
    <div className="relative py-16 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black]">
      {/* Magical Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#183331]">
          {/* Ambient Light Effect */}
          {/*<div className="absolute inset-0 opacity-40"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.15), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 70%)
              `
            }}
          />*/}
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
          <h2 className="text-6xl md:text-7xl font-edwardian text-center text-white mb-16 glow-text-intense mx-auto"
          style={{ wordSpacing: '0.1em' }}>
            Supporting Partners
            <div className="absolute -inset-x-8 -inset-y-4 bg-[gradient-to-r from-[#ffb1ba]-500/0 via-[#ffb1ba]-500/10 to-[#ffb1ba]-500/0 rounded-lg blur-lg -z-10]"></div>
            {/*gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 rounded-lg blur-lg -z-10*/}
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
              <div className="absolute -inset-[2px] bg-gradient-to-r from-[#ffb1ba]/0 via-[#ffb1ba]/20 to-[#ffb1ba]/0 rounded-lg opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700"></div>
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
                  <FaExternalLinkAlt className="absolute top-2 right-2 text-blue-400/0 group-hover:text-[#ffb1ba]/70 transition-all duration-500" />
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}