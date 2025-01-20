import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { db, TEAM_LIAISONS } from '../config';
import { TeamInfo, DashboardTeamId } from '../types/team';

interface UseTeamDataReturn {
  teamInfo: TeamInfo | null;
  isLoading: boolean;
  error: Error | null;
}

export function useTeamData(): UseTeamDataReturn {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as DashboardTeamId | null;
    
    if (!storedTeam || storedTeam === 'admin') {
      navigate("/team-portal/login");
      return;
    }

    console.log('Loading data for team:', storedTeam);
    
    const teamRef = ref(db, `teams/${storedTeam}`);
    const unsubscribe = onValue(teamRef, async (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('Received team data:', data);
          
          // Ensure liaisons data exists and is not empty
          if (!data.information?.liaisons || data.information.liaisons.length === 0) {
            // Re-initialize the team data
            const teamRef = ref(db, `teams/${storedTeam}`);
            try {
              await set(teamRef, {
                ...data,
                information: {
                  ...data.information,
                  liaisons: TEAM_LIAISONS[storedTeam]
                }
              });
              console.log('Re-initialized liaisons data for team:', storedTeam);
            } catch (error) {
              console.error('Error re-initializing liaisons data:', error);
              setError(error instanceof Error ? error : new Error('Failed to re-initialize liaisons data'));
            }
          }
          
          // Ensure schedule has all required fields
          if (data.schedule) {
            data.schedule = {
              showOrder: data.schedule.showOrder || null,
              isPublished: data.schedule.isPublished || false,
              friday: data.schedule.friday || [],
              saturdayTech: data.schedule.saturdayTech || [],
              saturdayPreShow: data.schedule.saturdayPreShow || [],
              saturdayShow: data.schedule.saturdayShow || [],
              saturdayPostShow: {
                placing: data.schedule.saturdayPostShow?.placing || [],
                nonPlacing: data.schedule.saturdayPostShow?.nonPlacing || []
              }
            };
          }
          setTeamInfo(data);
          setError(null);
        } else {
          console.log('No data exists for team:', storedTeam);
          setError(new Error('No team data found'));
        }
      } catch (error) {
        console.error('Error processing team data:', error);
        setError(error instanceof Error ? error : new Error('Failed to process team data'));
      } finally {
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Error loading team data:', error);
      setError(error instanceof Error ? error : new Error('Failed to load team data'));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  return { teamInfo, isLoading, error };
} 