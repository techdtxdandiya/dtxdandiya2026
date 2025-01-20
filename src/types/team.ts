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
    targetTeams?: DashboardTeamId[];
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

export type TeamId = 
  | 'texas'
  | 'ucb'
  | 'msu'
  | 'uiuc'
  | 'uta'
  | 'utd'
  | 'uva'
  | 'vt';

export type DashboardTeamId = TeamId | 'admin'; 