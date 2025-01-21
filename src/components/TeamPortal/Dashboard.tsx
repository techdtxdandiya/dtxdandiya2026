import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config';
import type { TeamInfo, DashboardTeamId } from '../../types/team';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as ScrollLink, Element } from 'react-scroll';
import '../../styles/magical-effects.css';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<DashboardTeamId | null>(null);
  const [scheduleData, setScheduleData] = useState<TeamInfo['schedule'] | null>(null);
  const [activeSection, setActiveSection] = useState('announcements');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'lumos' | 'nox'>('nox');
  const headerRef = useRef<HTMLDivElement>(null);

  // Navigation items with magical icons
  const navigationItems = [
    { id: 'announcements', label: 'Announcements', icon: '📜' },
    { id: 'schedule', label: 'Schedule', icon: '⌛' },
    { id: 'tech-time-video', label: 'Tech Time', icon: '🔮' },
    { id: 'information', label: 'Information', icon: '📚' }
  ];

  const toggleTheme = () => {
    setTheme(theme === 'lumos' ? 'nox' : 'lumos');
  };

  // Scroll effect for navigation
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

  // Data fetching
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

  // Render timeline event
  const renderTimelineEvent = (
    event: { time: string; event: string; location: string },
    index: number,
    isCurrentEvent: boolean = false
  ) => {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`magical-card timeline-event ${isCurrentEvent ? 'current-event' : ''} ${
          isCurrentEvent ? 'magical-glow' : ''
        }`}
      >
        <div className="flex items-center gap-4 p-4">
          <div className="timeline-time">
            <div className="text-lg font-medium text-accent-primary">
              {format(new Date(`2024-02-07T${event.time}`), 'h:mm a')}
            </div>
          </div>
          <div className="timeline-content flex-grow">
            <h4 className="text-lg font-medium mb-1">{event.event}</h4>
            <p className="text-sm text-secondary">{event.location}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render schedule section
  const renderScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }> | undefined,
    date: string
  ) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="schedule-section space-y-4">
        <h3 className="text-xl font-['Harry_Potter'] text-accent-primary mb-4">
          {title} - {date}
        </h3>
        <div className="timeline-thread pl-4">
          {events.map((event, index) => renderTimelineEvent(event, index))}
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
    <div className={`min-h-screen magical-parchment theme-${theme}`}>
      {/* Magical Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-accent-primary/5 via-transparent to-transparent" />
      </div>

      {/* Header with Spellbook Navigation */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 magical-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="floating-element text-2xl md:text-3xl font-['Harry_Potter'] magical-glow">
              {teamInfo.displayName}
            </h1>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 magical-card rounded-full"
              aria-label={`Switch to ${theme === 'lumos' ? 'dark' : 'light'} mode`}
            >
              {theme === 'lumos' ? '🌙' : '☀️'}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex spellbook-nav">
              {navigationItems.map(item => (
                <ScrollLink
                  key={item.id}
                  to={item.id}
                  spy={true}
                  smooth={true}
                  offset={-80}
                  duration={500}
                  className={`cursor-pointer transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg ${
                    activeSection === item.id
                      ? 'magical-card magical-glow'
                      : 'hover:magical-card'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </ScrollLink>
              ))}
              <button
                onClick={handleLogout}
                className="ml-4 magical-card px-4 py-2 rounded-lg"
              >
                🚪 Exit
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden magical-card p-2 rounded-lg"
            >
              <span className="text-xl">
                {isMobileMenuOpen ? '📕' : '📖'}
              </span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 spellbook-nav"
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
                          ? 'magical-card magical-glow'
                          : 'hover:magical-card'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </ScrollLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 magical-card px-3 py-2 rounded-lg"
                  >
                    <span>🚪</span>
                    <span>Exit</span>
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
        <Element name="announcements" id="announcements" className="ink-reveal">
          <section className="space-y-6">
            <h2 className="text-2xl font-['Harry_Potter'] magical-glow flex items-center gap-2">
              <span className="floating-element">📜</span> Announcements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamInfo.announcements?.length > 0 ? (
                teamInfo.announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="magical-card p-4"
                  >
                    <h3 className="text-lg font-medium mb-2">{announcement.title}</h3>
                    <p className="text-sm whitespace-pre-wrap mb-3">{announcement.content}</p>
                    <p className="text-xs text-secondary">
                      {format(new Date(announcement.timestamp), 'PPpp')}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-2 magical-card p-4 text-center">
                  No announcements at this time.
                </div>
              )}
            </div>
          </section>
        </Element>

        {/* Schedule Section */}
        <Element name="schedule" id="schedule" className="ink-reveal">
          <section className="space-y-8">
            <h2 className="text-2xl font-['Harry_Potter'] magical-glow flex items-center gap-2">
              <span className="floating-element">⌛</span> Schedule
            </h2>
            
            {scheduleData?.showOrder && (
              <div className="magical-card px-6 py-3 inline-block">
                <p className="font-medium flex items-center gap-2">
                  <span className="text-xl">🎭</span>
                  Performance Order: {scheduleData.showOrder}
                </p>
              </div>
            )}

            <div className="space-y-12">
              {renderScheduleSection("Friday Events", scheduleData?.friday, "February 7, 2024")}
              {renderScheduleSection("Saturday Tech Time", scheduleData?.saturdayTech, "February 8, 2024")}
              {renderScheduleSection("Saturday Pre-Show", scheduleData?.saturdayPreShow, "February 8, 2024")}
              {renderScheduleSection("Saturday Show", scheduleData?.saturdayShow, "February 8, 2024")}
              {scheduleData?.saturdayPostShow && (
                <>
                  {renderScheduleSection("Post-Show (Non-Placing)", scheduleData.saturdayPostShow.nonPlacing, "February 8, 2024")}
                  {renderScheduleSection("Post-Show (Placing)", scheduleData.saturdayPostShow.placing, "February 8, 2024")}
                </>
              )}
            </div>
          </section>
        </Element>

        {/* Tech Time Video Section */}
        <Element name="tech-time-video" id="tech-time-video" className="ink-reveal">
          <section className="space-y-6">
            <h2 className="text-2xl font-['Harry_Potter'] magical-glow flex items-center gap-2">
              <span className="floating-element">🔮</span> Tech Time Video
            </h2>
            {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
              <div className="magical-card p-8 text-center">
                <h3 className="text-xl font-medium mb-6">{teamInfo.techVideo.title}</h3>
                <a
                  href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 magical-card px-6 py-3 rounded-lg hover:magical-glow"
                >
                  <span>Watch Video</span>
                  <span className="text-xl">📽️</span>
                </a>
              </div>
            ) : (
              <div className="magical-card p-6 text-center">
                <p>Tech time video will be available soon.</p>
              </div>
            )}
          </section>
        </Element>

        {/* Information Section */}
        <Element name="information" id="information" className="ink-reveal">
          <section className="space-y-8">
            <h2 className="text-2xl font-['Harry_Potter'] magical-glow flex items-center gap-2">
              <span className="floating-element">📚</span> Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Liaisons Card */}
              <div className="magical-card p-6">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <span>🤝</span> Liaisons
                </h3>
                <div className="space-y-4">
                  {teamInfo.information?.liaisons?.map((liaison, index) => (
                    <div
                      key={index}
                      className="magical-card p-3"
                    >
                      <p className="font-medium mb-1">{liaison.name}</p>
                      {liaison.phone && (
                        <a
                          href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                          className="text-sm flex items-center gap-2 hover:magical-glow"
                        >
                          <span>📞</span>
                          {liaison.phone}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Details Card */}
              <div className="magical-card p-6">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <span>🎭</span> Tech Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="magical-card p-3">
                    <p className="text-sm mb-1">Danceable Space</p>
                    <p className="font-medium">42' x 28'</p>
                  </div>
                  <div className="magical-card p-3">
                    <p className="text-sm mb-1">Backdrop Space</p>
                    <p className="font-medium">4 ft</p>
                  </div>
                  <div className="magical-card p-3">
                    <p className="text-sm mb-1">Apron Space</p>
                    <p className="font-medium">4 ft</p>
                  </div>
                  <div className="magical-card p-3">
                    <p className="text-sm mb-1">Props Box</p>
                    <p className="font-medium">7' × 5' × 10'</p>
                  </div>
                </div>
                <div className="mt-4 magical-card p-3 border-red-500/20">
                  <p className="text-sm text-red-400">*There will be NO RIGGING this year at Marshall Arts Center*</p>
                </div>
              </div>

              {/* Venue Card */}
              <div className="magical-card p-6">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <span>🏛️</span> Venue
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-1">Name</p>
                    <p className="font-medium">Marshall Family Performing Arts Center</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1">Address</p>
                    <p className="font-medium mb-2">4141 Spring Valley Rd, Addison, TX 75001</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 magical-card px-3 py-1.5 rounded-lg hover:magical-glow"
                    >
                      <span>🗺️</span>
                      <span>View Map</span>
                    </a>
                  </div>
                  <div>
                    <p className="text-sm mb-1">Seating Capacity</p>
                    <p className="font-medium">600 seat auditorium</p>
                  </div>
                </div>
              </div>

              {/* Hotel Card */}
              <div className="magical-card p-6">
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <span>🏨</span> Hotel
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-1">Name</p>
                    <p className="font-medium">DoubleTree by Hilton Hotel Dallas</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1">Address</p>
                    <p className="font-medium mb-2">4099 Valley View Ln, Dallas, TX 75244</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 magical-card px-3 py-1.5 rounded-lg hover:magical-glow"
                    >
                      <span>🗺️</span>
                      <span>View Map</span>
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