import React from "react";
import { TableRow, TableCell, Alert, Box } from "@mui/material";
import { AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { QuinipoloType } from "../../../types/quinipolo";
import { AnswersType } from "../types";
import { MatchHeader } from "./MatchHeader";
import { MatchWinnerButtons } from "./MatchWinnerButtons";
import { AnswerStatistics } from "./AnswerStatistics";
import { AnswerStatisticsSkeleton } from "./AnswerStatisticsSkeleton";
import { CancelMatchButton } from "./CancelMatchButton";
import GoalsToggleButtonGroup from "../GoalsToggleButtonGroup";
import style from "../AnswersForm.module.scss";

interface MatchRowProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    gameType: "waterpolo" | "football";
    leagueId?: string;
    leagueName?: string;
  };
  matchIndex: number;
  answers: AnswersType[];
  quinipolo: QuinipoloType;
  currentAnswer: AnswersType;
  seeUserAnswersModeOn: boolean;
  viewOnlyModeOn: boolean;
  answerModeOn: boolean;
  correctingModeOn: boolean;
  editCorrectionModeOn: boolean;
  loading: boolean;
  hasAttemptedSubmit: boolean;
  missingAnswerIndices: number[];
  rowRef: (el: HTMLTableRowElement | null) => void;
  onChange: (event: React.MouseEvent<HTMLElement>, newValue: string) => void;
  handleGame15Change: (
    event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => void;
  handleCancelMatch: (matchIndex: number) => void;
  matchOption: (value: string, index: number) => React.ReactNode;
  matchStatistics?: {
    statistics: {
      homeTeam: { count: number; percentage: number };
      awayTeam: { count: number; percentage: number };
      empat: { count: number; percentage: number };
    };
  };
  statisticsLoading?: boolean;
  totalResponses?: number;
  showStatistics?: boolean;
}

export const MatchRow: React.FC<MatchRowProps> = ({
  match,
  matchIndex,
  answers,
  quinipolo,
  currentAnswer,
  seeUserAnswersModeOn,
  viewOnlyModeOn,
  answerModeOn,
  correctingModeOn,
  editCorrectionModeOn,
  loading,
  hasAttemptedSubmit,
  missingAnswerIndices,
  rowRef,
  onChange,
  handleGame15Change,
  handleCancelMatch,
  matchOption,
  matchStatistics,
  statisticsLoading,
  totalResponses,
  showStatistics = true,
}) => {
  const isMissing =
    hasAttemptedSubmit && missingAnswerIndices.includes(matchIndex);
  const isGame15 = matchIndex === 14;
  const isCancelled = currentAnswer.cancelled || false;
  const isCorrectionMode = correctingModeOn || editCorrectionModeOn;

  const correctAnswers = quinipolo.correct_answers;
  const hasCorrectAnswers = correctAnswers && correctAnswers.length > 0;
  const homeTeamGoals = hasCorrectAnswers
    ? correctAnswers[matchIndex]?.goalsHomeTeam || ""
    : "";
  const awayTeamGoals = hasCorrectAnswers
    ? correctAnswers[matchIndex]?.goalsAwayTeam || ""
    : "";
  const quinipoloHasBeenCorrected = quinipolo.has_been_corrected;
  const { t } = useTranslation();

  return (
    <TableRow
      key={`${match.homeTeam}${match.awayTeam}__${matchIndex}`}
      ref={rowRef}
      className={`${style.matchRow} ${isMissing ? style.missing : ""} ${
        isCancelled ? style.cancelled : ""
      }`}
    >
      <TableCell align="center" component="th" scope="row">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: isCancelled ? 1 : 0,
          }}
        >
          <MatchHeader
            matchNumber={matchIndex + 1}
            isGame15={isGame15}
            answerModeOn={answerModeOn}
            leagueId={match.leagueId}
          />
          {isCorrectionMode && (
            <CancelMatchButton
              matchIndex={matchIndex}
              isCancelled={isCancelled}
              onCancel={handleCancelMatch}
              disabled={loading || seeUserAnswersModeOn || viewOnlyModeOn}
            />
          )}
        </Box>
        {isCancelled && (
          <Alert severity="info" sx={{ mb: 1, fontSize: "0.875rem" }}>
            {t("matchCancelledMessage") ||
              "This match is cancelled and will count as correct for everyone"}
          </Alert>
        )}
        {!isCancelled && (
          <>
            <MatchWinnerButtons
              match={match}
              matchIndex={matchIndex}
              currentAnswer={currentAnswer}
              loading={loading || isCancelled}
              onChange={onChange}
              matchOption={matchOption}
            />
            {!answerModeOn && showStatistics && (
              <AnimatePresence mode="wait">
                {statisticsLoading ? (
                  <AnswerStatisticsSkeleton key={`skeleton-${matchIndex}`} />
                ) : matchStatistics && totalResponses ? (
                  <AnswerStatistics
                    key={`stats-${matchIndex}`}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                    matchNumber={matchIndex + 1}
                    statistics={matchStatistics.statistics}
                    totalResponses={totalResponses}
                  />
                ) : null}
              </AnimatePresence>
            )}
            {isGame15 && (
              <div className={style.goalsContainer}>
                <GoalsToggleButtonGroup
                  teamType="home"
                  teamName={quinipolo.quinipolo[14].homeTeam}
                  goals={currentAnswer.goalsHomeTeam}
                  correctGoals={homeTeamGoals}
                  matchType={match.gameType}
                  onChange={handleGame15Change}
                  seeUserAnswersModeOn={seeUserAnswersModeOn ? "true" : null}
                  viewOnlyModeOn={viewOnlyModeOn ? "true" : null}
                  quinipoloHasBeenCorrected={quinipoloHasBeenCorrected}
                  disabled={loading || isCancelled}
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
                  seeUserAnswersModeOn={seeUserAnswersModeOn ? "true" : null}
                  viewOnlyModeOn={viewOnlyModeOn ? "true" : null}
                  quinipoloHasBeenCorrected={quinipoloHasBeenCorrected}
                  disabled={loading || isCancelled}
                  isMissing={
                    hasAttemptedSubmit &&
                    !!answers[14]?.chosenWinner &&
                    !currentAnswer.goalsAwayTeam
                  }
                />
              </div>
            )}
          </>
        )}
      </TableCell>
    </TableRow>
  );
};
