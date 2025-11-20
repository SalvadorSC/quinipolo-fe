// Main scraper service that fetches matches and converts them to SurveyData format
import { SurveyData } from "../../types/quinipolo";
import { apiGet } from "../../utils/apiUtils";
import { leagues } from "./config";
import {
  Match,
  RankedMatch,
  ScraperMatchV2,
  ScraperPresetResponse,
} from "./types";
import { getWindowBounds, isWithinWindow } from "./utils/date";
import {
  filterMatchesWithinWindow,
  pickMatchesWithWeekendBias,
} from "./utils/matchSelector";

// This interface matches what the backend should return
interface ScraperApiResponse {
  matches: Match[];
  allMatches?: ScraperMatchV2[];
  presets?: ScraperPresetResponse;
  quotas?: Record<string, number>;
}

/**
 * Fetches matches from the backend scraper API
 * 
 * NOTE: This requires a backend endpoint at /api/scraper/matches that:
 * 1. Runs the scraper logic (fetching from Flashscore, RFEN, etc.)
 * 2. Returns matches in the Match[] format
 * 3. Handles CORS properly
 * 
 * The backend endpoint should use the code from quinipolo-scrapper to:
 * - Fetch matches from Flashscore and RFEN
 * - Select matches based on quotas and weekend bias
 * - Return the selected matches
 */
async function fetchScraperResponse(): Promise<ScraperApiResponse> {
  try {
    return await apiGet<ScraperApiResponse>("/api/scraper/matches", {
      timeout: 60000, // 60 seconds timeout for scraping
    });
  } catch (error: any) {
    console.error("Failed to fetch matches from API:", error);
    
    // Provide helpful error message
    if (error.response?.status === 404) {
      throw new Error(
        "Scraper endpoint not found. Please ensure the backend scraper API is implemented at /api/scraper/matches"
      );
    }
    
    throw new Error(
      `Failed to fetch matches: ${error.message || "Unknown error"}. Please ensure the backend scraper endpoint is available.`
    );
  }
}

/**
 * Computes a closeness score for a match (simplified version)
 * In the full implementation, this would use head-to-head data, table stats, etc.
 */
function computeClosenessScore(match: Match): number {
  // Simplified: return a default score
  // In the real implementation, this would use historical data
  return 0.5;
}

/**
 * Converts a Match to SurveyData format
 */
function matchToSurveyData(match: Match, isGame15: boolean): SurveyData {
  return {
    gameType: "waterpolo",
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    date: new Date(match.startTime),
    isGame15,
  };
}

/**
 * Main function to fetch and process matches for auto-filling the survey
 * Returns an array of SurveyData and the end date (first match start time)
 */
export async function fetchMatchesForSurvey(): Promise<{
  matches: SurveyData[];
  endDate: Date;
}> {
  // Fetch matches from backend API
  const response = await fetchScraperResponse();
  const allMatches = response.matches || [];

  const { start, end } = getWindowBounds();
  const selectedByLeague: Record<string, RankedMatch[]> = {};

  // Select matches for each league based on quotas
  for (const league of leagues) {
    const leagueMatches = allMatches.filter(
      (m) => m.leagueId === league.id
    );

    const inWindow = filterMatchesWithinWindow(leagueMatches, start, end);

    const ranking = pickMatchesWithWeekendBias(
      inWindow,
      league.quota,
      computeClosenessScore
    );

    selectedByLeague[league.id] = ranking.selected;
  }

  // Flatten all selected matches and sort by start time
  const orderedMatches = leagues
    .flatMap((league) => {
      const picks = selectedByLeague[league.id] ?? [];
      return picks;
    })
    .sort(
      (a, b) =>
        new Date(a.match.startTime).getTime() -
        new Date(b.match.startTime).getTime()
    );

  if (orderedMatches.length === 0) {
    throw new Error("No matches found in the next 7 days");
  }

  // Convert to SurveyData format
  const surveyMatches: SurveyData[] = orderedMatches.map(
    (entry, index) => {
      const isGame15 = index === 14; // Last match (index 14) is game 15
      return matchToSurveyData(entry.match, isGame15);
    }
  );

  // Ensure we have exactly 15 matches (pad with empty ones if needed)
  while (surveyMatches.length < 15) {
    surveyMatches.push({
      gameType: "waterpolo",
      homeTeam: "",
      awayTeam: "",
      date: new Date(),
      isGame15: surveyMatches.length === 14,
    });
  }

  // Take only first 15
  const finalMatches = surveyMatches.slice(0, 15);

  // Set the last one as game15
  if (finalMatches.length > 0) {
    finalMatches[finalMatches.length - 1].isGame15 = true;
  }

  // End date is the start time of the first match
  const endDate =
    orderedMatches.length > 0
      ? new Date(orderedMatches[0].match.startTime)
      : new Date();

  return {
    matches: finalMatches,
    endDate,
  };
}

export async function fetchScraperDataV2(): Promise<{
  matches: ScraperMatchV2[];
  presets: ScraperPresetResponse;
  quotas: Record<string, number>;
}> {
  const response = await fetchScraperResponse();
  const matches = response.allMatches ?? [];
  const presets =
    response.presets ?? { easy: [], moderate: [], hard: [] };
  const quotas = response.quotas ?? {};
  return { matches, presets, quotas };
}

