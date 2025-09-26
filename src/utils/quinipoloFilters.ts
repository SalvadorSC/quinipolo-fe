import { QuinipoloType } from "../types/quinipolo";
import { PENDING_QUINIPOLO_RECENT_DAYS } from "./config";
import { isUserModerator, UserLeague } from "./moderatorUtils";

export interface QuinipoloFilters {
  userLeagues?: UserLeague[];
  username?: string;
  leagueId?: string;
}

/**
 * Filters quinipolos for the "pending" tab
 * Shows quinipolos that are:
 * - Not deleted
 * - Moderated and uncorrected (if user is moderator)
 * - Active and unanswered by the user
 * - Recent (within 30 days) and uncorrected
 */
export const filterPendingQuinipolos = (
  quinipolos: QuinipoloType[],
  { userLeagues, username }: QuinipoloFilters
): QuinipoloType[] => {
  if (!userLeagues || !username) {
    return [];
  }

  return quinipolos.filter((quinipolo) => {
    if (quinipolo.is_deleted) return false;

    const today = new Date();
    const dateRecentDaysAgo = new Date(today);
    dateRecentDaysAgo.setDate(today.getDate() - PENDING_QUINIPOLO_RECENT_DAYS);

    const isModeratedAndUncorrected =
      isUserModerator(userLeagues, quinipolo.league_id) &&
      !quinipolo.has_been_corrected;

    const isActiveAndUnanswered =
      quinipolo.end_date > today.toISOString() &&
      !quinipolo.participants_who_answered?.includes(username);

    const isRecentAndUncorrected =
      quinipolo.end_date > dateRecentDaysAgo.toISOString() &&
      !quinipolo.has_been_corrected;

    return (
      isModeratedAndUncorrected ||
      isActiveAndUnanswered ||
      isRecentAndUncorrected
    );
  });
};

/**
 * Filters quinipolos for the "previous" tab
 * Shows quinipolos that are:
 * - Ended (past end date)
 * - Corrected
 * - Optional: filtered by specific league
 */
export const filterPreviousQuinipolos = (
  quinipolos: QuinipoloType[],
  { leagueId }: QuinipoloFilters
): QuinipoloType[] => {
  return quinipolos
    .filter(
      (quinipolo) =>
        quinipolo.end_date <= new Date().toISOString() &&
        (!leagueId || quinipolo.league_id === leagueId) &&
        quinipolo.has_been_corrected
    )
    .sort((a, b) => {
      const aTime = new Date(a.end_date).getTime();
      const bTime = new Date(b.end_date).getTime();
      return bTime - aTime;
    });
};

/**
 * Returns all quinipolos (no filtering)
 */
export const filterAllQuinipolos = (
  quinipolos: QuinipoloType[]
): QuinipoloType[] => {
  return quinipolos;
};
