import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue, update, get, set } from 'firebase/database';
import { FiEdit2, FiTrash2, FiSend, FiAlertCircle, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    };
    hotel: {
      name: string;
      address: string;
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

interface ScheduleEvent {
  time: string;
  event: string;
  location: string;
}

const TEAM_NUMBER_MAP: Record<TeamId, number> = {
  tamu: 1,
  texas: 2,
  michigan: 3,
  ucd: 4,
  unc: 5,
  iu: 6,
  berkeley: 7,
  msu: 8
};

const INITIAL_SCHEDULES: Record<number, TeamInfo['schedule']> = {
  1: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '7:30 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '8:00 PM', event: 'Post-Mixer Practice', location: 'Ebony Room' },
      { time: '8:35 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '7:40 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '8:05 AM', event: 'DR 1, Stretching', location: 'DR 1' },
      { time: '8:25 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '8:40 AM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '9:15 AM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '9:35 AM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '10:00 AM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '12:25 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '12:40 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '3:25 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '3:30 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '3:50 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '5:00 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '5:10 PM', event: 'DR 1, Dressing Room', location: 'DR 1' },
      { time: '5:25 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '5:45 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '6:00 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  },
  2: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '7:30 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '8:00 PM', event: 'Post-Mixer Practice', location: 'Teak Room' },
      { time: '8:55 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '8:10 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '8:35 AM', event: 'DR 2, Stretching', location: 'DR 2' },
      { time: '8:55 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '9:10 AM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '9:45 AM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '10:05 AM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '10:30 AM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '12:35 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '12:50 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '3:35 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '3:40 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '4:00 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '5:15 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '5:25 PM', event: 'DR 2, Dressing Room', location: 'DR 2' },
      { time: '5:40 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '6:00 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '6:15 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  },
  3: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '7:30 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '8:35 PM', event: 'Post-Mixer Practice', location: 'Ebony Room' },
      { time: '9:15 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '8:40 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '9:05 AM', event: 'DR 1, Stretching', location: 'DR 1' },
      { time: '9:25 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '9:40 AM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '10:15 AM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '10:35 AM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '11:00 AM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '12:45 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '1:00 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '3:45 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '3:50 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '4:10 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '5:30 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '5:40 PM', event: 'DR 1, Dressing Room', location: 'DR 1' },
      { time: '5:55 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '6:15 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '6:30 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  },
  4: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '7:30 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '8:35 PM', event: 'Post-Mixer Practice', location: 'Teak Room' },
      { time: '9:35 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '9:10 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '9:35 AM', event: 'DR 2, Stretching', location: 'DR 2' },
      { time: '9:55 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '10:10 AM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '10:45 AM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '11:05 AM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '11:30 AM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '12:55 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '1:10 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '3:55 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '4:00 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '4:20 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '5:45 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '5:55 PM', event: 'DR 2, Dressing Room', location: 'DR 2' },
      { time: '6:10 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '6:30 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '6:45 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  },
  5: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '8:00 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '9:10 PM', event: 'Post-Mixer Practice', location: 'Ebony Room' },
      { time: '9:55 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '9:40 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '10:05 AM', event: 'DR 1, Stretching', location: 'DR 1' },
      { time: '10:25 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '10:40 AM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '11:15 AM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '11:35 AM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '12:00 PM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '1:05 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '1:20 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '4:05 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '4:10 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '4:30 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '6:15 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '6:25 PM', event: 'DR 1, Dressing Room', location: 'DR 1' },
      { time: '6:40 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '7:00 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '7:15 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  },
  6: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '8:00 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '9:10 PM', event: 'Post-Mixer Practice', location: 'Teak Room' },
      { time: '10:15 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '10:10 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '10:35 AM', event: 'DR 2, Stretching', location: 'DR 2' },
      { time: '10:55 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '11:10 AM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '11:45 AM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '12:05 PM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '12:30 PM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '1:15 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '1:30 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '4:15 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '4:20 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '4:40 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '6:30 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '6:40 PM', event: 'DR 2, Dressing Room', location: 'DR 2' },
      { time: '6:55 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '7:15 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '7:30 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  },
  7: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '8:00 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '9:45 PM', event: 'Post-Mixer Practice', location: 'Ebony Room' },
      { time: '10:35 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '10:40 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '11:05 AM', event: 'DR 1, Stretching', location: 'DR 1' },
      { time: '11:25 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '11:40 AM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '12:15 PM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '12:35 PM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '1:00 PM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '1:25 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '1:40 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '4:25 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '4:30 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '4:50 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '6:45 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '6:55 PM', event: 'DR 1, Dressing Room', location: 'DR 1' },
      { time: '7:10 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '7:30 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '7:45 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  },
  8: {
    showOrder: null,
    isPublished: false,
    friday: [
      { time: '12:00 PM', event: 'Registration', location: 'Oak Room' },
      { time: '2:45 PM', event: 'Check-In', location: 'Oak Room' },
      { time: '4:30 PM', event: 'Dinner', location: 'Garden Terrace' },
      { time: '5:30 PM', event: 'Mixer', location: 'Garden Terrace' },
      { time: '8:00 PM', event: 'Captains Meeting', location: 'Near Room' },
      { time: '9:45 PM', event: 'Post-Mixer Practice', location: 'Teak Room' },
      { time: '10:55 PM', event: 'Optional Practice', location: 'Garden Terrace' }
    ],
    saturdayTech: [
      { time: '11:10 AM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '11:35 AM', event: 'DR 2, Stretching', location: 'DR 2' },
      { time: '11:55 AM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '12:10 PM', event: 'Stage, Tech Time (20 Mins)', location: 'Stage' },
      { time: '12:45 PM', event: 'Viewing Room, Video Review (10 Mins)', location: 'Viewing Room' },
      { time: '1:05 PM', event: 'Dance and Choral Hall, Post Tech', location: 'Dance and Choral Hall' },
      { time: '1:30 PM', event: 'Venue Lobby, Travel to Hotel', location: 'Venue Lobby' },
      { time: '1:35 PM', event: 'Hotel Lobby, Captains Travel to Venue', location: 'Hotel Lobby' },
      { time: '1:50 PM', event: 'Auditorium, Lighting Cues', location: 'Auditorium' }
    ],
    saturdayPreShow: [
      { time: '4:35 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
      { time: '4:40 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '5:00 PM', event: 'Outside Venue, Photo Shoot', location: 'Outside Venue' }
    ],
    saturdayShow: [
      { time: '7:00 PM', event: 'Hotel Lobby, Travel to Venue', location: 'Hotel Lobby' },
      { time: '7:10 PM', event: 'DR 2, Dressing Room', location: 'DR 2' },
      { time: '7:25 PM', event: 'Side Stage, Hold', location: 'Side Stage' },
      { time: '7:45 PM', event: 'Stage, Team Performance', location: 'Stage' },
      { time: '8:00 PM', event: 'Audience, Post Performance', location: 'Audience' }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:20 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '10:30 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '10:50 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:30 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ],
      placing: [
        { time: '9:40 PM', event: 'Venue, Travel to Hotel', location: 'Venue' },
        { time: '9:40 PM', event: 'Hotel, Dinner Distribution', location: 'Hotel' },
        { time: '10:50 PM', event: 'Hotel Lobby, Last Call', location: 'Hotel Lobby' },
        { time: '11:10 PM', event: 'Van, Travel to Afterparty', location: 'Van' },
        { time: '11:30 PM', event: 'VYB Lounge, Afterparty', location: 'VYB Lounge' },
        { time: '1:40 AM', event: 'Outside VYB Lounge, Bus Departs', location: 'Outside VYB Lounge' }
      ]
    }
  }
};

const initializeTeamData = async (teamId: TeamId) => {
  const teamRef = ref(db, `teams/${teamId}`);
  const snapshot = await get(teamRef);
  
  if (!snapshot.exists()) {
    // Initialize with basic structure
    await set(teamRef, {
      displayName: TEAM_DISPLAY_NAMES[teamId],
      announcements: [],
      information: {
        liaisons: [],
        tech: {
          danceableSpace: '',
          backdropSpace: '',
          apronSpace: '',
          propsBox: '',
          additionalNotes: ''
        },
        venue: {
          name: '',
          address: '',
          seatingCapacity: ''
        },
        hotel: {
          name: '',
          address: ''
        }
      },
      techVideo: {
        title: '',
        youtubeUrl: '',
        description: ''
      },
      schedule: INITIAL_SCHEDULES[TEAM_NUMBER_MAP[teamId]] || INITIAL_SCHEDULES[1],
      nearbyLocations: []
    });
  } else {
    // Ensure schedule exists
    const data = snapshot.val();
    if (!data.schedule || Object.keys(data.schedule).length === 0) {
      await update(teamRef, {
        schedule: INITIAL_SCHEDULES[TEAM_NUMBER_MAP[teamId]] || INITIAL_SCHEDULES[1]
      });
    }
  }
};

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
    const team = sessionStorage.getItem('team');
    if (team !== 'admin') {
      navigate('/team-portal/login');
      return;
    }

    // Initialize teams if they don't exist
    const initializeTeams = async () => {
      try {
    const teamsRef = ref(db, 'teams');
        const snapshot = await get(teamsRef);
        
        if (!snapshot.exists()) {
          console.log('Initializing teams data...');
          const initialData = Object.keys(TEAM_DISPLAY_NAMES).reduce((acc, teamId) => ({
            ...acc,
            [teamId]: {
              displayName: TEAM_DISPLAY_NAMES[teamId as TeamId],
              announcements: [],
              information: {
                liaisons: [],
                tech: {
                  danceableSpace: '',
                  backdropSpace: '',
                  apronSpace: '',
                  propsBox: '',
                  additionalNotes: ''
                },
                venue: {
                  name: '',
                  address: '',
                  seatingCapacity: ''
                },
                hotel: {
                  name: '',
                  address: ''
                }
              },
              techVideo: {
                title: '',
                youtubeUrl: '',
                description: ''
              },
              schedule: INITIAL_SCHEDULES[TEAM_NUMBER_MAP[teamId as TeamId]] || INITIAL_SCHEDULES[1],
              nearbyLocations: []
            }
          }), {});
          
          await set(teamsRef, initialData);
          console.log('Teams initialized successfully');
        }
      } catch (error) {
        console.error('Error initializing teams:', error);
        toast.error('Error initializing data');
      }
    };

    // Set up Firebase listener
    const setupFirebaseListener = () => {
      const teamsRef = ref(db, 'teams');
      console.log('Setting up Firebase listener at:', teamsRef.toString());

      return onValue(teamsRef, 
        (snapshot) => {
      if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('Received Firebase data:', Object.keys(data));
            
            const processedData = Object.entries(data).reduce((acc, [teamId, rawTeamData]) => {
              const teamData = rawTeamData as TeamInfo;
              let announcements: TeamInfo['announcements'] = [];
              
              if (teamData.announcements) {
                announcements = Array.isArray(teamData.announcements) 
                  ? teamData.announcements 
                  : Object.values(teamData.announcements);
              }

              acc[teamId as TeamId] = {
                ...teamData,
                announcements
              };
              return acc;
            }, {} as Record<TeamId, TeamInfo>);

            setTeamData(processedData);
          } else {
            console.log('No data in Firebase, initializing...');
            initializeTeams();
          }
        },
        (error) => {
          console.error('Firebase error:', error);
          if (error.message.includes('permission_denied')) {
            console.log('Permission denied, attempting to reinitialize...');
            initializeTeams();
          } else {
            toast.error('Error accessing data');
            sessionStorage.removeItem('team');
            navigate('/team-portal/login');
          }
        }
      );
    };

    const unsubscribe = setupFirebaseListener();
    return () => {
      console.log('Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [navigate]);

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

  const handleUpdateInformation = async (teamId: TeamId, updates: Partial<TeamInfo['information']>) => {
    try {
      const teamRef = ref(db, `teams/${teamId}/information`);
      const snapshot = await get(teamRef);
      const currentInfo = snapshot.val() || {};
      await set(teamRef, { ...currentInfo, ...updates });
      toast.success('Information updated successfully!');
    } catch (error) {
      console.error('Error updating information:', error);
      toast.error('Error updating information');
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
                              handleUpdateInformation(teamId, { liaisons: newLiaisons });
                            }}
                            placeholder="Liaison Name"
                            className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                          />
                          <input
                            type="text"
                            value={liaison.phone}
                            onChange={(e) => {
                              const newLiaisons = [...teamData[teamId].information.liaisons];
                              newLiaisons[index] = { ...liaison, phone: e.target.value };
                              handleUpdateInformation(teamId, { liaisons: newLiaisons });
                            }}
                            placeholder="Phone Number"
                            className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newLiaisons = [...(teamData[teamId]?.information?.liaisons || []), { name: '', phone: '' }];
                          handleUpdateInformation(teamId, { liaisons: newLiaisons });
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
                    <label className="block text-sm font-medium text-blue-300 mb-2">Danceable Space</label>
                    <input
                      type="text"
                      value="42' x 28'"
                      readOnly
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Backdrop Space</label>
                    <input
                      type="text"
                      value="4 ft"
                      readOnly
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Apron Space</label>
                    <input
                      type="text"
                      value="4 ft"
                      readOnly
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Props Box</label>
                    <input
                      type="text"
                      value="7ft (length) x 5ft (depth) x 10ft (height)"
                      readOnly
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-blue-300 mb-2">Additional Notes</label>
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
                    <label className="block text-sm font-medium text-blue-300 mb-2">Name</label>
                    <input
                      type="text"
                      value="Marshall Family Performing Arts Center"
                      readOnly
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Address</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value="4141 Spring Valley Rd, Addison, TX 75001"
                        readOnly
                        className="flex-1 bg-black/40 border border-blue-500/30 rounded-lg p-2"
                      />
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4141+Spring+Valley+Rd+Addison+TX+75001"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        View in Google Maps
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Seating Capacity</label>
                    <input
                      type="text"
                      value="600 seat auditorium"
                      readOnly
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-semibold text-white mb-6">Hotel Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Name</label>
                    <input
                      type="text"
                      value="DoubleTree by Hilton Hotel Dallas"
                      readOnly
                      className="w-full bg-black/40 border border-blue-500/30 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-300 mb-2">Address</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        value="4099 Valley View Ln, Dallas, TX 75244"
                        readOnly
                        className="flex-1 bg-black/40 border border-blue-500/30 rounded-lg p-2"
                      />
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=4099+Valley+View+Ln+Dallas+TX+75244"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
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