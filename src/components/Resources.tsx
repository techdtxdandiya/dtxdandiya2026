import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTicketAlt, FaMusic } from 'react-icons/fa';
import { GiOwl } from 'react-icons/gi';

interface Contact {
  position: string;
  name: string;
  phone: string;
}

const contacts: Contact[] = [
  { position: "Director", name: "Chinmayi Mohite", phone: "(469) 987-3581" },
  { position: "Director", name: "Aryan Patel", phone: "(845) 502-0766" },
  { position: "Director", name: "Naishada Kotte", phone: "(412) 689-3539" },
  { position: "Logistics", name: "Anisha Thakkar", phone: "(214) 843-2977" },
  { position: "Logistics", name: "Rishil Uppaluru", phone: "(512) 521-9355" },
  { position: "Head Liason", name: "Devanshi Patel", phone: "(469) 525-8760" },
  { position: "Head Liason", name: "Paneri Patel", phone: "(682) 347-9582" },
  { position: "Tech", name: "Dev Patel", phone: "(972) 258-4904" },
  { position: "Tech", name: "Shashank Kumar", phone: "(469) 386-2373" },
];

export default function Resources() {
  return (
    <div className="relative py-20 overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-5xl text-center mb-16 font-['Harry_Potter'] text-white glow-text">
          The Owl Post
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Quick Contact Section */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
              {/* Section Title */}
              <h3 className="text-4xl font-['Harry_Potter'] text-emerald-400 mb-8 text-center">
                Quick Contact
              </h3>

              {/* Contact Table */}
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <motion.div
                    key={index}
                    className="group relative flex items-center justify-between py-2 px-4 rounded-lg hover:bg-emerald-900/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1 min-w-[120px]">
                      <span className="text-emerald-400/80 font-['Harry_Potter'] text-lg">
                        {contact.position}
                      </span>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-white/90 font-['Harry_Potter']">
                        {contact.name}
                      </span>
                    </div>
                    <div className="flex-1 text-right">
                      <span className="text-white/70 font-['Harry_Potter'] group-hover:text-emerald-400 transition-colors duration-300">
                        {contact.phone}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Event Information Section */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/20">
              <h3 className="text-4xl font-['Harry_Potter'] text-emerald-400 mb-8 text-center">
                Afterparty Details
              </h3>

              <div className="space-y-8">
                {/* Location */}
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-lg bg-emerald-900/5"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaMapMarkerAlt className="text-emerald-400 text-2xl mt-1" />
                  <div>
                    <h4 className="text-emerald-400 font-['Harry_Potter'] text-xl mb-2">Location</h4>
                    <p className="text-white/80 font-['Harry_Potter']">
                      VYB Lounge
                      <br />
                      104 W McKinney St, Denton, TX 76201
                    </p>
                  </div>
                </motion.div>

                {/* Required Items */}
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-lg bg-emerald-900/5"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaTicketAlt className="text-emerald-400 text-2xl mt-1" />
                  <div>
                    <h4 className="text-emerald-400 font-['Harry_Potter'] text-xl mb-2">Required to Bring</h4>
                    <p className="text-white/80 font-['Harry_Potter']">
                      NFC Bands (Admission)
                      <br />
                      IDs to drink
                    </p>
                  </div>
                </motion.div>

                {/* Dance Moves */}
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-lg bg-emerald-900/5"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaMusic className="text-emerald-400 text-2xl mt-1" />
                  <div>
                    <h4 className="text-emerald-400 font-['Harry_Potter'] text-xl mb-2">Don't Forget</h4>
                    <p className="text-white/80 font-['Harry_Potter']">
                      Your best dance moves 💃🕺
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ambient Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(16,185,129,0.1)_0%,_transparent_60%)]"></div>
      </div>

      {/* Decorative Owl */}
      <motion.div 
        className="absolute -bottom-4 right-[15%] pointer-events-none z-20 hidden lg:block"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <GiOwl className="text-emerald-400/60 w-32 h-32 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
        </motion.div>
      </motion.div>
    </div>
  );
} 