// Types for the scraper service
export type LeagueId = "DHM" | "DHF" | "PDM" | "PDF" | "SDM" | "CL";

export interface Match {
  leagueId: LeagueId;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string; // ISO string
  sourceUrl: string;
  location?: string;
  flashscoreId?: string;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
}

export interface RankedMatch {
  match: Match;
  closeness: number;
}

export interface LeagueConfig {
  id: LeagueId;
  name: string;
  quota: number;
  primarySource: "flashscore" | "rfen";
  flashscoreUrl?: string;
  rfenCompetitionId?: number;
}

export type MatchDifficulty = "easy" | "moderate" | "hard" | "unknown";

export interface ScraperMatchV2 extends Match {
  matchId: string;
  closeness: number;
  difficulty: MatchDifficulty;
  isChampionsLeague?: boolean;
  replacementLeagueId?: LeagueId | null;
}

export interface ScraperPresetResponse {
  easy: string[];
  moderate: string[];
  hard: string[];
}
