import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import axios from "axios";
import style from "./AnswersForm.module.scss";
import { useNavigate } from "react-router-dom";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { apiGet, apiPost } from "../../utils/apiUtils";
import { useUser } from "../../Context/UserContext/UserContext";
import GoalsToggleButtonGroup from "./GoalsToggleButtonGroup";
import { useTranslation } from "react-i18next";
import { isUserModerator } from "../../utils/moderatorUtils";
import ScoreSummary from "./ScoreSummary";

import { QuinipoloType, CorrectAnswer } from "../../types/quinipolo";

type AnswersType = CorrectAnswer;

type CorrectionResponseType = {
  message: string;
  results: {
    correctAnswers: { chosenWinner: string; matchNumber: number }[];
    userAnswers: string[];
    points: number;
  };
};

type AnswerResponseType = {
  message: string;
};

const AnswersForm = () => {
  const user = useUser();
  const navigate = useNavigate();
  const { setFeedback } = useFeedback();
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

  const initialAnswers: AnswersType[] = [
    ...Array(14)
      .fill(null)
      .map((_, index) => ({
        matchNumber: index + 1,
        chosenWinner: "",
        isGame15: false,
        goalsHomeTeam: "",
        goalsAwayTeam: "",
      })),
    {
      matchNumber: 15,
      chosenWinner: "",
      isGame15: true,
      goalsHomeTeam: "",
      goalsAwayTeam: "",
    },
  ];

  const [answers, setAnswers] = useState<AnswersType[]>(initialAnswers);

  // get via params if correcting or not
  const queryParams = new URLSearchParams(window.location.search);
  const correctingModeOn = queryParams.get("correct"); // another submit
  const editCorrectionModeOn = queryParams.get("correctionEdit"); // show corrections selected
  const seeUserAnswersModeOn = queryParams.get("see"); // if user answered, show answers. If correction done, show corrections. If both, show corrected Answers

  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const id = queryParams.get("id");
      let response: any;

      if (!id) {
        console.error("ID is missing in the query string");
        return;
      }

      if (editCorrectionModeOn) {
        // will show a quinipolo, the corrections selected and give option to edit them.
        response = await apiGet<QuinipoloType>(
          `/api/quinipolos/quinipolo/${id}/correction-see`
        );

        // Transform correct_answers to match the expected structure
        if (response.correct_answers && response.correct_answers.length > 0) {
          const transformedAnswers = initialAnswers.map(
            (defaultAnswer, index) => {
              const correctAnswer = response.correct_answers.find(
                (ca: any) => ca.matchNumber === index + 1
              );
              return correctAnswer
                ? {
                    ...defaultAnswer,
                    chosenWinner: correctAnswer.chosenWinner || "",
                    goalsHomeTeam: correctAnswer.goalsHomeTeam || "",
                    goalsAwayTeam: correctAnswer.goalsAwayTeam || "",
                  }
                : defaultAnswer;
            }
          );
          setAnswers(transformedAnswers);
        } else {
          setAnswers(initialAnswers);
        }
      } else if (seeUserAnswersModeOn) {
        // will show a quinipolo with the user's answers
        response = await apiGet<{
          quinipolo: QuinipoloType;
          answers: AnswersType[];
        }>(`/api/quinipolos/quinipolo/${id}/answers-see`);
        if (response.answers && response.answers.length === 0) {
          setFeedback({
            message: "No tens cap resposta per aquest Quinipolò",
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
        response = await apiGet<QuinipoloType>(
          `/api/quinipolos/quinipolo/${id}`
        );
      }
      setLoading(false);
      setQuinipolo(response);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      // Handle the error as needed
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

  const submitQuinipolo = async () => {
    const answerToSubmit = {
      username: localStorage.getItem("username") ?? user.userData.username,
      quinipoloId: quinipolo.id,
      answers: answers.map((answer, index) => ({
        matchNumber: index + 1,
        chosenWinner: answer.chosenWinner,
        goalsHomeTeam: answer.goalsHomeTeam,
        goalsAwayTeam: answer.goalsAwayTeam,
      })),
    };

    setLoading(true);

    try {
      if (
        correctingModeOn &&
        quinipolo.league_id &&
        isUserModerator(user.userData.userLeagues, quinipolo.league_id)
      ) {
        const response = await apiPost<CorrectionResponseType>(
          `/api/quinipolos/quinipolo/${quinipolo.id}/submit-correction`,
          answerToSubmit
        );
        navigate("/correction-success", {
          state: { results: response.results },
        });
        setFeedback({
          message: response.message,
          severity: "success",
          open: true,
        });
      } else if (
        editCorrectionModeOn &&
        quinipolo.league_id &&
        isUserModerator(user.userData.userLeagues, quinipolo.league_id)
      ) {
        const response = await apiPost<CorrectionResponseType>(
          `/api/quinipolos/quinipolo/${quinipolo.id}/submit-correction-edit`,
          answerToSubmit
        );
        navigate("/correction-success", {
          state: { results: response.results },
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
              "An error occurred while submitting",
            severity: "error",
            open: true,
          });
        }
      } else {
        // Handle non-Axios errors
        setFeedback({
          message: "An unexpected error occurred",
          severity: "error",
          open: true,
        });
      }
      return; // Exit early on error
    }

    // Only set loading to false on success
    setLoading(false);
  };

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => {
    if (newValue === null || seeUserAnswersModeOn) return;
    setAnswers((prevAnswers) => {
      const parts = newValue.split("__");
      const teamName = parts[0];
      const index = parseInt(parts[1]);
      const updatedData = [...prevAnswers];
      updatedData[index] = {
        ...updatedData[index],
        matchNumber: index + 1,
        chosenWinner: teamName,
      };
      return updatedData;
    });
  };

  const handleGame15Change = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => {
    if (newValue === null || seeUserAnswersModeOn) return;
    setAnswers((prevAnswers) => {
      const parts = newValue.split("__");
      const goalValue = parts[0];
      const team = parts[1];
      const updatedData = [...prevAnswers];
      if (team === "home") {
        updatedData[14] = {
          ...updatedData[14],
          matchNumber: 15,
          goalsHomeTeam: goalValue,
        };
      } else {
        updatedData[14] = {
          ...updatedData[14],
          matchNumber: 15,
          goalsAwayTeam: goalValue,
        };
      }
      return updatedData;
    });
  };

  const matchOption = (value: string, index: number) => {
    const text = value === "empat" ? t("draw") : value;
    if (!quinipolo.has_been_corrected) {
      return <span>{text}</span>;
    }

    // The button value includes the index suffix, but stored answers don't
    const userAnswer = answers[index]?.chosenWinner;
    const correctAnswer = quinipolo.correct_answers?.[index]?.chosenWinner;

    // Determine the styling based on whether we're showing user answers and have corrections
    let className = "";
    if (seeUserAnswersModeOn && quinipolo.has_been_corrected) {
      // Extract the team name from the correct answer (remove index suffix if present)
      const correctAnswerTeam = correctAnswer?.split("__")[0] || "";

      if (correctAnswerTeam === value) {
        // This is the correct answer - always show in green
        className = style.correctAnswer;
      } else if (userAnswer === value && userAnswer !== correctAnswerTeam) {
        // This is the user's answer and it's wrong - show in red
        className = style.answerIsWrong;
      }
    }

    return <span className={className}>{text}</span>;
  };
  if (!quinipolo.quinipolo) {
    setFeedback({
      message: "Error cargando Quinipolo",
      severity: "error",
      open: true,
    });

    navigate("/");
  }

  // Determine header text based on mode
  const getHeaderText = () => {
    if (correctingModeOn) {
      return t("correct");
    } else if (seeUserAnswersModeOn) {
      return t("yourAnswersWithResults");
    } else {
      return t("selectTheResultForEachMatch");
    }
  };

  return (
    <FormControl>
      {seeUserAnswersModeOn ? (
        <ScoreSummary
          userAnswers={answers}
          correctAnswers={quinipolo.correct_answers || []}
          hasBeenCorrected={quinipolo.has_been_corrected}
        />
      ) : null}
      <TableContainer sx={{ mb: 8, borderRadius: 4 }} component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ marginBottom: 16 }}>
                {getHeaderText()}
              </TableCell>
            </TableRow>
          </TableHead>

          {/* Partits */}
          <TableBody>
            {quinipolo.quinipolo.map((match, index) => {
              // Safety check to ensure answers[index] exists
              const currentAnswer = answers[index] || {
                matchNumber: index + 1,
                chosenWinner: "",
                isGame15: index === 14,
                goalsHomeTeam: "",
                goalsAwayTeam: "",
              };
              console.log(currentAnswer);
              return (
                <TableRow
                  key={`${match.homeTeam}${match.awayTeam}__${index}`}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="center" component="th" scope="row">
                    <p className={style.matchName}>
                      {t("match")} {index + 1}
                    </p>
                    <ToggleButtonGroup
                      color="primary"
                      className={style.teamAnswerButtonContainer}
                      value={
                        currentAnswer.chosenWinner
                          ? `${currentAnswer.chosenWinner}__${index}`
                          : ""
                      }
                      exclusive
                      onChange={handleChange}
                      aria-label="Match winner"
                      disabled={loading}
                    >
                      <ToggleButton
                        className={`${style.teamAnswerButton}`}
                        value={`${match.homeTeam}__${index}`}
                        disabled={loading}
                      >
                        {matchOption(match.homeTeam, index)}
                      </ToggleButton>
                      <ToggleButton
                        value={`empat__${index}`}
                        disabled={loading}
                      >
                        {matchOption("empat", index)}
                      </ToggleButton>
                      <ToggleButton
                        className={`${style.teamAnswerButton}`}
                        value={`${match.awayTeam}__${index}`}
                        disabled={loading}
                      >
                        {matchOption(match.awayTeam, index)}
                      </ToggleButton>
                    </ToggleButtonGroup>
                    {index === 14 &&
                      (() => {
                        const correctAnswers = quinipolo.correct_answers;
                        const hasCorrectAnswers =
                          correctAnswers && correctAnswers.length > 0;
                        const homeTeamGoals = hasCorrectAnswers
                          ? correctAnswers[index]?.goalsHomeTeam || ""
                          : "";
                        const awayTeamGoals = hasCorrectAnswers
                          ? correctAnswers[index]?.goalsAwayTeam || ""
                          : "";
                        const quinipoloHasBeenCorrected =
                          quinipolo.has_been_corrected;

                        return (
                          <div className={style.goalsContainer}>
                            <GoalsToggleButtonGroup
                              teamType="home"
                              teamName={quinipolo.quinipolo[14].homeTeam}
                              goals={currentAnswer.goalsHomeTeam}
                              correctGoals={homeTeamGoals}
                              matchType={match.gameType}
                              onChange={handleGame15Change}
                              seeUserAnswersModeOn={seeUserAnswersModeOn}
                              quinipoloHasBeenCorrected={
                                quinipoloHasBeenCorrected
                              }
                              disabled={loading}
                            />
                            <GoalsToggleButtonGroup
                              teamType="away"
                              teamName={quinipolo.quinipolo[14].awayTeam}
                              goals={currentAnswer.goalsAwayTeam}
                              correctGoals={awayTeamGoals}
                              matchType={match.gameType}
                              onChange={handleGame15Change}
                              seeUserAnswersModeOn={seeUserAnswersModeOn}
                              quinipoloHasBeenCorrected={
                                quinipoloHasBeenCorrected
                              }
                              disabled={loading}
                            />
                          </div>
                        );
                      })()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          {/* Submit button */}
          {seeUserAnswersModeOn ? null : (
            <Button
              variant="contained"
              onClick={submitQuinipolo}
              className={style.submitButton}
              type="submit"
              disabled={loading}
              startIcon={
                loading ? <div className={style.spinner} /> : undefined
              }
            >
              {editCorrectionModeOn &&
              quinipolo.league_id &&
              isUserModerator(user.userData.userLeagues, quinipolo.league_id)
                ? t("edit")
                : t("submit")}
            </Button>
          )}
        </Table>
      </TableContainer>
    </FormControl>
  );
};

export default AnswersForm;
