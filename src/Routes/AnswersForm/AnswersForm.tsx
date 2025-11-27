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
import GoalsToggleButtonGroup from "./GoalsToggleButtonGroup";
import { useTranslation } from "react-i18next";
import { isSystemModerator, isUserModerator } from "../../utils/moderatorUtils";
import ScoreSummary from "./ScoreSummary";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

import { QuinipoloType, CorrectAnswer } from "../../types/quinipolo";
import { Tooltip } from "antd";
import { MatchResult } from "../../services/scraper/types";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useUser } from "../../Context/UserContext/UserContext";
import { ResultsAutoFillModal } from "./ResultsAutoFillModal/index";

type AnswersType = CorrectAnswer;

type CorrectionResponseType = {
  message: string;
  results:
    | {
        correctAnswers: { chosenWinner: string; matchNumber: number }[];
        userAnswers: string[];
        points: number;
      }[]
    | any; // backend returns an array of per-user results already used in CorrectionSuccess
  leagueId?: string;
  participantsLeaderboard?: Array<{
    username: string;
    points: number;
    totalPoints?: number;
    nQuinipolosParticipated: number;
    fullCorrectQuinipolos: number;
  }>;
  averagePointsThisQuinipolo?: number;
  mostFailed?: {
    matchNumber: number;
    failedPercentage: number;
    homeTeam?: string;
    awayTeam?: string;
    correctWinner?: string; // "home" | "away" | "draw"
    mostWrongWinner?: string; // same domain
  } | null;
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
  const [missingAnswerIndices, setMissingAnswerIndices] = useState<number[]>(
    []
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [resultsModalOpen, setResultsModalOpen] = useState<boolean>(false);

  // Helper: map server-side correct_answers into our local answers shape
  const mapCorrectAnswersToInitial = (correctAnswers: any[]): AnswersType[] => {
    return initialAnswers.map((defaultAnswer, index) => {
      const correctAnswer = correctAnswers.find(
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
    });
  };

  // Refs to scroll to the first missing answer
  const rowRefs = React.useRef<(HTMLTableRowElement | null)[]>([]);

  // get via params if correcting or not
  const queryParams = new URLSearchParams(window.location.search);
  const correctingModeOn = queryParams.get("correct"); // another submit
  const editCorrectionModeOn = queryParams.get("correctionEdit"); // show corrections selected
  const seeUserAnswersModeOn = queryParams.get("see"); // if user answered, show answers. If correction done, show corrections. If both, show corrected Answers
  const viewOnlyModeOn = queryParams.get("viewOnly"); // view quinipolo without fetching or showing user answers
  const answerModeOn = // none of the above
    correctingModeOn === null &&
    editCorrectionModeOn === null &&
    seeUserAnswersModeOn === null &&
    viewOnlyModeOn === null
      ? true
      : false;

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
          setAnswers(mapCorrectAnswersToInitial(response.correct_answers));
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

  // Auto-highlight missing answers as the user interacts (excluding view-only mode)
  useEffect(() => {
    if (seeUserAnswersModeOn) return;
    if (viewOnlyModeOn) return;
    if (!hasAttemptedSubmit) return;
    const matches = quinipolo?.quinipolo || [];
    if (!matches.length) return;
    const missing: number[] = [];
    answers.forEach((ans, idx) => {
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
    setMissingAnswerIndices(missing);
  }, [
    answers,
    quinipolo?.quinipolo,
    seeUserAnswersModeOn,
    viewOnlyModeOn,
    hasAttemptedSubmit,
  ]);

  const submitQuinipolo = async () => {
    // Validate all answers are provided before submitting
    const missing: number[] = [];
    answers.forEach((ans, idx) => {
      if (idx === 14) {
        const isWinnerMissing = !ans.chosenWinner;
        const areGoalsMissing = !(ans.goalsHomeTeam && ans.goalsAwayTeam);
        if (isWinnerMissing || (!isWinnerMissing && areGoalsMissing)) {
          missing.push(idx);
        }
      } else {
        const isWinnerMissing = !ans.chosenWinner;
        if (isWinnerMissing) {
          missing.push(idx);
        }
      }
    });

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
          state: {
            results: response.results,
            leagueId: response.leagueId || quinipolo.league_id,
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
        isUserModerator(user.userData.userLeagues, quinipolo.league_id)
      ) {
        const response = await apiPost<CorrectionResponseType>(
          `/api/quinipolos/quinipolo/${quinipolo.id}/submit-correction-edit`,
          answerToSubmit
        );
        navigate("/correction-success", {
          state: {
            results: response.results,
            leagueId: response.leagueId || quinipolo.league_id,
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
    if (newValue === null || seeUserAnswersModeOn || viewOnlyModeOn) return;
    // For match 15, only clear highlight when winner and both goals are set
    const index = parseInt(newValue.split("__")[1]);
    if (index !== 14) {
      setMissingAnswerIndices((prev) => prev.filter((i) => i !== index));
    } else {
      const match15 = answers[14];
      const bothGoalsSelected = !!(
        match15?.goalsHomeTeam && match15?.goalsAwayTeam
      );
      if (bothGoalsSelected) {
        setMissingAnswerIndices((prev) => prev.filter((i) => i !== 14));
      }
    }
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
    if (newValue === null || seeUserAnswersModeOn || viewOnlyModeOn) return;
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

      // Only clear the missing mark for match 15 when BOTH goals are set
      const bothGoalsSelected = !!(
        updatedData[14].goalsHomeTeam && updatedData[14].goalsAwayTeam
      );
      if (bothGoalsSelected) {
        setMissingAnswerIndices((prev) => prev.filter((i) => i !== 14));
      }
      return updatedData;
    });
  };

  /**
   * Converts a score to goal range for waterpolo
   * Returns: "-" for <11, "11/12" for 11-12, "+" for >12
   */
  const scoreToGoalRange = (score: number): string => {
    if (score < 11) return "-";
    if (score >= 11 && score <= 12) return "11/12";
    return "+";
  };

  /**
   * Handles auto-fill from results modal
   */
  const handleResultsAutoFill = (matches: MatchResult[]) => {
    const updatedAnswers = [...answers];

    matches.forEach((result) => {
      const matchIndex = result.matchNumber - 1; // Convert to 0-based index
      if (matchIndex < 0 || matchIndex >= 15) return;

      // Set winner
      let chosenWinner = "";
      if (result.outcome === "Tie" || result.outcome === "Tie (PEN)") {
        chosenWinner = "empat";
      } else {
        // Find the team name in the quinipolo match
        const quinipoloMatch = quinipolo.quinipolo[matchIndex];
        if (quinipoloMatch) {
          if (result.outcome === quinipoloMatch.homeTeam) {
            chosenWinner = quinipoloMatch.homeTeam;
          } else if (result.outcome === quinipoloMatch.awayTeam) {
            chosenWinner = quinipoloMatch.awayTeam;
          }
        }
      }

      updatedAnswers[matchIndex] = {
        ...updatedAnswers[matchIndex],
        matchNumber: result.matchNumber,
        chosenWinner,
        isGame15: matchIndex === 14,
      };

      // For game 15, also set goals
      if (matchIndex === 14) {
        let homeScore = result.homeScore;
        let awayScore = result.awayScore;

        // If it was a tie and went to penalties, use regulation scores
        if (
          result.outcome === "Tie (PEN)" &&
          result.homeRegulationScore !== undefined &&
          result.awayRegulationScore !== undefined
        ) {
          homeScore = result.homeRegulationScore;
          awayScore = result.awayRegulationScore;
        }

        updatedAnswers[14] = {
          ...updatedAnswers[14],
          goalsHomeTeam: scoreToGoalRange(homeScore),
          goalsAwayTeam: scoreToGoalRange(awayScore),
        };
      }
    });

    setAnswers(updatedAnswers);
    setFeedback({
      message:
        t("resultsAutoFill.success") || "Correction form filled successfully!",
      severity: "success",
      open: true,
    });
  };

  // Check if user is moderator for this league
  const isModerator =
    quinipolo.league_id &&
    isUserModerator(user.userData.userLeagues, quinipolo.league_id);

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
    if (
      (seeUserAnswersModeOn || viewOnlyModeOn) &&
      quinipolo.has_been_corrected
    ) {
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
    } else if (viewOnlyModeOn) {
      return t("viewQuinipoloResults");
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
      {(correctingModeOn || editCorrectionModeOn) &&
        (isModerator || isSystemModerator(user.userData.role)) && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 20,
            }}
          >
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setResultsModalOpen(true)}
              disabled={loading || !quinipolo.id}
              sx={{
                width: { xs: "100%", sm: "auto" },
                background: "linear-gradient(135deg, #b8860b, #ffd54f)",
                color: "#3e2723",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                "&:hover": {
                  background: "linear-gradient(135deg, #a07007, #ffca28)",
                  color: "#3e2723",
                },
                "&.Mui-disabled": {
                  background:
                    "linear-gradient(135deg, rgba(184,134,11,0.4), rgba(255,213,79,0.4))",
                  color: "rgba(62,39,35,0.6)",
                },
              }}
            >
              {t("resultsAutoFill.button") || "Auto-fill Results"}
            </Button>
          </div>
        )}
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
              return (
                <TableRow
                  key={`${match.homeTeam}${match.awayTeam}__${index}`}
                  ref={(el) => (rowRefs.current[index] = el)}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    backgroundColor:
                      hasAttemptedSubmit && missingAnswerIndices.includes(index)
                        ? "rgba(255, 99, 71, 0.05)"
                        : undefined,
                    outline:
                      hasAttemptedSubmit && missingAnswerIndices.includes(index)
                        ? "2px solid rgba(255, 99, 71, 0.6)"
                        : undefined,
                    outlineOffset: missingAnswerIndices.includes(index)
                      ? "-2px"
                      : undefined,
                    transition: "background-color 0.2s ease",
                    borderRadius: 2,
                  }}
                >
                  <TableCell align="center" component="th" scope="row">
                    {index === 14 && answerModeOn ? (
                      <div className={style.matchNameContainer}>
                        <p>{t("game15")}</p>
                        <Tooltip title={t("game15help")}>
                          <HelpOutlineRoundedIcon
                            style={{ cursor: "pointer" }}
                          />
                        </Tooltip>
                      </div>
                    ) : (
                      <p className={style.matchName}>
                        {t("match")} {index + 1}
                      </p>
                    )}
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
                              viewOnlyModeOn={viewOnlyModeOn}
                              quinipoloHasBeenCorrected={
                                quinipoloHasBeenCorrected
                              }
                              disabled={loading}
                              isMissing={
                                hasAttemptedSubmit &&
                                !!answers[14]?.chosenWinner &&
                                !currentAnswer.goalsHomeTeam
                              }
                            />
                            <GoalsToggleButtonGroup
                              teamType="away"
                              teamName={quinipolo.quinipolo[14].awayTeam}
                              goals={currentAnswer.goalsAwayTeam}
                              correctGoals={awayTeamGoals}
                              matchType={match.gameType}
                              onChange={handleGame15Change}
                              seeUserAnswersModeOn={seeUserAnswersModeOn}
                              viewOnlyModeOn={viewOnlyModeOn}
                              quinipoloHasBeenCorrected={
                                quinipoloHasBeenCorrected
                              }
                              disabled={loading}
                              isMissing={
                                hasAttemptedSubmit &&
                                !!answers[14]?.chosenWinner &&
                                !currentAnswer.goalsAwayTeam
                              }
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
          {seeUserAnswersModeOn || viewOnlyModeOn ? null : (
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
      {quinipolo.id && (
        <ResultsAutoFillModal
          open={resultsModalOpen}
          onClose={() => setResultsModalOpen(false)}
          onConfirm={handleResultsAutoFill}
          quinipoloId={quinipolo.id}
        />
      )}
    </FormControl>
  );
};

export default AnswersForm;
