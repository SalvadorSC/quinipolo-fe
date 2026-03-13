import React from "react";
import { TableRow, TableCell, Alert, Box, FormHelperText } from "@mui/material";
import { AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { QuinipoloType, GameType } from "../../../types/quinipolo";
import { AnswersType } from "../types";
import { MatchHeader } from "./MatchHeader";
import { MatchWinnerButtons } from "./MatchWinnerButtons";
import { AnswerStatistics } from "./AnswerStatistics";
import { AnswerStatisticsSkeleton } from "./AnswerStatisticsSkeleton";
import { CancelMatchButton } from "./CancelMatchButton";
import GoalsToggleButtonGroup from "../GoalsToggleButtonGroup";
import { GoalsInputs } from "./GoalsInputs";
import {
  validateGoalsMatchWinner,
  getGoalsValidationMessage,
} from "../utils/goalsValidationUtils";
import { LEAGUES_WITH_IMAGE_SHARE_BETA } from "../../../config/leaguesWithImageShare";
import style from "../AnswersForm.module.scss";

interface MatchRowProps {
  match: {
    homeTeam: string;
    awayTeam: string;
    gameType: GameType;
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
    newValue: string,
  ) => void;
  handleGoalsChange?: (
    matchIndex: number,
    teamType: "home" | "away" | "regularHome" | "regularAway",
    value: string,
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
  handleGoalsChange,
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
  const canEnterGoalsPerMatch =
    quinipolo.league_id &&
    LEAGUES_WITH_IMAGE_SHARE_BETA.includes(quinipolo.league_id);
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
            {t("matchCancelledMessage")}
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
            {isCorrectionMode && canEnterGoalsPerMatch && handleGoalsChange && (
              <GoalsInputs
                matchIndex={matchIndex}
                chosenWinner={currentAnswer.chosenWinner ?? ""}
                goalsHomeTeam={
                  isGame15
                    ? (currentAnswer.goalsHomeTeamExact ?? "")
                    : (currentAnswer.goalsHomeTeam ?? "")
                }
                goalsAwayTeam={
                  isGame15
                    ? (currentAnswer.goalsAwayTeamExact ?? "")
                    : (currentAnswer.goalsAwayTeam ?? "")
                }
                regularGoalsHomeTeam={currentAnswer.regularGoalsHomeTeam ?? ""}
                regularGoalsAwayTeam={currentAnswer.regularGoalsAwayTeam ?? ""}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                onGoalsChange={handleGoalsChange}
                disabled={loading || isCancelled}
              />
            )}
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
              <Box>
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
                {isCorrectionMode &&
                  (() => {
                    const game15Validation = validateGoalsMatchWinner(
                      currentAnswer.chosenWinner ?? "",
                      currentAnswer.goalsHomeTeam,
                      currentAnswer.goalsAwayTeam,
                      match.homeTeam,
                      match.awayTeam,
                      match.gameType,
                      true,
                      currentAnswer.goalsHomeTeamExact,
                      currentAnswer.goalsAwayTeamExact
                    );
                    const game15Error = getGoalsValidationMessage(
                      game15Validation,
                      t
                    );
                    return game15Error ? (
                      <FormHelperText error sx={{ m: 0, mt: 0.5, textAlign: "center" }}>
                        {game15Error}
                      </FormHelperText>
                    ) : null;
                  })()}
              </Box>
            )}
          </>
        )}
      </TableCell>
    </TableRow>
  );
};
