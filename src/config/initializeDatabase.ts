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
  generalInfo: {
    practiceArea: string;
    liasonContact: string;
    specialInstructions: string;
    additionalInfo: string;
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
        if (!data.generalInfo) {
          updates.generalInfo = {
            practiceArea: '',
            liasonContact: '',
            specialInstructions: '',
            additionalInfo: ''
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