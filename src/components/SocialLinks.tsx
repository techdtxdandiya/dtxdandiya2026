import { Instagram } from 'lucide-react';

export default function SocialLinks() {
  return (
    <div className="flex justify-center gap-6">
      <a
        href="https://www.instagram.com/dtx.dandiya/?hl=en"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-amber-500 transition-colors"
      >
        <Instagram size={24} />
      </a>
      <a
        href="https://www.tiktok.com/@dtx.dandiya"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-amber-500 transition-colors"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      </a>
    </div>
  );
}