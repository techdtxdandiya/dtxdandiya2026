import { useState } from 'react';
import { motion } from 'framer-motion';

interface ScheduleItem {
  what: string;
  where: string;
  when: string;
}

const fridaySchedule: ScheduleItem[] = [
  { what: "Registration", where: "Oak Room", when: "12:00 PM" },
  { what: "Check-In", where: "Hotel Lobby", when: "2:45 PM" },
  { what: "Dinner", where: "Garden Terrace", when: "4:30 PM" },
  { what: "Mixer", where: "Garden Terrace", when: "5:30 PM" },
  { what: "Practice", where: "Event Rooms", when: "7:30 PM" },
];

const saturdaySchedule: ScheduleItem[] = [
  { what: "Props", where: "Marshall Center", when: "6:00 AM" },
  { what: "Tech Time", where: "Marshall Center", when: "8:35 AM" },
  { what: "Photoshoot", where: "Marshall Center", when: "3:50 PM" },
  { what: "Doors Open", where: "Marshall Center", when: "5:00 PM" },
  { what: "Showtime", where: "Marshall Center", when: "5:30 PM" },
  { what: "Awards", where: "Marshall Center", when: "9:00 PM" },
  { what: "Afterparty", where: "VYB Lounge", when: "10:00 PM" },
];

// Magical floating element
const FloatingElement = ({ className = "", delay = 0 }: { className?: string, delay?: number }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      opacity: [0, 0.4, 0],
      scale: [0.8, 1.2, 0.8],
      y: [-15, 5, -15]
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <div className="text-[#C5A572]/60 text-3xl">✨</div>
  </motion.div>
);

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<'friday' | 'saturday'>('friday');

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Magical Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {/* Floating Elements */}
        <FloatingElement className="top-20 left-20" delay={0} />
        <FloatingElement className="top-40 right-40" delay={2} />
        <FloatingElement className="bottom-40 left-1/4" delay={4} />
        <FloatingElement className="top-1/2 right-1/4" delay={1} />
        <FloatingElement className="bottom-20 right-20" delay={3} />
      </div>

      {/* Content */}
      <div className="relative z-20">
        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-8">
          {['friday', 'saturday'].map((day) => (
            <motion.button
              key={day}
              onClick={() => setActiveDay(day as 'friday' | 'saturday')}
              className={`
                relative px-6 py-1 text-2xl font-['Harry_Potter'] tracking-wider
                transition-all duration-500
                ${activeDay === day 
                  ? 'text-[#C5A572] glow-text scale-110' 
                  : 'text-white/70 hover:text-[#C5A572] hover:glow-text'}
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {day}
            </motion.button>
          ))}
        </div>

        {/* Schedule Table */}
        <div className="overflow-hidden px-4 md:px-[200px]">
          <table className="w-full">
            {/* Column Headers */}
            <thead>
              <tr className="border-spacing-0">
                <th className="text-center pb-4 w-1/3">
                  <motion.span 
                    className="font-['Harry_Potter'] text-xl text-[#C5A572] tracking-wider"
                    whileHover={{ scale: 1.1 }}
                  >
                    WHAT
                  </motion.span>
                </th>
                <th className="text-center pb-4 w-1/3">
                  <motion.span 
                    className="font-['Harry_Potter'] text-xl text-[#C5A572] tracking-wider"
                    whileHover={{ scale: 1.1 }}
                  >
                    WHERE
                  </motion.span>
                </th>
                <th className="text-center pb-4 w-1/3">
                  <motion.span 
                    className="font-['Harry_Potter'] text-xl text-[#C5A572] tracking-wider"
                    whileHover={{ scale: 1.1 }}
                  >
                    WHEN
                  </motion.span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(activeDay === 'friday' ? fridaySchedule : saturdaySchedule).map((item, index) => (
                <motion.tr 
                  key={index}
                  className="group transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="py-[2px] text-center w-1/3">
                    <span className="font-['Harry_Potter'] text-xl text-white group-hover:glow-text transition-all duration-300">
                      {item.what}
                    </span>
                  </td>
                  <td className="py-[2px] text-center w-1/3">
                    <span className="font-['Harry_Potter'] text-lg text-white group-hover:glow-text transition-all duration-300">
                      {item.where}
                    </span>
                  </td>
                  <td className="py-[2px] text-center w-1/3">
                    <span className="font-['Harry_Potter'] text-lg text-white group-hover:glow-text transition-all duration-300">
                      {item.when}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}