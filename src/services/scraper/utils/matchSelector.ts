import { compareAsc, getDay } from "date-fns";
import { Match, RankedMatch } from "../types";
import { isWithinWindow } from "./date";

const WEEKEND_DAYS = new Set([5, 6, 0]); // Fri, Sat, Sun

export interface RankingResult {
  selected: RankedMatch[];
  discarded: RankedMatch[];
}

export function filterMatchesWithinWindow(
  matches: Match[],
  start: Date,
  end: Date
) {
  return matches.filter((match) =>
    isWithinWindow(match.startTime, start, end)
  );
}

export function pickMatchesWithWeekendBias(
  matches: Match[],
  quota: number,
  getCloseness: (match: Match) => number
): RankingResult {
  const scored = matches.map((match) => {
    const date = new Date(match.startTime);
    const closeness = getCloseness(match);
    const weekend = WEEKEND_DAYS.has(getDay(date));
    return { match, closeness, weekend, date };
  });

  scored.sort((a, b) => {
    if (a.closeness !== b.closeness) {
      return a.closeness - b.closeness;
    }
    if (a.weekend !== b.weekend) {
      return a.weekend ? -1 : 1;
    }
    return compareAsc(a.date, b.date);
  });

  return {
    selected: scored
      .slice(0, quota)
      .map(({ match, closeness }) => ({ match, closeness })),
    discarded: scored
      .slice(quota)
      .map(({ match, closeness }) => ({ match, closeness })),
  };
}

