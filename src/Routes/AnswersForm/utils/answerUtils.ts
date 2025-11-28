import { AnswersType } from "../types";

export const mapCorrectAnswersToInitial = (
  correctAnswers: any[],
  initialAnswers: AnswersType[]
): AnswersType[] => {
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

export const prepareAnswersForSubmission = (
  answers: AnswersType[]
): Array<{
  matchNumber: number;
  chosenWinner: string;
  goalsHomeTeam?: string;
  goalsAwayTeam?: string;
}> => {
  return answers.map((answer, index) => {
    const baseAnswer = {
      matchNumber: index + 1,
      chosenWinner: answer.chosenWinner,
    };
    // Only include goals for match 15 (pleno al 15)
    if (index === 14) {
      return {
        ...baseAnswer,
        goalsHomeTeam: answer.goalsHomeTeam,
        goalsAwayTeam: answer.goalsAwayTeam,
      };
    }
    return baseAnswer;
  });
};
