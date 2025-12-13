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
          cancelled: correctAnswer.cancelled || false,
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
  cancelled?: boolean;
}> => {
  return answers.map((answer, index) => {
    const baseAnswer: {
      matchNumber: number;
      chosenWinner: string;
      goalsHomeTeam?: string;
      goalsAwayTeam?: string;
      cancelled?: boolean;
    } = {
      matchNumber: index + 1,
      chosenWinner: answer.chosenWinner,
    };

    // Include cancelled status if present
    if (answer.cancelled) {
      baseAnswer.cancelled = true;
    }

    // Only include goals for match 15 (pleno al 15)
    if (index === 14) {
      baseAnswer.goalsHomeTeam = answer.goalsHomeTeam;
      baseAnswer.goalsAwayTeam = answer.goalsAwayTeam;
    }
    return baseAnswer;
  });
};
