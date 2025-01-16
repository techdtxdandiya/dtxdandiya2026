import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue, update } from 'firebase/database';

interface TeamInfo {
  displayName: string;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: number;
  }>;
  generalInfo: {
    practiceArea: string;
    liasonContact: string;
    specialInstructions: string;
    additionalInfo: string;
  };
  techVideo: {
    title: string;
    youtubeUrl: string;
    description?: string;
  };
  schedule: {
    showOrder: number;
    isPublished: boolean;
    events: Array<{
      id: string;
      name: string;
      startTime: string;
      endTime: string;
      location: string;
      type: 'Practice' | 'Performance' | 'Meeting' | 'Other';
      notes?: string;
    }>;
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

type TeamId = 'tamu' | 'texas' | 'michigan' | 'ucd' | 'unc' | 'iu' | 'berkeley' | 'msu';

const TEAM_DISPLAY_NAMES: Record<TeamId, string> = {
  tamu: 'TAMU Wreckin\' Raas',
  texas: 'Texas Raas',
  michigan: 'Michigan Wolveraas',
  ucd: 'UCD Raasleela',
  unc: 'UNC Tar Heel Raas',
  iu: 'IU HoosierRaas',
  berkeley: 'UC Berkeley Raas Ramzat',
  msu: 'MSU RaaSparty'
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'announcements' | 'general' | 'tech' | 'schedule' | 'locations'>('announcements');
  const [teamData, setTeamData] = useState<Record<TeamId, TeamInfo>>({} as Record<TeamId, TeamInfo>);
  const [selectedTeams, setSelectedTeams] = useState<TeamId[]>([]);
  const [updateMessage, setUpdateMessage] = useState<string>('');

  useEffect(() => {
    const team = sessionStorage.getItem('team');
    if (team !== 'admin') {
      navigate('/team-portal/login');
      return;
    }

    const teamsRef = ref(db, 'teams');
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        setTeamData(snapshot.val());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('team');
    navigate('/team-portal/login');
  };

  const handleTeamSelect = (teamId: TeamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleUpdateTeamData = async (teamId: TeamId, updates: Partial<TeamInfo>) => {
    try {
      const teamRef = ref(db, `teams/${teamId}`);
      await update(teamRef, updates);
      setUpdateMessage('Updates saved successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating team data:', error);
      setUpdateMessage('Error saving updates. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handleAddAnnouncement = (teamId: TeamId) => {
    const newAnnouncement = {
      id: Date.now().toString(),
      title: '',
      content: '',
      timestamp: Date.now()
    };
    
    const currentAnnouncements = teamData[teamId].announcements || [];
    handleUpdateTeamData(teamId, {
      announcements: [...currentAnnouncements, newAnnouncement]
    });
  };

  const handleUpdateSchedule = (teamId: TeamId, newEvent: TeamInfo['schedule']['events'][0]) => {
    const currentEvents = teamData[teamId].schedule?.events || [];
    const eventIndex = currentEvents.findIndex(e => e.id === newEvent.id);
    
    if (eventIndex === -1) {
      handleUpdateTeamData(teamId, {
        schedule: {
          ...teamData[teamId].schedule,
          events: [...currentEvents, newEvent]
        }
      });
    } else {
      const updatedEvents = [...currentEvents];
      updatedEvents[eventIndex] = newEvent;
      handleUpdateTeamData(teamId, {
        schedule: {
          ...teamData[teamId].schedule,
          events: updatedEvents
        }
      });
    }
  };

  const handleUpdateTechVideo = (teamId: TeamId, videoData: TeamInfo['techVideo']) => {
    handleUpdateTeamData(teamId, { techVideo: videoData });
  };

  const handleUpdateLocation = (teamId: TeamId, location: TeamInfo['nearbyLocations'][0]) => {
    const currentLocations = teamData[teamId].nearbyLocations || [];
    const locationIndex = currentLocations.findIndex(l => l.id === location.id);
    
    if (locationIndex === -1) {
      handleUpdateTeamData(teamId, {
        nearbyLocations: [...currentLocations, location]
      });
    } else {
      const updatedLocations = [...currentLocations];
      updatedLocations[locationIndex] = location;
      handleUpdateTeamData(teamId, {
        nearbyLocations: updatedLocations
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-['Harry_Potter']">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl mb-4">Select Teams</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(TEAM_DISPLAY_NAMES).map(([teamId, displayName]) => (
              <button
                key={teamId}
                onClick={() => handleTeamSelect(teamId as TeamId)}
                className={`p-4 rounded-lg transition-colors ${
                  selectedTeams.includes(teamId as TeamId)
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {displayName}
              </button>
            ))}
          </div>
        </div>

        {updateMessage && (
          <div className="mb-4 p-4 bg-green-600/20 border border-green-500 rounded-lg">
            {updateMessage}
          </div>
        )}

        <div className="mb-8">
          <div className="flex space-x-4 border-b border-purple-500/30">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 ${
                activeTab === 'announcements'
                  ? 'border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 ${
                activeTab === 'general'
                  ? 'border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              General Info
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`px-4 py-2 ${
                activeTab === 'tech'
                  ? 'border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tech Video
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 ${
                activeTab === 'schedule'
                  ? 'border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-4 py-2 ${
                activeTab === 'locations'
                  ? 'border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Locations
            </button>
          </div>

          <div className="mt-8">
            {selectedTeams.length === 0 ? (
              <p className="text-gray-400">Please select one or more teams to manage their information.</p>
            ) : (
              <>
                {activeTab === 'announcements' && (
                  <div>
                    <h2 className="text-2xl font-['Harry_Potter'] mb-4">Announcements</h2>
                    {selectedTeams.map((teamId) => (
                      <div key={teamId} className="mb-8">
                        <h3 className="text-xl mb-4">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <div className="space-y-4">
                          {teamData[teamId]?.announcements?.map((announcement) => (
                            <div key={announcement.id} className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                              <input
                                type="text"
                                value={announcement.title}
                                onChange={(e) => {
                                  const updatedAnnouncement = {
                                    ...announcement,
                                    title: e.target.value
                                  };
                                  const currentAnnouncements = teamData[teamId].announcements || [];
                                  const updatedAnnouncements = currentAnnouncements.map(a =>
                                    a.id === announcement.id ? updatedAnnouncement : a
                                  );
                                  handleUpdateTeamData(teamId, { announcements: updatedAnnouncements });
                                }}
                                className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2 mb-2"
                                placeholder="Announcement title..."
                              />
                              <textarea
                                value={announcement.content}
                                onChange={(e) => {
                                  const updatedAnnouncement = {
                                    ...announcement,
                                    content: e.target.value
                                  };
                                  const currentAnnouncements = teamData[teamId].announcements || [];
                                  const updatedAnnouncements = currentAnnouncements.map(a =>
                                    a.id === announcement.id ? updatedAnnouncement : a
                                  );
                                  handleUpdateTeamData(teamId, { announcements: updatedAnnouncements });
                                }}
                                className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                placeholder="Announcement content..."
                              />
                              <div className="mt-2 flex justify-between items-center">
                                <span className="text-sm text-gray-400">
                                  {new Date(announcement.timestamp).toLocaleString()}
                                </span>
                                <button
                                  onClick={() => {
                                    const updatedAnnouncements = teamData[teamId].announcements.filter(
                                      a => a.id !== announcement.id
                                    );
                                    handleUpdateTeamData(teamId, { announcements: updatedAnnouncements });
                                  }}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddAnnouncement(teamId)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            + Add Announcement
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'general' && (
                  <div>
                    <h2 className="text-2xl font-['Harry_Potter'] mb-4">General Information</h2>
                    {selectedTeams.map((teamId) => (
                      <div key={teamId} className="mb-8">
                        <h3 className="text-xl mb-4">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <label className="block mb-2">Practice Area</label>
                            <input
                              type="text"
                              value={teamData[teamId]?.generalInfo?.practiceArea || ''}
                              onChange={(e) => {
                                handleUpdateTeamData(teamId, {
                                  generalInfo: {
                                    ...teamData[teamId]?.generalInfo,
                                    practiceArea: e.target.value
                                  }
                                });
                              }}
                              className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                          </div>
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <label className="block mb-2">Liaison Contact</label>
                            <input
                              type="text"
                              value={teamData[teamId]?.generalInfo?.liasonContact || ''}
                              onChange={(e) => {
                                handleUpdateTeamData(teamId, {
                                  generalInfo: {
                                    ...teamData[teamId]?.generalInfo,
                                    liasonContact: e.target.value
                                  }
                                });
                              }}
                              className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                          </div>
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <label className="block mb-2">Special Instructions</label>
                            <textarea
                              value={teamData[teamId]?.generalInfo?.specialInstructions || ''}
                              onChange={(e) => {
                                handleUpdateTeamData(teamId, {
                                  generalInfo: {
                                    ...teamData[teamId]?.generalInfo,
                                    specialInstructions: e.target.value
                                  }
                                });
                              }}
                              className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                          </div>
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <label className="block mb-2">Additional Information</label>
                            <textarea
                              value={teamData[teamId]?.generalInfo?.additionalInfo || ''}
                              onChange={(e) => {
                                handleUpdateTeamData(teamId, {
                                  generalInfo: {
                                    ...teamData[teamId]?.generalInfo,
                                    additionalInfo: e.target.value
                                  }
                                });
                              }}
                              className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'tech' && (
                  <div>
                    <h2 className="text-2xl font-['Harry_Potter'] mb-4">Tech Video</h2>
                    {selectedTeams.map((teamId) => (
                      <div key={teamId} className="mb-8">
                        <h3 className="text-xl mb-4">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <label className="block mb-2">Video Title</label>
                            <input
                              type="text"
                              value={teamData[teamId]?.techVideo?.title || ''}
                              onChange={(e) => {
                                handleUpdateTechVideo(teamId, {
                                  ...teamData[teamId]?.techVideo,
                                  title: e.target.value
                                });
                              }}
                              className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                          </div>
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <label className="block mb-2">YouTube URL</label>
                            <input
                              type="text"
                              value={teamData[teamId]?.techVideo?.youtubeUrl || ''}
                              onChange={(e) => {
                                handleUpdateTechVideo(teamId, {
                                  ...teamData[teamId]?.techVideo,
                                  youtubeUrl: e.target.value
                                });
                              }}
                              className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                          </div>
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <label className="block mb-2">Description</label>
                            <textarea
                              value={teamData[teamId]?.techVideo?.description || ''}
                              onChange={(e) => {
                                handleUpdateTechVideo(teamId, {
                                  ...teamData[teamId]?.techVideo,
                                  description: e.target.value
                                });
                              }}
                              className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div>
                    <h2 className="text-2xl font-['Harry_Potter'] mb-4">Schedule</h2>
                    {selectedTeams.map((teamId) => (
                      <div key={teamId} className="mb-8">
                        <h3 className="text-xl mb-4">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <label className="block mb-2">Show Order</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={teamData[teamId]?.schedule?.showOrder || 1}
                                  onChange={(e) => {
                                    handleUpdateTeamData(teamId, {
                                      schedule: {
                                        ...teamData[teamId]?.schedule,
                                        showOrder: parseInt(e.target.value)
                                      }
                                    });
                                  }}
                                  className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                />
                              </div>
                              <div className="flex items-center">
                                <label className="mr-2">Published</label>
                                <input
                                  type="checkbox"
                                  checked={teamData[teamId]?.schedule?.isPublished || false}
                                  onChange={(e) => {
                                    handleUpdateTeamData(teamId, {
                                      schedule: {
                                        ...teamData[teamId]?.schedule,
                                        isPublished: e.target.checked
                                      }
                                    });
                                  }}
                                  className="w-4 h-4"
                                />
                              </div>
                            </div>
                            {teamData[teamId]?.schedule?.events?.map((event) => (
                              <div key={event.id} className="p-4 bg-black/40 border border-purple-500/30 rounded-lg mb-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block mb-2">Event Name</label>
                                    <input
                                      type="text"
                                      value={event.name}
                                      onChange={(e) => {
                                        handleUpdateSchedule(teamId, {
                                          ...event,
                                          name: e.target.value
                                        });
                                      }}
                                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2">Event Type</label>
                                    <select
                                      value={event.type}
                                      onChange={(e) => {
                                        handleUpdateSchedule(teamId, {
                                          ...event,
                                          type: e.target.value as TeamInfo['schedule']['events'][0]['type']
                                        });
                                      }}
                                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    >
                                      <option value="Practice">Practice</option>
                                      <option value="Performance">Performance</option>
                                      <option value="Meeting">Meeting</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block mb-2">Start Time</label>
                                    <input
                                      type="datetime-local"
                                      value={event.startTime}
                                      onChange={(e) => {
                                        handleUpdateSchedule(teamId, {
                                          ...event,
                                          startTime: e.target.value
                                        });
                                      }}
                                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    />
                                  </div>
                                  <div>
                                    <label className="block mb-2">End Time</label>
                                    <input
                                      type="datetime-local"
                                      value={event.endTime}
                                      onChange={(e) => {
                                        handleUpdateSchedule(teamId, {
                                          ...event,
                                          endTime: e.target.value
                                        });
                                      }}
                                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block mb-2">Location</label>
                                    <input
                                      type="text"
                                      value={event.location}
                                      onChange={(e) => {
                                        handleUpdateSchedule(teamId, {
                                          ...event,
                                          location: e.target.value
                                        });
                                      }}
                                      className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block mb-2">Notes</label>
                                    <textarea
                                      value={event.notes || ''}
                                      onChange={(e) => {
                                        handleUpdateSchedule(teamId, {
                                          ...event,
                                          notes: e.target.value
                                        });
                                      }}
                                      className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const updatedEvents = teamData[teamId].schedule.events.filter(e => e.id !== event.id);
                                    handleUpdateTeamData(teamId, {
                                      schedule: {
                                        ...teamData[teamId].schedule,
                                        events: updatedEvents
                                      }
                                    });
                                  }}
                                  className="mt-4 text-red-500 hover:text-red-400"
                                >
                                  Remove Event
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newEvent = {
                                  id: Date.now().toString(),
                                  name: '',
                                  type: 'Other' as const,
                                  startTime: new Date().toISOString().slice(0, 16),
                                  endTime: new Date().toISOString().slice(0, 16),
                                  location: '',
                                  notes: ''
                                };
                                handleUpdateSchedule(teamId, newEvent);
                              }}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              + Add Event
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'locations' && (
                  <div>
                    <h2 className="text-2xl font-['Harry_Potter'] mb-4">Nearby Locations</h2>
                    {selectedTeams.map((teamId) => (
                      <div key={teamId} className="mb-8">
                        <h3 className="text-xl mb-4">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <div className="space-y-4">
                          {teamData[teamId]?.nearbyLocations?.map((location) => (
                            <div key={location.id} className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block mb-2">Name</label>
                                  <input
                                    type="text"
                                    value={location.name}
                                    onChange={(e) => {
                                      handleUpdateLocation(teamId, {
                                        ...location,
                                        name: e.target.value
                                      });
                                    }}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2">Type</label>
                                  <select
                                    value={location.type}
                                    onChange={(e) => {
                                      handleUpdateLocation(teamId, {
                                        ...location,
                                        type: e.target.value as TeamInfo['nearbyLocations'][0]['type']
                                      });
                                    }}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                  >
                                    <option value="Food">Food</option>
                                    <option value="Practice">Practice</option>
                                    <option value="Hotel">Hotel</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Other">Other</option>
                                  </select>
                                </div>
                                <div className="col-span-2">
                                  <label className="block mb-2">Address</label>
                                  <input
                                    type="text"
                                    value={location.address}
                                    onChange={(e) => {
                                      handleUpdateLocation(teamId, {
                                        ...location,
                                        address: e.target.value
                                      });
                                    }}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2">Distance</label>
                                  <input
                                    type="text"
                                    value={location.distance || ''}
                                    onChange={(e) => {
                                      handleUpdateLocation(teamId, {
                                        ...location,
                                        distance: e.target.value
                                      });
                                    }}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                    placeholder="e.g. 0.5 miles"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block mb-2">Notes</label>
                                  <textarea
                                    value={location.notes || ''}
                                    onChange={(e) => {
                                      handleUpdateLocation(teamId, {
                                        ...location,
                                        notes: e.target.value
                                      });
                                    }}
                                    className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const updatedLocations = teamData[teamId].nearbyLocations.filter(l => l.id !== location.id);
                                  handleUpdateTeamData(teamId, { nearbyLocations: updatedLocations });
                                }}
                                className="mt-4 text-red-500 hover:text-red-400"
                              >
                                Remove Location
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newLocation = {
                                id: Date.now().toString(),
                                name: '',
                                address: '',
                                type: 'Other' as const,
                                notes: ''
                              };
                              handleUpdateLocation(teamId, newLocation);
                            }}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            + Add Location
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 