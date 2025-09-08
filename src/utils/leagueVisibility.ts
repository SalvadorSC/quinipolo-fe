import { isSystemAdmin, isSystemModerator } from "./moderatorUtils";

export type LeagueSummary = {
  id: string;
  league_name: string;
  is_private: boolean;
  [key: string]: any;
};

export const filterVisibleLeagues = (
  leagues: LeagueSummary[],
  userRole: string
): LeagueSummary[] => {
  const privileged = isSystemModerator(userRole) || isSystemAdmin(userRole);
  if (privileged) return leagues;
  return leagues.filter((l) => l.league_name !== "Test");
};
