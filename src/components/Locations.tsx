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
    type: "Main Event Venue"
  },
  {
    name: "VYB Lounge",
    description: "Where victors and participants unite in revelry",
    address: "104 W McKinney St, Denton, TX 76201",
    mapsUrl: "https://maps.google.com/?q=104+W+McKinney+St,+Denton,+TX+76201",
    type: "Afterparty Venue"
  }
];

export default function Locations() {
  return (
    <div className="bg-black relative overflow-hidden py-16">
      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-['Harry_Potter'] text-center text-white mb-16 glow-text-white mx-auto">
        Enchanted Venues
      </h2>

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
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 h-full
                            transform transition-transform duration-500 hover:scale-[1.02]">
                {/* Location Type Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-purple-900/60 rounded-full text-sm font-['Harry_Potter'] text-white/90">
                    {location.type}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4 space-y-4">
                  <h3 className="text-2xl font-['Harry_Potter'] text-white text-center">
                    {location.name}
                  </h3>
                  
                  <p className="text-purple-200/70 text-center font-['Harry_Potter'] text-sm">
                    {location.description}
                  </p>

                  <div className="flex items-center justify-center space-x-2 text-white/80">
                    <FaMapMarkerAlt className="text-purple-400" />
                    <span className="text-sm">{location.address}</span>
                  </div>

                  {/* Map Link */}
                  <div className="text-center">
                    <a
                      href={location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-900/30 rounded-lg
                               hover:bg-purple-900/50 transition-colors duration-300 text-white/90
                               border border-purple-500/30 hover:border-purple-500/50"
                    >
                      <span className="font-['Harry_Potter']">View on Map</span>
                      <FaExternalLinkAlt className="text-sm" />
                    </a>
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-purple-500/40 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-purple-500/40 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-purple-500/40 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-purple-500/40 rounded-br-lg"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ambient Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(147,51,234,0.1)_0%,_transparent_60%)]"></div>
      </div>
    </div>
  );
} 