import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeamPortalLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'owl') {
      sessionStorage.setItem('team', 'judges');
      navigate('/team-portal/judges');
    } else if (password === 'dobby') {
      sessionStorage.setItem('team', 'reps');
      navigate('/team-portal/reps');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
          <div className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.15), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 70%)
              `
            }}
          />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text-intense text-center mb-8">
            Team Portal
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                Enter Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-blue-900/10 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-white font-['Harry_Potter'] hover:bg-blue-500/20 transition-all duration-300"
            >
              I Solemnly Swear
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 