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

const initializeTeamData = async () => {
  try {
    for (const teamId of TEAM_IDS) {
      const teamRef = ref(db, `teams/${teamId}`);
      const snapshot = await get(teamRef);
      
      if (!snapshot.exists()) {
        // Initialize new team data
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
          schedule: INITIAL_SCHEDULE,
          nearbyLocations: []
        });
        console.log(`Initialized data for team: ${TEAM_DISPLAY_NAMES[teamId]}`);
      } else {
        // Update existing team data structure if needed
        const data = snapshot.val();
        const updates: any = {};
        
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
          // Ensure schedule has all required fields
          const schedule = { ...INITIAL_SCHEDULE };
          (Object.keys(INITIAL_SCHEDULE) as Array<keyof Schedule>).forEach(key => {
            if (data.schedule[key]) {
              schedule[key] = data.schedule[key];
            }
          });
          updates.schedule = schedule;
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