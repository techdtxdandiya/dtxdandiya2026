import { ref, set, get } from 'firebase/database';
import { db } from './firebase';

export const TEAM_IDS = ['tamu', 'texas', 'michigan', 'ucd', 'unc', 'iu', 'berkeley', 'msu'] as const;

export type TeamId = typeof TEAM_IDS[number];
export type DashboardTeamId = TeamId | 'admin';

export const TEAM_DISPLAY_NAMES: Record<TeamId, string> = {
  tamu: 'TAMU Wreckin\' Raas',
  texas: 'Texas Raas',
  michigan: 'Michigan Wolveraas',
  ucd: 'UCD Raasleela',
  unc: 'UNC Tar Heel Raas',
  iu: 'IU HoosierRaas',
  berkeley: 'UC Berkeley Raas Ramzat',
  msu: 'MSU RaaSparty'
};

export interface ScheduleEvent {
  time: string;
  event: string;
  location: string;
}

export interface Schedule {
  showOrder: number | null;
  isPublished: boolean;
  friday: ScheduleEvent[];
  saturdayTech: ScheduleEvent[];
  saturdayPreShow: ScheduleEvent[];
  saturdayShow: ScheduleEvent[];
  saturdayPostShow: {
    placing: ScheduleEvent[];
    nonPlacing: ScheduleEvent[];
  };
}

export interface TeamInfo {
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
    tech: typeof TECH_INFO;
    venue: typeof VENUE_INFO;
    hotel: typeof HOTEL_INFO;
  };
  techVideo: {
    title: string;
    youtubeUrl: string;
    driveUrl: string;
    description: string;
    isPublished: boolean;
  };
  schedule: Schedule;
  nearbyLocations: Array<{
    id: string;
    name: string;
    address: string;
    type: 'Food' | 'Practice' | 'Hotel' | 'Emergency' | 'Other';
    distance?: string;
    notes?: string;
  }>;
}

