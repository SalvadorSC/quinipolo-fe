import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Paper, Button } from "@mui/material";
import style from "../QuinipoloSuccess/QuinipoloSuccess.module.scss";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import Leaderboard from "../../Components/Leaderboard/Leaderboard";
import { useTranslation } from "react-i18next";

export type Result = {
  username: string;
  pointsEarned?: number;
  totalPoints: number;
  correct15thGame: boolean;
  nQuinipolosParticipated: number;
};

const CorrectionSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setFeedback } = useFeedback();
  const results: Result[] = location.state?.results || [];
  const sortedResults = results.sort(
    (a: Result, b: Result) => b.totalPoints - a.totalPoints
  );
  const { t } = useTranslation();

  // Group and sort points earned
  const groupAndSortPointsEarned = (results: Result[]) => {
    const pointsEarnedGrouping: { [key: number]: string[] } = {};
    results.forEach(({ username, pointsEarned }) => {
      if (!pointsEarnedGrouping[pointsEarned!]) {
        pointsEarnedGrouping[pointsEarned!] = [];
      }
      pointsEarnedGrouping[pointsEarned!].push(username);
    });
    return Object.entries(pointsEarnedGrouping).sort(
      ([a], [b]) => Number(b) - Number(a)
    );
  };

  // Group and sort total points
  const groupAndSortTotalPoints = (results: Result[]) => {
    const totalPointsGrouping: { [key: number]: string[] } = {};
    results.forEach(({ username, totalPoints }) => {
      if (!totalPointsGrouping[totalPoints]) {
        totalPointsGrouping[totalPoints] = [];
      }
      totalPointsGrouping[totalPoints].push(username);
    });
    return Object.entries(totalPointsGrouping).sort(
      ([a]: [string, string[]], [b]: [string, string[]]) =>
        Number(b) - Number(a)
    );
  };

  const sorted_points_earned = groupAndSortPointsEarned(results);
  const sorted_total_points = groupAndSortTotalPoints(results);

  const generateMessageToShare = () => {
    const date = new Date();
    const locale = "es-ES";

    const formattedDate = date.toLocaleDateString(locale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    let message = `*${t("resultsTitle", {
      n: results[0]?.nQuinipolosParticipated,
      date: formattedDate,
    })}*\n\n`;

    // Points Earned Distribution
    message += `*${t("pointsEarnedThisQuinipolo")}*\n`;
    for (const [points, usernames] of sorted_points_earned) {
      message += `- ${usernames.join(", ")}: *${points}p*\n`;
    }

    // Total Points Distribution (Leaderboard)
    message += `\n*${t("leaderboardTitle")}*\n`;
    let position = 1; // To keep track of the current position
    for (const [points, usernames] of sorted_total_points) {
      let prefix = `${position}.-`;
      if (position === 1) prefix = "🥇";
      else if (position === 2) prefix = "🥈";
      else if (position === 3) prefix = "🥉";

      message += `${prefix} ${usernames.join(", ")}: *${points}p*\n`;
      position += usernames.length; // Increment position by the number of tied users
    }

    // Determinar ganadores de la Quinipolo
    if (
      results.find(
        (result) => result.correct15thGame && result.pointsEarned === 15
      )
    ) {
      message += `\n *${t("quinipoloWinners")}:* \n`;
      results.forEach((result) => {
        console.log(result.pointsEarned);
        if (result.correct15thGame && result.pointsEarned === 15) {
          message += `- ${result.username}: ${result.totalPoints}p *${
            result.pointsEarned > 0 ? "+" : ""
          }${result.pointsEarned}* 🌟\n`;
        }
      });
    } else {
      message += `\n ${t("noWinner")} 😢\n`;
    }

    message += `\n${t("thanksForParticipating")}\n`;
    return message;
  };

  const messageToShare = generateMessageToShare();
  const copyMessageToClipboard = () => {
    navigator.clipboard
      .writeText(messageToShare)
      .then(() => {
        setFeedback({
          message: t("messageCopied"),
          severity: "success",
          open: true,
        });
      })
      .catch((err) => {
        setFeedback({
          message: t("errorCopyingMessage"),
          severity: "error",
          open: true,
        });
      });
  };

  return (
    <div className={style.correctionSuccessContainer}>
      <div>
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            borderRadius: results.length > 0 ? "10px 10px 0 0" : null,
          }}
        >
          <h2>{t("quinipoloCorrectedSuccess")}</h2>

          <p
            className={style.copyCorrection}
            style={results.length > 0 ? {} : { marginTop: 40 }}
          >
            {results.length > 0 ? t("resultsTableInfo") : t("noOneAnswered")}
          </p>
          {results.length > 0 ? null : (
            <p className={style.copyCorrection}>{t("communicateWell")}</p>
          )}
        </Paper>
        {results.length > 0 ? (
          <Leaderboard sortedResults={sortedResults} />
        ) : null}
      </div>

      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          marginTop: "20px",
        }}
      >
        <p className={style.reminder}>{t("dontForgetToShare")}</p>
        <Button
          style={{ marginTop: 16 }}
          variant="contained"
          onClick={copyMessageToClipboard}
        >
          {t("copyMessage")}
        </Button>
        <Button
          variant="contained"
          onClick={copyMessageToClipboard}
          style={{ marginTop: 16 }}
        >
          <a
            href={`https://wa.me/?text=${encodeURIComponent(messageToShare)}`}
            target="_blank"
            style={{ color: "white", textDecoration: "none" }}
            rel="noopener noreferrer"
          >
            {t("shareOnWhatsApp")}
          </a>
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            navigate("/");
          }}
          className={style.returnButton}
          style={{ marginTop: 16 }}
        >
          {t("returnToMainMenu")}
        </Button>
      </Paper>
    </div>
  );
};

export default CorrectionSuccess;
