import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

export default function RepsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'information' | 'schedule'>('information');

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/team-portal/login");
  };

  const scheduleData = {
    friday: [
      { what: 'Registration', where: 'Hotel Oak Room', when: '12:00 PM' },
      { what: 'Dinner', where: 'Hotel Garden Terrace', when: '4:00 PM' },
      { what: 'Mixer', where: 'Hotel Garden Terrace', when: '5:00 PM' },
      { what: 'Captains Meeting', where: 'Outside Event Rooms', when: '7:25 PM' },
      { what: 'Practice', where: 'Hotel Event Rooms', when: '7:30 PM' },
    ],
    saturday: [
      { what: 'Props', where: 'Marshall Center', when: '5:30 AM' },
      { what: 'Tech Time', where: 'Marshall Center', when: '8:35 AM' },
      { what: 'Photoshoot', where: 'Marshall Center', when: '3:50 PM' },
      { what: 'Doors Open', where: 'Marshall Center', when: '5:00 PM' },
      { what: 'Showtime', where: 'Marshall Center', when: '5:30 PM' },
      { what: 'Awards', where: 'Marshall Center', when: '9:00 PM' },
      { what: 'Afterparty', where: 'VYB Lounge', when: '10:00 PM' },
    ]
  };

  const renderScheduleSection = (title: string, events: Array<{ what: string; where: string; when: string }>) => {
    return (
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-['Harry_Potter'] text-white mb-4 px-1">{title}</h3>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="bg-blue-900/10 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="flex flex-col sm:grid sm:grid-cols-[1fr,1fr,120px] items-start sm:items-center">
                <div className="w-full sm:w-auto px-4 py-3 sm:py-4 border-b sm:border-b-0 sm:border-r border-blue-500/20">
                  <div className="text-white font-sans">{event.what}</div>
                </div>
                <div className="px-4 py-3 sm:py-4 text-white font-sans">{event.where}</div>
                <div className="w-full sm:w-auto px-4 py-3 sm:py-4 bg-blue-500/5 rounded-b-xl sm:rounded-none sm:rounded-r-xl text-blue-200/80 text-sm font-sans">
                  {event.when}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 sm:mb-12">
          <h1 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text-intense text-center sm:text-left">
            Team Portal
          </h1>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-white font-['Harry_Potter'] hover:bg-blue-500/20 transition-all duration-300"
          >
            Mischief Managed (Logout)
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row border-b border-blue-500/30">
            {[
              ['information', 'Information'],
              ['schedule', 'Schedule']
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-4 py-3 sm:py-2 font-['Harry_Potter'] text-lg sm:text-base transition-all duration-300 ${
                  activeTab === key
                    ? 'bg-blue-500/20 sm:bg-transparent border-b-2 border-blue-500 text-white'
                    : 'text-blue-200/60 hover:text-white hover:bg-blue-500/10 sm:hover:bg-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 sm:space-y-8">
          {activeTab === 'information' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
                  <h3 className="text-xl sm:text-2xl font-['Harry_Potter'] text-white mb-4">Tech Information</h3>
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
                          <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-blue-300 text-sm font-sans font-medium">Props Box</h4>
                        <p className="text-white font-sans">7ft (length) x 5ft (depth) x 10ft (height)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-blue-300 text-sm font-sans font-medium">Props Dimensions</h4>
                        <p className="text-white font-sans">42" x 4"</p>
                      </div>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-200 text-sm">*There will be NO RIGGING this year at Marshall Arts Center*</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
                    <h3 className="text-xl sm:text-2xl font-['Harry_Potter'] text-white mb-4">Venue Information</h3>
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

                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/20">
                    <h3 className="text-xl sm:text-2xl font-['Harry_Potter'] text-white mb-4">Hotel Information</h3>
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-['Harry_Potter'] text-white mb-4 sm:mb-6">Schedule</h2>
              {renderScheduleSection("Friday", scheduleData.friday)}
              {renderScheduleSection("Saturday", scheduleData.saturday)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 