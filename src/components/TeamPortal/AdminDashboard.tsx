import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { ref, onValue, update, get, set } from 'firebase/database';

interface TeamInfo {
  displayName: string;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: number;
    targetTeams?: TeamId[];
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
      generalInfo: {
        practiceArea: '',
        liasonContact: '',
        specialInstructions: '',
        additionalInfo: ''
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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'announcements' | 'general' | 'tech' | 'schedule'>('announcements');
  const [teamData, setTeamData] = useState<Record<TeamId, TeamInfo>>({} as Record<TeamId, TeamInfo>);
  const [selectedTeams, setSelectedTeams] = useState<TeamId[]>([]);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    const team = sessionStorage.getItem('team');
    if (team !== 'admin') {
      navigate('/team-portal/login');
      return;
    }

    const teamsRef = ref(db, 'teams');
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTeamData(data);
        
        // Initialize data for all teams
        Object.keys(TEAM_DISPLAY_NAMES).forEach((teamId) => {
          initializeTeamData(teamId as TeamId);
        });
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

  const handleUpdateSchedule = (
    teamId: TeamId,
    scheduleSection: keyof Omit<TeamInfo['schedule'], 'showOrder' | 'isPublished'>,
    data: ScheduleEvent[] | { placing: ScheduleEvent[]; nonPlacing: ScheduleEvent[] }
  ) => {
    const teamRef = ref(db, `teams/${teamId}/schedule/${scheduleSection}`);
    update(teamRef, data);
  };

  const handleUpdateShowOrder = (teamId: TeamId, order: number | null) => {
    const teamRef = ref(db, `teams/${teamId}/schedule/showOrder`);
    set(teamRef, order);
  };

  const handleSendAnnouncement = (title: string, content: string, targetTeams: TeamId[]) => {
    const newAnnouncement = {
      id: Date.now().toString(),
      title,
      content,
      timestamp: Date.now(),
      targetTeams
    };

    targetTeams.forEach(teamId => {
      const teamRef = ref(db, `teams/${teamId}/announcements`);
      get(teamRef).then((snapshot) => {
        const currentAnnouncements = snapshot.exists() ? snapshot.val() : [];
        update(teamRef, [...currentAnnouncements, newAnnouncement]);
      });
    });
  };

  const handleUpdateGeneralInfo = (updates: Partial<TeamInfo['generalInfo']>, targetTeams: TeamId[]) => {
    targetTeams.forEach(teamId => {
      const teamRef = ref(db, `teams/${teamId}/generalInfo`);
      update(teamRef, updates);
    });
  };

  const handleUpdateTechVideo = (teamId: TeamId, videoData: TeamInfo['techVideo']) => {
    const teamRef = ref(db, `teams/${teamId}/techVideo`);
    set(teamRef, videoData);
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

  const handleUpdateSchedulePublished = (teamId: TeamId, isPublished: boolean) => {
    const teamRef = ref(db, `teams/${teamId}/schedule/isPublished`);
    set(teamRef, isPublished);
  };

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
          </div>

          {activeTab === 'announcements' && (
            <div className="mt-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">New Announcement</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                  />
                  <textarea
                    placeholder="Content"
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-32 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                  />
                  <button
                    onClick={() => {
                      if (selectedTeams.length > 0 && newAnnouncement.title && newAnnouncement.content) {
                        handleSendAnnouncement(newAnnouncement.title, newAnnouncement.content, selectedTeams);
                        setNewAnnouncement({ title: '', content: '' });
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                    disabled={selectedTeams.length === 0 || !newAnnouncement.title || !newAnnouncement.content}
                  >
                    Send to Selected Teams
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="mt-6">
              {selectedTeams.map(teamId => (
                <div key={teamId} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">{TEAM_DISPLAY_NAMES[teamId]}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Practice Area</label>
                      <input
                        type="text"
                        value={teamData[teamId]?.generalInfo?.practiceArea || ''}
                        onChange={(e) => handleUpdateGeneralInfo({ practiceArea: e.target.value }, [teamId])}
                        className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Liaison Contact</label>
                      <input
                        type="text"
                        value={teamData[teamId]?.generalInfo?.liasonContact || ''}
                        onChange={(e) => handleUpdateGeneralInfo({ liasonContact: e.target.value }, [teamId])}
                        className="w-full bg-black/40 border border-purple-500/30 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Special Instructions</label>
                      <textarea
                        value={teamData[teamId]?.generalInfo?.specialInstructions || ''}
                        onChange={(e) => handleUpdateGeneralInfo({ specialInstructions: e.target.value }, [teamId])}
                        className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Additional Information</label>
                      <textarea
                        value={teamData[teamId]?.generalInfo?.additionalInfo || ''}
                        onChange={(e) => handleUpdateGeneralInfo({ additionalInfo: e.target.value }, [teamId])}
                        className="w-full h-24 bg-black/40 border border-purple-500/30 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
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