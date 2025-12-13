import { AnswersType } from "../types";

export const findMissingAnswers = (answers: AnswersType[]): number[] => {
  const missing: number[] = [];
  answers.forEach((ans, idx) => {
    // Skip validation for cancelled matches
    if (ans.cancelled) {
      return;
    }
    if (idx === 14) {
      const isWinnerMissing = !ans.chosenWinner;
      const areGoalsMissing = !(ans.goalsHomeTeam && ans.goalsAwayTeam);
      if (isWinnerMissing || (!isWinnerMissing && areGoalsMissing)) {
        missing.push(idx);
      }
    } else {
      if (!ans.chosenWinner) {
        missing.push(idx);
      }
    }
  });
  return missing;
};
