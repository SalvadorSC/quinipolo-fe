import { AnswersType } from "../types";
import { findGoalsMismatchIndices } from "./goalsValidationUtils";
import { QuinipoloType } from "../../../types/quinipolo";

export const findMissingAnswers = (
  answers: AnswersType[],
  options?: {
    requireGoalsForTieOnMatches1to14?: boolean;
    requireExactGoalsForMatch15?: boolean;
  }
): number[] => {
  const requireGoalsForTie =
    options?.requireGoalsForTieOnMatches1to14 ?? false;
  const requireExactGoals = options?.requireExactGoalsForMatch15 ?? false;
  const missing: number[] = [];
  answers.forEach((ans, idx) => {
    if (ans.cancelled) return;

    if (idx === 14) {
      const isWinnerMissing = !ans.chosenWinner;
      const areRangeGoalsMissing = !(ans.goalsHomeTeam && ans.goalsAwayTeam);
      const areExactGoalsMissing =
        requireExactGoals &&
        !(ans.goalsHomeTeamExact && ans.goalsAwayTeamExact);
      const areGoalsMissing = areRangeGoalsMissing || areExactGoalsMissing;
      if (isWinnerMissing || (!isWinnerMissing && areGoalsMissing)) {
        missing.push(idx);
      }
    } else {
      if (!ans.chosenWinner) {
        missing.push(idx);
      } else if (
        requireGoalsForTie &&
        ans.chosenWinner === "empat" &&
        !(
          (ans.goalsHomeTeam && ans.goalsAwayTeam) ||
          (ans.regularGoalsHomeTeam && ans.regularGoalsAwayTeam)
        )
      ) {
        missing.push(idx);
      }
    }
  });
  return missing;
};

export const findGoalsMismatchIndicesForQuinipolo = (
  answers: AnswersType[],
  quinipolo: QuinipoloType
): number[] => findGoalsMismatchIndices(answers, quinipolo);
