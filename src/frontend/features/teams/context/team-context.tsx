import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useTeams } from "../api/use-teams";
import type { TeamResponse } from "../schemas";

interface TeamContextValue {
  teams: TeamResponse[] | undefined;
  currentTeam: TeamResponse | undefined;
  currentTeamId: number | undefined;
  setCurrentTeamId: (teamId: number) => void;
  isLoading: boolean;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { data: teams, isLoading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const currentTeam = useMemo(() => {
    if (!teams || teams.length === 0) return undefined;
    if (selectedTeamId) {
      const found = teams.find((t) => t.id === selectedTeamId);
      if (found) return found;
    }
    return teams[0];
  }, [teams, selectedTeamId]);

  const setCurrentTeamId = useCallback((teamId: number) => {
    setSelectedTeamId(teamId);
  }, []);

  const value = useMemo(
    () => ({
      teams,
      currentTeam,
      currentTeamId: currentTeam?.id,
      setCurrentTeamId,
      isLoading,
    }),
    [teams, currentTeam, setCurrentTeamId, isLoading]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useCurrentTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useCurrentTeam must be used within a TeamProvider");
  }
  return context;
}
