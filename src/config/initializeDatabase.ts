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
    description?: string;
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

export const INITIAL_SCHEDULE: Schedule = {
  showOrder: null,
  isPublished: false,
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

  if (existingSchedule.showOrder !== undefined) {
    schedule.showOrder = existingSchedule.showOrder;
  }
  if (existingSchedule.isPublished !== undefined) {
    schedule.isPublished = existingSchedule.isPublished;
  }
  if (Array.isArray(existingSchedule.friday)) {
    schedule.friday = existingSchedule.friday;
  }
  if (Array.isArray(existingSchedule.saturdayTech)) {
    schedule.saturdayTech = existingSchedule.saturdayTech;
  }
  if (Array.isArray(existingSchedule.saturdayPreShow)) {
    schedule.saturdayPreShow = existingSchedule.saturdayPreShow;
  }
  if (Array.isArray(existingSchedule.saturdayShow)) {
    schedule.saturdayShow = existingSchedule.saturdayShow;
  }
  if (existingSchedule.saturdayPostShow) {
    schedule.saturdayPostShow = {
      placing: Array.isArray(existingSchedule.saturdayPostShow.placing) 
        ? existingSchedule.saturdayPostShow.placing 
        : [],
      nonPlacing: Array.isArray(existingSchedule.saturdayPostShow.nonPlacing)
        ? existingSchedule.saturdayPostShow.nonPlacing
        : []
    };
  }

  return schedule;
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
            description: ''
          },
          schedule: INITIAL_SCHEDULE,
          nearbyLocations: []
        });
        console.log(`Initialized data for team: ${TEAM_DISPLAY_NAMES[teamId]}`);
      } else {
        // Update existing team data if liaisons are missing or empty
        const data = snapshot.val();
        const currentLiaisons = data.information?.liaisons || [];
        
        // Check if liaisons need to be updated
        if (!Array.isArray(currentLiaisons) || currentLiaisons.length === 0 || currentLiaisons.some(l => !l.name || !l.phone)) {
          await set(ref(db, `teams/${teamId}/information`), {
            ...data.information,
            liaisons: INITIAL_LIAISONS[teamId],
            tech: TECH_INFO,
            venue: VENUE_INFO,
            hotel: HOTEL_INFO
          });
          console.log(`Updated liaisons for team: ${TEAM_DISPLAY_NAMES[teamId]}`);
        }
      }
    }
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Run the initialization
initializeTeamData().catch(console.error); 