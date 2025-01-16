import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TeamInfo {
  generalInfo: string;
  specificInfo: string;
  showOrder: number | null;
  videoLink: string;
  schedule: string;
}

type TeamId = "tamu" | "texas" | "michigan" | "ucd" | "unc" | "iu" | "berkeley" | "msu";

const INITIAL_TEAM_INFO: Record<TeamId, TeamInfo> = {
  tamu: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" },
  texas: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" },
  michigan: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" },
  ucd: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" },
  unc: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" },
  iu: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" },
  berkeley: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" },
  msu: { generalInfo: "", specificInfo: "", showOrder: null, videoLink: "", schedule: "Check back soon" }
};

const TEAM_DISPLAY_NAMES: Record<TeamId, string> = {
  tamu: "TAMU Wreckin' Raas",
  texas: "Texas Raas",
  michigan: "Michigan Wolveraas",
  ucd: "UCD Raasleela",
  unc: "UNC Tar Heel Raas",
  iu: "IU HoosierRaas",
  berkeley: "UC Berkeley Raas Ramzat",
  msu: "MSU RaaSparty"
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'specific' | 'schedule' | 'videos'>('general');
  const [teamInfo, setTeamInfo] = useState(INITIAL_TEAM_INFO);
  const [selectedTeams, setSelectedTeams] = useState<TeamId[]>([]);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    // Check if admin is logged in
    const team = sessionStorage.getItem('team');
    if (team !== 'admin') {
      navigate('/team-portal/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('team');
    navigate('/');
  };

  const handleTeamSelect = (teamId: TeamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleShowOrderChange = (teamId: TeamId, order: number) => {
    setTeamInfo(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        showOrder: order,
        schedule: generateSchedule(order) // Function to generate schedule based on show order
      }
    }));
  };

  const generateSchedule = (order: number) => {
    // This is a placeholder - implement actual schedule generation logic
    return `Performance Time: ${order * 15 + 360} minutes from start`;
  };

  const handleUpdateInfo = (type: 'general' | 'specific', teamId: TeamId, value: string) => {
    setTeamInfo(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        [type === 'general' ? 'generalInfo' : 'specificInfo']: value
      }
    }));
  };

  const handleVideoLinkUpdate = (teamId: TeamId, link: string) => {
    setTeamInfo(prev => ({
      ...prev,
      [teamId]: {
        ...prev[teamId],
        videoLink: link
      }
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-['Harry_Potter'] glow-text">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg
                     hover:bg-purple-900/40 transition-all duration-300"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {['general', 'specific', 'schedule', 'videos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-['Harry_Potter'] ${
                activeTab === tab 
                  ? 'bg-purple-900/40 border border-purple-500/50'
                  : 'bg-black/40 border border-purple-500/20 hover:bg-purple-900/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Team Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-['Harry_Potter'] mb-4">Select Teams</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(TEAM_DISPLAY_NAMES).map(([teamId, name]) => (
              <button
                key={teamId}
                onClick={() => handleTeamSelect(teamId as TeamId)}
                className={`p-2 rounded-lg text-sm ${
                  selectedTeams.includes(teamId as TeamId)
                    ? 'bg-purple-900/40 border border-purple-500/50'
                    : 'bg-black/40 border border-purple-500/20 hover:bg-purple-900/20'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="space-y-8">
          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-2xl font-['Harry_Potter'] mb-4">Show Order</h2>
              <div className="grid gap-4">
                {Object.entries(TEAM_DISPLAY_NAMES)
                  .filter(([teamId]) => selectedTeams.includes(teamId as TeamId))
                  .map(([teamId, name]) => (
                    <div key={teamId} className="flex items-center space-x-4">
                      <span>{name}</span>
                      <select
                        value={teamInfo[teamId as TeamId].showOrder || ''}
                        onChange={(e) => handleShowOrderChange(teamId as TeamId, parseInt(e.target.value))}
                        className="bg-black/40 border border-purple-500/30 rounded-lg p-2"
                      >
                        <option value="">Select Order</option>
                        {Array.from({ length: 8 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {(activeTab === 'general' || activeTab === 'specific') && (
            <div>
              <h2 className="text-2xl font-['Harry_Potter'] mb-4">
                {activeTab === 'general' ? 'General Information' : 'Team-Specific Information'}
              </h2>
              {selectedTeams.map((teamId) => (
                <div key={teamId} className="mb-4">
                  <h3 className="text-xl mb-2">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                  <textarea
                    value={activeTab === 'general' ? teamInfo[teamId].generalInfo : teamInfo[teamId].specificInfo}
                    onChange={(e) => handleUpdateInfo(activeTab, teamId, e.target.value)}
                    className="w-full h-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                    placeholder={`Enter ${activeTab} information...`}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              <h2 className="text-2xl font-['Harry_Potter'] mb-4">Video Links</h2>
              {selectedTeams.map((teamId) => (
                <div key={teamId} className="mb-4">
                  <h3 className="text-xl mb-2">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                  <input
                    type="text"
                    value={teamInfo[teamId].videoLink}
                    onChange={(e) => handleVideoLinkUpdate(teamId, e.target.value)}
                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                    placeholder="Enter Google Drive video link..."
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Button */}
        <div className="mt-8">
          <button
            onClick={() => {
              // Here you would implement the actual update logic
              setUpdateMessage('Changes saved successfully!');
              setTimeout(() => setUpdateMessage(''), 3000);
            }}
            className="px-8 py-3 bg-purple-900/30 border border-purple-500/40 rounded-lg
                     hover:bg-purple-900/50 transition-all duration-300 font-['Harry_Potter']"
          >
            Update Changes
          </button>
          {updateMessage && (
            <p className="mt-2 text-green-400">{updateMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
} 