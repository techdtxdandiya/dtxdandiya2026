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
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-['Harry_Potter'] text-center text-white mb-12 sm:mb-16">
          Our Magical Patrons
        </h2>
        
        {/* Updated grid layout for 7 sponsors */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-12 max-w-6xl mx-auto">
          {/* First row - 5 sponsors */}
          <div className="col-span-1">
            <SponsorLogo name="BAPS" logo="/assets/sponsors/baps.png" url="#" />
          </div>
          <div className="col-span-1">
            <SponsorLogo name="Precision" logo="/assets/sponsors/precision.png" url="#" />
          </div>
          <div className="col-span-1">
            <SponsorLogo name="Costco" logo="/assets/sponsors/costco.png" url="#" />
          </div>
          <div className="col-span-1">
            <SponsorLogo name="Krispy Kreme" logo="/assets/sponsors/krispy_kreme.png" url="#" />
          </div>
          <div className="col-span-1">
            <SponsorLogo name="Gopal" logo="/assets/sponsors/gopal.png" url="#" />
          </div>

          {/* Second row - 2 sponsors centered */}
          <div className="col-span-1 md:col-start-2 lg:col-start-2 lg:col-span-1">
            <SponsorLogo name="Raising Cane's" logo="/assets/sponsors/raising_canes.png" url="#" />
          </div>
          <div className="col-span-1">
            <SponsorLogo name="Smoothie King" logo="/assets/sponsors/smoothie_king.png" url="#" />
          </div>
        </div>
      </div>
    </section>
  );
}

const SponsorLogo = ({ name, logo, url }: { name: string; logo: string; url: string }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition-transform duration-300 hover:scale-110"
    >
      <div className="aspect-[3/2] relative">
        <img
          src={logo}
          alt={`${name} logo`}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </a>
  );
};