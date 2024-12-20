import React from 'react';

export default function AboutUs() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-5xl text-center mb-16 font-['Harry_Potter'] text-white glow-text">
          About Us
        </h2>
        
        <div className="flex flex-col items-center">
          {/* Team Image */}
          <div className="mb-12 relative w-full max-w-4xl">
            <img 
              src="/assets/team/team.JPG" 
              alt="DTX Dandiya Team" 
              className="w-full rounded-lg shadow-2xl"
            />
            {/* Magical Frame */}
            <div className="absolute -inset-1">
              {/* Corner Decorations */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#C5A572] rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#C5A572] rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#C5A572] rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#C5A572] rounded-br-lg"></div>
            </div>
          </div>

          {/* Text Section */}
          <div className="max-w-3xl mx-auto text-center">
            {/* Text Content */}
            <div className="relative px-8 py-6">
              <p className="text-lg leading-relaxed text-white/90 font-['Crimson_Text'] tracking-wide">
                We welcome you to <span className="font-['Harry_Potter'] text-[#C5A572] text-2xl">DTX Dandiya</span>. 
                We are Dallas's premier Raas Garba competition, bringing together some of the very best collegiate Raas teams 
                from around the country. With every graceful twirl and resonating drumbeat, we aim to create an immersive 
                experience that not only honors our heritage but also fosters a sense of togetherness. Join us in embracing 
                diversity, the joy of dance, and the spirit of community as we weave tradition into the colorful fabric of 
                our shared heritage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Magical Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-20 w-3 h-3 bg-[#C5A572]/20 rounded-full animate-twinkle"></div>
        <div className="absolute bottom-1/4 right-20 w-3 h-3 bg-[#C5A572]/20 rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-[#C5A572]/20 rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
      </div>
    </section>
  );
} 