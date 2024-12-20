import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5";

// Predefined team passwords
const TEAM_PASSWORDS: { [key: string]: string } = {
  'gryffindor': 'lion123',
  'slytherin': 'snake123',
  'hufflepuff': 'badger123',
  'ravenclaw': 'eagle123',
  'phoenix': 'fire123',
  // Add more team passwords as needed
};

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if password matches any team
    const team = Object.entries(TEAM_PASSWORDS).find(([_, pass]) => pass === password);
    
    if (team) {
      // Store team info in sessionStorage
      sessionStorage.setItem('teamName', team[0]);
      navigate('/team-dashboard');
    } else {
      setError('Invalid password. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center bg-cover bg-center"
         style={{ backgroundImage: "url('/src/components/assets/backgrounds/home_page.jpg')" }}>
      <div className="max-w-md w-full mx-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 px-4 py-2 text-white/80 font-['Harry_Potter'] text-lg
                   hover:text-white transition-colors duration-300 flex items-center
                   group"
        >
          <IoArrowBack className="mr-2 text-xl transition-transform duration-300 
                                group-hover:-translate-x-1" />
          Back to the Muggle World
        </button>

        <div className="bg-black/60 backdrop-blur-lg p-8 rounded-lg border border-white/10">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-['Harry_Potter'] text-center text-white mb-8 glow-text">
            Team Portal
          </h2>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-['Harry_Potter'] text-xl mb-2">
                Enter Your Team Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white 
                         focus:outline-none focus:border-white/40 transition-colors
                         placeholder-white/30"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-400 text-center font-['Harry_Potter'] text-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 text-xl text-white font-['Harry_Potter'] 
                       bg-black/40 border border-white/20 rounded-lg
                       hover:bg-white/10 transition-colors duration-300
                       magical-border"
            >
              Alohomora
            </button>
          </form>

          {/* Decorative Elements */}
          <div className="mt-8 text-center">
            <div className="text-white/40 font-['Harry_Potter'] text-sm">
              "I solemnly swear that I am up to no good"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 