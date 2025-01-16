import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TeamInfo {
  displayName: string;
  practiceArea: string;
  liasonContact: string;
  specialInstructions: string;
}

type TeamId = "tamu" | "texas" | "michigan" | "ucd" | "unc" | "iu" | "berkeley" | "msu";

// Team information mapping
export const TEAM_INFO: Record<TeamId, TeamInfo> = {
  "tamu": {
    displayName: "TAMU Wreckin' Raas",
    practiceArea: "Great Hall - Main Practice Arena",
    liasonContact: "Devanshi Patel - (469) 525-8760",
    specialInstructions: "Please arrive 15 minutes before your scheduled practice time."
  },
  "texas": {
    displayName: "Texas Raas",
    practiceArea: "Room of Requirement - Practice Room B",
    liasonContact: "Paneri Patel - (682) 347-9582",
    specialInstructions: "Bring your own water bottles and practice attire."
  },
  "michigan": {
    displayName: "Michigan Wolveraas",
    practiceArea: "Astronomy Tower - Upper Level Studio",
    liasonContact: "Devanshi Patel - (469) 525-8760",
    specialInstructions: "Check in at the front desk upon arrival."
  },
  "ucd": {
    displayName: "UCD Raasleela",
    practiceArea: "Transfiguration Courtyard - Practice Area C",
    liasonContact: "Paneri Patel - (682) 347-9582",
    specialInstructions: "Please maintain noise levels during evening practices."
  },
  "unc": {
    displayName: "UNC Tar Heel Raas",
    practiceArea: "Defense Against Dark Arts Chamber - Studio D",
    liasonContact: "Devanshi Patel - (469) 525-8760",
    specialInstructions: "Follow marked pathways to practice area."
  },
  "iu": {
    displayName: "IU HoosierRaas",
    practiceArea: "Charms Classroom - Practice Space E",
    liasonContact: "Paneri Patel - (682) 347-9582",
    specialInstructions: "Store equipment in designated areas after practice."
  },
  "berkeley": {
    displayName: "UC Berkeley Raas Ramzat",
    practiceArea: "Potions Dungeon - Lower Level Studio",
    liasonContact: "Devanshi Patel - (469) 525-8760",
    specialInstructions: "Use service elevator for equipment transport."
  },
  "msu": {
    displayName: "MSU RaaSparty",
    practiceArea: "Quidditch Pitch - Indoor Practice Arena",
    liasonContact: "Paneri Patel - (682) 347-9582",
    specialInstructions: "Keep all emergency exits clear during practice."
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [teamId, setTeamId] = useState<TeamId | null>(null);

  useEffect(() => {
    const storedTeam = sessionStorage.getItem("team") as TeamId | null;
    
    if (!storedTeam || !TEAM_INFO[storedTeam]) {
      navigate("/team-portal/login");
      return;
    }

    setTeamId(storedTeam);
    setTeamInfo(TEAM_INFO[storedTeam]);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("team");
    navigate("/");
  };

  if (!teamInfo || !teamId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black">
          <div className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.15), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 70%)
              `
            }}
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-['Harry_Potter'] text-white glow-text-intense">
            {teamInfo.displayName}
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-white font-['Harry_Potter'] hover:bg-blue-500/20 transition-all duration-300"
          >
            Mischief Managed
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Practice Area */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-['Harry_Potter'] text-white mb-4">Practice Area</h2>
            <p className="text-blue-200/80">{teamInfo.practiceArea}</p>
          </div>

          {/* Liason Contact */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-['Harry_Potter'] text-white mb-4">Liason Contact</h2>
            <p className="text-blue-200/80">{teamInfo.liasonContact}</p>
          </div>

          {/* Special Instructions */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 md:col-span-2">
            <h2 className="text-2xl font-['Harry_Potter'] text-white mb-4">Special Instructions</h2>
            <p className="text-blue-200/80">{teamInfo.specialInstructions}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 