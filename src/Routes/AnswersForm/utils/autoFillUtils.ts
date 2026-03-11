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
    if (result.outcome === "Tie" || result.outcome === "Tie (PEN)") {
      chosenWinner = "empat";
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
      const hasRegulation =
        result.homeRegulationScore !== undefined &&
        result.awayRegulationScore !== undefined;
      const isTiePen = result.outcome === "Tie (PEN)";

      let rangeHome = result.homeScore;
      let rangeAway = result.awayScore;
      if (isTiePen && hasRegulation) {
        rangeHome = result.homeRegulationScore!;
        rangeAway = result.awayRegulationScore!;
      }

      const match15Update: Partial<AnswersType> = {
        goalsHomeTeam: scoreToGoalRange(rangeHome),
        goalsAwayTeam: scoreToGoalRange(rangeAway),
        goalsHomeTeamExact: String(result.homeScore),
        goalsAwayTeamExact: String(result.awayScore),
      };

      if (isTiePen && hasRegulation) {
        match15Update.regularGoalsHomeTeam = String(result.homeRegulationScore);
        match15Update.regularGoalsAwayTeam = String(result.awayRegulationScore);
      } else if (result.outcome === "Tie") {
        match15Update.regularGoalsHomeTeam = String(result.homeScore);
        match15Update.regularGoalsAwayTeam = String(result.awayScore);
      }

      updatedAnswers[14] = {
        ...updatedAnswers[14],
        ...match15Update,
      };
    }
  });

  return updatedAnswers;
};
