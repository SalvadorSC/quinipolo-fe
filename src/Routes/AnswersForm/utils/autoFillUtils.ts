import { MatchResult } from "../../../services/scraper/types";
import { AnswersType } from "../types";
import { QuinipoloType } from "../../../types/quinipolo";

/**
 * Converts a score to goal range for waterpolo
 * Returns: "-" for <11, "11/12" for 11-12, "+" for >12
 */
export const scoreToGoalRange = (score: number): string => {
  if (score < 11) return "-";
  if (score >= 11 && score <= 12) return "11/12";
  return "+";
};

/**
 * Handles auto-fill from results modal
 */
export const applyAutoFillResults = (
  matches: MatchResult[],
  currentAnswers: AnswersType[],
  quinipolo: QuinipoloType
): AnswersType[] => {
  const updatedAnswers = [...currentAnswers];

  matches.forEach((result) => {
    const matchIndex = result.matchNumber - 1; // Convert to 0-based index
    if (matchIndex < 0 || matchIndex >= 15) return;

    // Set winner
    let chosenWinner = "";
    if (result.outcome === "Tie" || result.outcome === "Tie (PEN)") {
      chosenWinner = "empat";
    } else {
      // Find the team name in the quinipolo match
      const quinipoloMatch = quinipolo.quinipolo[matchIndex];
      if (quinipoloMatch) {
        if (result.outcome === quinipoloMatch.homeTeam) {
          chosenWinner = quinipoloMatch.homeTeam;
        } else if (result.outcome === quinipoloMatch.awayTeam) {
          chosenWinner = quinipoloMatch.awayTeam;
        }
      }
    }

    updatedAnswers[matchIndex] = {
      ...updatedAnswers[matchIndex],
      matchNumber: result.matchNumber,
      chosenWinner,
      isGame15: matchIndex === 14,
    };

    // For game 15, also set goals
    if (matchIndex === 14) {
      let homeScore = result.homeScore;
      let awayScore = result.awayScore;

      // If it was a tie and went to penalties, use regulation scores
      if (
        result.outcome === "Tie (PEN)" &&
        result.homeRegulationScore !== undefined &&
        result.awayRegulationScore !== undefined
      ) {
        homeScore = result.homeRegulationScore;
        awayScore = result.awayRegulationScore;
      }

      updatedAnswers[14] = {
        ...updatedAnswers[14],
        goalsHomeTeam: scoreToGoalRange(homeScore),
        goalsAwayTeam: scoreToGoalRange(awayScore),
      };
    }
  });

  return updatedAnswers;
};
