import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config';
import type { TeamInfo, DashboardTeamId } from '../../types/team';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink, Element } from 'react-scroll';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<DashboardTeamId | null>(null);
  const [scheduleData, setScheduleData] = useState<TeamInfo['schedule'] | null>(null);
  const [activeSection, setActiveSection] = useState('announcements');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Navigation items
  const navigationItems = [
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'schedule', label: 'Schedule', icon: '📅' },
    { id: 'tech-time-video', label: 'Tech Time', icon: '🎥' },
    { id: 'information', label: 'Information', icon: 'ℹ️' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as DashboardTeamId | null;
    
    if (!storedTeam || storedTeam === 'admin') {
      navigate("/team-portal/login");
      return;
    }

    setTeamId(storedTeam);
    
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
  }, [navigate]);

  // Add this new type for calendar events
  type CalendarEvent = {
    title: string;
    start: string;
    end?: string;
    location?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    classNames?: string[];
  };

  // Add new function to convert schedule data to calendar events
  const convertScheduleToEvents = (): CalendarEvent[] => {
    if (!scheduleData) return [];

    const events: CalendarEvent[] = [];
    const today = new Date();
    const friday = new Date(today.getTime());
    friday.setDate(today.getDate() - today.getDay() + 5); // Get to Friday

    // Helper function to create date string
    const createDateTimeString = (date: Date, timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
      const newDate = new Date(date.getTime());
      newDate.setHours(hours, minutes);
      return newDate.toISOString();
    };

    // Add Friday events
    scheduleData.friday?.forEach(event => {
      events.push({
        title: event.event,
        start: createDateTimeString(friday, event.time),
        location: event.location,
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: 'rgba(147, 51, 234, 0.3)',
        textColor: '#f3f4f6',
        classNames: ['backdrop-blur-sm']
      });
    });

    // Add Saturday events
    const saturday = new Date(friday.getTime());
    saturday.setDate(friday.getDate() + 1);

    // Tech Time events
    scheduleData.saturdayTech?.forEach(event => {
      events.push({
        title: event.event,
        start: createDateTimeString(saturday, event.time),
        location: event.location,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        textColor: '#f3f4f6',
        classNames: ['backdrop-blur-sm']
      });
    });

    // Pre-Show events
    scheduleData.saturdayPreShow?.forEach(event => {
      events.push({
        title: event.event,
        start: createDateTimeString(saturday, event.time),
        location: event.location,
        backgroundColor: 'rgba(234, 179, 8, 0.2)',
        borderColor: 'rgba(234, 179, 8, 0.3)',
        textColor: '#f3f4f6',
        classNames: ['backdrop-blur-sm']
      });
    });

    // Show events
    scheduleData.saturdayShow?.forEach(event => {
      events.push({
        title: event.event,
        start: createDateTimeString(saturday, event.time),
        location: event.location,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        textColor: '#f3f4f6',
        classNames: ['backdrop-blur-sm']
      });
    });

    // Post-Show events
    scheduleData.saturdayPostShow?.nonPlacing?.forEach(event => {
      events.push({
        title: event.event,
        start: createDateTimeString(saturday, event.time),
        location: event.location,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        textColor: '#f3f4f6',
        classNames: ['backdrop-blur-sm']
      });
    });

    scheduleData.saturdayPostShow?.placing?.forEach(event => {
      events.push({
        title: event.event,
        start: createDateTimeString(saturday, event.time),
        location: event.location,
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderColor: 'rgba(236, 72, 153, 0.3)',
        textColor: '#f3f4f6',
        classNames: ['backdrop-blur-sm']
      });
    });

    return events;
  };

  const renderScheduleGrid = (
    events: Array<{ time: string; event: string; location: string }> | undefined
  ) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 backdrop-blur-lg rounded-lg p-3 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-16 text-sm font-medium text-purple-300">
                {event.time}
              </div>
              <div className="flex-grow">
                <div className="text-white font-medium">{event.event}</div>
                <div className="text-purple-300 text-sm">{event.location}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/team-portal/login");
  };

  // Add this new function to render calendar events
  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="p-1">
        <div className="font-medium">{eventInfo.event.title}</div>
        {eventInfo.event.extendedProps.location && (
          <div className="text-xs opacity-75">{eventInfo.event.extendedProps.location}</div>
        )}
      </div>
    );
  };

  if (!teamInfo || !teamId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#1a1a2e] font-inter">
      {/* Magical Particle Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[url('/assets/magical-particles.png')] animate-float" />
      </div>

      {/* Header */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/80 backdrop-blur-xl border-b border-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-['Harry_Potter'] bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 text-transparent bg-clip-text">
              {teamInfo.displayName}
            </h1>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map(item => (
                <ScrollLink
                  key={item.id}
                  to={item.id}
                  spy={true}
                  smooth={true}
                  offset={-80}
                  duration={500}
                  className={`cursor-pointer transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    activeSection === item.id
                      ? 'bg-purple-500/20 text-purple-200'
                      : 'text-purple-300/60 hover:text-purple-200'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </ScrollLink>
              ))}
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-full text-purple-200 text-sm font-medium transition-all duration-300"
              >
                Logout
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-purple-200 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-2"
              >
                <div className="flex flex-col space-y-2">
                  {navigationItems.map(item => (
                    <ScrollLink
                      key={item.id}
                      to={item.id}
                      spy={true}
                      smooth={true}
                      offset={-80}
                      duration={500}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`cursor-pointer transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg ${
                        activeSection === item.id
                          ? 'bg-purple-500/20 text-purple-200'
                          : 'text-purple-300/60 hover:text-purple-200'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </ScrollLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-200 font-medium transition-all duration-300"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16 space-y-12">
        {/* Announcements Section */}
        <Element name="announcements" id="announcements">
          <section className="space-y-4">
            <h2 className="text-2xl font-['Harry_Potter'] text-purple-200 flex items-center gap-2">
              <span>📢</span> Announcements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamInfo.announcements?.length > 0 ? (
                teamInfo.announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-lg rounded-lg p-4 hover:bg-white/10 transition-all duration-300 border border-purple-500/10"
                  >
                    <h3 className="text-lg font-medium text-purple-200 mb-2">{announcement.title}</h3>
                    <p className="text-purple-300 text-sm whitespace-pre-wrap mb-3">{announcement.content}</p>
                    <p className="text-xs text-purple-400">
                      {new Date(announcement.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 bg-white/5 backdrop-blur-lg rounded-lg p-4 text-center text-purple-300">
                  No announcements at this time.
                </div>
              )}
            </div>
          </section>
        </Element>

        {/* Schedule Section */}
        <Element name="schedule" id="schedule">
          <section className="space-y-6">
            <h2 className="text-2xl font-['Harry_Potter'] text-purple-200 flex items-center gap-2">
              <span>📅</span> Schedule
            </h2>
            
            {scheduleData?.showOrder && (
              <div className="bg-purple-500/10 backdrop-blur-lg rounded-lg px-4 py-3 inline-block">
                <p className="text-purple-200 font-medium">Performance Order: {scheduleData.showOrder}</p>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Calendar View */}
                <div className="lg:col-span-3">
                  <div className="fc-custom-theme">
                    <FullCalendar
                      plugins={[timeGridPlugin, dayGridPlugin, listPlugin]}
                      initialView="timeGridTwoDay"
                      views={{
                        timeGridTwoDay: {
                          type: 'timeGrid',
                          duration: { days: 2 },
                          buttonText: '2 day'
                        }
                      }}
                      headerToolbar={{
                        left: 'timeGridTwoDay,listTwoDay',
                        center: 'title',
                        right: 'prev,next'
                      }}
                      events={convertScheduleToEvents()}
                      slotMinTime="08:00:00"
                      slotMaxTime="24:00:00"
                      allDaySlot={false}
                      height="auto"
                      eventContent={renderEventContent}
                      slotLabelFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: 'short'
                      }}
                      eventTimeFormat={{
                        hour: 'numeric',
                        minute: '2-digit',
                        meridiem: 'short'
                      }}
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-medium text-purple-200 mb-4">Event Types</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-2 bg-purple-500/20 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-purple-500/50" />
                      <span className="text-purple-200">Friday Events</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-blue-500/20 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-blue-500/50" />
                      <span className="text-purple-200">Tech Time</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-yellow-500/20 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-yellow-500/50" />
                      <span className="text-purple-200">Pre-Show</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-red-500/20 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-red-500/50" />
                      <span className="text-purple-200">Show</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-green-500/20 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-green-500/50" />
                      <span className="text-purple-200">Post-Show (Non-Placing)</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-pink-500/20 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-pink-500/50" />
                      <span className="text-purple-200">Post-Show (Placing)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Element>

        {/* Tech Time Video Section */}
        <Element name="tech-time-video" id="tech-time-video">
          <section className="space-y-4">
            <h2 className="text-2xl font-['Harry_Potter'] text-purple-200 flex items-center gap-2">
              <span>🎥</span> Tech Time Video
            </h2>
            {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center border border-purple-500/10">
                <h3 className="text-xl font-medium text-purple-200 mb-4">{teamInfo.techVideo.title}</h3>
                <a
                  href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105"
                >
                  <span>Watch Video</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 text-center text-purple-300">
                Tech time video will be available soon.
              </div>
            )}
          </section>
        </Element>

        {/* Information Section */}
        <Element name="information" id="information">
          <section className="space-y-6">
            <h2 className="text-2xl font-['Harry_Potter'] text-purple-200 flex items-center gap-2">
              <span>ℹ️</span> Information
            </h2>
            
            {/* Grid Layout for Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Liaisons Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
                <h3 className="text-lg font-medium text-purple-200 mb-4">Liaisons</h3>
                <div className="space-y-3">
                  {teamInfo.information?.liaisons?.map((liaison, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-purple-500/10 rounded-lg"
                    >
                      <div className="flex-grow">
                        <p className="text-purple-200 font-medium">{liaison.name}</p>
                        {liaison.phone && (
                          <a
                            href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                            className="text-sm text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {liaison.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Details Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
                <h3 className="text-lg font-medium text-purple-200 mb-4">Tech Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <p className="text-sm text-purple-300 mb-1">Danceable Space</p>
                    <p className="text-purple-200 font-medium">42' x 28'</p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <p className="text-sm text-purple-300 mb-1">Backdrop Space</p>
                    <p className="text-purple-200 font-medium">4 ft</p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <p className="text-sm text-purple-300 mb-1">Apron Space</p>
                    <p className="text-purple-200 font-medium">4 ft</p>
                  </div>
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <p className="text-sm text-purple-300 mb-1">Props Box</p>
                    <p className="text-purple-200 font-medium">7' × 5' × 10'</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-300 text-sm">*There will be NO RIGGING this year at Marshall Arts Center*</p>
                </div>
              </div>

              {/* Venue Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
                <h3 className="text-lg font-medium text-purple-200 mb-4">Venue</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Name</p>
                    <p className="text-purple-200">Marshall Family Performing Arts Center</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Address</p>
                    <p className="text-purple-200 mb-2">4141 Spring Valley Rd, Addison, TX 75001</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-200 text-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Open in Maps
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Seating Capacity</p>
                    <p className="text-purple-200">600 seat auditorium</p>
                  </div>
                </div>
              </div>

              {/* Hotel Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-purple-500/10">
                <h3 className="text-lg font-medium text-purple-200 mb-4">Hotel</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Name</p>
                    <p className="text-purple-200">DoubleTree by Hilton Hotel Dallas</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Address</p>
                    <p className="text-purple-200 mb-2">4099 Valley View Ln, Dallas, TX 75244</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-purple-200 text-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Open in Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Element>
      </main>
    </div>
  );
}

// Add these styles to your CSS/SCSS file or in a style tag in your HTML
<style>
{`
  .fc-custom-theme {
    --fc-border-color: rgba(147, 51, 234, 0.2);
    --fc-button-bg-color: rgba(147, 51, 234, 0.2);
    --fc-button-border-color: rgba(147, 51, 234, 0.3);
    --fc-button-hover-bg-color: rgba(147, 51, 234, 0.3);
    --fc-button-hover-border-color: rgba(147, 51, 234, 0.4);
    --fc-button-active-bg-color: rgba(147, 51, 234, 0.4);
    --fc-button-active-border-color: rgba(147, 51, 234, 0.5);
    --fc-event-bg-color: rgba(147, 51, 234, 0.2);
    --fc-event-border-color: rgba(147, 51, 234, 0.3);
    --fc-event-text-color: #f3f4f6;
    --fc-page-bg-color: transparent;
  }

  .fc {
    background: rgba(255, 255, 255, 0.03);
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .fc .fc-toolbar-title {
    color: #e9d5ff;
  }

  .fc .fc-button {
    color: #e9d5ff;
  }

  .fc .fc-timegrid-slot-label {
    color: #e9d5ff;
  }

  .fc .fc-timegrid-axis-cushion {
    color: #e9d5ff;
  }

  .fc .fc-list-day-cushion {
    background-color: rgba(147, 51, 234, 0.2);
  }

  .fc .fc-list-event:hover td {
    background-color: rgba(147, 51, 234, 0.2);
  }

  .fc .fc-list-event-time {
    color: #e9d5ff;
  }

  .fc .fc-list-event-title {
    color: #e9d5ff;
  }

  .fc .fc-timegrid-event {
    backdrop-filter: blur(8px);
  }
`}
</style> 