import { AnswersType } from "./types";

export const createInitialAnswers = (): AnswersType[] => [
  ...Array(14)
    .fill(null)
    .map((_, index) => ({
      matchNumber: index + 1,
      chosenWinner: "",
      isGame15: false,
      goalsHomeTeam: "",
      goalsAwayTeam: "",
    })),
  {
    matchNumber: 15,
    chosenWinner: "",
    isGame15: true,
    goalsHomeTeam: "",
    goalsAwayTeam: "",
  },
];
