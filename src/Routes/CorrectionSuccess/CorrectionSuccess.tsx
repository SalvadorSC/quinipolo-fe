import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Paper, Button } from "@mui/material";
import style from "../QuinipoloSuccess/QuinipoloSuccess.module.scss";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import Leaderboard from "../../Components/Leaderboard/Leaderboard";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../utils/apiUtils";
import {
  formatStatsSummary,
  formatPointsEarnedDistribution,
  formatLeaderboardSection,
  formatWinnersSection,
} from "../../utils/shareMessage";
import CorrectionStats from "../../Components/CorrectionStats/CorrectionStats";

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
  const leagueId: string | undefined = location.state?.leagueId;
  const averagePointsThisQuinipolo: number | undefined =
    location.state?.averagePointsThisQuinipolo;
  const mostFailed:
    | {
        matchNumber: number;
        failedPercentage: number;
        homeTeam?: string;
        awayTeam?: string;
        correctWinner?: string;
        mostWrongWinner?: string;
      }
    | null
    | undefined = location.state?.mostFailed;
  const results: Result[] = React.useMemo(
    () => (location.state?.results as Result[]) || [],
    [location.state?.results]
  );

  const participantsFromState: Result[] = (
    location.state?.participantsLeaderboard || []
  ).map((p: any) => ({
    username: p.username,
    nQuinipolosParticipated: p.nQuinipolosParticipated,
    totalPoints: p.totalPoints ?? p.points,
    correct15thGame: false,
    pointsEarned: undefined,
  }));
  const [mergedLeaderboard, setMergedLeaderboard] = useState<Result[] | null>(
    null
  );
  const { t } = useTranslation();

  // If server provided participants, merge immediately; otherwise fetch.
  useEffect(() => {
    if (participantsFromState && participantsFromState.length > 0) {
      const byUserFromCorrection = new Map<string, Result>();
      for (const r of results) byUserFromCorrection.set(r.username, r);
      const merged = participantsFromState.map(
        (p) => byUserFromCorrection.get(p.username) || p
      );
      for (const r of results) {
        if (!merged.find((m) => m.username === r.username)) {
          merged.push(r);
        }
      }
      setMergedLeaderboard(
        merged.sort((a, b) => b.totalPoints - a.totalPoints)
      );
      return;
    }
    if (!leagueId) return;
    apiGet(`/api/leagues/${leagueId}/leaderboard`, { cache: { ttlMs: 30000 } })
      .then((data: any) => {
        const baseFromLeague: Result[] = (
          data?.participantsLeaderboard || []
        ).map((p: any) => ({
          username: p.username,
          nQuinipolosParticipated: p.nQuinipolosParticipated,
          totalPoints: p.points,
          correct15thGame: false,
          pointsEarned: undefined,
        }));

        const byUserFromCorrection = new Map<string, Result>();
        for (const r of results) byUserFromCorrection.set(r.username, r);

        const merged: Result[] = baseFromLeague.map(
          (p) => byUserFromCorrection.get(p.username) || p
        );

        // Also include any correction results for users not present in base list (safety)
        for (const r of results) {
          if (!merged.find((m) => m.username === r.username)) {
            merged.push(r);
          }
        }

        setMergedLeaderboard(
          merged.sort((a, b) => b.totalPoints - a.totalPoints)
        );
      })
      .catch(() => {
        // If fetch fails, do nothing – fallback will be raw results
        setMergedLeaderboard(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  const sortedResults = useMemo(() => {
    return results.slice().sort((a, b) => b.totalPoints - a.totalPoints);
  }, [results]);

  // Group and sort points earned
  const groupAndSortPointsEarned = (results: Result[]) => {
    const pointsEarnedGrouping: { [key: number]: string[] } = {};
    results.forEach(({ username, pointsEarned }) => {
      const earned = pointsEarned ?? 0;
      if (!pointsEarnedGrouping[earned]) {
        pointsEarnedGrouping[earned] = [];
      }
      pointsEarnedGrouping[earned].push(username);
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

  const generateMessageToShare = () => {
    const source: Result[] =
      mergedLeaderboard && mergedLeaderboard.length > 0
        ? mergedLeaderboard
        : results;
    const date = new Date();
    const locale = "es-ES";

    const formattedDate = date.toLocaleDateString(locale, {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    let message = `*${t("resultsTitle", {
      n: source[0]?.nQuinipolosParticipated,
      date: formattedDate,
    })}*\n\n`;

    // Stats summary
    message += formatStatsSummary(t, averagePointsThisQuinipolo, mostFailed);

    // Points Earned Distribution
    const local_sorted_points_earned = groupAndSortPointsEarned(source);
    message += formatPointsEarnedDistribution(t, local_sorted_points_earned);

    // Total Points Distribution (Leaderboard)
    const local_sorted_total_points = groupAndSortTotalPoints(source);
    message += formatLeaderboardSection(t, local_sorted_total_points);

    // Winners section
    message += formatWinnersSection(t, source);

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
    <div
      className={style.correctionSuccessContainer}
      style={{
        height: "calc(100vh - 132px)",
        maxHeight: "calc(100vh - 132px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          borderRadius: "10px",
          flex: "1 1 0",
          minHeight: 0,
          overflow: "hidden",
          mb: 2,
        }}
      >
        <h2>{t("quinipoloCorrectedSuccess")}</h2>

        {results.length > 0 ? (
          <CorrectionStats
            averagePoints={averagePointsThisQuinipolo}
            mostFailed={mostFailed}
            copyClassName={style.copyCorrection}
          />
        ) : null}

        <p
          className={style.copyCorrection}
          style={results.length > 0 ? {} : { marginTop: 40 }}
        >
          {results.length > 0 ? t("resultsTableInfo") : t("noOneAnswered")}
        </p>
        {results.length > 0 ? null : (
          <p className={style.copyCorrection}>{t("communicateWell")}</p>
        )}
        {results.length > 0 ? (
          <div
            style={{
              width: "100%",
              flex: 1,
              minHeight: 0,
            }}
          >
            <Leaderboard
              showSearch={false}
              sortedResults={mergedLeaderboard || sortedResults}
            />
          </div>
        ) : null}

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
          className="gradient-success"
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
