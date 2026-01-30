import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5";

// Team passwords with Harry Potter theme
const TEAM_PASSWORDS: { [key: string]: string } = {
  "tamu": "tennis",
  "texas": "golf",
  "michigan": "court",
  "uf": "pickleball",
  "uiuc": "squash",
  "uw": "swimming",
  "washu": "badminton",
  "ucsd": "croquet",
  "admin": "chess", // admin password
  "judge": "yoga",
  "reps": "cycling"
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
      sessionStorage.setItem('team', team[0]);
      
      // Navigate based on team type
      if (team[0] === 'admin') {
        navigate('/team-portal/admin');
      } else if (team[0] === 'judge' || team[0] === 'reps') {
        navigate('/team-portal/dashboard');
      } else {
        navigate('/team-portal/dashboard');
      }
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
         style={{ backgroundImage: "url('/assets/backgrounds/home_page.jpg')" }}>
      <div className="max-w-md w-full mx-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 px-4 py-2 text-white/80 font-cormorant text-lg
                   hover:text-white transition-colors duration-300 flex items-center
                   group"
        >
          <IoArrowBack className="mr-2 text-xl transition-transform duration-300 
                                group-hover:-translate-x-1" />
          Return to the Grounds
        </button>

        <div className="bg-black/60 backdrop-blur-lg p-8 rounded-lg border border-white/10">
          {/* Title */}
          <h2 className="text-6xl md:text-7xl font-edwardian text-center text-white mb-8 glow-text"
          style={{ wordSpacing: '0.1em' }}>
            Team Member Access
          </h2>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-cormorant text-xl mb-2">
                Enter Access Code
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
              <div className="text-red-400 text-center font-cormorant text-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 text-xl text-white font-cormorant 
                       bg-black/40 border border-white/20 rounded-lg
                       hover:bg-white/10 transition-colors duration-300
                       magical-border"
            >
              Enter
            </button>
          </form>

          {/* Decorative Elements */}
          <div className="mt-8 text-center">
            <div className="text-white/40 font-cormorant text-sm">
              "Admission by invitation only."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 