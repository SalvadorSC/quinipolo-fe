export interface UserLeague {
  league_id: string;
  role: string;
}

export const isUserModerator = (
  userLeagues: UserLeague[],
  leagueId: string
): boolean => {
  const league = userLeagues.find((ul) => ul.league_id === leagueId);
  return league?.role === "moderator" || league?.role === "admin";
};

export const isSystemAdmin = (userRole: string): boolean => {
  return userRole === "admin" || userRole === "system_admin";
};
