import React, { useState, useRef } from "react";
import {
  FormControl,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../Context/UserContext/UserContext";
import {
  isSystemModerator,
  isUserModerator,
  isSystemAdmin,
} from "../../utils/moderatorUtils";
import ScoreSummary from "./ScoreSummary";
import { ResultsAutoFillModal } from "./ResultsAutoFillModal/index";
import { MatchRow } from "./components/MatchRow";
import { AutoFillButton } from "./components/AutoFillButton/AutoFillButton";
import { SubmitButton } from "./components/SubmitButton";
import { StatisticsToggleButton } from "./components/StatisticsToggleButton/StatisticsToggleButton";
import { useAnswersFormModes } from "./hooks/useAnswersFormModes";
import { useQuinipoloData } from "./hooks/useQuinipoloData";
import { useAnswerHandlers } from "./hooks/useAnswerHandlers";
import { useAnswerSubmission } from "./hooks/useAnswerSubmission";
import { useAnswerValidation } from "./hooks/useAnswerValidation";
import { useAnswerStatistics } from "./hooks/useAnswerStatistics";
import { applyAutoFillResults } from "./utils/autoFillUtils";
import { getHeaderText } from "./utils/headerUtils";
import { createMatchOptionRenderer } from "./utils/matchOptionUtils";
import style from "./AnswersForm.module.scss";

const AnswersForm = () => {
  const user = useUser();
  const navigate = useNavigate();
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();
  const modes = useAnswersFormModes();

  const [missingAnswerIndices, setMissingAnswerIndices] = useState<number[]>(
    []
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [resultsModalOpen, setResultsModalOpen] = useState<boolean>(false);
  const [showStatistics, setShowStatistics] = useState<boolean>(true);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const {
    loading: dataLoading,
    quinipolo,
    answers,
    setAnswers,
  } = useQuinipoloData(modes.editCorrectionModeOn, modes.seeUserAnswersModeOn);

  const { handleChange, handleGame15Change } = useAnswerHandlers(
    answers,
    setAnswers,
    modes.seeUserAnswersModeOn,
    modes.viewOnlyModeOn,
    setMissingAnswerIndices
  );

  const { submitQuinipolo, loading: submitLoading } = useAnswerSubmission(
    answers,
    quinipolo,
    modes.correctingModeOn,
    modes.editCorrectionModeOn,
    user,
    setMissingAnswerIndices,
    setHasAttemptedSubmit,
    rowRefs
  );

  useAnswerValidation(
    answers,
    quinipolo,
    modes.seeUserAnswersModeOn,
    modes.viewOnlyModeOn,
    hasAttemptedSubmit,
    setMissingAnswerIndices
  );

  // Show statistics if deadline passed and user is viewing (not answering)
  // Only super admins can see statistics
  const isSystemAdministrator = isSystemAdmin(user.userData.role);
  const shouldShowStatistics =
    isSystemAdministrator &&
    (modes.seeUserAnswersModeOn ||
      modes.viewOnlyModeOn ||
      modes.correctingModeOn ||
      modes.editCorrectionModeOn);

  const { statistics, loading: statisticsLoading } = useAnswerStatistics(
    quinipolo.id,
    quinipolo.end_date,
    shouldShowStatistics
  );

  const loading = dataLoading || submitLoading;
  const isModerator = Boolean(
    quinipolo.league_id &&
      isUserModerator(user.userData.userLeagues, quinipolo.league_id)
  );

  const handleResultsAutoFill = (matches: any[]) => {
    const updatedAnswers = applyAutoFillResults(matches, answers, quinipolo);
    setAnswers(updatedAnswers);
    setFeedback({
      message:
        t("resultsAutoFill.success") || "Correction form filled successfully!",
      severity: "success",
      open: true,
    });
  };

  const matchOption = createMatchOptionRenderer(
    answers,
    quinipolo,
    modes.seeUserAnswersModeOn,
    modes.viewOnlyModeOn,
    t
  );

  if (!quinipolo.quinipolo) {
    setFeedback({
      message: t("errorLoadingQuinipolo") || "Error loading Quinipolo",
      severity: "error",
      open: true,
    });
    navigate("/");
    return null;
  }

  return (
    <FormControl>
      {modes.seeUserAnswersModeOn && (
        <ScoreSummary
          userAnswers={answers}
          correctAnswers={quinipolo.correct_answers || []}
          hasBeenCorrected={quinipolo.has_been_corrected}
        />
      )}

      {(modes.correctingModeOn || modes.editCorrectionModeOn) &&
        user.userData.hasScraperAccess === true && (
          <AutoFillButton
            onClick={() => setResultsModalOpen(true)}
            disabled={loading || !quinipolo.id}
          />
        )}
      <TableContainer
        className={style.tableContainer}
        component={Paper}
        sx={{ borderRadius: "12px" }}
      >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                className={style.tableHeader}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {getHeaderText(modes, t)}
                {shouldShowStatistics && isSystemAdministrator && (
                  <StatisticsToggleButton
                    showStatistics={showStatistics}
                    onToggle={() => setShowStatistics(!showStatistics)}
                    disabled={
                      statisticsLoading ||
                      !statistics?.total_responses ||
                      statistics.total_responses === 0
                    }
                    hasNoAnswers={
                      !statisticsLoading &&
                      (!statistics?.total_responses ||
                        statistics.total_responses === 0)
                    }
                  />
                )}
              </TableCell>
            </TableRow>
          </TableHead>
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

              // Get statistics for this specific match
              const matchStatistics = statistics
                ? statistics.matches.find((m) => m.matchNumber === index + 1)
                : undefined;

              return (
                <MatchRow
                  key={`${match.homeTeam}${match.awayTeam}__${index}`}
                  match={match}
                  matchIndex={index}
                  answers={answers}
                  quinipolo={quinipolo}
                  currentAnswer={currentAnswer}
                  seeUserAnswersModeOn={modes.seeUserAnswersModeOn}
                  viewOnlyModeOn={modes.viewOnlyModeOn}
                  answerModeOn={modes.answerModeOn}
                  loading={loading}
                  hasAttemptedSubmit={hasAttemptedSubmit}
                  missingAnswerIndices={missingAnswerIndices}
                  rowRef={(el) => (rowRefs.current[index] = el)}
                  onChange={handleChange}
                  handleGame15Change={handleGame15Change}
                  matchOption={matchOption}
                  matchStatistics={matchStatistics}
                  statisticsLoading={statisticsLoading}
                  totalResponses={statistics?.total_responses}
                  showStatistics={showStatistics}
                />
              );
            })}
          </TableBody>
          {!modes.seeUserAnswersModeOn && !modes.viewOnlyModeOn && (
            <SubmitButton
              onClick={submitQuinipolo}
              loading={loading}
              editCorrectionModeOn={modes.editCorrectionModeOn}
              isModerator={isModerator}
            />
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
