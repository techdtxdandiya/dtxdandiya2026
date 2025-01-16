import { ref, set } from 'firebase/database';
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

const initializeTeamData = async () => {
  try {
    for (const teamId of TEAM_IDS) {
      const teamRef = ref(db, `teams/${teamId}`);
      await set(teamRef, {
        displayName: TEAM_DISPLAY_NAMES[teamId],
        announcements: [
          {
            id: '1',
            title: 'Welcome to DTX Dandiya 2024!',
            content: 'Welcome to your team portal. More information will be added soon.',
            timestamp: Date.now()
          }
        ],
        generalInfo: {
          practiceArea: 'To be announced',
          liasonContact: 'To be announced',
          specialInstructions: 'Please check back later for special instructions.',
          additionalInfo: ''
        },
        techVideo: {
          title: '',
          youtubeUrl: '',
          description: ''
        },
        schedule: {
          showOrder: 1,
          isPublished: false,
          events: []
        },
        nearbyLocations: []
      });
    }
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Run the initialization
initializeTeamData(); 