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

export const INITIAL_SCHEDULES: Record<TeamId, Schedule> = {
  tamu: {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Garden Terrace" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "7:55 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "8:30 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "7:35 AM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "8:00 AM", event: "DR 1", location: "Stretching" },
      { time: "8:20 AM", event: "Side Stage", location: "Hold" },
      { time: "8:35 AM", event: "Stage", location: "Tech Time (20 Mins)" },
      { time: "9:10 AM", event: "Viewing Room", location: "Video Review (10 Mins)" },
      { time: "9:30 AM", event: "Dance and Choral Hall", location: "Post Tech" },
      { time: "9:55 AM", event: "Venue Lobby", location: "Travel to Hotel" },
      { time: "12:20 PM", event: "Hotel Lobby", location: "Captains Travel to Venue" },
      { time: "12:35 PM", event: "Auditorium", location: "Lighting Cues" }
    ],
    saturdayPreShow: [
      { time: "3:20 PM", event: "Hotel Lobby", location: "Last Call" },
      { time: "3:25 PM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "3:45 PM", event: "Outside Venue", location: "Photo Shoot" }
    ],
    saturdayShow: [
      { time: "4:55 PM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "5:05 PM", event: "DR 1", location: "Dressing Room" },
      { time: "5:20 PM", event: "Side Stage", location: "Hold" },
      { time: "5:40 PM", event: "Stage", location: "Team Performance" },
      { time: "5:55 PM", event: "Audience", location: "Post Performance" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Venue", location: "Travel to Hotel" },
        { time: "9:35 PM", event: "Hotel", location: "Dinner Distribution" },
        { time: "10:15 PM", event: "Hotel Lobby", location: "Last Call" },
        { time: "10:25 PM", event: "Van", location: "Travel to Afterparty" },
        { time: "10:45 PM", event: "VYB Lounge", location: "Afterparty" },
        { time: "1:25 AM", event: "Outside VYB Lounge", location: "Bus Departs" }
      ],
      placing: [
        { time: "9:35 PM", event: "Venue", location: "Travel to Hotel" },
        { time: "9:35 PM", event: "Hotel", location: "Dinner Distribution" },
        { time: "10:45 PM", event: "Hotel Lobby", location: "Last Call" },
        { time: "11:05 PM", event: "Van", location: "Travel to Afterparty" },
        { time: "11:25 PM", event: "VYB Lounge", location: "Afterparty" },
        { time: "1:35 AM", event: "Outside VYB Lounge", location: "Bus Departs" }
      ]
    }
  },
  texas: {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Garden Terrace" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "7:55 PM", event: "Post-Mixer Practice", location: "Teak Room" },
      { time: "8:50 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "8:05 AM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "8:30 AM", event: "DR 2", location: "Stretching" },
      { time: "8:50 AM", event: "Side Stage", location: "Hold" },
      { time: "9:05 AM", event: "Stage", location: "Tech Time (20 Mins)" },
      { time: "9:40 AM", event: "Viewing Room", location: "Video Review (10 Mins)" },
      { time: "10:00 AM", event: "Dance and Choral Hall", location: "Post Tech" },
      { time: "10:25 AM", event: "Venue Lobby", location: "Travel to Hotel" },
      { time: "12:30 PM", event: "Hotel Lobby", location: "Captains Travel to Venue" },
      { time: "12:45 PM", event: "Auditorium", location: "Lighting Cues" }
    ],
    saturdayPreShow: [
      { time: "3:30 PM", event: "Hotel Lobby", location: "Last Call" },
      { time: "3:35 PM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "3:55 PM", event: "Outside Venue", location: "Photo Shoot" }
    ],
    saturdayShow: [
      { time: "5:10 PM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "5:20 PM", event: "DR 2", location: "Dressing Room" },
      { time: "5:35 PM", event: "Side Stage", location: "Hold" },
      { time: "5:55 PM", event: "Stage", location: "Team Performance" },
      { time: "6:10 PM", event: "Audience", location: "Post Performance" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Venue", location: "Travel to Hotel" },
        { time: "9:35 PM", event: "Hotel", location: "Dinner Distribution" },
        { time: "10:15 PM", event: "Hotel Lobby", location: "Last Call" },
        { time: "10:25 PM", event: "Van", location: "Travel to Afterparty" },
        { time: "10:45 PM", event: "VYB Lounge", location: "Afterparty" },
        { time: "1:25 AM", event: "Outside VYB Lounge", location: "Bus Departs" }
      ],
      placing: [
        { time: "9:35 PM", event: "Venue", location: "Travel to Hotel" },
        { time: "9:35 PM", event: "Hotel", location: "Dinner Distribution" },
        { time: "10:45 PM", event: "Hotel Lobby", location: "Last Call" },
        { time: "11:05 PM", event: "Van", location: "Travel to Afterparty" },
        { time: "11:25 PM", event: "VYB Lounge", location: "Afterparty" },
        { time: "1:35 AM", event: "Outside VYB Lounge", location: "Bus Departs" }
      ]
    }
  },
  michigan: {
    isPublished: false,
    showOrder: null,
    friday: [
      { time: "11:55 AM", event: "Registration", location: "Oak Room" },
      { time: "2:40 PM", event: "Check-In", location: "Oak Room" },
      { time: "3:55 PM", event: "Dinner", location: "Garden Terrace" },
      { time: "4:55 PM", event: "Mixer", location: "Garden Terrace" },
      { time: "7:25 PM", event: "Captains Meeting", location: "Near Room" },
      { time: "8:30 PM", event: "Post-Mixer Practice", location: "Ebony Room" },
      { time: "9:10 PM", event: "Optional Practice", location: "Garden Terrace" }
    ],
    saturdayTech: [
      { time: "8:35 AM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "9:00 AM", event: "DR 1", location: "Stretching" },
      { time: "9:20 AM", event: "Side Stage", location: "Hold" },
      { time: "9:35 AM", event: "Stage", location: "Tech Time (20 Mins)" },
      { time: "10:10 AM", event: "Viewing Room", location: "Video Review (10 Mins)" },
      { time: "10:30 AM", event: "Dance and Choral Hall", location: "Post Tech" },
      { time: "10:55 AM", event: "Venue Lobby", location: "Travel to Hotel" },
      { time: "12:40 PM", event: "Hotel Lobby", location: "Captains Travel to Venue" },
      { time: "12:55 PM", event: "Auditorium", location: "Lighting Cues" }
    ],
    saturdayPreShow: [
      { time: "3:40 PM", event: "Hotel Lobby", location: "Last Call" },
      { time: "3:45 PM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "4:05 PM", event: "Outside Venue", location: "Photo Shoot" }
    ],
    saturdayShow: [
      { time: "5:25 PM", event: "Hotel Lobby", location: "Travel to Venue" },
      { time: "5:35 PM", event: "DR 1", location: "Dressing Room" },
      { time: "5:50 PM", event: "Side Stage", location: "Hold" },
      { time: "6:10 PM", event: "Stage", location: "Team Performance" },
      { time: "6:25 PM", event: "Audience", location: "Post Performance" }
    ],
    saturdayPostShow: {
      nonPlacing: [
        { time: "9:35 PM", event: "Venue", location: "Travel to Hotel" },
        { time: "9:35 PM", event: "Hotel", location: "Dinner Distribution" },
        { time: "10:15 PM", event: "Hotel Lobby", location: "Last Call" },
        { time: "10:25 PM", event: "Van", location: "Travel to Afterparty" },
        { time: "10:45 PM", event: "VYB Lounge", location: "Afterparty" },
        { time: "1:25 AM", event: "Outside VYB Lounge", location: "Bus Departs" }
      ],
      placing: [
        { time: "9:35 PM", event: "Venue", location: "Travel to Hotel" },
        { time: "9:35 PM", event: "Hotel", location: "Dinner Distribution" },
        { time: "10:45 PM", event: "Hotel Lobby", location: "Last Call" },
        { time: "11:05 PM", event: "Van", location: "Travel to Afterparty" },
        { time: "11:25 PM", event: "VYB Lounge", location: "Afterparty" },
        { time: "1:35 AM", event: "Outside VYB Lounge", location: "Bus Departs" }
      ]
    }
  },
  ucd: {
    isPublished: false,
    showOrder: null,
    friday: [],
    saturdayTech: [],
    saturdayPreShow: [],
    saturdayShow: [],
    saturdayPostShow: {
      nonPlacing: [],
      placing: []
    }
  },
  unc: {
    isPublished: false,
    showOrder: null,
    friday: [],
    saturdayTech: [],
    saturdayPreShow: [],
    saturdayShow: [],
    saturdayPostShow: {
      nonPlacing: [],
      placing: []
    }
  },
  iu: {
    isPublished: false,
    showOrder: null,
    friday: [],
    saturdayTech: [],
    saturdayPreShow: [],
    saturdayShow: [],
    saturdayPostShow: {
      nonPlacing: [],
      placing: []
    }
  },
  berkeley: {
    isPublished: false,
    showOrder: null,
    friday: [],
    saturdayTech: [],
    saturdayPreShow: [],
    saturdayShow: [],
    saturdayPostShow: {
      nonPlacing: [],
      placing: []
    }
  },
  msu: {
    isPublished: false,
    showOrder: null,
    friday: [],
    saturdayTech: [],
    saturdayPreShow: [],
    saturdayShow: [],
    saturdayPostShow: {
      nonPlacing: [],
      placing: []
    }
  }
};

export const updateSchedule = (existingSchedule: Partial<Schedule> | undefined): Schedule => {
  const schedule = { ...INITIAL_SCHEDULES.tamu };
  
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
        // Initialize new team data
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
            title: '',
            youtubeUrl: '',
            driveUrl: '',
            description: '',
            isPublished: false
          },
          schedule: INITIAL_SCHEDULES[teamId],
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