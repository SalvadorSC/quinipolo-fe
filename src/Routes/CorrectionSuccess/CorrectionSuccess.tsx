import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Paper, Button, Box, CircularProgress } from "@mui/material";
import style from "../QuinipoloSuccess/QuinipoloSuccess.module.scss";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import Leaderboard from "../../Components/Leaderboard/Leaderboard";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost } from "../../utils/apiUtils";
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

type LeaderboardParticipant = {
  username: string;
  points?: number;
  totalPoints?: number;
  nQuinipolosParticipated?: number;
  fullCorrectQuinipolos?: number;
};

/** Beta: only these leagues can share ranking images */
const LEAGUES_WITH_IMAGE_SHARE_BETA = [
  "351a1949-f6c5-4940-ac70-1c7dd08e8b1a", // Global
  "4cae8d44-f3bd-42a5-a899-78e64fdb0181", // Sant Feliu
  "3cc750df-b2ee-4a1f-92e4-cc743b9d01c4", // TEST
];

const CorrectionSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setFeedback } = useFeedback();
  const leagueId: string | undefined = location.state?.leagueId;
  const endDate: string | undefined = location.state?.endDate;
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
    [location.state?.results],
  );
  const matchday: string = location.state?.matchday ?? "";
  const participantsLeaderboardRaw = useMemo(
    () => location.state?.participantsLeaderboard || [],
    [location.state?.participantsLeaderboard],
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
    null,
  );
  const [sharingWithImages, setSharingWithImages] = useState(false);
  const [shareImages, setShareImages] = useState<{
    image3: string;
    image4: string;
  } | null>(null);
  const [shareImagesLoading, setShareImagesLoading] = useState(false);
  const { t } = useTranslation();

  // If server provided participants, merge immediately; otherwise fetch.
  useEffect(() => {
    if (participantsFromState && participantsFromState.length > 0) {
      const byUserFromCorrection = new Map<string, Result>();
      for (const r of results) byUserFromCorrection.set(r.username, r);
      const merged = participantsFromState.map(
        (p) => byUserFromCorrection.get(p.username) || p,
      );
      for (const r of results) {
        if (!merged.find((m) => m.username === r.username)) {
          merged.push(r);
        }
      }
      setMergedLeaderboard(
        merged.sort((a, b) => b.totalPoints - a.totalPoints),
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
          (p) => byUserFromCorrection.get(p.username) || p,
        );

        // Also include any correction results for users not present in base list (safety)
        for (const r of results) {
          if (!merged.find((m) => m.username === r.username)) {
            merged.push(r);
          }
        }

        setMergedLeaderboard(
          merged.sort((a, b) => b.totalPoints - a.totalPoints),
        );
      })
      .catch(() => {
        // If fetch fails, do nothing – fallback will be raw results
        setMergedLeaderboard(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  const canShareImages =
    !!leagueId && LEAGUES_WITH_IMAGE_SHARE_BETA.includes(leagueId);

  const getRankingPayload = useCallback(() => {
    const quinipoloParticipants = results
      .slice()
      .sort((a, b) => (b.pointsEarned ?? 0) - (a.pointsEarned ?? 0))
      .map((r, i) => ({
        rank: i + 1,
        username: r.username,
        points: r.pointsEarned ?? 0,
      }));

    const generalSource: LeaderboardParticipant[] =
      participantsLeaderboardRaw.length > 0
        ? (participantsLeaderboardRaw as LeaderboardParticipant[])
        : (mergedLeaderboard || results).map(
            (p): LeaderboardParticipant => ({
              username: p.username,
              points: p.totalPoints,
              totalPoints: p.totalPoints,
              nQuinipolosParticipated: p.nQuinipolosParticipated,
              fullCorrectQuinipolos:
                "fullCorrectQuinipolos" in p
                  ? (p as LeaderboardParticipant).fullCorrectQuinipolos
                  : undefined,
            }),
          );
    const generalParticipants = generalSource
      .slice()
      .sort(
        (a, b) =>
          (b.points ?? b.totalPoints ?? 0) - (a.points ?? a.totalPoints ?? 0),
      )
      .map((p, i) => ({
        rank: i + 1,
        username: p.username,
        points: p.points ?? p.totalPoints ?? 0,
        totalPoints: p.points ?? p.totalPoints ?? 0,
        nQuinipolosParticipated: p.nQuinipolosParticipated,
        fullCorrectQuinipolos: p.fullCorrectQuinipolos,
      }));

    return {
      image3_quinipoloRanking: {
        matchday,
        rankingType: "quinipolo",
        participants: quinipoloParticipants,
      },
      image4_generalLeagueRanking: {
        matchday,
        rankingType: "general",
        leagueId,
        participantsLeaderboard: generalParticipants,
      },
    };
  }, [
    results,
    participantsLeaderboardRaw,
    mergedLeaderboard,
    matchday,
    leagueId,
  ]);

  // Fetch share images only when merged leaderboard is ready to avoid incorrect rankings
  useEffect(() => {
    if (
      !canShareImages ||
      results.length === 0 ||
      shareImages ||
      mergedLeaderboard === null
    )
      return;

    setShareImagesLoading(true);
    apiPost<{ matchday: string; images: Record<string, string> }>(
      "/api/graphics/generate",
      getRankingPayload(),
    )
      .then((res) => {
        const image3 = res.images?.image3;
        const image4 = res.images?.image4;
        if (image3 && image4) {
          setShareImages({ image3, image4 });
        }
      })
      .catch(() => {
        setFeedback({
          message: t("errorCopyingMessage") ?? "Could not generate images",
          severity: "error",
          open: true,
        });
      })
      .finally(() => setShareImagesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canShareImages,
    results.length,
    mergedLeaderboard,
    participantsLeaderboardRaw.length,
    getRankingPayload,
  ]);

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
      ([a], [b]) => Number(b) - Number(a),
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
        Number(b) - Number(a),
    );
  };

  const generateMessageToShare = () => {
    const source: Result[] =
      mergedLeaderboard && mergedLeaderboard.length > 0
        ? mergedLeaderboard
        : results;
    const locale = "es-ES";

    // Use endDate from quinipolo if available, otherwise fall back to current date
    const date = endDate ? new Date(endDate) : new Date();
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

  const shareWithImages = async () => {
    if (!canShareImages || results.length === 0) return;
    setSharingWithImages(true);
    try {
      let image3 = shareImages?.image3;
      let image4 = shareImages?.image4;
      if (!image3 || !image4) {
        const payload = getRankingPayload();
        const res = await apiPost<{
          matchday: string;
          images: Record<string, string>;
        }>("/api/graphics/generate", payload);
        image3 = res.images?.image3;
        image4 = res.images?.image4;
        if (image3 && image4) setShareImages({ image3, image4 });
      }
      if (!image3 || !image4) {
        setFeedback({
          message: t("errorCopyingMessage") ?? "Could not generate images",
          severity: "error",
          open: true,
        });
        return;
      }

      const dataUrlToFile = async (
        dataUrl: string,
        name: string,
      ): Promise<File> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], name, { type: "image/png" });
      };

      const [file3, file4] = await Promise.all([
        dataUrlToFile(image3, "quinipolo-ranking.png"),
        dataUrlToFile(image4, "quinipolo-general-ranking.png"),
      ]);

      const shareData: ShareData = {
        files: [file3, file4],
        text: messageToShare,
        title: t("shareTitle") ?? "Quinipolo Resultados",
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setFeedback({
          message: t("shareSuccess") ?? "Shared successfully",
          severity: "success",
          open: true,
        });
      } else {
        setFeedback({
          message:
            t("shareNotSupported") ??
            "Sharing with images is not supported on this device. Try copying the message.",
          severity: "warning",
          open: true,
        });
      }
    } catch (err) {
      setFeedback({
        message: err instanceof Error ? err.message : "Share failed",
        severity: "error",
        open: true,
      });
    } finally {
      setSharingWithImages(false);
    }
  };

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

  const copyImageToClipboard = async (dataUrl: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setFeedback({
        message: t("imageCopied") ?? "Image copied to clipboard",
        severity: "success",
        open: true,
      });
    } catch {
      setFeedback({
        message: t("errorCopyingMessage") ?? "Could not copy image",
        severity: "error",
        open: true,
      });
    }
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
          justifyContent: "flex-start",
          borderRadius: "10px",
          flex: "1 1 0",
          minHeight: 0,
          overflow: "auto",
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

        {results.length > 0 && canShareImages && (
          <Box sx={{ mt: 2, width: "100%", maxWidth: 400 }}>
            <p
              className={style.copyCorrection}
              style={{ fontWeight: "bold", marginBottom: 8 }}
            >
              {t("shareImagesTitle") ?? "Share images"}
            </p>
            {shareImagesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={32} />
              </Box>
            ) : shareImages ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <img
                    src={shareImages.image3}
                    alt={t("quinipoloRankingImageAlt") ?? "Quinipolo ranking"}
                    style={{ width: "100%", borderRadius: 8, display: "block" }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyImageToClipboard(shareImages.image3)}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    {t("copyImage") ?? "Copy image"}
                  </Button>
                </Box>
                <Box>
                  <img
                    src={shareImages.image4}
                    alt={
                      t("generalRankingImageAlt") ?? "General league ranking"
                    }
                    style={{ width: "100%", borderRadius: 8, display: "block" }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyImageToClipboard(shareImages.image4)}
                    sx={{ mt: 1, width: "100%" }}
                  >
                    {t("copyImage") ?? "Copy image"}
                  </Button>
                </Box>
              </Box>
            ) : null}
          </Box>
        )}

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
          component="a"
          href={`https://wa.me/?text=${encodeURIComponent(messageToShare)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gradient-success"
        >
          {t("shareOnWhatsApp")}
        </Button>
        {results.length > 0 && canShareImages && (
          <Button
            variant="contained"
            onClick={shareWithImages}
            disabled={sharingWithImages}
            style={{ marginTop: 16 }}
            className="gradient-success"
          >
            {sharingWithImages
              ? "..."
              : `${t("shareOnWhatsAppWithImages") ?? "Share with images"} (beta)`}
          </Button>
        )}
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