export const GENERIC_SCHEDULES: Record<string, Schedule> = {
  'Team 1': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "7:55 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "8:30 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "7:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "8:00 AM", event: "Stretching", location: "DR 1" },
      { time: "8:20 AM", event: "Hold", location: "Side Stage" },
      { time: "8:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "9:10 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "9:30 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "9:55 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:20 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "12:35 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:20 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "3:45 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "4:55 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:05 PM", event: "Dressing Room", location: "DR 1" },
      { time: "5:20 PM", event: "Hold", location: "Side Stage" },
      { time: "5:40 PM", event: "Team Performance", location: "Stage" },
      { time: "5:55 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 2': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "7:55 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "8:50 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "8:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "8:30 AM", event: "Stretching", location: "DR 2" },
      { time: "8:50 AM", event: "Hold", location: "Side Stage" },
      { time: "9:05 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "9:40 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "10:00 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "10:25 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:30 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "12:45 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:30 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:35 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "3:55 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "5:10 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:20 PM", event: "Dressing Room", location: "DR 2" },
      { time: "5:35 PM", event: "Hold", location: "Side Stage" },
      { time: "5:55 PM", event: "Team Performance", location: "Stage" },
      { time: "6:10 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 3': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "8:30 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "9:10 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "8:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "9:00 AM", event: "Stretching", location: "DR 1" },
      { time: "9:20 AM", event: "Hold", location: "Side Stage" },
      { time: "9:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "10:10 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "10:30 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "10:55 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:40 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "12:55 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:40 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:45 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:05 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "5:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:35 PM", event: "Dressing Room", location: "DR 1" },
      { time: "5:50 PM", event: "Hold", location: "Side Stage" },
      { time: "6:10 PM", event: "Team Performance", location: "Stage" },
      { time: "6:25 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 4': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "8:30 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "9:30 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "9:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "9:30 AM", event: "Stretching", location: "DR 2" },
      { time: "9:50 AM", event: "Hold", location: "Side Stage" },
      { time: "10:05 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "10:40 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "11:00 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "11:25 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "12:50 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:05 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "3:50 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "3:55 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:15 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "5:40 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "5:50 PM", event: "Dressing Room", location: "DR 2" },
      { time: "6:05 PM", event: "Hold", location: "Side Stage" },
      { time: "6:25 PM", event: "Team Performance", location: "Stage" },
      { time: "6:40 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 5': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:05 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "9:50 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "9:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "10:00 AM", event: "Stretching", location: "DR 1" },
      { time: "10:20 AM", event: "Hold", location: "Side Stage" },
      { time: "10:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "11:10 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "11:30 AM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "11:55 AM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:00 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:15 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:00 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:05 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:25 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:10 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "6:20 PM", event: "Dressing Room", location: "DR 1" },
      { time: "6:35 PM", event: "Hold", location: "Side Stage" },
      { time: "6:55 PM", event: "Team Performance", location: "Stage" },
      { time: "7:10 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 6': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:05 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "10:10 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "10:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "10:30 AM", event: "Stretching", location: "DR 2" },
      { time: "10:50 AM", event: "Hold", location: "Side Stage" },
      { time: "11:05 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "11:40 AM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "12:00 PM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "12:25 PM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:10 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:25 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:10 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:15 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:35 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "6:35 PM", event: "Dressing Room", location: "DR 2" },
      { time: "6:50 PM", event: "Hold", location: "Side Stage" },
      { time: "7:10 PM", event: "Team Performance", location: "Stage" },
      { time: "7:25 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 7': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:40 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "10:30 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "10:35 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "11:00 AM", event: "Stretching", location: "DR 1" },
      { time: "11:20 AM", event: "Hold", location: "Side Stage" },
      { time: "11:35 AM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "12:10 PM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "12:30 PM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "12:55 PM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:20 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:35 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:20 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:25 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:45 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:40 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "6:50 PM", event: "Dressing Room", location: "DR 1" },
      { time: "7:05 PM", event: "Hold", location: "Side Stage" },
      { time: "7:25 PM", event: "Team Performance", location: "Stage" },
      { time: "7:40 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  },
  'Team 8': {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Team Rooms" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:55 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "9:40 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "10:50 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "11:05 AM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "11:30 AM", event: "Stretching", location: "DR 2" },
      { time: "11:50 AM", event: "Hold", location: "Side Stage" },
      { time: "12:05 PM", event: "Tech Time (20 Mins)", location: "Stage" },
      { time: "12:40 PM", event: "Video Review (10 Mins)", location: "Viewing Room" },
      { time: "1:00 PM", event: "Post Tech", location: "Dance and Choral Hall" },
      { time: "1:25 PM", event: "Travel to Hotel", location: "Venue Lobby" },
      { time: "1:30 PM", event: "Captains Travel to Venue", location: "Hotel Lobby" },
      { time: "1:45 PM", event: "Lighting Cues", location: "Auditorium" }
    ],
    saturdayPreShow: [
      { time: "4:30 PM", event: "Last Call", location: "Hotel Lobby" },
      { time: "4:35 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "4:55 PM", event: "Photo Shoot", location: "Outside Venue" }
    ],
    saturdayShow: [
      { time: "6:55 PM", event: "Travel to Venue", location: "Hotel Lobby" },
      { time: "7:05 PM", event: "Dressing Room", location: "DR 2" },
      { time: "7:20 PM", event: "Hold", location: "Side Stage" },
      { time: "7:40 PM", event: "Team Performance", location: "Stage" },
      { time: "7:55 PM", event: "Post Performance", location: "Audience" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:15 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "10:25 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "10:45 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:25 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ],
      placing: [
        { time: "9:35 PM", event: "Travel to Hotel", location: "Venue" },
        { time: "9:35 PM", event: "Dinner Distribution", location: "Hotel" },
        { time: "10:45 PM", event: "Last Call", location: "Hotel Lobby" },
        { time: "11:05 PM", event: "Travel to Afterparty", location: "Van" },
        { time: "11:25 PM", event: "Afterparty", location: "VYB Lounge" },
        { time: "1:35 AM", event: "Bus Departs", location: "Outside VYB Lounge" }
      ]
    }
  }
};

export const INITIAL_SCHEDULE: Schedule = {
  isPublished: false,
  showOrder: null,
  friday: [],
  saturdayTech: [],
  saturdayPreShow: [],
  saturdayShow: [],
  saturdayPostShow: {
    placing: [],
    nonPlacing: []
  }
};

export const updateSchedule = (existingSchedule: Partial<Schedule> | undefined): Schedule => {
  const schedule = { ...INITIAL_SCHEDULE };
  
  if (!existingSchedule) return schedule;

  return {
    ...schedule,
    ...existingSchedule,
    saturdayPostShow: {
      ...schedule.saturdayPostShow,
      ...(existingSchedule.saturdayPostShow || {})
    }
  };
};

export const VENUE_INFO = {
  name: 'Marshall Family Performing Arts Center',
  address: '4141 Spring Valley Rd, Addison, TX 75001',
  seatingCapacity: '600 seat auditorium'
} as const;

export const HOTEL_INFO = {
  name: 'DoubleTree by Hilton Hotel Dallas',
  address: '4099 Valley View Ln, Dallas, TX 75244'
} as const;

export const TECH_INFO = {
  danceableSpace: "42' x 28'",
  backdropSpace: '4 ft',
  apronSpace: '4 ft',
  propsBox: '7ft (length) x 5ft (depth) x 10ft (height)',
  additionalNotes: '*There will be NO RIGGING this year at Marshall Arts Center*'
} as const;

export const INITIAL_LIAISONS = {
  texas: [
    { name: 'Svayam Sharma', phone: '972.510.7638' },
    { name: 'Prajith Sugatan', phone: '214.732.1833' },
    { name: 'Aayushi Madalia', phone: '512.773.0779' }
  ],
  berkeley: [
    { name: 'Subhash Madiraju', phone: '857.499.4545' },
    { name: 'Aryaa Shah', phone: '469.514.1422' },
    { name: 'Satya Rallabandi', phone: '214.897.1156' }
  ],
  msu: [
    { name: 'Subhash E', phone: '901.232.6813' },
    { name: 'Jerin Vandannoor', phone: '972.804.0459' },
    { name: 'Disha', phone: '254.421.7696' }
  ],
  iu: [
    { name: 'Shivan Golechha', phone: '972.903.2550' },
    { name: 'Ishani Gupta', phone: '737.217.7600' },
    { name: 'Divya Patel', phone: '936.232.8316' }
  ],
  unc: [
    { name: 'Shivani Kumar', phone: '469.64.2710' },
    { name: 'Suhas Nalla', phone: '214.973.1625' },
    { name: 'Samarth Bikki', phone: '512.917.8857' }
  ],
  michigan: [
    { name: 'Ahimsa Yukta', phone: '832.323.3820' },
    { name: 'Vijval Atyam', phone: '214.298.0080' },
    { name: 'Punjan Patel', phone: '469.810.3614' }
  ],
  tamu: [
    { name: 'Adrian Gaspar', phone: '732.668.1820' },
    { name: 'Rupali Venkatesa', phone: '901.468.9016' }
  ],
  ucd: [
    { name: 'Pranav B', phone: '469.400.3883' },
    { name: 'Prakrit Sinha', phone: '512.669.6980' },
    { name: 'Sarayu Varanasi', phone: '847.970.0653' }
  ]
} as const;

export const initializeTeamData = async () => {
  try {
    for (const teamId of TEAM_IDS) {
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      
      if (!snapshot.exists()) {
      await set(teamRef, {
        displayName: TEAM_DISPLAY_NAMES[teamId],
          announcements: [],
          information: {
            liaisons: INITIAL_LIAISONS[teamId],
            tech: TECH_INFO,
            venue: VENUE_INFO,
            hotel: HOTEL_INFO
        },
        techVideo: {
            title: 'Tech Time Video',
          youtubeUrl: '',
            driveUrl: '',
            description: '',
            isPublished: false
          },
          schedule: INITIAL_SCHEDULE,
        nearbyLocations: []
      });
        console.log(`Initialized data for team: ${TEAM_DISPLAY_NAMES[teamId]}`);
      }
    }
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};