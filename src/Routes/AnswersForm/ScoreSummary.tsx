import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { CorrectAnswer } from "../../types/quinipolo";

interface ScoreSummaryProps {
  userAnswers: CorrectAnswer[];
  correctAnswers: CorrectAnswer[];
  hasBeenCorrected: boolean;
}

const ScoreSummary: React.FC<ScoreSummaryProps> = ({
  userAnswers,
  correctAnswers,
  hasBeenCorrected,
}) => {
  const { t } = useTranslation();

  if (!hasBeenCorrected || !correctAnswers || correctAnswers.length === 0) {
    return null;
  }

  const calculateScore = () => {
    let correctCount = 0;
    let game15Correct = false;

    // Check matches 1-14 (regular matches)
    for (let i = 0; i < 14; i++) {
      const userAnswer = userAnswers[i]?.chosenWinner;
      const correctAnswer =
        correctAnswers[i]?.chosenWinner?.split("__")[0] || "";

      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    }

    // Check match 15 (special game with goals)
    const userGame15 = userAnswers[14];
    const correctGame15 = correctAnswers[14];

    if (userGame15 && correctGame15) {
      const userWinner = userGame15.chosenWinner;
      const correctWinner = correctGame15.chosenWinner?.split("__")[0] || "";
      const userHomeGoals = userGame15.goalsHomeTeam;
      const userAwayGoals = userGame15.goalsAwayTeam;
      const correctHomeGoals =
        correctGame15.goalsHomeTeam?.split("__")[0] || "";
      const correctAwayGoals =
        correctGame15.goalsAwayTeam?.split("__")[0] || "";

      // Check if winner is correct
      const winnerCorrect = userWinner === correctWinner;

      // Check if both goals are correct
      const homeGoalsCorrect = userHomeGoals === correctHomeGoals;
      const awayGoalsCorrect = userAwayGoals === correctAwayGoals;

      // Game 15 is fully correct if winner and both goals are correct
      game15Correct = winnerCorrect && homeGoalsCorrect && awayGoalsCorrect;

      if (game15Correct) {
        correctCount++;
      }
    }

    return { correctCount, game15Correct };
  };

  const { correctCount, game15Correct } = calculateScore();

  return (
    <Paper
      elevation={2}
      className="gradient-primary"
      sx={{
        p: 2,
        mb: 2,
        textAlign: "center",
        borderRadius: 4,
        color: "white",
        border: "2px solid white",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{ fontWeight: "bold", color: "white" }}
      >
        {t("score")}: {correctCount}/15
      </Typography>

      {game15Correct && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: "white" }}
          >
            🎯 {t("game15FullyCorrect")}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ScoreSummary;
