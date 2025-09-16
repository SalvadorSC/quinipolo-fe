import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import style from "./AnswersForm.module.scss";

interface GoalsToggleButtonGroupProps {
  teamType: "home" | "away";
  teamName: string;
  goals: string;
  correctGoals: string;
  matchType: "waterpolo" | "football";
  onChange: (event: React.MouseEvent<HTMLElement>, newValue: string) => void;
  seeUserAnswersModeOn: string | null;
  quinipoloHasBeenCorrected: boolean;
  disabled?: boolean;
  isMissing?: boolean;
}

const GoalsToggleButtonGroup: React.FC<GoalsToggleButtonGroupProps> = ({
  teamType,
  teamName,
  goals,
  correctGoals,
  matchType,
  onChange,
  seeUserAnswersModeOn,
  quinipoloHasBeenCorrected,
  disabled = false,
  isMissing = false,
}) => {
  const values =
    matchType === "waterpolo"
      ? ["9/10", `9/10__${teamType}`]
      : ["1/2", `1/2__${teamType}`];

  const getButtonClassName = (value: string) => {
    if (!seeUserAnswersModeOn || !quinipoloHasBeenCorrected) return "";

    // Extract the goal value from the button value
    const goalValue = value.split("__")[0];

    // Determine the styling based on whether we're showing user answers and have corrections
    // Extract the goal value from the correct answer (remove team suffix if present)
    const correctGoalValue = correctGoals?.split("__")[0] || "";

    if (correctGoalValue === goalValue) {
      // This is the correct answer - always show in green
      return style.correctAnswer;
    } else if (goals === goalValue && goals !== correctGoalValue) {
      // This is the user's answer and it's wrong - show in red
      return style.answerIsWrong;
    }

    return "";
  };

  return (
    <div
      style={{
        outline: isMissing ? "2px solid rgba(255, 99, 71, 0.6)" : undefined,
        borderRadius: isMissing ? 8 : undefined,
        padding: isMissing ? 4 : undefined,
        background: isMissing ? "rgba(255, 99, 71, 0.08)" : undefined,
        transition: "background-color 0.2s ease",
      }}
    >
      <p>Goals {teamName}:</p>
      <ToggleButtonGroup
        color="primary"
        value={goals ? `${goals}__${teamType}` : ""}
        exclusive
        onChange={onChange}
        aria-label="Match winner"
        disabled={disabled}
      >
        <ToggleButton value={`-__${teamType}`} disabled={disabled}>
          <span className={getButtonClassName(`-__${teamType}`)}>-</span>
        </ToggleButton>
        <ToggleButton value={values[1]} disabled={disabled}>
          <span className={getButtonClassName(values[1])}>{values[0]} </span>
        </ToggleButton>
        <ToggleButton value={`+__${teamType}`} disabled={disabled}>
          <span className={getButtonClassName(`+__${teamType}`)}>+</span>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
};

export default GoalsToggleButtonGroup;
