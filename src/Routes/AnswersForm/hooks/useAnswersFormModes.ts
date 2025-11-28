import { useMemo } from "react";
import { AnswersFormModes } from "../types";

export const useAnswersFormModes = (): AnswersFormModes => {
  return useMemo(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const correctingModeOn = queryParams.get("correct") !== null;
    const editCorrectionModeOn = queryParams.get("correctionEdit") !== null;
    const seeUserAnswersModeOn = queryParams.get("see") !== null;
    const viewOnlyModeOn = queryParams.get("viewOnly") !== null;
    const answerModeOn =
      !correctingModeOn &&
      !editCorrectionModeOn &&
      !seeUserAnswersModeOn &&
      !viewOnlyModeOn;

    return {
      correctingModeOn,
      editCorrectionModeOn,
      seeUserAnswersModeOn,
      viewOnlyModeOn,
      answerModeOn,
    };
  }, []);
};
