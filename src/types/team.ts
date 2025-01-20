import { TECH_INFO, VENUE_INFO, HOTEL_INFO, TEAM_IDS } from '../config/initializeDatabase';

export type TeamId = typeof TEAM_IDS[number];
export type DashboardTeamId = TeamId | 'admin';

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
    description?: string;
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