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

    let chosenWinner = "";
    const quinipoloMatch = quinipolo.quinipolo[matchIndex];
    if (result.outcome === "Tie") {
      chosenWinner = "empat";
    } else if (result.outcome === "Tie (PEN)") {
      if (result.homeScore === result.awayScore) {
        chosenWinner = "empat";
      } else if (quinipoloMatch) {
        chosenWinner =
          result.homeScore > result.awayScore
            ? quinipoloMatch.homeTeam
            : quinipoloMatch.awayTeam;
      }
    } else if (quinipoloMatch) {
      if (result.outcome === quinipoloMatch.homeTeam) {
        chosenWinner = quinipoloMatch.homeTeam;
      } else if (result.outcome === quinipoloMatch.awayTeam) {
        chosenWinner = quinipoloMatch.awayTeam;
      }
    }

    const answerUpdate: Partial<AnswersType> = {
      matchNumber: result.matchNumber,
      chosenWinner,
      isGame15: matchIndex === 14,
    };

    if (matchIndex < 14) {
      const hasRegulation =
        result.homeRegulationScore !== undefined &&
        result.awayRegulationScore !== undefined;
      const isTiePen = result.outcome === "Tie (PEN)";

      if (isTiePen && hasRegulation) {
        answerUpdate.regularGoalsHomeTeam = String(result.homeRegulationScore);
        answerUpdate.regularGoalsAwayTeam = String(result.awayRegulationScore);
        answerUpdate.goalsHomeTeam = String(result.homeScore);
        answerUpdate.goalsAwayTeam = String(result.awayScore);
      } else {
        answerUpdate.goalsHomeTeam = String(result.homeScore);
        answerUpdate.goalsAwayTeam = String(result.awayScore);
        if (result.outcome === "Tie") {
          answerUpdate.regularGoalsHomeTeam = String(result.homeScore);
          answerUpdate.regularGoalsAwayTeam = String(result.awayScore);
        }
      }
    }

    updatedAnswers[matchIndex] = {
      ...updatedAnswers[matchIndex],
      ...answerUpdate,
    };

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
