import { useEffect } from "react";
import { AnswersType } from "../types";
import { QuinipoloType } from "../../../types/quinipolo";
import { findMissingAnswers } from "../utils/validationUtils";

export const useAnswerValidation = (
  answers: AnswersType[],
  quinipolo: QuinipoloType,
  seeUserAnswersModeOn: boolean,
  viewOnlyModeOn: boolean,
  hasAttemptedSubmit: boolean,
  setMissingAnswerIndices: React.Dispatch<React.SetStateAction<number[]>>
) => {
  useEffect(() => {
    if (seeUserAnswersModeOn) return;
    if (viewOnlyModeOn) return;
    if (!hasAttemptedSubmit) return;
    const matches = quinipolo?.quinipolo || [];
    if (!matches.length) return;

    const missing = findMissingAnswers(answers);
    setMissingAnswerIndices(missing);
  }, [
    answers,
    quinipolo?.quinipolo,
    seeUserAnswersModeOn,
    viewOnlyModeOn,
    hasAttemptedSubmit,
    setMissingAnswerIndices,
  ]);
};
