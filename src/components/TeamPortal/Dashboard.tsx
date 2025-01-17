import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';

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
      additionalNotes?: string;
    };
    hotel: {
      name: string;
      address: string;
      additionalNotes?: string;
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
  const [activeTab, setActiveTab] = useState<'announcements' | 'information' | 'tech' | 'schedule' | 'locations'>('announcements');

  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as TeamId | null;
    
    if (!storedTeam || storedTeam === 'admin') {
      navigate("/team-portal/login");
      return;
    }

    setTeamId(storedTeam);
    
    const teamRef = ref(db, `teams/${storedTeam}`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
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
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 ${
                activeTab === 'announcements'
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-blue-200/60 hover:text-white'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('information')}
              className={`px-4 py-2 ${
                activeTab === 'information'
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-blue-200/60 hover:text-white'
              }`}
            >
              Information
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`px-4 py-2 ${
                activeTab === 'tech'
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-blue-200/60 hover:text-white'
              }`}
            >
              Tech Video
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 ${
                activeTab === 'schedule'
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-blue-200/60 hover:text-white'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-4 py-2 ${
                activeTab === 'locations'
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-blue-200/60 hover:text-white'
              }`}
            >
              Locations
            </button>
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
            <div>
              <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Information</h2>
              
              {/* Liaisons Section */}
              <div className="mb-8">
                <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <h3 className="text-2xl text-white mb-4">Liaisons Information</h3>
                  <div className="space-y-4">
                    {teamInfo.information?.liaisons.length > 0 ? (
                      teamInfo.information.liaisons.map((liaison, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="text-blue-200">{liaison.name}</div>
                          <div className="text-blue-200">{liaison.phone}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-200/60">Liaison information will be updated soon.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tech Information */}
              <div className="mb-8">
                <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <h3 className="text-2xl text-white mb-4">Tech Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg text-blue-300 mb-2">Danceable Space</h4>
                      <p className="text-blue-200">{teamInfo.information?.tech?.danceableSpace}</p>
                    </div>
                    <div>
                      <h4 className="text-lg text-blue-300 mb-2">Backdrop Space</h4>
                      <p className="text-blue-200">{teamInfo.information?.tech?.backdropSpace}</p>
                    </div>
                    <div>
                      <h4 className="text-lg text-blue-300 mb-2">Apron Space</h4>
                      <p className="text-blue-200">{teamInfo.information?.tech?.apronSpace}</p>
                    </div>
                    <div>
                      <h4 className="text-lg text-blue-300 mb-2">Props Box</h4>
                      <p className="text-blue-200">{teamInfo.information?.tech?.propsBox}</p>
                    </div>
                  </div>
                  {teamInfo.information?.tech?.additionalNotes && (
                    <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
                      <p className="text-blue-200 whitespace-pre-wrap">{teamInfo.information.tech.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Venue Information */}
              <div className="mb-8">
                <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <h3 className="text-2xl text-white mb-4">Venue Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg text-blue-300 mb-2">{teamInfo.information?.venue?.name}</h4>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teamInfo.information?.venue?.address || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                      >
                        <span>{teamInfo.information?.venue?.address}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <div>
                      <h4 className="text-lg text-blue-300 mb-2">Seating Capacity</h4>
                      <p className="text-blue-200">{teamInfo.information?.venue?.seatingCapacity}</p>
                    </div>
                    {teamInfo.information?.venue?.additionalNotes && (
                      <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
                        <p className="text-blue-200 whitespace-pre-wrap">{teamInfo.information.venue.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hotel Information */}
              <div className="mb-8">
                <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <h3 className="text-2xl text-white mb-4">Hotel Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg text-blue-300 mb-2">{teamInfo.information?.hotel?.name}</h4>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teamInfo.information?.hotel?.address || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                      >
                        <span>{teamInfo.information?.hotel?.address}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    {teamInfo.information?.hotel?.additionalNotes && (
                      <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
                        <p className="text-blue-200 whitespace-pre-wrap">{teamInfo.information.hotel.additionalNotes}</p>
                      </div>
                    )}
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

          {activeTab === 'locations' && (
            <div>
              <h2 className="text-3xl font-['Harry_Potter'] text-white mb-6">Nearby Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamInfo.nearbyLocations?.map((location) => (
                  <div key={location.id} className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl text-white">{location.name}</h3>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        location.type === 'Food' ? 'bg-green-500/20 text-green-200' :
                        location.type === 'Practice' ? 'bg-blue-500/20 text-blue-200' :
                        location.type === 'Hotel' ? 'bg-yellow-500/20 text-yellow-200' :
                        location.type === 'Emergency' ? 'bg-red-500/20 text-red-200' :
                        'bg-purple-500/20 text-purple-200'
                      }`}>
                        {location.type}
                      </span>
                    </div>
                    <div className="space-y-2 text-blue-200/80">
                      <p>{location.address}</p>
                      {location.distance && (
                        <p className="text-blue-200/60">Distance: {location.distance}</p>
                      )}
                      {location.notes && (
                        <p className="text-blue-200/60 whitespace-pre-wrap">{location.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 