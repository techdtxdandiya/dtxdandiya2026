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

  const renderScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }> | undefined
  ) => {
    if (!events || events.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h3 className="text-2xl text-white mb-4">{title}</h3>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
              <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
                <div className="text-blue-200 font-medium">{event.time}</div>
                <div className="text-white">{event.event}</div>
                <div className="text-blue-200/80">{event.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSchedule = () => {
    if (!teamInfo?.schedule?.isPublished) {
      return (
        <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
          <p className="text-white text-center">Schedule will be available soon.</p>
        </div>
      );
    }

    if (!teamInfo.schedule.showOrder) {
      return (
        <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
          <p className="text-white text-center">Schedule has not been assigned yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {teamInfo.schedule.showOrder && (
          <div className="mb-8 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
            <p className="text-xl text-white">Performance Order: Team {teamInfo.schedule.showOrder}</p>
          </div>
        )}
        {renderScheduleSection("Friday", teamInfo.schedule.friday)}
        {renderScheduleSection("Saturday Tech Time", teamInfo.schedule.saturdayTech)}
        {renderScheduleSection("Saturday Pre-Show", teamInfo.schedule.saturdayPreShow)}
        {renderScheduleSection("Saturday Show", teamInfo.schedule.saturdayShow)}
        {teamInfo.schedule.saturdayPostShow && (
          <>
            {renderScheduleSection("Saturday Post-Show (Non-Placing)", teamInfo.schedule.saturdayPostShow.nonPlacing)}
            {renderScheduleSection("Saturday Post-Show (Placing)", teamInfo.schedule.saturdayPostShow.placing)}
          </>
        )}
      </div>
    );
  };

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
        console.log('Schedule data:', data.schedule);
        console.log('Schedule published status:', data.schedule?.isPublished);
        console.log('Schedule sections:', {
          friday: data.schedule?.friday,
          saturdayTech: data.schedule?.saturdayTech,
          saturdayPreShow: data.schedule?.saturdayPreShow,
          saturdayShow: data.schedule?.saturdayShow,
          saturdayPostShow: data.schedule?.saturdayPostShow
        });
        setTeamInfo(data);
      } else {
        console.log('No data exists for team:', storedTeam);
      }
    }, (error) => {
      console.error('Error loading team data:', error);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/team-portal/login");
  };

  if (!teamInfo || !teamId) {
    return null;
  }

  // Add schedule tab debug logging
  useEffect(() => {
    if (activeTab === 'schedule' && teamInfo) {
      console.log('Schedule tab active, current team info:', teamInfo);
      console.log('Schedule data:', teamInfo.schedule);
      console.log('Schedule published:', teamInfo.schedule?.isPublished);
      console.log('Show order:', teamInfo.schedule?.showOrder);
    }
  }, [activeTab, teamInfo]);

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
            {[
              ['announcements', 'Announcements'],
              ['information', 'Information'],
              ['tech-time-video', 'Tech Time Video'],
              ['schedule', 'Schedule']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-4 py-2 ${
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
        <div className="space-y-8">
          {activeTab === 'announcements' && (
            <div>
              <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Announcements</h2>
              <div className="space-y-4">
                {teamInfo.announcements?.length > 0 ? (
                  teamInfo.announcements.map((announcement) => (
                    <div key={announcement.id} className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                      <h3 className="text-xl text-white mb-2">{announcement.title}</h3>
                      <p className="text-blue-200/80 whitespace-pre-wrap mb-4">{announcement.content}</p>
                      <p className="text-sm text-blue-200/60">
                        Posted: {new Date(announcement.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-blue-200/60">No announcements at this time.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'information' && (
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Liaisons Information</h3>
                <div className="space-y-4">
                  {teamInfo.information?.liaisons?.map((liaison, index) => (
                    <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-blue-500/5 rounded-lg">
                      <div className="flex flex-col space-y-1">
                        <p className="text-white text-lg font-medium">{liaison.name}</p>
                        {liaison.phone && (
                          <a 
                            href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                            className="text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            {liaison.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Tech Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-500/5 rounded-lg">
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Danceable Space</h4>
                    <p className="text-white">42' x 28'</p>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-lg">
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Backdrop Space</h4>
                    <p className="text-white">4 ft</p>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-lg">
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Apron Space</h4>
                    <p className="text-white">4 ft</p>
                  </div>
                  <div className="p-4 bg-blue-500/5 rounded-lg">
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Props Box</h4>
                    <p className="text-white">7ft (length) x 5ft (depth) x 10ft (height)</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-200">*There will be NO RIGGING this year at Marshall Arts Center*</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Venue Information</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Name</h4>
                    <p className="text-white text-lg">Marshall Family Performing Arts Center</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Address</h4>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <p className="text-white">4141 Spring Valley Rd, Addison, TX 75001</p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
                      >
                        View in Google Maps
                      </a>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Seating Capacity</h4>
                    <p className="text-white">600 seat auditorium</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Hotel Information</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Name</h4>
                    <p className="text-white text-lg">DoubleTree by Hilton Hotel Dallas</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Address</h4>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <p className="text-white">4099 Valley View Ln, Dallas, TX 75244</p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
                      >
                        View in Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech-time-video' && (
            <div>
              <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Tech Time Video</h2>
              {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
                <div className="p-8 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20 flex flex-col items-center justify-center">
                  <h3 className="text-2xl text-white mb-6 font-['Harry_Potter']">{teamInfo.techVideo.title}</h3>
                  <a
                    href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="text-white text-lg">Access Video</span>
                    <svg 
                      className="w-6 h-6 text-white transition-transform duration-300 group-hover:translate-x-1" 
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
                <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <p className="text-blue-200/60">Tech time video will be available soon.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Schedule</h2>
              {renderSchedule()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 