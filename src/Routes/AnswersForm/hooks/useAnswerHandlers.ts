import { AnswersType } from "../types";

export const useAnswerHandlers = (
  answers: AnswersType[],
  setAnswers: React.Dispatch<React.SetStateAction<AnswersType[]>>,
  seeUserAnswersModeOn: boolean,
  viewOnlyModeOn: boolean,
  setMissingAnswerIndices: React.Dispatch<React.SetStateAction<number[]>>
) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => {
    if (newValue === null || seeUserAnswersModeOn || viewOnlyModeOn) return;

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

  const handleCancelMatch = (matchIndex: number) => {
    if (seeUserAnswersModeOn || viewOnlyModeOn) return;

    setAnswers((prevAnswers) => {
      const updatedData = [...prevAnswers];
      const currentAnswer = updatedData[matchIndex];

      if (currentAnswer.cancelled) {
        // Uncancel: restore the match
        updatedData[matchIndex] = {
          ...currentAnswer,
          cancelled: false,
        };
      } else {
        // Cancel: mark as cancelled and clear answers
        updatedData[matchIndex] = {
          ...currentAnswer,
          cancelled: true,
          chosenWinner: "",
          goalsHomeTeam: "",
          goalsAwayTeam: "",
        };
      }

      // Remove from missing indices when cancelled
      if (updatedData[matchIndex].cancelled) {
        setMissingAnswerIndices((prev) => prev.filter((i) => i !== matchIndex));
      }

      return updatedData;
    });
  };

  return {
    handleChange,
    handleGame15Change,
    handleCancelMatch,
  };
};
