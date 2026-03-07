import { AnswersType } from "../types";
import { GameType } from "../../../types/quinipolo";
import {
  GOAL_DISPLAY_CONFIG,
  DEFAULT_GOAL_DISPLAY,
} from "../goalDisplayConfig";

export type GoalsValidationResult =
  | { valid: true }
  | {
      valid: false;
      reason:
        | "home_should_win"
        | "away_should_win"
        | "should_be_draw"
        | "exact_vs_range_mismatch"
        | "regular_time_must_be_tie"
        | "penalties_below_regular";
    };

/**
 * Converts GoalsToggleButtonGroup value to a comparable rank (0=low, 1=mid, 2=high).
 * Used for match 15 validation.
 */
function goalRangeToRank(value: string, gameType: GameType): number | null {
  if (!value) return null;
  const cfg = GOAL_DISPLAY_CONFIG[gameType] || DEFAULT_GOAL_DISPLAY;
  const centerPayload = cfg.centerPayload;
  if (value === "-") return 0;
  if (value === centerPayload) return 1;
  if (value === "+") return 2;
  return null;
}

/**
 * Maps exact numeric goals to the range payload (-, 11/12, + for waterpolo).
 * Used to validate that exact goals match the selected range.
 */
function exactGoalsToRangePayload(
  goals: number,
  gameType: GameType
): string | null {
  if (Number.isNaN(goals) || goals < 0) return null;
  const cfg = GOAL_DISPLAY_CONFIG[gameType] || DEFAULT_GOAL_DISPLAY;
  const centerPayload = cfg.centerPayload;
  if (gameType === "waterpolo") {
    if (goals < 11) return "-";
    if (goals <= 12) return centerPayload;
    return "+";
  }
  if (gameType === "football") {
    if (goals === 0) return "-";
    if (goals <= 2) return centerPayload;
    return "+";
  }
  return null;
}

/**
 * Validates that goals are consistent with the chosen winner.
 * For matches 1-14: uses numeric goals.
 * For match 15: uses range goals (goalsHomeTeam, goalsAwayTeam) and optionally
 * exact goals (goalsHomeTeamExact, goalsAwayTeamExact). Validates:
 * - Range vs winner (including draw: homeRank === awayRank)
 * - Exact vs winner when exact goals are set
 * - Exact vs range when both are set
 */
export function validateGoalsMatchWinner(
  chosenWinner: string,
  goalsHomeTeam: string | undefined,
  goalsAwayTeam: string | undefined,
  homeTeam: string,
  awayTeam: string,
  gameType: GameType = "waterpolo",
  isMatch15: boolean = false,
  goalsHomeTeamExact?: string,
  goalsAwayTeamExact?: string
): GoalsValidationResult {
  if (!chosenWinner) return { valid: true };

  const isHomeWinner = chosenWinner === homeTeam;
  const isAwayWinner = chosenWinner === awayTeam;
  const isDraw = chosenWinner === "empat";

  if (isMatch15) {
    const home = goalsHomeTeam ?? "";
    const away = goalsAwayTeam ?? "";
    const homeRank = goalRangeToRank(home, gameType);
    const awayRank = goalRangeToRank(away, gameType);

    const homeExactNum =
      goalsHomeTeamExact !== undefined &&
      goalsHomeTeamExact !== null &&
      goalsHomeTeamExact !== ""
        ? parseInt(String(goalsHomeTeamExact), 10)
        : NaN;
    const awayExactNum =
      goalsAwayTeamExact !== undefined &&
      goalsAwayTeamExact !== null &&
      goalsAwayTeamExact !== ""
        ? parseInt(String(goalsAwayTeamExact), 10)
        : NaN;
    const hasExactGoals =
      !Number.isNaN(homeExactNum) && !Number.isNaN(awayExactNum);

    if (hasExactGoals && home && away) {
      const homeExpected = exactGoalsToRangePayload(homeExactNum, gameType);
      const awayExpected = exactGoalsToRangePayload(awayExactNum, gameType);
      if (
        homeExpected !== null &&
        awayExpected !== null &&
        (homeExpected !== home || awayExpected !== away)
      ) {
        return { valid: false, reason: "exact_vs_range_mismatch" };
      }
    }

    if (isDraw) {
      if (homeRank !== null && awayRank !== null && homeRank !== awayRank) {
        return { valid: false, reason: "should_be_draw" };
      }
      if (hasExactGoals && homeExactNum !== awayExactNum) {
        return { valid: false, reason: "should_be_draw" };
      }
    } else {
      if (homeRank !== null && awayRank !== null) {
        if (isHomeWinner && homeRank <= awayRank) {
          return { valid: false, reason: "home_should_win" };
        }
        if (isAwayWinner && awayRank <= homeRank) {
          return { valid: false, reason: "away_should_win" };
        }
      }
      if (hasExactGoals) {
        if (isHomeWinner && homeExactNum <= awayExactNum) {
          return { valid: false, reason: "home_should_win" };
        }
        if (isAwayWinner && awayExactNum <= homeExactNum) {
          return { valid: false, reason: "away_should_win" };
        }
      }
    }

    return { valid: true };
  }

  const home = parseInt(String(goalsHomeTeam ?? ""), 10);
  const away = parseInt(String(goalsAwayTeam ?? ""), 10);
  if (Number.isNaN(home) || Number.isNaN(away)) return { valid: true };

  if (isDraw) return { valid: true };
  if (isHomeWinner && home <= away) {
    return { valid: false, reason: "home_should_win" };
  }
  if (isAwayWinner && away <= home) {
    return { valid: false, reason: "away_should_win" };
  }

  return { valid: true };
}

