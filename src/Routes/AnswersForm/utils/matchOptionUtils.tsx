import React from "react";
import { QuinipoloType } from "../../../types/quinipolo";
import { AnswersType } from "../types";
import style from "../AnswersForm.module.scss";

export const createMatchOptionRenderer = (
  answers: AnswersType[],
  quinipolo: QuinipoloType,
  seeUserAnswersModeOn: boolean,
  viewOnlyModeOn: boolean,
  t: (key: string) => string
) => {
  return (value: string, index: number) => {
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
};
