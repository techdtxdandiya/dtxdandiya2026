import { ref, set, get } from 'firebase/database';
import { db } from './firebase';

const TEAM_IDS = ['tamu', 'texas', 'michigan', 'ucd', 'unc', 'iu', 'berkeley', 'msu'] as const;

const TEAM_DISPLAY_NAMES: Record<typeof TEAM_IDS[number], string> = {
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

interface Schedule {
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

interface TeamData {
  displayName: string;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    timestamp: number;
    targetTeams?: typeof TEAM_IDS[number][];
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
    description: string;
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

const INITIAL_SCHEDULE: Schedule = {
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

const updateSchedule = (existingSchedule: Partial<Schedule> | undefined): Schedule => {
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

const TEAM_LIAISONS: Record<typeof TEAM_IDS[number], Array<{ name: string; phone: string }>> = {
  texas: [
    { name: 'svayam', phone: '' },
    { name: 'prajith', phone: '' },
    { name: 'aayushi', phone: '' }
  ],
  berkeley: [
    { name: 'subhash m', phone: '' },
    { name: 'aarya', phone: '' },
    { name: 'satya', phone: '' }
  ],
  msu: [
    { name: 'subhash e', phone: '' },
    { name: 'jerin', phone: '' },
    { name: 'disha', phone: '' }
  ],
  iu: [
    { name: 'shivan', phone: '' },
    { name: 'ishani', phone: '' },
    { name: 'divya', phone: '' }
  ],
  unc: [
    { name: 'shivani', phone: '' },
    { name: 'suhas', phone: '' },
    { name: 'samarth', phone: '' }
  ],
  michigan: [
    { name: 'ahimsa', phone: '' },
    { name: 'vijyal', phone: '' },
    { name: 'punjan', phone: '' }
  ],
  tamu: [
    { name: 'adrian', phone: '' },
    { name: 'rupali', phone: '' }
  ],
  ucd: [
    { name: 'pranav b', phone: '' },
    { name: 'prakrit', phone: '' },
    { name: 'sarayu', phone: '' }
  ]
};

const VENUE_INFO = {
  name: 'Marshall Family Performing Arts Center',
  address: '4141 Spring Valley Rd, Addison, TX 75001',
  seatingCapacity: '600 seat auditorium'
};

const HOTEL_INFO = {
  name: 'DoubleTree by Hilton Hotel Dallas',
  address: '4099 Valley View Ln, Dallas, TX 75244'
};

const TECH_INFO = {
  danceableSpace: "42' x 28'",
  backdropSpace: '4 ft',
  apronSpace: '4 ft',
  propsBox: '7ft (length) x 5ft (depth) x 10ft (height)',
  additionalNotes: '*There will be NO RIGGING this year at Marshall Arts Center*'
};

const initializeTeamData = async () => {
  try {
    for (const teamId of TEAM_IDS) {
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      
      if (!snapshot.exists()) {
        // Initialize new team data
        const initialData: TeamData = {
          displayName: TEAM_DISPLAY_NAMES[teamId],
          announcements: [],
          information: {
            liaisons: TEAM_LIAISONS[teamId],
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
        };
        await set(teamRef, initialData);
        console.log(`Initialized data for team: ${TEAM_DISPLAY_NAMES[teamId]}`);
      } else {
        // Update existing team data structure if needed
        const data = snapshot.val() as Partial<TeamData>;
        const updates: Partial<TeamData> = {};
        
        // Ensure all required fields exist
        if (!data.announcements) updates.announcements = [];
        if (!data.information) {
          updates.information = {
            liaisons: TEAM_LIAISONS[teamId],
            tech: TECH_INFO,
            venue: VENUE_INFO,
            hotel: HOTEL_INFO
          };
        }
        if (!data.techVideo) {
          updates.techVideo = {
            title: '',
            youtubeUrl: '',
            description: ''
          };
        }
        if (!data.schedule) {
          updates.schedule = INITIAL_SCHEDULE;
        } else {
          updates.schedule = updateSchedule(data.schedule);
        }
        if (!data.nearbyLocations) updates.nearbyLocations = [];
        
        // Apply updates if needed
        if (Object.keys(updates).length > 0) {
          await set(teamRef, { ...data, ...updates });
          console.log(`Updated data structure for team: ${TEAM_DISPLAY_NAMES[teamId]}`);
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