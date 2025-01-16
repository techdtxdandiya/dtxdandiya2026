import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue, update } from 'firebase/database';

interface TeamInfo {
  generalInfo: string;
  techVideo: {
    title: string;
    url: string;
  };
  schedule: {
    events: Array<{
      name: string;
      time: string;
      location: string;
      notes?: string;
    }>;
  };
  nearbyLocations: Array<{
    name: string;
    address: string;
    type: 'Food' | 'Practice' | 'Hotel' | 'Other';
    notes?: string;
  }>;
  announcements: Array<{
    title: string;
    content: string;
    timestamp: number;
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
                          {teamData[teamId]?.announcements?.map((announcement, index) => (
                            <div key={index} className="p-4 bg-black/40 border border-purple-500/30 rounded-lg">
                              <input
                                type="text"
                                value={announcement.title}
                                onChange={(e) => {
                                  const newAnnouncements = [...(teamData[teamId].announcements || [])];
                                  newAnnouncements[index] = {
                                    ...announcement,
                                    title: e.target.value
                                  };
                                  handleUpdateTeamData(teamId, { announcements: newAnnouncements });
                                }}
                                className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2 mb-2"
                                placeholder="Announcement title..."
                              />
                              <textarea
                                value={announcement.content}
                                onChange={(e) => {
                                  const newAnnouncements = [...(teamData[teamId].announcements || [])];
                                  newAnnouncements[index] = {
                                    ...announcement,
                                    content: e.target.value
                                  };
                                  handleUpdateTeamData(teamId, { announcements: newAnnouncements });
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
                                    const newAnnouncements = teamData[teamId].announcements.filter(
                                      (_, i) => i !== index
                                    );
                                    handleUpdateTeamData(teamId, { announcements: newAnnouncements });
                                  }}
                                  className="text-red-500 hover:text-red-400"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newAnnouncement = {
                                title: '',
                                content: '',
                                timestamp: Date.now()
                              };
                              handleUpdateTeamData(teamId, {
                                announcements: [
                                  ...(teamData[teamId].announcements || []),
                                  newAnnouncement
                                ]
                              });
                            }}
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
                    <h2 className="text-2xl font-['Harry_Potter'] mb-4">General Competition Information</h2>
                    {selectedTeams.map((teamId) => (
                      <div key={teamId} className="mb-6">
                        <h3 className="text-xl mb-2">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <textarea
                          value={teamData[teamId].generalInfo}
                          onChange={(e) => {
                            handleUpdateTeamData(teamId, { generalInfo: e.target.value });
                          }}
                          className="w-full h-48 bg-black/40 border border-purple-500/30 rounded-lg p-4"
                          placeholder="Enter general competition information..."
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'tech' && (
                  <div>
                    <h2 className="text-2xl font-['Harry_Potter'] mb-4">Tech Time Video</h2>
                    {selectedTeams.map((teamId) => (
                      <div key={teamId} className="mb-6">
                        <h3 className="text-xl mb-2">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm mb-2">Video Title</label>
                            <input
                              type="text"
                              value={teamData[teamId].techVideo.title}
                              onChange={(e) => {
                                handleUpdateTeamData(teamId, {
                                  techVideo: {
                                    ...teamData[teamId].techVideo,
                                    title: e.target.value
                                  }
                                });
                              }}
                              className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                              placeholder="Enter video title..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-2">Video URL (YouTube Embed)</label>
                            <input
                              type="text"
                              value={teamData[teamId].techVideo.url}
                              onChange={(e) => {
                                handleUpdateTeamData(teamId, {
                                  techVideo: {
                                    ...teamData[teamId].techVideo,
                                    url: e.target.value
                                  }
                                });
                              }}
                              className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                              placeholder="Enter YouTube embed URL..."
                            />
                          </div>
                          {teamData[teamId].techVideo.url && (
                            <div className="aspect-w-16 aspect-h-9">
                              <iframe
                                src={teamData[teamId].techVideo.url}
                                title={teamData[teamId].techVideo.title}
                                className="w-full rounded-lg"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
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
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 bg-purple-900/40 text-left">Event</th>
                                  <th className="px-4 py-2 bg-purple-900/40 text-left">Time</th>
                                  <th className="px-4 py-2 bg-purple-900/40 text-left">Location</th>
                                  <th className="px-4 py-2 bg-purple-900/40 text-left">Notes</th>
                                  <th className="px-4 py-2 bg-purple-900/40 text-left">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teamData[teamId].schedule.events.map((event, index) => (
                                  <tr key={index}>
                                    <td className="px-4 py-2">
                                      <input
                                        type="text"
                                        value={event.name}
                                        onChange={(e) => {
                                          const newEvents = [...teamData[teamId].schedule.events];
                                          newEvents[index] = { ...event, name: e.target.value };
                                          handleUpdateTeamData(teamId, {
                                            schedule: { ...teamData[teamId].schedule, events: newEvents }
                                          });
                                        }}
                                        className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input
                                        type="text"
                                        value={event.time}
                                        onChange={(e) => {
                                          const newEvents = [...teamData[teamId].schedule.events];
                                          newEvents[index] = { ...event, time: e.target.value };
                                          handleUpdateTeamData(teamId, {
                                            schedule: { ...teamData[teamId].schedule, events: newEvents }
                                          });
                                        }}
                                        className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input
                                        type="text"
                                        value={event.location}
                                        onChange={(e) => {
                                          const newEvents = [...teamData[teamId].schedule.events];
                                          newEvents[index] = { ...event, location: e.target.value };
                                          handleUpdateTeamData(teamId, {
                                            schedule: { ...teamData[teamId].schedule, events: newEvents }
                                          });
                                        }}
                                        className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <input
                                        type="text"
                                        value={event.notes || ''}
                                        onChange={(e) => {
                                          const newEvents = [...teamData[teamId].schedule.events];
                                          newEvents[index] = { ...event, notes: e.target.value };
                                          handleUpdateTeamData(teamId, {
                                            schedule: { ...teamData[teamId].schedule, events: newEvents }
                                          });
                                        }}
                                        className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                      />
                                    </td>
                                    <td className="px-4 py-2">
                                      <button
                                        onClick={() => {
                                          const newEvents = teamData[teamId].schedule.events.filter((_, i) => i !== index);
                                          handleUpdateTeamData(teamId, {
                                            schedule: { ...teamData[teamId].schedule, events: newEvents }
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-400"
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <button
                            onClick={() => {
                              const newEvent = {
                                name: '',
                                time: '',
                                location: '',
                                notes: ''
                              };
                              handleUpdateTeamData(teamId, {
                                schedule: {
                                  ...teamData[teamId].schedule,
                                  events: [...teamData[teamId].schedule.events, newEvent]
                                }
                              });
                            }}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            + Add Event
                          </button>
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
                          {teamData[teamId].nearbyLocations.map((location, index) => (
                            <div key={index} className="p-4 bg-black/40 border border-purple-500/30 rounded-lg space-y-4">
                              <div>
                                <label className="block text-sm mb-2">Location Name</label>
                                <input
                                  type="text"
                                  value={location.name}
                                  onChange={(e) => {
                                    const newLocations = [...teamData[teamId].nearbyLocations];
                                    newLocations[index] = { ...location, name: e.target.value };
                                    handleUpdateTeamData(teamId, { nearbyLocations: newLocations });
                                  }}
                                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-2">Address</label>
                                <input
                                  type="text"
                                  value={location.address}
                                  onChange={(e) => {
                                    const newLocations = [...teamData[teamId].nearbyLocations];
                                    newLocations[index] = { ...location, address: e.target.value };
                                    handleUpdateTeamData(teamId, { nearbyLocations: newLocations });
                                  }}
                                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm mb-2">Type</label>
                                <select
                                  value={location.type}
                                  onChange={(e) => {
                                    const newLocations = [...teamData[teamId].nearbyLocations];
                                    newLocations[index] = { ...location, type: e.target.value as any };
                                    handleUpdateTeamData(teamId, { nearbyLocations: newLocations });
                                  }}
                                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                >
                                  <option value="Food">Food</option>
                                  <option value="Practice">Practice</option>
                                  <option value="Hotel">Hotel</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm mb-2">Notes</label>
                                <input
                                  type="text"
                                  value={location.notes || ''}
                                  onChange={(e) => {
                                    const newLocations = [...teamData[teamId].nearbyLocations];
                                    newLocations[index] = { ...location, notes: e.target.value };
                                    handleUpdateTeamData(teamId, { nearbyLocations: newLocations });
                                  }}
                                  className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newLocations = teamData[teamId].nearbyLocations.filter((_, i) => i !== index);
                                  handleUpdateTeamData(teamId, { nearbyLocations: newLocations });
                                }}
                                className="text-red-500 hover:text-red-400"
                              >
                                Remove Location
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newLocation = {
                                name: '',
                                address: '',
                                type: 'Other' as const,
                                notes: ''
                              };
                              handleUpdateTeamData(teamId, {
                                nearbyLocations: [...teamData[teamId].nearbyLocations, newLocation]
                              });
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