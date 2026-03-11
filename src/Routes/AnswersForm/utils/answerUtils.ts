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
          goalsHomeTeamExact: correctAnswer.goalsHomeTeamExact || "",
          goalsAwayTeamExact: correctAnswer.goalsAwayTeamExact || "",
          regularGoalsHomeTeam: correctAnswer.regularGoalsHomeTeam || "",
          regularGoalsAwayTeam: correctAnswer.regularGoalsAwayTeam || "",
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
  goalsHomeTeamExact?: string;
  goalsAwayTeamExact?: string;
  regularGoalsHomeTeam?: string;
  regularGoalsAwayTeam?: string;
  cancelled?: boolean;
}> => {
  return answers.map((answer, index) => {
    const baseAnswer: {
      matchNumber: number;
      chosenWinner: string;
      goalsHomeTeam?: string;
      goalsAwayTeam?: string;
      goalsHomeTeamExact?: string;
      goalsAwayTeamExact?: string;
      regularGoalsHomeTeam?: string;
      regularGoalsAwayTeam?: string;
      cancelled?: boolean;
    } = {
      matchNumber: index + 1,
      chosenWinner: answer.chosenWinner,
    };

    if (answer.cancelled) {
      baseAnswer.cancelled = true;
    }

    if (index === 14) {
      if (answer.goalsHomeTeam || answer.goalsAwayTeam) {
        baseAnswer.goalsHomeTeam = answer.goalsHomeTeam || "";
        baseAnswer.goalsAwayTeam = answer.goalsAwayTeam || "";
      }
      if (answer.goalsHomeTeamExact || answer.goalsAwayTeamExact) {
        baseAnswer.goalsHomeTeamExact = answer.goalsHomeTeamExact || "";
        baseAnswer.goalsAwayTeamExact = answer.goalsAwayTeamExact || "";
      }
      if (answer.regularGoalsHomeTeam || answer.regularGoalsAwayTeam) {
        baseAnswer.regularGoalsHomeTeam = answer.regularGoalsHomeTeam || "";
        baseAnswer.regularGoalsAwayTeam = answer.regularGoalsAwayTeam || "";
      }
    } else {
      const hasRegular =
        answer.regularGoalsHomeTeam || answer.regularGoalsAwayTeam;
      const hasFinal = answer.goalsHomeTeam || answer.goalsAwayTeam;
      const isEmpat = answer.chosenWinner === "empat";

      if (hasFinal) {
        baseAnswer.goalsHomeTeam = answer.goalsHomeTeam || "";
        baseAnswer.goalsAwayTeam = answer.goalsAwayTeam || "";
      } else if (isEmpat && hasRegular) {
        baseAnswer.goalsHomeTeam = answer.regularGoalsHomeTeam || "";
        baseAnswer.goalsAwayTeam = answer.regularGoalsAwayTeam || "";
      }

      if (hasRegular) {
        baseAnswer.regularGoalsHomeTeam = answer.regularGoalsHomeTeam || "";
        baseAnswer.regularGoalsAwayTeam = answer.regularGoalsAwayTeam || "";
      }
    }
    return baseAnswer;
  });
};
