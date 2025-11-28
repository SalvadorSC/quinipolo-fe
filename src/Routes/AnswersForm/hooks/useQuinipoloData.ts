import { useState, useEffect } from "react";
import { apiGet } from "../../../utils/apiUtils";
import { QuinipoloType } from "../../../types/quinipolo";
import { AnswersType } from "../types";
import { mapCorrectAnswersToInitial } from "../utils/answerUtils";
import { createInitialAnswers } from "../constants";
import { useFeedback } from "../../../Context/FeedbackContext/FeedbackContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../Context/UserContext/UserContext";

export const useQuinipoloData = (
  editCorrectionModeOn: boolean,
  seeUserAnswersModeOn: boolean
) => {
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();
  const user = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [quinipolo, setQuinipolo] = useState<QuinipoloType>({
    id: "",
    league_id: "",
    league_name: "",
    quinipolo: [],
    end_date: "",
    has_been_corrected: false,
    creation_date: "",
    is_deleted: false,
    participants_who_answered: [],
    correct_answers: [],
  });
  const [answers, setAnswers] = useState<AnswersType[]>(createInitialAnswers());

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const id = queryParams.get("id");
      let response: any;

      if (!id) {
        console.error("ID is missing in the query string");
        setLoading(false);
        return;
      }

      if (editCorrectionModeOn) {
        // will show a quinipolo, the corrections selected and give option to edit them.
        response = await apiGet<QuinipoloType>(
          `/api/quinipolos/quinipolo/${id}/correction-see`
        );

        // Transform correct_answers to match the expected structure
        if (response.correct_answers && response.correct_answers.length > 0) {
          setAnswers(
            mapCorrectAnswersToInitial(
              response.correct_answers,
              createInitialAnswers()
            )
          );
        } else {
          setAnswers(createInitialAnswers());
        }
      } else if (seeUserAnswersModeOn) {
        // will show a quinipolo with the user's answers
        response = await apiGet<{
          quinipolo: QuinipoloType;
          answers: AnswersType[];
        }>(`/api/quinipolos/quinipolo/${id}/answers-see`);
        if (response.answers && response.answers.length === 0) {
          setFeedback({
            message: t("no-answer-available"),
            severity: "error",
            open: true,
          });
        }

        if (response.answers && response.answers.length > 0) {
          setAnswers(response.answers);
        }
        setQuinipolo(response.quinipolo);
        setLoading(false);
        return;
      } else {
        // includes view-only mode case
        response = await apiGet<QuinipoloType>(
          `/api/quinipolos/quinipolo/${id}`
        );
      }
      setLoading(false);
      setQuinipolo(response);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setFeedback({
        message: error.message,
        severity: "error",
        open: true,
      });
    }
  };

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user.userData.isAuthenticated) {
      setLoading(true);
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.userData.isAuthenticated]);

  return {
    loading,
    quinipolo,
    answers,
    setAnswers,
  };
};
