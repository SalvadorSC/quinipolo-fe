/** League UUIDs where leaderboard points/results must not be shown. */
const LEAGUES_WITHOUT_LEADERBOARD_RESULTS = [
  "4cae8d44-f3bd-42a5-a899-78e64fdb0181", // Sant Feliu
];

export function shouldHideLeaderboardResults(
  leagueId?: string | null
): boolean {
  return (
    !!leagueId && LEAGUES_WITHOUT_LEADERBOARD_RESULTS.includes(leagueId)
  );
}
