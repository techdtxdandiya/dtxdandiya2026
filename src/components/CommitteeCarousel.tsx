import { useState, useEffect } from 'react';

// Import all images as URLs
const committees = [
  {
    name: 'Directors',
    image: "/assets/team/Directors.jpg",
    description: 'Leading the magic'
  },
  {
    name: 'Logistics',
    image: "/assets/team/Logistics.jpeg",
    description: 'Making it happen'
  },
  {
    name: 'Registration',
    image: "/assets/team/Registration.jpg",
    description: 'Managing participants'
  },
  {
    name: 'Head Liaisons',
    image: "/assets/team/HeadLiaisons.jpg",
    description: 'Team coordination'
  },
  {
    name: 'Tech/External',
    image: "./assets/team/Tech.jpg",
    description: 'Technical support'
  },
  {
    name: 'Fundraising',
    image: "/assets/team/Fundraising.jpeg",
    description: 'Resource gathering'
  },
  {
    name: 'Afterparty',
    image: "/assets/team/Afterparty.jpeg",
    description: 'Celebration planning'
  },
  {
    name: 'Hospitality',
    image: "/assets/team/Hospitality.jpeg",
    description: 'Guest experience'
  },
  {
    name: 'Mixer/Social',
    image: "/assets/team/Mixer.jpeg",
    description: 'Event socializing'
  },
  {
    name: 'Advisors',
    image: "/assets/team/Advisors.jpg",
    description: 'Brand outreach'
  }
];

export default function CommitteeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % committees.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-96 overflow-hidden rounded-lg">
      {committees.map((committee, index) => (
        <div
          key={committee.name}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentIndex ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <img 
                src={committee.image} 
                alt={committee.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-amber-500 mb-2">{committee.name}</h3>
                <p className="text-gray-300">{committee.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {committees.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-amber-500' : 'bg-gray-500'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}