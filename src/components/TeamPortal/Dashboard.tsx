import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../../config';
import type { TeamInfo, DashboardTeamId } from '../../types/team';
import { FiMapPin, FiPhone, FiMail, FiExternalLink, FiCalendar, FiClock, FiMapPin as FiLocation } from 'react-icons/fi';

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<DashboardTeamId | null>(null);
  const [activeSection, setActiveSection] = useState<string>('schedule');
  const [scheduleData, setScheduleData] = useState<TeamInfo['schedule'] | null>(null);

  // Main data loading effect
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
    });

    return () => unsubscribe();
  }, [navigate]);

  const renderScheduleSection = (
    title: string,
    events: Array<{ time: string; event: string; location: string }> | undefined
  ) => {
    if (!events || events.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white/90 mb-3">{title}</h3>
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors">
              <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
                <div className="flex items-center gap-2 text-blue-200/90">
                  <FiClock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="text-white/90">{event.event}</div>
                <div className="flex items-center gap-2 text-blue-200/70">
                  <FiLocation className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSchedule = () => {
    if (!scheduleData) {
      return (
        <div className="text-center py-8">
          <p className="text-white/60">Schedule will be available soon.</p>
        </div>
      );
    }

    if (!scheduleData.isPublished) {
      return (
        <div className="text-center py-8">
          <p className="text-white/60">Schedule will be available soon.</p>
        </div>
      );
    }

    if (!scheduleData.showOrder) {
      return (
        <div className="text-center py-8">
          <p className="text-white/60">Schedule has not been assigned yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 rounded-lg">
          <span className="text-blue-200">Performance Order {scheduleData.showOrder}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Friday Events */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xl text-white/90">
              <FiCalendar className="w-5 h-5" />
              <h2 className="font-semibold">Friday</h2>
            </div>
            {renderScheduleSection("", scheduleData.friday)}
          </div>

          {/* Saturday Events */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xl text-white/90">
              <FiCalendar className="w-5 h-5" />
              <h2 className="font-semibold">Saturday</h2>
            </div>
            {renderScheduleSection("Tech Time", scheduleData.saturdayTech)}
            {renderScheduleSection("Pre-Show", scheduleData.saturdayPreShow)}
            {renderScheduleSection("Show", scheduleData.saturdayShow)}
            {scheduleData.saturdayPostShow && (
              <>
                {renderScheduleSection("Post-Show (Non-Placing)", scheduleData.saturdayPostShow.nonPlacing)}
                {renderScheduleSection("Post-Show (Placing)", scheduleData.saturdayPostShow.placing)}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderInformation = () => {
    if (!teamInfo) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liaisons Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Liaisons</h3>
          <div className="space-y-3">
            {teamInfo.information.liaisons.map((liaison, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FiPhone className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <div className="text-white/90">{liaison.name}</div>
                  <a href={`tel:${liaison.phone}`} className="text-blue-200/70 text-sm hover:text-blue-200">
                    {liaison.phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Venue Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Venue</h3>
          <div className="space-y-3">
            <div className="text-white/90">{teamInfo.information.venue.name}</div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-blue-200/70" />
              <span className="text-white/70">{teamInfo.information.venue.address}</span>
            </div>
            <div className="text-blue-200/70 text-sm">
              {teamInfo.information.venue.seatingCapacity}
            </div>
          </div>
        </div>

        {/* Hotel Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Hotel</h3>
          <div className="space-y-3">
            <div className="text-white/90">{teamInfo.information.hotel.name}</div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-blue-200/70" />
                <span className="text-white/70">{teamInfo.information.hotel.address}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(teamInfo.information.hotel.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-200"
              >
                <FiExternalLink className="w-4 h-4" />
                <span>Map</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tech Info Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Tech Information</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-blue-200/70 text-sm">Danceable Space</div>
                <div className="text-white/90">{teamInfo.information.tech.danceableSpace}</div>
              </div>
              <div>
                <div className="text-blue-200/70 text-sm">Backdrop Space</div>
                <div className="text-white/90">{teamInfo.information.tech.backdropSpace}</div>
              </div>
              <div>
                <div className="text-blue-200/70 text-sm">Apron Space</div>
                <div className="text-white/90">{teamInfo.information.tech.apronSpace}</div>
              </div>
              <div>
                <div className="text-blue-200/70 text-sm">Props Box</div>
                <div className="text-white/90">{teamInfo.information.tech.propsBox}</div>
              </div>
            </div>
            <div className="text-red-400/90 text-sm mt-4">
              {teamInfo.information.tech.additionalNotes}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTechVideo = () => {
    if (!teamInfo?.techVideo) return null;

    return (
      <div className="max-w-2xl mx-auto">
        {teamInfo.techVideo?.isPublished && teamInfo.techVideo.driveUrl ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6">
            <h3 className="text-xl font-['Harry_Potter'] text-white/90 mb-6 text-center">
              {teamInfo.techVideo.title}
            </h3>
            <div className="flex justify-center">
              <a
                href={teamInfo.techVideo.driveUrl.startsWith('http') ? teamInfo.techVideo.driveUrl : `https://${teamInfo.techVideo.driveUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <span className="text-white text-lg">Access Video</span>
                <FiExternalLink className="w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60">Tech time video will be available soon.</p>
          </div>
        )}
      </div>
    );
  };

  if (!teamInfo || !teamId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/10 via-black to-black pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl md:text-4xl font-['Harry_Potter'] text-white glow-text-intense">
                {teamInfo.displayName}
              </h1>
              <button
                onClick={() => {
                  sessionStorage.removeItem("team");
                  navigate("/team-portal/login");
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/90 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-8">
            {/* Schedule Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-white/90">Schedule</h2>
              {renderSchedule()}
            </section>

            {/* Tech Video Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-white/90">Tech Time Video</h2>
              {renderTechVideo()}
            </section>

            {/* Information Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-white/90">Information</h2>
              {renderInformation()}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 