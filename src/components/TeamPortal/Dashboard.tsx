import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config';
import type { TeamInfo, DashboardTeamId } from '../../types/team';
import { motion } from 'framer-motion';
import { Link as ScrollLink, Element } from 'react-scroll';

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<DashboardTeamId | null>(null);
  const [scheduleData, setScheduleData] = useState<TeamInfo['schedule'] | null>(null);
  const [activeSection, setActiveSection] = useState('announcements');
  const headerRef = useRef<HTMLDivElement>(null);

  // Scroll position effect for navigation highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['announcements', 'schedule', 'tech-time-video', 'information'];
      const scrollPosition = window.scrollY + 100; // Offset for header

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
      console.log('No team stored or admin, redirecting to login');
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

  const renderScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }> | undefined
  ) => {
    if (!events || events.length === 0) return null;

    return (
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl text-white mb-4 font-['Harry_Potter']">{title}</h3>
        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={index}
              className="p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-4 items-center">
                <div className="text-amber-200 font-medium font-inter">{event.time}</div>
                <div className="text-white font-inter">{event.event}</div>
                <div className="text-amber-200/80 font-inter">{event.location}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderSchedule = () => {
    if (!scheduleData) {
      return (
        <motion.div 
          className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-amber-500/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-white text-center font-inter">Schedule will be available soon.</p>
        </motion.div>
      );
    }

    if (!scheduleData.isPublished) {
      return (
        <motion.div 
          className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-amber-500/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-white text-center font-inter">Schedule will be available soon.</p>
        </motion.div>
      );
    }

    return (
      <div className="space-y-8">
        {scheduleData.showOrder && (
          <motion.div 
            className="mb-8 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-amber-500/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xl text-white font-['Harry_Potter']">Performance Order {scheduleData.showOrder}</p>
          </motion.div>
        )}
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
  };

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/team-portal/login");
  };

  if (!teamInfo || !teamId) {
    return null;
  }

  const navigationItems = [
    { id: 'announcements', label: 'Announcements' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'tech-time-video', label: 'Tech Time Video' },
    { id: 'information', label: 'Information' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1C] relative overflow-hidden font-inter">
      {/* Magical Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
          <div className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(234, 179, 8, 0.15), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(234, 179, 8, 0.15), transparent 70%),
                radial-gradient(circle at 50% 50%, rgba(29, 78, 216, 0.1), transparent 70%)
              `
            }}
          />
          <div className="absolute inset-0 bg-[url('/assets/magical-particles.png')] opacity-30 animate-float"></div>
        </div>
      </div>

      {/* Sticky Header */}
      <div ref={headerRef} className="sticky top-0 z-50 bg-[#0A0F1C]/80 backdrop-blur-lg border-b border-amber-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-['Harry_Potter'] text-amber-400 glow-text-gold">
              {teamInfo.displayName}
            </h1>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex space-x-6">
                {navigationItems.map(item => (
                  <ScrollLink
                    key={item.id}
                    to={item.id}
                    spy={true}
                    smooth={true}
                    offset={-100}
                    duration={500}
                    className={`cursor-pointer transition-all duration-300 ${
                      activeSection === item.id
                        ? 'text-amber-400 font-medium'
                        : 'text-gray-400 hover:text-amber-300'
                    }`}
                  >
                    {item.label}
                  </ScrollLink>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-['Harry_Potter'] hover:bg-amber-500/20 transition-all duration-300"
              >
                Mischief Managed
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="md:hidden flex overflow-x-auto space-x-6 py-4 scrollbar-hide">
            {navigationItems.map(item => (
              <ScrollLink
                key={item.id}
                to={item.id}
                spy={true}
                smooth={true}
                offset={-100}
                duration={500}
                className={`cursor-pointer whitespace-nowrap transition-all duration-300 ${
                  activeSection === item.id
                    ? 'text-amber-400 font-medium'
                    : 'text-gray-400 hover:text-amber-300'
                }`}
              >
                {item.label}
              </ScrollLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-16">
        {/* Announcements Section */}
        <Element name="announcements" id="announcements">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-['Harry_Potter'] text-amber-400 glow-text-gold mb-8">Announcements</h2>
            <div className="space-y-4">
              {teamInfo.announcements?.length > 0 ? (
                teamInfo.announcements.map((announcement, index) => (
                  <motion.div
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
                  >
                    <h3 className="text-xl text-amber-300 mb-2">{announcement.title}</h3>
                    <p className="text-gray-300 whitespace-pre-wrap mb-4">{announcement.content}</p>
                    <p className="text-sm text-amber-200/60">
                      Posted: {new Date(announcement.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-400">No announcements at this time.</p>
              )}
            </div>
          </motion.div>
        </Element>

        {/* Schedule Section */}
        <Element name="schedule" id="schedule">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-['Harry_Potter'] text-amber-400 glow-text-gold mb-8">Schedule</h2>
            {renderSchedule()}
          </motion.div>
        </Element>

        {/* Tech Time Video Section */}
        <Element name="tech-time-video" id="tech-time-video">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-['Harry_Potter'] text-amber-400 glow-text-gold mb-8">Tech Time Video</h2>
            {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="p-8 bg-black/40 backdrop-blur-sm rounded-xl border border-amber-500/20 flex flex-col items-center justify-center"
              >
                <h3 className="text-2xl text-amber-300 mb-6 font-['Harry_Potter']">{teamInfo.techVideo.title}</h3>
                <a
                  href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <span className="text-black text-lg">Access Video</span>
                  <svg 
                    className="w-6 h-6 text-black transition-transform duration-300 group-hover:translate-x-1" 
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
              </motion.div>
            ) : (
              <div className="p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-amber-500/20">
                <p className="text-gray-400">Tech time video will be available soon.</p>
              </div>
            )}
          </motion.div>
        </Element>

        {/* Information Section */}
        <Element name="information" id="information">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-['Harry_Potter'] text-amber-400 glow-text-gold mb-8">Information</h2>

            {/* Liaisons Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
            >
              <h3 className="text-2xl font-['Harry_Potter'] text-amber-300 mb-6">Liaisons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamInfo.information?.liaisons?.map((liaison, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-all duration-300"
                  >
                    <p className="text-white text-lg font-medium mb-2">{liaison.name}</p>
                    {liaison.phone && (
                      <a 
                        href={`tel:${liaison.phone.replace(/[^0-9]/g, '')}`}
                        className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {liaison.phone}
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tech Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
            >
              <h3 className="text-2xl font-['Harry_Potter'] text-amber-300 mb-6">Tech Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10"
                >
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Danceable Space</h4>
                  <p className="text-white">42' x 28'</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10"
                >
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Backdrop Space</h4>
                  <p className="text-white">4 ft</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10"
                >
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Apron Space</h4>
                  <p className="text-white">4 ft</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10"
                >
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Props Box</h4>
                  <p className="text-white">7ft (length) x 5ft (depth) x 10ft (height)</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="md:col-span-2"
                >
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-200">*There will be NO RIGGING this year at Marshall Arts Center*</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Venue Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
            >
              <h3 className="text-2xl font-['Harry_Potter'] text-amber-300 mb-6">Venue</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Name</h4>
                  <p className="text-white text-lg">Marshall Family Performing Arts Center</p>
                </div>
                <div>
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Address</h4>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <p className="text-white">4141 Spring Valley Rd, Addison, TX 75001</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View in Maps
                    </a>
                  </div>
                </div>
                <div>
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Seating Capacity</h4>
                  <p className="text-white">600 seat auditorium</p>
                </div>
              </div>
            </motion.div>

            {/* Hotel Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
            >
              <h3 className="text-2xl font-['Harry_Potter'] text-amber-300 mb-6">Hotel</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Name</h4>
                  <p className="text-white text-lg">DoubleTree by Hilton Hotel Dallas</p>
                </div>
                <div>
                  <h4 className="text-amber-300 text-sm font-medium mb-2">Address</h4>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <p className="text-white">4099 Valley View Ln, Dallas, TX 75244</p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View in Maps
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </Element>
      </div>
    </div>
  );
} 