import { AnswersFormModes } from "../types";

export const getHeaderText = (
  modes: AnswersFormModes,
  t: (key: string) => string
): string => {
  if (modes.correctingModeOn) {
    return t("correct");
  } else if (modes.seeUserAnswersModeOn) {
    return t("yourAnswersWithResults");
  } else if (modes.viewOnlyModeOn) {
    return t("viewQuinipoloResults");
  } else {
    return t("selectTheResultForEachMatch");
  }
};