/**
 * Validates that goals after penalties are not lower than regular time goals.
 * Only applies when both regular and penalty scores are set (tie-breaker scenario).
 */
export function validatePenaltiesNotBelowRegular(
  regularGoalsHomeTeam: string,
  regularGoalsAwayTeam: string,
  goalsHomeTeam: string,
  goalsAwayTeam: string
): GoalsValidationResult {
  const regH = parseInt(String(regularGoalsHomeTeam ?? ""), 10);
  const regA = parseInt(String(regularGoalsAwayTeam ?? ""), 10);
  const penH = parseInt(String(goalsHomeTeam ?? ""), 10);
  const penA = parseInt(String(goalsAwayTeam ?? ""), 10);
  if (Number.isNaN(regH) || Number.isNaN(regA)) return { valid: true };
  if (Number.isNaN(penH) || Number.isNaN(penA)) return { valid: true };
  if (penH < regH || penA < regA) {
    return { valid: false, reason: "penalties_below_regular" };
  }
  return { valid: true };
}

export function getGoalsValidationMessage(
  result: GoalsValidationResult,
  t: (key: string) => string
): string | null {
  if (result.valid) return null;
  switch (result.reason) {
    case "home_should_win":
      return t("goalsMustShowHomeWinning");
    case "away_should_win":
      return t("goalsMustShowAwayWinning");
    case "should_be_draw":
      return t("goalsMustBeEqualForDraw");
    case "exact_vs_range_mismatch":
      return t("goalsMustMatchRanges");
    case "regular_time_must_be_tie":
      return t("regularTimeScoreMustBeTie");
    case "penalties_below_regular":
      return t("goalsAfterPenaltiesCannotBeLower");
    default:
      return null;
  }
}

/**
 * Returns match indices where goals don't match the chosen winner.
 * Only checks matches that have both goals and a winner set.
 * For match 15, uses GoalsToggleButtonGroup range comparison.
 * When tieBreakerRequested, regular time score must be equal (tie).
 */
export function findGoalsMismatchIndices(
  answers: AnswersType[],
  quinipolo: {
    quinipolo: Array<{ homeTeam: string; awayTeam: string; gameType?: GameType }>;
  }
): number[] {
  const mismatchSet = new Set<number>();
  answers.forEach((ans, idx) => {
    if (ans.cancelled) return;
    const match = quinipolo.quinipolo[idx];
    if (!match) return;
    const gameType = match.gameType ?? "waterpolo";
    const isMatch15 = idx === 14;
    const goalsHome =
      ans.goalsHomeTeam ||
      (ans.chosenWinner === "empat" && ans.regularGoalsHomeTeam
        ? ans.regularGoalsHomeTeam
        : "");
    const goalsAway =
      ans.goalsAwayTeam ||
      (ans.chosenWinner === "empat" && ans.regularGoalsAwayTeam
        ? ans.regularGoalsAwayTeam
        : "");
    const result = validateGoalsMatchWinner(
      ans.chosenWinner ?? "",
      goalsHome,
      goalsAway,
      match.homeTeam,
      match.awayTeam,
      gameType,
      isMatch15,
      isMatch15 ? ans.goalsHomeTeamExact : undefined,
      isMatch15 ? ans.goalsAwayTeamExact : undefined
    );
    if (!result.valid) {
      mismatchSet.add(idx);
    }
    if (
      !isMatch15 &&
      (ans.regularGoalsHomeTeam || ans.regularGoalsAwayTeam)
    ) {
      const regH = ans.regularGoalsHomeTeam ?? "";
      const regA = ans.regularGoalsAwayTeam ?? "";
      if (regH !== "" && regA !== "" && regH !== regA) {
        mismatchSet.add(idx);
      }
      const goalsH = ans.goalsHomeTeam ?? "";
      const goalsA = ans.goalsAwayTeam ?? "";
      if (
        regH !== "" &&
        regA !== "" &&
        goalsH !== "" &&
        goalsA !== "" &&
        !validatePenaltiesNotBelowRegular(regH, regA, goalsH, goalsA).valid
      ) {
        mismatchSet.add(idx);
      }
    }
  });
  return Array.from(mismatchSet);
}
