import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamData } from '../../hooks/useTeamData';
import { Announcements } from './sections/Announcements';
import { Information } from './sections/Information';
import { TechVideo } from './sections/TechVideo';
import { Schedule } from './sections/Schedule';

type TabType = 'announcements' | 'information' | 'tech' | 'schedule';

export default function Dashboard() {
  const navigate = useNavigate();
  const { teamInfo, isLoading, error } = useTeamData();
  const [activeTab, setActiveTab] = useState<TabType>('announcements');

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/team-portal/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">{error.message}</div>
      </div>
    );
  }

  if (!teamInfo) {
    return null;
  }

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

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text-intense">
            {teamInfo.displayName}
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-white font-['Harry_Potter'] hover:bg-blue-500/20 transition-all duration-300"
          >
            Mischief Managed
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b border-blue-500/30">
            {(['announcements', 'information', 'tech', 'schedule'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-white'
                    : 'text-blue-200/60 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'announcements' && <Announcements announcements={teamInfo.announcements} />}
          {activeTab === 'information' && <Information information={teamInfo.information} />}
          {activeTab === 'tech' && <TechVideo techVideo={teamInfo.techVideo} />}
          {activeTab === 'schedule' && <Schedule schedule={teamInfo.schedule} />}
        </div>
      </div>
    </div>
  );
} 