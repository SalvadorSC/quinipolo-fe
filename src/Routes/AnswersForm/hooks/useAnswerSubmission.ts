import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFeedback } from "../../../Context/FeedbackContext/FeedbackContext";
import { apiPost } from "../../../utils/apiUtils";
import {
  isSystemModerator,
  isUserModerator,
} from "../../../utils/moderatorUtils";
import { useTranslation } from "react-i18next";
import {
  AnswersType,
  CorrectionResponseType,
  AnswerResponseType,
} from "../types";
import { QuinipoloType } from "../../../types/quinipolo";
import { prepareAnswersForSubmission } from "../utils/answerUtils";
import { findMissingAnswers } from "../utils/validationUtils";

export const useAnswerSubmission = (
  answers: AnswersType[],
  quinipolo: QuinipoloType,
  correctingModeOn: boolean,
  editCorrectionModeOn: boolean,
  user: any,
  setMissingAnswerIndices: React.Dispatch<React.SetStateAction<number[]>>,
  setHasAttemptedSubmit: React.Dispatch<React.SetStateAction<boolean>>,
  rowRefs: React.MutableRefObject<(HTMLTableRowElement | null)[]>
) => {
  const navigate = useNavigate();
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const submitQuinipolo = async () => {
    const missing = findMissingAnswers(answers);

    if (missing.length > 0) {
      setHasAttemptedSubmit(true);
      setMissingAnswerIndices(missing);
      setFeedback({
        message: t("missingAnswersForMatches", {
          matches: missing.map((i) => i + 1).join(", "),
        }),
        severity: "warning",
        open: true,
      });

      // Scroll to first missing row
      const firstMissing = missing[0];
      const rowEl = rowRefs.current[firstMissing];
      if (rowEl && typeof rowEl.scrollIntoView === "function") {
        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const answerToSubmit = {
      username: localStorage.getItem("username") ?? user.userData.username,
      quinipoloId: quinipolo.id,
      answers: prepareAnswersForSubmission(answers),
    };

    setLoading(true);

    try {
      if (
        correctingModeOn &&
        quinipolo.league_id &&
        (isUserModerator(user.userData.userLeagues, quinipolo.league_id) ||
          isSystemModerator(user.userData.role))
      ) {
        const response = await apiPost<CorrectionResponseType>(
          `/api/quinipolos/quinipolo/${quinipolo.id}/submit-correction`,
          answerToSubmit
        );
        navigate("/correction-success", {
          state: {
            results: response.results,
            leagueId: response.leagueId || quinipolo.league_id,
            endDate: response.endDate,
            participantsLeaderboard:
              response.participantsLeaderboard || undefined,
            averagePointsThisQuinipolo: response.averagePointsThisQuinipolo,
            mostFailed: response.mostFailed,
          },
        });
        setFeedback({
          message: response.message,
          severity: "success",
          open: true,
        });
      } else if (
        editCorrectionModeOn &&
        quinipolo.league_id &&
        (isUserModerator(user.userData.userLeagues, quinipolo.league_id) ||
          isSystemModerator(user.userData.role))
      ) {
        const response = await apiPost<CorrectionResponseType>(
          `/api/quinipolos/quinipolo/${quinipolo.id}/submit-correction-edit`,
          answerToSubmit
        );
        navigate("/correction-success", {
          state: {
            results: response.results,
            leagueId: response.leagueId || quinipolo.league_id,
            endDate: response.endDate,
            participantsLeaderboard:
              response.participantsLeaderboard || undefined,
            averagePointsThisQuinipolo: response.averagePointsThisQuinipolo,
            mostFailed: response.mostFailed,
          },
        });
        setFeedback({
          message: response.message,
          severity: "success",
          open: true,
        });
      } else {
        const response = await apiPost<AnswerResponseType>(
          `/api/quinipolos/quinipolo/answers`,
          answerToSubmit
        );
        setFeedback({
          message: response.message,
          severity: "success",
          open: true,
        });
        navigate("/");
      }
    } catch (error: unknown) {
      console.error("Error submitting Quinipolo:", error);
      setLoading(false);

      // Check if error is of type AxiosError
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 409) {
          console.log(error.response);
          setFeedback({
            message: error.response.data,
            severity: "error",
            open: true,
          });
        } else {
          setFeedback({
            message:
              error.response?.data?.message ||
              t("errorSubmittingAnswers") ||
              "An error occurred while submitting",
            severity: "error",
            open: true,
          });
        }
      } else {
        // Handle non-Axios errors
        setFeedback({
          message: t("unexpectedError") || "An unexpected error occurred",
          severity: "error",
          open: true,
        });
      }
      return; // Exit early on error
    }

    // Only set loading to false on success
    setLoading(false);
  };

  return {
    submitQuinipolo,
    loading,
  };
};
