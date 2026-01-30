import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { db } from '../../config';
import type { TeamInfo } from '../../types/team';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

type TabType = 'announcements' | 'information' | 'tech-time-video' | 'schedule' | 'report';
type DashboardTeamId = string | 'admin' | 'judge' | 'reps';
type UserType = 'team' | 'judge' | 'reps';

interface TabConfig {
  key: TabType;
  label: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<DashboardTeamId | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('announcements');
  const [scheduleData, setScheduleData] = useState<TeamInfo['schedule'] | null>(null);
  const [reportForm, setReportForm] = useState({ description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userType, setUserType] = useState<UserType>('team');

  // Hogwarts House Assignment mapping for team portals
  const hogwartsAssignments: { [key: string]: string } = {
    tamu: 'Ravenclaw',
    texas: 'Slytherin',
    michigan: 'Ravenclaw',
    uf: 'Slytherin',
    uiuc: 'Hufflepuff',
    uw: 'Hufflepuff',
    washu: 'Gryffindor',
    ucsd: 'Gryffindor'
  };

  const hogwartsHouse = teamId && hogwartsAssignments[teamId];

  let houseColorClass = '';
  if (hogwartsHouse === 'Ravenclaw') {
    houseColorClass = 'bg-blue-600';
  } else if (hogwartsHouse === 'Slytherin') {
    houseColorClass = 'bg-green-600';
  } else if (hogwartsHouse === 'Hufflepuff') {
    houseColorClass = 'bg-yellow-600';
  } else if (hogwartsHouse === 'Gryffindor') {
    houseColorClass = 'bg-red-600';
  }

  // Static schedule data for judges and reps
  const repsScheduleData = {
    friday: [
      { event: "Check-in/Registration", location: "Lobby", time: "12:00 PM - 3:00 PM" },
      { event: "Dinner", location: "Lobby", time: "4:00 PM" },
      { event: "Mixer", location: "Ballroom", time: "5:15 PM" },
      { event: "Go Out", location: "Downtown", time: "8:00 PM" },
    ],
    saturday: [
      { event: "Breakfast", location: "Lobby", time: "7:00 AM" },
      { event: "Props Setup", location: "Venue", time: "5:30 AM - 8:00 AM" },
      { event: "Props Cleanup", location: "Venue", time: "8:00 AM" },
      { event: "Tech Time", location: "Venue", time: "8:40 AM" },
      { event: "Mock Deliberations", location: "Boardroom", time: "11:00 AM" },
      { event: "Lunch", location: "During/After Deliberations", time: "2:00 PM" },
      { event: "Rep/Judges Photos", location: "Venue", time: "3:40 PM" },
      { event: "Show", location: "Venue", time: "5:30 PM" },
      { event: "Show Deliberations", location: "Venue Viewing Room", time: "8:00 PM" },
      { event: "Dinner", location: "RAS Rep Hotel Room", time: "10:00 PM" },
      { event: "After Party", location: "The Reserve", time: "11:00 PM" }
    ]
  };

  const judgesScheduleData = {
    friday: [
      { event: "Check-in/Registration", location: "Oak Room", time: "12:00 AM - 3:00 PM" },
      { event: "Dinner", location: "Lobby", time: "4:00 PM" },
      { event: "Go Out", location: "Downtown", time: "6:00 PM" },
    ],
    saturday: [
      { event: "Breakfast", location: "Lobby", time: "7:00 AM" },
      { event: "Mock Deliberations", location: "Boardroom", time: "11:00 AM" },
      { event: "Lunch", location: "During/After Deliberations", time: "2:00 PM" },
      { event: "Rep/Judges Photos", location: "Venue", time: "3:40 PM" },
      { event: "Show", location: "Venue", time: "5:30 PM" },
      { event: "Show Deliberations", location: "Venue Viewing Room", time: "8:00 PM" },
      { event: "Dinner", location: "Judges Hotel Room", time: "10:00 PM" },
      { event: "After Party", location: "The Reserve", time: "11:00 PM" }
    ]
  };

  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as DashboardTeamId | null;
    
    if (!storedTeam) {
      console.log('No team stored, redirecting to login');
      navigate("/team-portal/login");
      return;
    }

    setTeamId(storedTeam);
    
    // Determine user type
    if (storedTeam === 'judge') {
      setUserType('judge');
    } else if (storedTeam === 'reps') {
      setUserType('reps');
    } else {
      setUserType('team');
      // Only fetch from Firebase for actual teams
    const teamRef = ref(db, `teams/${storedTeam}`);
    const unsubscribe = onValue(teamRef, (snapshot) => {
      if (snapshot.exists()) {
          const data = snapshot.val();
          setTeamInfo(data);
          setScheduleData(data.schedule || null);
      }
      }, (error) => {
        console.error('Error loading team data:', error);
    });

    return () => unsubscribe();
    }
  }, [navigate]);

  // Move debug logging to a separate effect
  useEffect(() => {
    if (activeTab === 'schedule' && teamInfo) {
      console.log('Schedule tab active, current team info:', teamInfo);
      console.log('Schedule data:', teamInfo.schedule);
      console.log('Schedule published:', teamInfo.schedule?.isPublished);
      console.log('Show order:', teamInfo.schedule?.showOrder);
    }
  }, [activeTab, teamInfo]);

  const renderScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }> | undefined
  ) => {
    if (!events || events.length === 0) {
      return null;
    }

    return (
      <div className="mb-12">
        <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-8 px-1">{title}</h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[15px] sm:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-blue-500/50">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500/30 backdrop-blur-sm border border-blue-500"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500/30 backdrop-blur-sm border border-blue-500"></div>
          </div>

          <div className="space-y-8 relative">
            {events.map((event, index) => (
              <div 
                key={index} 
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-[14px] sm:left-1/2 top-1/2 -translate-y-1/2 sm:-translate-x-1/2 w-4 h-4">
                  <div className="absolute inset-0 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="absolute inset-[2px] rounded-full bg-black"></div>
                  <div className="absolute inset-[3px] rounded-full bg-blue-500"></div>
                </div>

                {/* Time Badge */}
                <div className={`hidden sm:flex w-32 ${
                  index % 2 === 0 ? 'justify-end' : 'justify-start'
                }`}>
                  <div className="px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 font-medium font-cormorant">
                    {event.time}
                  </div>
                </div>

                {/* Event Card */}
                <div className={`ml-8 sm:ml-0 flex-1 max-w-lg ${
                  index % 2 === 0 ? 'sm:mr-[calc(50%+2rem)]' : 'sm:ml-[calc(50%+2rem)]'
                }`}>
                  <div className="group relative p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                    {/* Mobile Time Badge */}
                    <div className="sm:hidden mb-2 inline-block px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 text-blue-300 font-medium font-cormorant">
                      {event.time}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-white font-cormorant text-lg group-hover:text-blue-300 transition-colors">
                        {event.event}
                      </h4>
                      <p className="text-blue-200/80 text-2x1 font-cormorant">
                        {event.location}
                      </p>
                    </div>

                    {/* Decorative Corner */}
                    <div className="absolute -top-px -right-px w-4 h-4 rounded-br-xl border-r border-t border-blue-500/30 group-hover:border-blue-500/60 transition-colors"></div>
                    <div className="absolute -bottom-px -left-px w-4 h-4 rounded-tl-xl border-l border-b border-blue-500/30 group-hover:border-blue-500/60 transition-colors"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSchedule = () => {
    if (userType === 'team') {
      // Existing team schedule rendering logic
      if (!scheduleData) {
        return (
          <div className="p-6 bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-blue-200/80 text-center font-cormorant">Schedule will be available soon.</p>
          </div>
        );
      }

      if (!scheduleData.isPublished) {
        return (
          <div className="p-6 bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-blue-200/80 text-center font-cormorant">Schedule will be available soon.</p>
          </div>
        );
      }

      if (!scheduleData.showOrder) {
        return (
          <div className="p-6 bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-blue-200/80 text-center font-cormorant">Schedule has not been assigned yet.</p>
          </div>
        );
      }

      return (
        <div className="space-y-8">
          <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl border border-blue-500/20">
            <p className="text-2xl sm:text-3xl text-white font-cormorant text-center">
              Performance Order: {scheduleData.showOrder}
            </p>
          </div>
          {renderScheduleSection("Friday", scheduleData.friday)}
          {renderScheduleSection("Saturday Tech Time", scheduleData.saturdayTech)}
          {renderScheduleSection("Saturday Pre-Show", scheduleData.saturdayPreShow)}
          {renderScheduleSection("Saturday Show", scheduleData.saturdayShow)}
          {scheduleData.saturdayPostShow && (
            <>
              {renderScheduleSection("Saturday Post-Show (Non-Placing)", scheduleData.saturdayPostShow.nonPlacing)}
              {renderScheduleSection("Saturday Post-Show (Placing)", scheduleData.saturdayPostShow.placing)}
            </>
          )}
        </div>
      );
    } else {
      // Render static schedule for judges and reps
      const scheduleToUse = userType === 'reps' ? repsScheduleData : judgesScheduleData;
      return (
        <div className="space-y-8">
          {renderScheduleSection("Friday", scheduleToUse.friday)}
          {renderScheduleSection("Saturday", scheduleToUse.saturday)}
        </div>
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/team-portal/login");
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.description.trim()) return;

    setIsSubmitting(true);
    try {
      const reportsRef = ref(db, 'reports');
      const newReportRef = push(reportsRef);
      await set(newReportRef, {
        description: reportForm.description,
        timestamp: serverTimestamp(),
        teamId: teamId
      });
      
      toast.success('Report submitted successfully');
      setReportForm({ description: '' });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available tabs based on user type
  const getAvailableTabs = (): TabConfig[] => {
    if (userType === 'team') {
      return [
        { key: 'announcements', label: 'Announcements' },
        { key: 'information', label: 'Information' },
        { key: 'tech-time-video', label: 'Tech Time Video' },
        { key: 'schedule', label: 'Schedule' },
        { key: 'report', label: 'Report' }
      ];
    } else {
      return [
        { key: 'information', label: 'Information' },
        { key: 'schedule', label: 'Schedule' }
      ];
    }
  };

  // Get header title based on user type
  const getHeaderTitle = () => {
    if (userType === 'team' && teamInfo?.displayName) {
      return teamInfo.displayName;
    } else if (userType === 'judge') {
      return 'Judges Portal';
    } else if (userType === 'reps') {
      return 'Representatives Portal';
    }
    return '';
  };

  const renderInformationTab = () => {
    if (userType === 'reps') {
      return (
        <div className="space-y-8">
          {/* Reps Information Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">Reps Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 2a1 1 0 012-2h6a2 2 0 012 2v2h2a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h2V2zm8 2H7V2h6v2zm1 2H6v12h8V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Props Boxes</h4>
                  <p className="text-white font-sans">Props Boxes are in permanent places</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Props Setup Measurement</h4>
                  <p className="text-white font-sans">DTX Directors/Logs will provide tech reps with a measuring tape at the venue during props setup to check prop box dimensions</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Extension Cables</h4>
                  <p className="text-white font-sans">Extension cables for teams are provided</p>
                </div>
              </div>

              {/* Schedule Links Section */}
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Schedule Links</h4>
                  <div className="space-y-1">
                    <a 
                      href="https://docs.google.com/spreadsheets/d/1KfuXm3ssbFsC-hpclEz11NpA49j8Z570gbqYwttBUF4/edit?usp=drive_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white hover:text-blue-300 font-sans text-sm transition-colors flex items-center gap-1"
                    >
                      Master Schedule
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                    <a 
                      href="https://docs.google.com/spreadsheets/d/1Q3MeB3ljCWTGrGrz8pUAOH5pvmdGBGa3Y5UKpiJOJYk/edit?usp=drive_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white hover:text-blue-300 font-sans text-sm transition-colors flex items-center gap-1"
                    >
                      Transportation Schedule
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                    <a 
                      href="https://docs.google.com/spreadsheets/d/1WoZc6X9HfN3vUDeT_3f5c_ugxk7mfWM4KA5ZVVj1e3w/edit?gid=209341081#gid=209341081"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white hover:text-blue-300 font-sans text-sm transition-colors flex items-center gap-1"
                    >
                      Board Schedule
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Information Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-cormorant text-white mb-4">General Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Danceable Space</h4>
                  <p className="text-white font-sans">42' x 28'</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Backdrop Space</h4>
                  <p className="text-white font-sans">4 ft</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Apron Space</h4>
                  <p className="text-white font-sans">4 ft</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Stage Props Dimensions</h4>
                  <p className="text-white font-sans">42" x 4"</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Prop Box Size</h4>
                  <p className="text-white font-sans">7ft (Length) x 5ft (Width) x 10+ft (Height)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h6v7H7V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Info Packet</h4>
                  <a 
                    href="https://docs.google.com/document/d/1P68N1dQVvHo5vtKcbFzOjVPJHFAVX7uE2NDq7p-ZfvU/edit?tab=t.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 font-sans transition-colors flex items-center gap-1"
                  >
                    View Document
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">*There will be NO RIGGING this year at Marshall Arts Center*</p>
              </div>
            </div>
          </div>

          {/* Tech Time Flow Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-4">Tech Time Flow</h3>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-blue-500/20">
              <img
                src="/assets/reps/techtime_flow.jpeg"
                alt="Tech Time Flow"
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Show Flow Section */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-4">Show Flow</h3>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-blue-500/20">
              <img
                src="/assets/reps/show_flow.jpeg"
                alt="Show Flow"
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Existing sections */}
          {renderVenueInfoSection()}
          {renderHotelInfoSection()}
          {renderLivestreamSection()}
          {renderNearbyPlacesSection()}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Liaison Information Section for Teams */}
        {userType === 'team' && teamInfo?.information?.liaisons && (
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-4">Liaisons Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamInfo.information.liaisons.map((liaison, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-blue-500/5 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium font-sans truncate">{liaison.name}</p>
                    {liaison.phone && (
                      <a 
                        href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                        className="text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-2 text-sm font-sans"
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
        )}

        {/* Original content for other user types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
            <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-4">General Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Danceable Space</h4>
                  <p className="text-white font-sans">42' x 28'</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Backdrop Space</h4>
                  <p className="text-white font-sans">4 ft</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Stage Props Dimensions</h4>
                  <p className="text-white font-sans">42" x 4"</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Prop Box Size</h4>
                  <p className="text-white font-sans">7ft (Length) x 5ft (Width) x 10+ft (Height)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h6v7H7V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-blue-300 text-sm font-sans font-medium">Info Packet</h4>
                  <a 
                    href="https://docs.google.com/document/d/1P68N1dQVvHo5vtKcbFzOjVPJHFAVX7uE2NDq7p-ZfvU/edit?tab=t.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-300 font-sans transition-colors flex items-center gap-1"
                  >
                    View Document
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">*There will be NO RIGGING this year at Marshall Arts Center*</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {renderVenueInfoSection()}
            {renderHotelInfoSection()}
            {renderLivestreamSection()}
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-6">Nearby Places</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-edwardian text-white mb-4">Food Options</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-sans">Chick-fil-A</p>
                    <a 
                      href="https://maps.google.com/?q=13347+Montfort+Dr,+Dallas,+TX+75240"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                    >
                      13347 Montfort Dr, Dallas, TX 75240
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-sans">In-N-Out Burger</p>
                    <a 
                      href="https://maps.google.com/?q=7940+Belt+Line+Rd,+Dallas,+TX+75254"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                    >
                      7940 Belt Line Rd, Dallas, TX 75254
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-edwardian text-white mb-4">Prop Repair Places</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-sans">At Home</p>
                    <a 
                      href="https://maps.google.com/?q=13710+Dallas+Pkwy,+Dallas,+TX+75240"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                    >
                      13710 Dallas Pkwy, Dallas, TX 75240
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-sans">Hobby Lobby</p>
                    <a 
                      href="https://maps.google.com/?q=14555+Dallas+Pkwy,+Dallas,+TX+75254"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                    >
                      14555 Dallas Pkwy, Dallas, TX 75254
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-sans">Joann Fabrics and Crafts</p>
                    <a 
                      href="https://maps.google.com/?q=13710+Dallas+Pkwy,+Dallas,+TX+75240"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                    >
                      13710 Dallas Pkwy, Dallas, TX 75240
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (userType === 'team' && !teamInfo) {
      return null;
    }

    const renderAnnouncementsTab = () => {
      if (userType !== 'team' || !teamInfo) return null;
      return (
        <div>
          <h2 className="text-3xl sm:text-4xl font-edwardian text-white mb-4 sm:mb-6">Announcements</h2>
          <div className="space-y-3 sm:space-y-4">
            {teamInfo.announcements?.length > 0 ? (
              teamInfo.announcements.map((announcement) => (
                <div key={announcement.id} className="p-4 sm:p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
                  <h3 className="text-lg sm:text-xl font-edwardian text-white mb-2">{announcement.title}</h3>
                  <p className="text-blue-200/80 whitespace-pre-wrap font-sans mb-3 sm:mb-4">{announcement.content}</p>
                  <p className="text-xs sm:text-sm text-blue-200/60 font-sans">
                    Posted: {new Date(announcement.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-blue-200/60 font-sans text-center py-4">No announcements at this time.</p>
            )}
          </div>
        </div>
      );
    };

    const renderTechVideoTab = () => {
      if (userType !== 'team' || !teamInfo) return null;
      return (
        <div>
          <h2 className="text-3xl sm:text-4xl font-edwardian text-white mb-4 sm:mb-6"
          style={{ wordSpacing: '0.1em' }}>
            Tech Time Video
          </h2>
          {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
            <div className="p-4 sm:p-8 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
              <div className="flex flex-col items-center justify-center gap-6">
                <a
                  href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto group flex items-center justify-center gap-3 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="text-white text-lg font-sans">Access Video</span>
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
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/20">
              <p className="text-blue-200/60 font-sans text-center">Tech time video will be available soon.</p>
            </div>
          )}
        </div>
      );
    };

    const renderReportTab = () => {
      if (userType !== 'team') return null;
      return (
        <div>
          <h2 className="text-3xl sm:text-4xl font-edwardian text-white mb-4 sm:mb-6"
          style={{ wordSpacing: '0.1em' }}>
            Anonymous Report
          </h2>
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <p className="text-blue-200 font-sans mb-4">
                  This form is for reporting any concerns, SA incidents, or feedback 100% anonymously. Your submission will be sent directly to the DTX Dandiya Directors for review.
                </p>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-white font-sans mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm({ description: e.target.value })}
                    placeholder="Please provide details of your report..."
                    className="w-full h-48 px-4 py-3 bg-black/40 border border-blue-500/30 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:border-blue-500/60 transition-colors font-sans"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-sans transition-all duration-300 flex items-center gap-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Report
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    };

    const getTabContent = () => {
      switch (activeTab) {
        case 'announcements':
          return renderAnnouncementsTab();
        case 'information':
          return renderInformationTab();
        case 'tech-time-video':
          return renderTechVideoTab();
        case 'schedule':
          return (
            <div>
              <h2 className="text-3xl sm:text-4xl font-edwardian text-white mb-4 sm:mb-6"
              style={{ wordSpacing: '0.1em' }}>
                Schedule
              </h2>
              {renderSchedule()}
            </div>
          );
        case 'report':
          return renderReportTab();
        default:
          return null;
      }
    };

    return (
      <div className="space-y-6 sm:space-y-8">
        {getTabContent()}
      </div>
    );
  };

  const renderVenueInfoSection = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-4">Venue Information</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3 1h6v7H7V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-sans font-medium">Name</h4>
            <p className="text-white font-sans">Marshall Family Performing Arts Center</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-blue-300 text-sm font-sans font-medium">Address</h4>
            <p className="text-white font-sans mb-2">4141 Spring Valley Rd, Addison, TX 75001</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200 text-sm"
            >
              View in Google Maps
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-sans font-medium">Seating Capacity</h4>
            <p className="text-white font-sans">600 seat auditorium</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHotelInfoSection = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-4">Hotel Information</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-300 text-sm font-sans font-medium">Name</h4>
            <p className="text-white font-sans">DoubleTree by Hilton Hotel Dallas</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-blue-300 text-sm font-sans font-medium">Address</h4>
            <p className="text-white font-sans mb-2">4099 Valley View Ln, Dallas, TX 75244</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200 text-sm"
            >
              View in Google Maps
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLivestreamSection = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-4">Livestream</h3>
      <div className="space-y-4">
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-blue-500/20">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/0hLdHx_i1W0?si=d8mO241CDsOpoGuT"
            title="DTX Dandiya 2025 Livestream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );

  const renderNearbyPlacesSection = () => (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
      <h3 className="text-xl sm:text-2xl font-edwardian text-white mb-6">Nearby Places</h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-edwardian text-white mb-4">Food Options</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">Chick-fil-A</p>
                <a 
                  href="https://maps.google.com/?q=13347+Montfort+Dr,+Dallas,+TX+75240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  13347 Montfort Dr, Dallas, TX 75240
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">In-N-Out Burger</p>
                <a 
                  href="https://maps.google.com/?q=7940+Belt+Line+Rd,+Dallas,+TX+75254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  7940 Belt Line Rd, Dallas, TX 75254
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xl font-edwardian text-white mb-4">Prop Repair Places</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">At Home</p>
                <a 
                  href="https://maps.google.com/?q=13710+Dallas+Pkwy,+Dallas,+TX+75240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  13710 Dallas Pkwy, Dallas, TX 75240
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">Hobby Lobby</p>
                <a 
                  href="https://maps.google.com/?q=14555+Dallas+Pkwy,+Dallas,+TX+75254"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  14555 Dallas Pkwy, Dallas, TX 75254
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FaMapMarkerAlt className="text-blue-300 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-sans">Joann Fabrics and Crafts</p>
                <a 
                  href="https://maps.google.com/?q=13710+Dallas+Pkwy,+Dallas,+TX+75240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 text-sm font-sans flex items-center gap-1"
                >
                  13710 Dallas Pkwy, Dallas, TX 75240
                  <FaExternalLinkAlt className="text-xs" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!teamId || (userType === 'team' && !teamInfo)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <Toaster position="top-right" />
      
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

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12">
          <div className="flex flex-col items-center sm:items-start gap-2">
            <h1 className="text-4xl md:text-5xl font-edwardian text-white glow-text-intense text-center sm:text-left">
              {getHeaderTitle()}
            </h1>
            {userType === 'team' && hogwartsHouse && (
              <div className={`${houseColorClass} bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-white/20 shadow-lg transform hover:scale-105 transition-all duration-300`}>
                <span className="text-xl font-edwardian text-white">House: {hogwartsHouse}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-white font-edwardian hover:bg-blue-500/20 transition-all duration-300"
          >
            Mischief Managed (Logout)
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row border-b border-blue-500/30">
            {getAvailableTabs().map((tab) => (
            <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 sm:py-2 font-edwardian text-lg sm:text-base transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-blue-500/20 sm:bg-transparent border-b-2 border-blue-500 text-white'
                    : 'text-blue-200/60 hover:text-white hover:bg-blue-500/10 sm:hover:bg-transparent'
                }`}
              >
                {tab.label}
            </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
} 