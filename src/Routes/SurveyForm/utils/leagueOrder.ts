import { SurveyData } from "../../../types/quinipolo";

const LEAGUE_ORDER = [
  "DHM",
  "DHF",
  "PDM",
  "PDF",
  "SDM",
  "CL",
  "CLF",
  "SEL. M",
  "SEL. F",
];

export function getLeagueSortIndex(leagueId?: string | null): number {
  const idx = LEAGUE_ORDER.indexOf(leagueId ?? "");
  return idx === -1 ? LEAGUE_ORDER.length : idx;
}

export function sortMatchesByLeague(matches: SurveyData[]): SurveyData[] {
  const [rest, pleno] =
    matches.length >= 15
      ? [matches.slice(0, 14), matches[14]]
      : [matches, null];
  const sorted = [...rest].sort(
    (a, b) => getLeagueSortIndex(a.leagueId) - getLeagueSortIndex(b.leagueId),
  );
  return pleno ? [...sorted, pleno] : sorted;
}
