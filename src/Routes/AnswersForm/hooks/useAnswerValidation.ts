import { useEffect } from "react";
import { AnswersType } from "../types";
import { QuinipoloType } from "../../../types/quinipolo";
import { findMissingAnswers } from "../utils/validationUtils";
import { LEAGUES_WITH_IMAGE_SHARE_BETA } from "../../../config/leaguesWithImageShare";

export const useAnswerValidation = (
  answers: AnswersType[],
  quinipolo: QuinipoloType,
  seeUserAnswersModeOn: boolean,
  viewOnlyModeOn: boolean,
  hasAttemptedSubmit: boolean,
  setMissingAnswerIndices: React.Dispatch<React.SetStateAction<number[]>>,
  isCorrectionMode: boolean = false
) => {
  const canEnterGoalsPerMatch =
    isCorrectionMode &&
    LEAGUES_WITH_IMAGE_SHARE_BETA.includes(quinipolo.league_id);

  useEffect(() => {
    if (seeUserAnswersModeOn) return;
    if (viewOnlyModeOn) return;
    if (!hasAttemptedSubmit) return;
    const matches = quinipolo?.quinipolo || [];
    if (!matches.length) return;

    const missing = findMissingAnswers(answers, {
      requireGoalsForTieOnMatches1to14: canEnterGoalsPerMatch,
      requireExactGoalsForMatch15: canEnterGoalsPerMatch,
    });
    setMissingAnswerIndices(missing);
  }, [
    answers,
    quinipolo?.quinipolo,
    quinipolo.league_id,
    seeUserAnswersModeOn,
    viewOnlyModeOn,
    hasAttemptedSubmit,
    setMissingAnswerIndices,
    canEnterGoalsPerMatch,
  ]);
};
