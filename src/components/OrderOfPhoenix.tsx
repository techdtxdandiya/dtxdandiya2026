import React, { useState, useEffect } from 'react';

interface Committee {
  name: string;
  image: string;
  title: string;
}

const committees: Committee[] = [
  { name: "Directors", image: "/assets/team/Directors.jpeg", title: "The Grand Wizards" },
  { name: "Logistics", image: "/assets/team/Logistics.jpeg", title: "Masters of Movement" },
  { name: "Registration", image: "/assets/team/Registration.jpeg", title: "Keepers of Records" },
  { name: "Head Liaison", image: "/assets/team/HeadLiasions.jpeg", title: "The Diplomats" },
  { name: "Tech/External", image: "/assets/team/Tech.JPG", title: "Tech Sorcerers" },
  { name: "Fundraising", image: "/assets/team/Fundraising.jpeg", title: "Treasure Hunters" },
  { name: "Hospitality", image: "/assets/team/Hospitality.JPG", title: "Comfort Charmers" },
  { name: "Mixer/Social", image: "/assets/team/Mixer.JPG", title: "Social Enchanters" },
  { name: "Marketing", image: "/assets/team/Marketing.jpeg", title: "Message Mages" },
  { name: "Afterparty", image: "/assets/team/Afterparty.jpeg", title: "Night Mystics" },
];

export default function OrderOfPhoenix() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % committees.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative py-20 overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
      </div>

      <div className="relative z-10">
        {/* Title with Phoenix Wings */}
        <div className="text-center mb-12 md:mb-20 relative px-4">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[120px]">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[30%] h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[30%] h-[2px] bg-gradient-to-l from-transparent via-orange-500/50 to-transparent"></div>
          </div>
          <h2 className="text-5xl md:text-7xl font-['Harry_Potter'] text-white glow-text relative">
            Order of the Phoenix
          </h2>
        </div>

        {/* Committee Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative">
            {/* Content Container */}
            <div className="relative bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image Display */}
                <div className="relative w-full md:w-2/3 order-1 md:order-2">
                  <div className={`transform transition-all duration-500 
                    ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                  >
                    {/* Image Container with Dynamic Aspect Ratio */}
                    <div className="relative pt-[100%] md:pt-[75%]">
                      <img 
                        src={committees[activeIndex].image}
                        alt={committees[activeIndex].name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                    </div>
                  </div>
                </div>

                {/* Committee Info */}
                <div className="relative w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center order-2 md:order-1 bg-gradient-to-r from-black/60 via-black/40 to-transparent">
                  <div className={`transform transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
                    <h3 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text-intense mb-4">
                      {committees[activeIndex].name}
                    </h3>
                    <p className="text-2xl md:text-3xl text-orange-300/90 font-['Harry_Potter']">
                      {committees[activeIndex].title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Border */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border border-orange-500/20"></div>
                <div className="absolute inset-[3px] border border-white/10"></div>
                
                {/* Corner Decorations - Responsive Sizes */}
                <div className="absolute top-0 left-0 w-[10%] max-w-16 aspect-square border-t-2 border-l-2 border-orange-400/40"></div>
                <div className="absolute top-0 right-0 w-[10%] max-w-16 aspect-square border-t-2 border-r-2 border-orange-400/40"></div>
                <div className="absolute bottom-0 left-0 w-[10%] max-w-16 aspect-square border-b-2 border-l-2 border-orange-400/40"></div>
                <div className="absolute bottom-0 right-0 w-[10%] max-w-16 aspect-square border-b-2 border-r-2 border-orange-400/40"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(251,146,60,0.15)_0%,_transparent_60%)]"></div>
      </div>
    </div>
  );
} 