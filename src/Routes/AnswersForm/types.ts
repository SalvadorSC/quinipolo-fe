import { CorrectAnswer } from "../../types/quinipolo";

export type AnswersType = CorrectAnswer;

export type CorrectionResponseType = {
  message: string;
  results:
    | {
        correctAnswers: { chosenWinner: string; matchNumber: number }[];
        userAnswers: string[];
        points: number;
      }[]
    | any; // backend returns an array of per-user results already used in CorrectionSuccess
  leagueId?: string;
  endDate?: string;
  participantsLeaderboard?: Array<{
    username: string;
    points: number;
    totalPoints?: number;
    nQuinipolosParticipated: number;
    fullCorrectQuinipolos: number;
  }>;
  averagePointsThisQuinipolo?: number;
  mostFailed?: {
    matchNumber: number;
    failedPercentage: number;
    homeTeam?: string;
    awayTeam?: string;
    correctWinner?: string; // "home" | "away" | "draw"
    mostWrongWinner?: string; // same domain
  } | null;
};

export type AnswerResponseType = {
  message: string;
};

export type AnswersFormModes = {
  correctingModeOn: boolean;
  editCorrectionModeOn: boolean;
  seeUserAnswersModeOn: boolean;
  viewOnlyModeOn: boolean;
  answerModeOn: boolean;
};
