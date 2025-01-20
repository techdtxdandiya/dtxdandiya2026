import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue, update, get, set } from 'firebase/database';
import { TEAM_DISPLAY_NAMES, INITIAL_LIAISONS } from '../../config/initializeDatabase';
import type { TeamInfo, TeamId, DashboardTeamId, ScheduleEvent } from '../../types/team';
import { FiEdit2, FiTrash2, FiSend, FiAlertCircle, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AnnouncementFormData {
  id?: string;
  title: string;
  content: string;
  isEditing?: boolean;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'announcements' | 'information' | 'tech' | 'schedule'>('announcements');
  const [teamData, setTeamData] = useState<Record<TeamId, TeamInfo>>({} as Record<TeamId, TeamInfo>);
  const [selectedTeams, setSelectedTeams] = useState<TeamId[]>([]);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementFormData>({
    title: '',
    content: ''
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAnnouncementTab, setActiveAnnouncementTab] = useState<'new' | 'manage'>('new');
  const [selectedTeamForAnnouncements, setSelectedTeamForAnnouncements] = useState<TeamId | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const teamsRef = ref(db, 'teams');
    return onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('Received teams data:', data);
        setTeamData(data);
      }
    });
  }, []);

  // Add team selection logging
  const handleTeamSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teamId = e.target.value as TeamId;
    console.log('Team selection changed to:', teamId);
    console.log('Available team data:', Object.keys(teamData));
    if (teamId && teamId in teamData) {
      const selectedTeamData = teamData[teamId];
      console.log('Selected team data:', {
        displayName: selectedTeamData.displayName,
        hasAnnouncements: !!selectedTeamData.announcements,
        announcementCount: selectedTeamData.announcements?.length || 0
      });
    }
    setSelectedTeamForAnnouncements(teamId || null);
  };

  // Add logging to team selection
  useEffect(() => {
    if (selectedTeamForAnnouncements) {
      console.log('Selected team changed to:', selectedTeamForAnnouncements);
      console.log('Current team data:', teamData[selectedTeamForAnnouncements]);
      console.log('Team announcements:', teamData[selectedTeamForAnnouncements]?.announcements);
    }
  }, [selectedTeamForAnnouncements, teamData]);

  const handleLogout = () => {
    sessionStorage.removeItem('team');
    navigate('/team-portal/login');
  };

  const handleTeamSelect = (teamId: TeamId) => {
    console.log('Team selection handler called with:', teamId);
    console.log('Current team data available:', teamData);
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleUpdateTeamData = async (teamId: TeamId, updates: Partial<TeamInfo>) => {
    try {
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      const currentData = snapshot.val() || {};
      await set(teamRef, { ...currentData, ...updates });
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

  const handleUpdateSchedule = async (
    teamId: TeamId,
    scheduleSection: keyof Omit<TeamInfo['schedule'], 'showOrder' | 'isPublished'>,
    data: ScheduleEvent[] | { placing: ScheduleEvent[]; nonPlacing: ScheduleEvent[] }
  ) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/schedule`);
      const snapshot = await get(teamRef);
      const currentSchedule = snapshot.val() || {};
      await set(teamRef, {
        ...currentSchedule,
        [scheduleSection]: data
      });
      setUpdateMessage('Schedule updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating schedule:', error);
      setUpdateMessage('Error updating schedule. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handleUpdateShowOrder = async (teamId: TeamId, order: number | null) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/schedule`);
      const snapshot = await get(teamRef);
      const currentSchedule = snapshot.val() || {};
      await set(teamRef, {
        ...currentSchedule,
        showOrder: order
      });
      setUpdateMessage('Show order updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating show order:', error);
      setUpdateMessage('Error updating show order. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const handleSendAnnouncement = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // Validation
      if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
        setErrorMessage('Please fill in both title and content.');
        return;
      }
      if (selectedTeams.length === 0) {
        setErrorMessage('Please select at least one team.');
        return;
      }

      const newAnnouncement = {
        id: announcementForm.id || Date.now().toString(),
        title: announcementForm.title.trim(),
        content: announcementForm.content.trim(),
        timestamp: Date.now(),
        targetTeams: selectedTeams
      };

      console.log('Sending announcement:', newAnnouncement);
      console.log('Target teams:', selectedTeams);

      await Promise.all(selectedTeams.map(async teamId => {
        const teamRef = ref(db, `teams/${teamId}`);
        const snapshot = await get(teamRef);
        if (snapshot.exists()) {
          const teamData = snapshot.val();
          let currentAnnouncements = teamData.announcements || [];
          
          // Ensure currentAnnouncements is an array
          if (!Array.isArray(currentAnnouncements)) {
            currentAnnouncements = Object.values(currentAnnouncements);
          }
          
          // If editing, remove the old announcement
          const filteredAnnouncements = announcementForm.id 
            ? currentAnnouncements.filter((a: any) => a.id !== announcementForm.id)
            : currentAnnouncements;
          
          const updatedAnnouncements = [...filteredAnnouncements, newAnnouncement];
          console.log(`Updating announcements for team ${teamId}:`, updatedAnnouncements);
          
          await set(teamRef, {
            ...teamData,
            announcements: updatedAnnouncements
          });
        }
      }));

      toast.success(announcementForm.id ? 'Announcement updated successfully' : 'Announcement sent successfully');
      setAnnouncementForm({ title: '', content: '' });
      setSelectedTeams([]);
      setActiveAnnouncementTab('manage');
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAnnouncement = (announcement: TeamInfo['announcements'][0]) => {
    console.log('Editing announcement:', announcement);
    setAnnouncementForm({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      isEditing: true
    });
    setSelectedTeams(announcement.targetTeams || []);
    setActiveAnnouncementTab('new');
  };

  const handleDeleteAnnouncement = async (announcementId: string, teamId: TeamId) => {
    if (!teamId) {
      console.error('No team selected for deletion');
      toast.error('Please select a team first');
      return;
    }
    
    try {
      console.log(`Deleting announcement ${announcementId} from team ${teamId}`);
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      
      if (snapshot.exists()) {
        const teamData = snapshot.val();
        console.log('Current team data:', teamData);
        
        let currentAnnouncements = teamData.announcements || [];
        if (!Array.isArray(currentAnnouncements)) {
          currentAnnouncements = Object.values(currentAnnouncements);
        }
        
        console.log('Current announcements:', currentAnnouncements);
        const updatedAnnouncements = currentAnnouncements.filter((a: any) => a.id !== announcementId);
        console.log('Updated announcements:', updatedAnnouncements);
        
        await set(teamRef, {
          ...teamData,
          announcements: updatedAnnouncements
        });
        
        toast.success('Announcement deleted successfully');
      } else {
        console.error('Team data not found');
        toast.error('Team data not found');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleUpdateLiaisons = async (teamId: TeamId, liaisons: Array<{ name: string; phone: string }>) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/information/liaisons`);
      await set(teamRef, liaisons);
      toast.success('Liaisons updated successfully!');
    } catch (error) {
      console.error('Error updating liaisons:', error);
      toast.error('Error updating liaisons');
    }
  };

  const handleUpdateTechVideo = async (teamId: TeamId, videoData: TeamInfo['techVideo']) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/techVideo`);
      await set(teamRef, videoData);
      setUpdateMessage('Tech video updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating tech video:', error);
      setUpdateMessage('Error updating tech video. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
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

  const handleUpdateSchedulePublished = async (teamId: TeamId, isPublished: boolean) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/schedule`);
      const snapshot = await get(teamRef);
      const currentSchedule = snapshot.val() || {};
      await set(teamRef, {
        ...currentSchedule,
        isPublished
      });
      setUpdateMessage(`Schedule ${isPublished ? 'published' : 'unpublished'} successfully!`);
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating schedule published status:', error);
      setUpdateMessage('Error updating schedule status. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    }
  };

  const renderNewAnnouncementSection = () => (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
        <h3 className="text-xl font-semibold text-white mb-4">New Announcement</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter announcement title"
              value={announcementForm.title}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white"
            />
        </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-1">Content</label>
            <textarea
              placeholder="Enter announcement content"
              value={announcementForm.content}
              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">Select Teams</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(TEAM_DISPLAY_NAMES).map(([teamId, name]) => (
              <button
                key={teamId}
                onClick={() => handleTeamSelect(teamId as TeamId)}
                  className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedTeams.includes(teamId as TeamId)
                      ? 'bg-blue-500/20 text-white border-2 border-blue-500'
                      : 'text-blue-200/60 border border-blue-500/20 hover:bg-blue-500/10'
                }`}
              >
                  <span className="truncate">{name}</span>
                  {selectedTeams.includes(teamId as TeamId) && (
                    <FiCheck className="text-blue-400 ml-2 flex-shrink-0" />
                  )}
              </button>
            ))}
          </div>
        </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-lg"
            >
              <FiAlertCircle />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-blue-500/20">
            <div className="flex gap-2">
            <button
                onClick={() => {
                  setAnnouncementForm({ title: '', content: '' });
                  setSelectedTeams([]);
                  setErrorMessage('');
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Clear All
            </button>
            <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center gap-2 px-4 py-2 ${
                  previewMode 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                } rounded-lg transition-colors`}
              >
                <FiEye />
                Preview
            </button>
            </div>
            
            <button
              onClick={handleSendAnnouncement}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiSend />
              {isSubmitting ? 'Sending...' : 'Send Announcement'}
            </button>
          </div>
        </div>

        {previewMode && announcementForm.title && announcementForm.content && (
          <div className="mt-6 border-t border-blue-500/20 pt-6">
            <h4 className="text-lg font-medium text-blue-300 mb-4">Preview</h4>
            <div className="bg-black/40 p-4 rounded-lg border border-blue-500/10">
              <h5 className="text-lg font-medium text-white mb-2">{announcementForm.title}</h5>
              <p className="text-blue-200/80 whitespace-pre-wrap">{announcementForm.content}</p>
              <div className="mt-4 text-sm text-blue-300/60">
                Will be sent to: {selectedTeams.map(id => TEAM_DISPLAY_NAMES[id]).join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderManageAnnouncementsSection = () => {
    console.log('Rendering manage announcements section');
    console.log('Selected team:', selectedTeamForAnnouncements);
    console.log('Team data available:', Object.keys(teamData));
    
    if (selectedTeamForAnnouncements) {
      console.log('Selected team data:', teamData[selectedTeamForAnnouncements]);
      console.log('Selected team announcements:', 
        teamData[selectedTeamForAnnouncements]?.announcements
      );
    }

    const selectedTeamAnnouncements = selectedTeamForAnnouncements 
      ? teamData[selectedTeamForAnnouncements]?.announcements || []
      : [];

    console.log('Announcements to render:', selectedTeamAnnouncements);

    return (
      <div className="space-y-6">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-semibold text-white">Manage Announcements</h3>
            <div className="w-full sm:w-auto">
              <select
                value={selectedTeamForAnnouncements || ''}
                onChange={handleTeamSelectionChange}
                className="w-full sm:w-64 bg-black/40 border border-blue-500/30 rounded-lg p-2 text-white"
              >
                <option value="">Select a team</option>
                {Object.entries(TEAM_DISPLAY_NAMES).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedTeamForAnnouncements ? (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {selectedTeamAnnouncements.length > 0 ? (
                  selectedTeamAnnouncements.map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group bg-black/40 p-4 rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white mb-2">{announcement.title}</h4>
                          <p className="text-blue-200/80 whitespace-pre-wrap mb-3">{announcement.content}</p>
                          <div className="flex flex-wrap gap-2 items-center text-sm text-blue-300/60">
                            <span>{new Date(announcement.timestamp).toLocaleString()}</span>
                            {announcement.targetTeams && announcement.targetTeams.length > 0 && (
                              <>
                                <span>•</span>
                                <span>Sent to: {announcement.targetTeams.map(id => TEAM_DISPLAY_NAMES[id]).join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                            onClick={() => handleEditAnnouncement(announcement)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Edit announcement"
                          >
                            <FiEdit2 className="text-blue-400" />
            </button>
            <button
                            onClick={() => {
                              console.log('Deleting announcement:', announcement.id);
                              handleDeleteAnnouncement(announcement.id, selectedTeamForAnnouncements);
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete announcement"
                          >
                            <FiTrash2 className="text-red-400" />
            </button>
          </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-blue-200/60 text-center py-8"
                  >
                    No announcements yet for {TEAM_DISPLAY_NAMES[selectedTeamForAnnouncements]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4"
            >
              <p className="text-blue-200/60 mb-2">Select a team to view and manage their announcements</p>
              <p className="text-blue-200/40 text-sm">You can edit, delete, or view the history of announcements for each team</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const renderAnnouncementsSection = () => (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
                                <button
          onClick={() => setActiveAnnouncementTab('new')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeAnnouncementTab === 'new'
              ? 'bg-blue-500/20 text-white'
              : 'text-blue-200/60 hover:bg-blue-500/10'
          }`}
        >
          New Announcement
                                </button>
                          <button
          onClick={() => setActiveAnnouncementTab('manage')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeAnnouncementTab === 'manage'
              ? 'bg-blue-500/20 text-white'
              : 'text-blue-200/60 hover:bg-blue-500/10'
          }`}
        >
          Manage Announcements
                          </button>
                        </div>

      {activeAnnouncementTab === 'new' ? renderNewAnnouncementSection() : renderManageAnnouncementsSection()}
                      </div>
  );

  const renderScheduleSection = (
    teamId: TeamId,
    section: keyof Omit<TeamInfo['schedule'], 'showOrder' | 'isPublished'>,
    title: string
  ) => {
    const events = section === 'saturdayPostShow' 
      ? teamData[teamId]?.schedule?.[section]
      : teamData[teamId]?.schedule?.[section] || [];

    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {section === 'saturdayPostShow' ? (
          <>
            <div className="mb-4">
              <h4 className="text-lg mb-2">Placing Teams</h4>
              {(teamData[teamId]?.schedule?.saturdayPostShow?.placing || []).map((event, index) => (
                <div key={index} className="flex gap-2 mb-2">
                            <input
                    value={event.time}
                              onChange={(e) => {
                      const newPlacing = [...teamData[teamId].schedule.saturdayPostShow.placing];
                      newPlacing[index] = { ...event, time: e.target.value };
                      handleUpdateSchedule(teamId, 'saturdayPostShow', {
                        ...teamData[teamId].schedule.saturdayPostShow,
                        placing: newPlacing
                                });
                              }}
                    className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                            <input
                    value={event.event}
                              onChange={(e) => {
                      const newPlacing = [...teamData[teamId].schedule.saturdayPostShow.placing];
                      newPlacing[index] = { ...event, event: e.target.value };
                      handleUpdateSchedule(teamId, 'saturdayPostShow', {
                        ...teamData[teamId].schedule.saturdayPostShow,
                        placing: newPlacing
                                });
                              }}
                    className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                  />
                  <input
                    value={event.location}
                              onChange={(e) => {
                      const newPlacing = [...teamData[teamId].schedule.saturdayPostShow.placing];
                      newPlacing[index] = { ...event, location: e.target.value };
                      handleUpdateSchedule(teamId, 'saturdayPostShow', {
                        ...teamData[teamId].schedule.saturdayPostShow,
                        placing: newPlacing
                                });
                              }}
                    className="w-48 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                  />
                      </div>
                    ))}
                  </div>
                  <div>
              <h4 className="text-lg mb-2">Non-Placing Teams</h4>
              {(teamData[teamId]?.schedule?.saturdayPostShow?.nonPlacing || []).map((event, index) => (
                <div key={index} className="flex gap-2 mb-2">
                            <input
                    value={event.time}
                              onChange={(e) => {
                      const newNonPlacing = [...teamData[teamId].schedule.saturdayPostShow.nonPlacing];
                      newNonPlacing[index] = { ...event, time: e.target.value };
                      handleUpdateSchedule(teamId, 'saturdayPostShow', {
                        ...teamData[teamId].schedule.saturdayPostShow,
                        nonPlacing: newNonPlacing
                                });
                              }}
                    className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                            <input
                    value={event.event}
                              onChange={(e) => {
                      const newNonPlacing = [...teamData[teamId].schedule.saturdayPostShow.nonPlacing];
                      newNonPlacing[index] = { ...event, event: e.target.value };
                      handleUpdateSchedule(teamId, 'saturdayPostShow', {
                        ...teamData[teamId].schedule.saturdayPostShow,
                        nonPlacing: newNonPlacing
                                });
                              }}
                    className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                  />
                  <input
                    value={event.location}
                              onChange={(e) => {
                      const newNonPlacing = [...teamData[teamId].schedule.saturdayPostShow.nonPlacing];
                      newNonPlacing[index] = { ...event, location: e.target.value };
                      handleUpdateSchedule(teamId, 'saturdayPostShow', {
                        ...teamData[teamId].schedule.saturdayPostShow,
                        nonPlacing: newNonPlacing
                                });
                              }}
                    className="w-48 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                            />
                      </div>
                    ))}
                  </div>
          </>
        ) : (
          (events as ScheduleEvent[]).map((event, index) => (
            <div key={index} className="flex gap-2 mb-2">
                                <input
                value={event.time}
                                  onChange={(e) => {
                  const newEvents = [...events as ScheduleEvent[]];
                  newEvents[index] = { ...event, time: e.target.value };
                  handleUpdateSchedule(teamId, section, newEvents);
                                  }}
                                  className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                />
                                <input
                value={event.event}
                                  onChange={(e) => {
                  const newEvents = [...events as ScheduleEvent[]];
                  newEvents[index] = { ...event, event: e.target.value };
                  handleUpdateSchedule(teamId, section, newEvents);
                }}
                className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg p-2"
              />
                                    <input
                value={event.location}
                                      onChange={(e) => {
                  const newEvents = [...events as ScheduleEvent[]];
                  newEvents[index] = { ...event, location: e.target.value };
                  handleUpdateSchedule(teamId, section, newEvents);
                }}
                className="w-48 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                />
                              </div>
          ))
        )}
                            </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-['Harry_Potter'] text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
                                  </div>

        {updateMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-600/20 border border-green-500 rounded-lg text-green-200"
          >
            {updateMessage}
          </motion.div>
        )}

        <div className="mb-8">
          <div className="flex space-x-4 border-b border-blue-500/30">
            {['announcements', 'information', 'tech', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 transition-colors ${
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

        <div className="max-w-[1200px] mx-auto">
          {activeTab === 'announcements' && renderAnnouncementsSection()}
          {activeTab === 'information' && (
            <div className="space-y-8">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Liaisons Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedTeams.map(teamId => (
                    <div key={teamId} className="space-y-4">
                      <h4 className="text-xl text-white">{TEAM_DISPLAY_NAMES[teamId]}</h4>
                      {teamData[teamId]?.information?.liaisons?.map((liaison, index) => (
                        <div key={index} className="space-y-2">
                          <input
                            type="text"
                            value={liaison.name}
                            onChange={(e) => {
                              const newLiaisons = [...teamData[teamId].information.liaisons];
                              newLiaisons[index] = { ...liaison, name: e.target.value };
                              handleUpdateLiaisons(teamId, newLiaisons);
                            }}
                            placeholder="Liaison Name"
                            className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={liaison.phone}
                              onChange={(e) => {
                                const newLiaisons = [...teamData[teamId].information.liaisons];
                                newLiaisons[index] = { ...liaison, phone: e.target.value };
                                handleUpdateLiaisons(teamId, newLiaisons);
                              }}
                              placeholder="Phone Number"
                              className="flex-1 bg-black/40 border border-blue-500/30 rounded-lg p-2"
                            />
                            {liaison.phone && (
                              <a 
                                href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                                className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-300"
                                title="Call"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newLiaisons = [...(teamData[teamId]?.information?.liaisons || []), { name: '', phone: '' }];
                          handleUpdateLiaisons(teamId, newLiaisons);
                        }}
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        Add Liaison
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Tech Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Danceable Space</h4>
                    <p className="text-white">42' x 28'</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Backdrop Space</h4>
                    <p className="text-white">4 ft</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Apron Space</h4>
                    <p className="text-white">4 ft</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Props Box</h4>
                    <p className="text-white">7ft (length) x 5ft (depth) x 10ft (height)</p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200">
                      *There will be NO RIGGING this year at Marshall Arts Center*
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Venue Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Name</h4>
                    <p className="text-white">Marshall Family Performing Arts Center</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Address</h4>
                    <div className="flex items-center gap-4">
                      <p className="text-white">4141 Spring Valley Rd, Addison, TX 75001</p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
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
                <div className="space-y-4">
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Name</h4>
                    <p className="text-white">DoubleTree by Hilton Hotel Dallas</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 text-sm font-medium mb-2">Address</h4>
                    <div className="flex items-center gap-4">
                      <p className="text-white">4099 Valley View Ln, Dallas, TX 75244</p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
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
            <div className="mt-6">
              {selectedTeams.map(teamId => (
                      <div key={teamId} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                        <div className="space-y-4">
                                <div>
                      <label className="block text-sm font-medium mb-1">Video Title</label>
                                  <input
                                    type="text"
                        value={teamData[teamId]?.techVideo?.title || ''}
                        onChange={(e) => handleUpdateTechVideo(teamId, {
                          ...teamData[teamId]?.techVideo,
                          title: e.target.value
                        })}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                  />
                                </div>
                                <div>
                      <label className="block text-sm font-medium mb-1">YouTube URL</label>
                                  <input
                                    type="text"
                        value={teamData[teamId]?.techVideo?.youtubeUrl || ''}
                        onChange={(e) => handleUpdateTechVideo(teamId, {
                          ...teamData[teamId]?.techVideo,
                          youtubeUrl: e.target.value
                        })}
                                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                  />
                                </div>
                                <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                                  <textarea
                        value={teamData[teamId]?.techVideo?.description || ''}
                        onChange={(e) => handleUpdateTechVideo(teamId, {
                          ...teamData[teamId]?.techVideo,
                          description: e.target.value
                        })}
                                    className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
            </div>
          )}
          {activeTab === 'schedule' && (
            <div className="mt-6">
              {selectedTeams.map(teamId => (
                <div key={teamId} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Show Order:</label>
                        <select
                          value={teamData[teamId]?.schedule?.showOrder || ''}
                          onChange={(e) => handleUpdateShowOrder(teamId, e.target.value ? parseInt(e.target.value) : null)}
                          className="w-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                        >
                          <option value="">Not Assigned</option>
                          {Array.from({ length: 8 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>Team {num}</option>
                          ))}
                        </select>
                        </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Published:</label>
                        <input
                          type="checkbox"
                          checked={teamData[teamId]?.schedule?.isPublished || false}
                          onChange={(e) => handleUpdateSchedulePublished(teamId, e.target.checked)}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                  {renderScheduleSection(teamId, 'friday', 'Friday')}
                  {renderScheduleSection(teamId, 'saturdayTech', 'Saturday Tech Time')}
                  {renderScheduleSection(teamId, 'saturdayPreShow', 'Saturday Pre-Show')}
                  {renderScheduleSection(teamId, 'saturdayShow', 'Saturday Show')}
                  {renderScheduleSection(teamId, 'saturdayPostShow', 'Saturday Post-Show')}
                      </div>
                    ))}
                  </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 