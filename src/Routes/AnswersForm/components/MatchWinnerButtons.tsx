import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import style from "../AnswersForm.module.scss";

interface MatchWinnerButtonsProps {
  match: {
    homeTeam: string;
    awayTeam: string;
  };
  matchIndex: number;
  currentAnswer: {
    chosenWinner: string;
  };
  loading: boolean;
  onChange: (event: React.MouseEvent<HTMLElement>, newValue: string) => void;
  matchOption: (value: string, index: number) => React.ReactNode;
}

export const MatchWinnerButtons: React.FC<MatchWinnerButtonsProps> = ({
  match,
  matchIndex,
  currentAnswer,
  loading,
  onChange,
  matchOption,
}) => {
  return (
    <ToggleButtonGroup
      color="primary"
      className={style.teamAnswerButtonContainer}
      value={
        currentAnswer.chosenWinner
          ? `${currentAnswer.chosenWinner}__${matchIndex}`
          : ""
      }
      exclusive
      onChange={onChange}
      aria-label="Match winner"
      disabled={loading}
    >
      <ToggleButton
        className={`${style.teamAnswerButton}`}
        value={`${match.homeTeam}__${matchIndex}`}
        disabled={loading}
      >
        {matchOption(match.homeTeam, matchIndex)}
      </ToggleButton>
      <ToggleButton value={`empat__${matchIndex}`} disabled={loading}>
        {matchOption("empat", matchIndex)}
      </ToggleButton>
      <ToggleButton
        className={`${style.teamAnswerButton}`}
        value={`${match.awayTeam}__${matchIndex}`}
        disabled={loading}
      >
        {matchOption(match.awayTeam, matchIndex)}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
