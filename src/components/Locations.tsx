import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const locations = [
  {
    name: "DoubleTree by Hilton",
    description: "Where teams gather and prepare for the magical weekend",
    address: "4099 Valley View Ln, Dallas, TX 75244",
    mapsUrl: "https://maps.google.com/?q=4099+Valley+View+Ln,+Dallas,+TX+75244",
    type: "Hotel & Registration"
  },
  {
    name: "Marshall Family Performing Arts Center",
    description: "Where the competition's magic unfolds",
    address: "4141 Spring Valley Rd, Addison, TX 75001",
    mapsUrl: "https://maps.google.com/?q=4141+Spring+Valley+Rd,+Addison,+TX+75001",
    type: "Main Event"
  },
  {
    name: "VYB Lounge",
    description: "Where victors and participants unite in revelry",
    address: "104 W McKinney St, Denton, TX 76201",
    mapsUrl: "https://maps.google.com/?q=104+W+McKinney+St,+Denton,+TX+76201",
    type: "Afterparty"
  }
];

export default function Locations() {
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

      {/* Title */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text inline-block relative">
          Enchanted Venues
          <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 rounded-lg blur-lg -z-10"></div>
        </h2>
      </motion.div>

      {/* Grid Container */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {/* Card */}
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-red-500/20 h-full
                            transform transition-transform duration-500 hover:scale-[1.02]">
                {/* Location Type Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-red-900/60 rounded-full text-sm font-['Harry_Potter'] text-white/90">
                    {location.type}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4 space-y-4">
                  <h3 className="text-2xl font-['Harry_Potter'] text-white text-center">
                    {location.name}
                  </h3>
                  
                  <p className="text-red-200/70 text-center font-['Harry_Potter'] text-sm">
                    {location.description}
                  </p>

                  <div className="flex items-center justify-center space-x-2 text-white/80">
                    <FaMapMarkerAlt className="text-red-400" />
                    <span className="text-sm">{location.address}</span>
                  </div>

                  {/* Map Link */}
                  <div className="text-center">
                    <a
                      href={location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-red-900/30 rounded-lg
                               hover:bg-red-900/50 transition-colors duration-300 text-white/90
                               border border-red-500/30 hover:border-red-500/50"
                    >
                      <span className="font-['Harry_Potter']">View on Map</span>
                      <FaExternalLinkAlt className="text-sm" />
                    </a>
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-red-500/40 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-red-500/40 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-red-500/40 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-red-500/40 rounded-br-lg"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ambient Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(220,38,38,0.1)_0%,_transparent_60%)]"></div>
      </div>
    </div>
  );
} 