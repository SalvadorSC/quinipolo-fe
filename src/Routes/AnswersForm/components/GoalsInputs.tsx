import React, { useState, useEffect } from "react";
import { Box, TextField, FormHelperText, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  validateGoalsMatchWinner,
  validatePenaltiesNotBelowRegular,
  getGoalsValidationMessage,
} from "../utils/goalsValidationUtils";

const DEBOUNCE_MS = 400;

function useDebouncedValues<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface GoalsInputsProps {
  matchIndex: number;
  chosenWinner: string;
  goalsHomeTeam: string;
  goalsAwayTeam: string;
  regularGoalsHomeTeam?: string;
  regularGoalsAwayTeam?: string;
  homeTeam: string;
  awayTeam: string;
  onGoalsChange: (
    matchIndex: number,
    teamType: "home" | "away" | "regularHome" | "regularAway",
    value: string,
  ) => void;
  disabled?: boolean;
}

export const GoalsInputs: React.FC<GoalsInputsProps> = ({
  matchIndex,
  chosenWinner,
  goalsHomeTeam,
  goalsAwayTeam,
  regularGoalsHomeTeam = "",
  regularGoalsAwayTeam = "",
  homeTeam,
  awayTeam,
  onGoalsChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const debouncedGoalsHome = useDebouncedValues(goalsHomeTeam, DEBOUNCE_MS);
  const debouncedGoalsAway = useDebouncedValues(goalsAwayTeam, DEBOUNCE_MS);
  const debouncedRegularHome = useDebouncedValues(
    regularGoalsHomeTeam,
    DEBOUNCE_MS
  );
  const debouncedRegularAway = useDebouncedValues(
    regularGoalsAwayTeam,
    DEBOUNCE_MS
  );

  const debouncedEffectiveHome =
    debouncedGoalsHome ||
    (chosenWinner === "empat" ? debouncedRegularHome : "");
  const debouncedEffectiveAway =
    debouncedGoalsAway ||
    (chosenWinner === "empat" ? debouncedRegularAway : "");

  const winnerValidation = validateGoalsMatchWinner(
    chosenWinner,
    debouncedEffectiveHome,
    debouncedEffectiveAway,
    homeTeam,
    awayTeam,
  );
  const hasRegularAndPenaltyGoals =
    debouncedRegularHome !== "" &&
    debouncedRegularAway !== "" &&
    debouncedGoalsHome !== "" &&
    debouncedGoalsAway !== "";
  const penaltiesValidation = hasRegularAndPenaltyGoals
    ? validatePenaltiesNotBelowRegular(
        debouncedRegularHome,
        debouncedRegularAway,
        debouncedGoalsHome,
        debouncedGoalsAway
      )
    : { valid: true as const };
  const validation = !winnerValidation.valid
    ? winnerValidation
    : !penaltiesValidation.valid
      ? penaltiesValidation
      : winnerValidation;
  const errorMessage = getGoalsValidationMessage(validation, t);
  const hasError = !validation.valid;

  const isEmpat = chosenWinner === "empat";
  const hasRegularGoals =
    regularGoalsHomeTeam !== "" || regularGoalsAwayTeam !== "";
  const showTieSection = isEmpat || hasRegularGoals;
  const regularMustBeEqual =
    hasRegularGoals &&
    debouncedRegularHome !== "" &&
    debouncedRegularAway !== "" &&
    debouncedRegularHome !== debouncedRegularAway;

  const goalsRow = (
    label: string,
    homeValue: string,
    awayValue: string,
    homeType: "home" | "regularHome",
    awayType: "away" | "regularAway",
    error: boolean
  ) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          type="number"
          size="small"
          placeholder="0"
          value={homeValue}
          onChange={(e) => onGoalsChange(matchIndex, homeType, e.target.value)}
          disabled={disabled}
          error={error}
          sx={{ flex: 1 }}
          inputProps={{ min: 0, max: 99 }}
        />
        <span>-</span>
        <TextField
          type="number"
          size="small"
          placeholder="0"
          value={awayValue}
          onChange={(e) => onGoalsChange(matchIndex, awayType, e.target.value)}
          disabled={disabled}
          error={error}
          sx={{ flex: 1 }}
          inputProps={{ min: 0, max: 99 }}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        mt: 1,
        alignItems: "flex-start",
      }}
    >
      {showTieSection ? (
        <>
          {goalsRow(
            t("goalsInTie"),
            regularGoalsHomeTeam,
            regularGoalsAwayTeam,
            "regularHome",
            "regularAway",
            regularMustBeEqual
          )}
          {goalsRow(
            t("goalsAfterPenalties"),
            goalsHomeTeam,
            goalsAwayTeam,
            "home",
            "away",
            hasError
          )}
        </>
      ) : (
        goalsRow(
          t("goalsInputsDescription"),
          goalsHomeTeam,
          goalsAwayTeam,
          "home",
          "away",
          hasError
        )
      )}
      {regularMustBeEqual && (
        <FormHelperText error sx={{ m: 0, textAlign: "left" }}>
          {t("regularTimeScoreMustBeTie")}
        </FormHelperText>
      )}
      {errorMessage && (
        <FormHelperText error sx={{ m: 0, textAlign: "center" }}>
          {errorMessage}
        </FormHelperText>
      )}
    </Box>
  );
};
