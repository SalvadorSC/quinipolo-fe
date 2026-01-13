// Types for the scraper service
export type LeagueId =
  | "DHM"
  | "DHF"
  | "PDM"
  | "PDF"
  | "SDM"
  | "CL"
  | "CLF"
  | "SEL. M"
  | "SEL. F";

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

export interface MatchResult {
  matchNumber: number;
  leagueId: LeagueId;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string; // ISO string
  homeScore: number;
  awayScore: number;
  status?: string;
  wentToPenalties?: boolean;
  homeRegulationScore?: number;
  awayRegulationScore?: number;
  outcome: string; // Winner team name, "Tie", "Tie (PEN)", or "N/A"
  confidence: number; // 0.0 to 1.0
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  sourceUrl: string;
}

export interface ResultsResponse {
  matches: MatchResult[];
  window: {
    start: string;
    end: string;
  };
  totalResults: number;
  matchedCount: number;
}
