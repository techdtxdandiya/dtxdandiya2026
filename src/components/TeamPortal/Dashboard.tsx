import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config';
import type { TeamInfo, DashboardTeamId } from '../../types/team';

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<DashboardTeamId | null>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'information' | 'tech-time-video' | 'schedule'>('announcements');
  const [scheduleData, setScheduleData] = useState<TeamInfo['schedule'] | null>(null);

  // Move debug logging to a separate effect
  useEffect(() => {
    if (activeTab === 'schedule' && teamInfo) {
      console.log('Schedule tab active, current team info:', teamInfo);
      console.log('Schedule data:', teamInfo.schedule);
      console.log('Schedule published:', teamInfo.schedule?.isPublished);
      console.log('Show order:', teamInfo.schedule?.showOrder);
    }
  }, [activeTab, teamInfo]);

  // Main data loading effect
  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as DashboardTeamId | null;
    
    if (!storedTeam || storedTeam === 'admin') {
      console.log('No team stored or admin, redirecting to login');
      navigate("/team-portal/login");
      return;
    }

    setTeamId(storedTeam);
    console.log('Loading data for team:', storedTeam);
    
    const teamRef = ref(db, `teams/${storedTeam}`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Received team data:', data);
        setTeamInfo(data);
        setScheduleData(data.schedule || null);
      } else {
        console.log('No data exists for team:', storedTeam);
      }
    }, (error) => {
      console.error('Error loading team data:', error);
    });

    return () => unsubscribe();
  }, [navigate]);

  const renderScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }> | undefined
  ) => {
    if (!events || events.length === 0) {
      return null;
    }

    return (
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="p-3 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
              <div className="grid grid-cols-[6rem,1fr,auto] gap-3 items-center text-sm">
                <div className="text-blue-200 font-medium">{event.time}</div>
                <div className="text-white font-normal">{event.event}</div>
                <div className="text-blue-200/80 font-normal">{event.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSchedule = () => {
    if (!scheduleData) {
      return (
        <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
          <p className="text-white text-center text-sm">Schedule will be available soon.</p>
        </div>
      );
    }

    if (!scheduleData.isPublished) {
      return (
        <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
          <p className="text-white text-center text-sm">Schedule will be available soon.</p>
        </div>
      );
    }

    if (!scheduleData.showOrder) {
      return (
        <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
          <p className="text-white text-center text-sm">Schedule has not been assigned yet.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6 p-3 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
          <p className="text-lg text-white font-medium">Performance Order {scheduleData.showOrder}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Friday Events */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Friday</h3>
            {renderScheduleSection("Registration & Check-in", scheduleData.friday?.slice(0, 2))}
            {renderScheduleSection("Evening Events", scheduleData.friday?.slice(2))}
          </div>

          {/* Saturday Events */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Saturday</h3>
            {renderScheduleSection("Tech Time", scheduleData.saturdayTech)}
            {renderScheduleSection("Pre-Show", scheduleData.saturdayPreShow)}
            {renderScheduleSection("Show Time", scheduleData.saturdayShow)}
            {scheduleData.saturdayPostShow && (
              <>
                {renderScheduleSection("Post-Show (Non-Placing)", scheduleData.saturdayPostShow.nonPlacing)}
                {renderScheduleSection("Post-Show (Placing)", scheduleData.saturdayPostShow.placing)}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/team-portal/login");
  };

  if (!teamInfo || !teamId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-sans">
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

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-['Harry_Potter'] text-white glow-text-intense">
            {teamInfo.displayName}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-white font-['Harry_Potter'] hover:bg-blue-500/20 transition-all duration-300"
          >
            Mischief Managed
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-blue-500/30">
            {[
              ['announcements', 'Announcements'],
              ['information', 'Information'],
              ['tech-time-video', 'Tech Time Video'],
              ['schedule', 'Schedule']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === key
                    ? 'border-b-2 border-blue-500 text-white'
                    : 'text-blue-200/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'announcements' && (
            <div>
              <h2 className="text-2xl font-['Harry_Potter'] text-white mb-6">Announcements</h2>
              <div className="grid gap-4">
                {teamInfo.announcements?.map((announcement, index) => (
                  <div
                    key={index}
                    className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20"
                  >
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-lg font-medium text-white">{announcement.title}</h3>
                      <p className="text-sm text-blue-200/80">{announcement.content}</p>
                      <p className="text-xs text-blue-200/60">{announcement.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'information' && (
            <div>
              <h2 className="text-2xl font-['Harry_Potter'] text-white mb-6">Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-lg font-medium text-white mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {teamInfo.information?.liaisons?.map((liaison, index) => (
                      <div key={index}>
                        <h4 className="text-sm font-medium text-blue-300 mb-1">Liaison {index + 1}</h4>
                        <p className="text-sm text-white">{liaison.name}</p>
                        {liaison.phone && (
                          <p className="text-sm text-white mt-1">{liaison.phone}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-blue-500/20">
                  <h3 className="text-lg font-medium text-white mb-4">Hotel Information</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-blue-300 mb-1">Name</h4>
                      <p className="text-sm text-white">DoubleTree by Hilton Hotel Dallas</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-300 mb-1">Address</h4>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-white">4099 Valley View Ln, Dallas, TX 75244</p>
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded text-sm text-blue-200"
                        >
                          View in Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech-time-video' && (
            <div>
              <h2 className="text-2xl font-['Harry_Potter'] text-white mb-6">Tech Time Video</h2>
              {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
                <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20 flex flex-col items-center justify-center">
                  <h3 className="text-lg font-medium text-white mb-4">{teamInfo.techVideo.title}</h3>
                  <a
                    href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-300"
                  >
                    <span className="text-sm font-medium text-white">Access Video</span>
                    <svg 
                      className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14 5l7 7m0 0l-7 7m7-7H3" 
                      />
                    </svg>
                  </a>
                </div>
              ) : (
                <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-200/60">Tech time video will be available soon.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-2xl font-['Harry_Potter'] text-white mb-6">Schedule</h2>
              {renderSchedule()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 