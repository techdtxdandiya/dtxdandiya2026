import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue, set } from 'firebase/database';
import { TEAM_LIAISONS } from '../../config/initializeDatabase';

interface TeamInfo {
  displayName: string;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: number;
    targetTeams?: TeamId[];
  }>;
  information: {
    liaisons: Array<{
      name: string;
      phone: string;
    }>;
    tech: {
      danceableSpace: string;
      backdropSpace: string;
      apronSpace: string;
      propsBox: string;
      additionalNotes?: string;
    };
    venue: {
      name: string;
      address: string;
      seatingCapacity: string;
    };
    hotel: {
      name: string;
      address: string;
    };
  };
  techVideo: {
    title: string;
    youtubeUrl: string;
    description?: string;
  };
  schedule: {
    showOrder: number | null;
    isPublished: boolean;
    friday: Array<{
      time: string;
      event: string;
      location: string;
    }>;
    saturdayTech: Array<{
      time: string;
      event: string;
      location: string;
    }>;
    saturdayPreShow: Array<{
      time: string;
      event: string;
      location: string;
    }>;
    saturdayShow: Array<{
      time: string;
      event: string;
      location: string;
    }>;
    saturdayPostShow: {
      placing: Array<{
        time: string;
        event: string;
        location: string;
      }>;
      nonPlacing: Array<{
        time: string;
        event: string;
        location: string;
      }>;
    };
  };
  nearbyLocations: Array<{
    id: string;
    name: string;
    address: string;
    type: 'Food' | 'Practice' | 'Hotel' | 'Emergency' | 'Other';
    distance?: string;
    notes?: string;
  }>;
}

type TeamId = "tamu" | "texas" | "michigan" | "ucd" | "unc" | "iu" | "berkeley" | "msu" | "admin";

const renderScheduleSection = (
  title: string,
  events: Array<{ time: string; event: string; location: string }> | undefined
) => {
  if (!events || events.length === 0) return null;

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<TeamId | null>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'information' | 'tech' | 'schedule'>('announcements');

  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as TeamId | null;
    
    if (!storedTeam || storedTeam === 'admin') {
      navigate("/team-portal/login");
      return;
    }

    setTeamId(storedTeam);
    console.log('Loading data for team:', storedTeam);
    
    const teamRef = ref(db, `teams/${storedTeam}`);
    const unsubscribe = onValue(teamRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Received team data:', data);
        
        // Ensure liaisons data exists and is not empty
        if (!data.information?.liaisons || data.information.liaisons.length === 0) {
          // Re-initialize the team data
          const teamRef = ref(db, `teams/${storedTeam}`);
          try {
            await set(teamRef, {
              ...data,
              information: {
                ...data.information,
                liaisons: TEAM_LIAISONS[storedTeam]
              }
            });
            console.log('Re-initialized liaisons data for team:', storedTeam);
          } catch (error) {
            console.error('Error re-initializing liaisons data:', error);
          }
        }
        
        // Ensure schedule has all required fields
        if (data.schedule) {
          data.schedule = {
            showOrder: data.schedule.showOrder || null,
            isPublished: data.schedule.isPublished || false,
            friday: data.schedule.friday || [],
            saturdayTech: data.schedule.saturdayTech || [],
            saturdayPreShow: data.schedule.saturdayPreShow || [],
            saturdayShow: data.schedule.saturdayShow || [],
            saturdayPostShow: {
              placing: data.schedule.saturdayPostShow?.placing || [],
              nonPlacing: data.schedule.saturdayPostShow?.nonPlacing || []
            }
          };
        }
        setTeamInfo(data);
      } else {
        console.log('No data exists for team:', storedTeam);
      }
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
            {['announcements', 'information', 'tech', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
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
                            className="text-blue-300 hover:text-blue-200 transition-colors"
                          >
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

          {activeTab === 'tech' && (
            <div>
              <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Tech Video</h2>
              {teamInfo.techVideo?.youtubeUrl ? (
                <div className="space-y-6">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={teamInfo.techVideo.youtubeUrl.replace('watch?v=', 'embed/')}
                      title={teamInfo.techVideo.title}
                      className="w-full rounded-xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                    <h3 className="text-xl text-white mb-4">{teamInfo.techVideo.title}</h3>
                    {teamInfo.techVideo.description && (
                      <p className="text-blue-200/80 whitespace-pre-wrap">{teamInfo.techVideo.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-blue-200/60">Tech video will be available soon.</p>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Schedule</h2>
              {teamInfo.schedule?.isPublished ? (
                <div>
                  {teamInfo.schedule.showOrder !== null && (
                    <div className="mb-8 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
                      <p className="text-xl text-white">Performance Order: Team {teamInfo.schedule.showOrder}</p>
                    </div>
                  )}
                  
                  {renderScheduleSection('Friday', teamInfo.schedule.friday)}
                  {renderScheduleSection('Saturday Tech Time', teamInfo.schedule.saturdayTech)}
                  {renderScheduleSection('Saturday Pre-Show', teamInfo.schedule.saturdayPreShow)}
                  {renderScheduleSection('Saturday Show', teamInfo.schedule.saturdayShow)}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl text-white mb-4">Saturday Post-Show</h3>
                    <div className="grid gap-8 md:grid-cols-2">
                      <div>
                        <h4 className="text-xl text-blue-200 mb-4">Placing Teams</h4>
                        <div className="space-y-3">
                          {(teamInfo.schedule.saturdayPostShow?.placing || []).map((event, index) => (
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
                      <div>
                        <h4 className="text-xl text-blue-200 mb-4">Non-Placing Teams</h4>
                        <div className="space-y-3">
                          {(teamInfo.schedule.saturdayPostShow?.nonPlacing || []).map((event, index) => (
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <p className="text-blue-200/60">Schedule will be published soon.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 