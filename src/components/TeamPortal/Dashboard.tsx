import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Team-specific information
const TEAM_INFO: { [key: string]: {
  practiceArea: string;
  liasonName: string;
  liasonContact: string;
  specialInstructions: string[];
}} = {
  'gryffindor': {
    practiceArea: 'ECS West',
    liasonName: 'Devanshi Patel',
    liasonContact: '(469) 525-8760',
    specialInstructions: [
      'Please arrive 15 minutes before your practice time',
    ]
  },
  'slytherin': {
    practiceArea: 'Quidditch Field B',
    liasonName: 'Paneri Patel',
    liasonContact: '(682) 347-9582',
    specialInstructions: [
      'Team huddle at 5:45 PM',
      'Bring backup dandiya sticks',
      'Review formations before practice'
    ]
  },
  // Add more team info as needed
};

// Dummy data for team schedules
const TEAM_SCHEDULES: { [key: string]: Array<{ time: string; event: string; location: string }> } = {
  'gryffindor': [
    { time: '6:00 PM', event: 'Team Check-in', location: 'Great Hall' },
    { time: '7:00 PM', event: 'Opening Ceremony', location: 'Main Stage' },
    { time: '8:00 PM', event: 'Practice', location: 'Arena A' },
    { time: '9:30 PM', event: 'Break', location: 'Team Room' },
    { time: '10:00 PM', event: 'Practice', location: 'Arena B' },
  ],
  'slytherin': [
    { time: '6:15 PM', event: 'Team Check-in', location: 'Great Hall' },
    { time: '7:00 PM', event: 'Opening Ceremony', location: 'Main Stage' },
    { time: '8:30 PM', event: 'Practice', location: 'Arena B' },
    { time: '9:45 PM', event: 'Break', location: 'Team Room' },
    { time: '10:30 PM', event: 'Practice', location: 'Arena A' },
  ],
  // Add more team schedules as needed
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState<string>('');
  const [schedule, setSchedule] = useState<Array<{ time: string; event: string; location: string }>>([]);
  const [teamInfo, setTeamInfo] = useState(TEAM_INFO['gryffindor']); // Default value

  useEffect(() => {
    const storedTeamName = sessionStorage.getItem('teamName');
    if (!storedTeamName) {
      navigate('/team-login');
      return;
    }

    setTeamName(storedTeamName);
    setSchedule(TEAM_SCHEDULES[storedTeamName] || []);
    setTeamInfo(TEAM_INFO[storedTeamName] || TEAM_INFO['gryffindor']);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('teamName');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-['Harry_Potter'] text-white glow-text">
            Welcome, {teamName.charAt(0).toUpperCase() + teamName.slice(1)}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white font-['Harry_Potter'] 
                     bg-black/40 border border-white/20 rounded-lg
                     hover:bg-white/10 transition-colors duration-300
                     magical-border"
          >
            Mischief Managed (Logout)
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Team Schedule */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <h2 className="text-2xl font-['Harry_Potter'] text-white mb-6 glow-text">
              Your Schedule
            </h2>
            <div className="space-y-4">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-black/40 rounded-lg border border-white/10
                           hover:border-white/20 transition-colors duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xl text-white/90 font-['Harry_Potter']">
                        {item.event}
                      </div>
                      <div className="text-gray-400 font-sans text-sm mt-1">
                        {item.location}
                      </div>
                    </div>
                    <div className="text-amber-300/80 font-['Harry_Potter']">
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Information */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <h2 className="text-2xl font-['Harry_Potter'] text-white mb-6 glow-text">
              Important Information
            </h2>
            <div className="space-y-6">
              {/* Practice Area */}
              <div className="p-4 bg-black/40 rounded-lg border border-white/10">
                <h3 className="text-xl text-white font-['Harry_Potter'] mb-2">
                  Practice Area Location
                </h3>
                <p className="text-gray-300 font-sans">
                  {teamInfo.practiceArea}
                </p>
              </div>

              {/* Liason Contact */}
              <div className="p-4 bg-black/40 rounded-lg border border-white/10">
                <h3 className="text-xl text-white font-['Harry_Potter'] mb-2">
                  Liason Contact
                </h3>
                <p className="text-gray-300 font-sans">
                  {teamInfo.liasonName}
                  <br />
                  <span className="text-amber-300/80">{teamInfo.liasonContact}</span>
                </p>
              </div>

              {/* Special Instructions */}
              <div className="p-4 bg-black/40 rounded-lg border border-white/10">
                <h3 className="text-xl text-white font-['Harry_Potter'] mb-3">
                  Special Instructions
                </h3>
                <ul className="space-y-2">
                  {teamInfo.specialInstructions.map((instruction, index) => (
                    <li key={index} className="text-gray-300 font-sans flex items-start">
                      <span className="text-amber-300/80 mr-2">•</span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 