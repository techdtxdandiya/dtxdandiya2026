import React from 'react';

export default function AboutUs() {
  return (
    <div className="relative w-full py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center">
          {/* Image Section */}
          <div className="relative group mb-16 w-full max-w-4xl">
            {/* Magical Frame */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C5A572]/0 via-[#C5A572]/50 to-[#C5A572]/0 rounded-lg blur"></div>
            <div className="relative">
              <img 
                src="/src/components/assets/team/team.JPG" 
                alt="DTX Dandiya Team" 
                className="w-full h-auto rounded-lg shadow-[0_0_15px_rgba(197,165,114,0.3)] transition-all duration-500 group-hover:shadow-[0_0_25px_rgba(197,165,114,0.5)]"
              />
              {/* Corner Decorations */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#C5A572] rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#C5A572] rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#C5A572] rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#C5A572] rounded-br-lg"></div>
            </div>
          </div>

          {/* Text Section */}
          <div className="relative max-w-3xl text-center">
            {/* Decorative Line */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#C5A572] to-transparent"></div>
            
            {/* Text Content */}
            <div className="relative px-8 py-6">
              {/* Magical Glow Effect */}
              <div className="absolute inset-0 bg-black/40 rounded-xl backdrop-blur-sm"></div>
              
              <p className="relative text-lg leading-relaxed text-white/90 font-['Crimson_Text'] tracking-wide">
                We welcome you to <span className="font-['Harry_Potter'] text-[#C5A572] text-2xl">DTX Dandiya</span>. 
                We are Dallas's premier Raas Garba competition, bringing together some of the very best collegiate Raas teams 
                from around the country. With every graceful twirl and resonating drumbeat, we aim to create an immersive 
                experience that not only honors our heritage but also fosters a sense of togetherness. Join us in embracing 
                diversity, the joy of dance, and the spirit of community as we weave tradition into the colorful fabric of 
                our shared heritage.
              </p>
            </div>

            {/* Bottom Decorative Line */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#C5A572] to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Floating Magical Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-20 w-3 h-3 bg-[#C5A572]/20 rounded-full animate-twinkle"></div>
        <div className="absolute bottom-1/4 right-20 w-3 h-3 bg-[#C5A572]/20 rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-[#C5A572]/20 rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
} 