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
import { LEAGUES_WITH_IMAGE_SHARE_BETA } from "../../config/leaguesWithImageShare";

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
        wrongCount?: number;
        totalCount?: number;
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
  const matchday: string | undefined = location.state?.matchday;
  const quinipoloId: string | undefined = location.state?.quinipoloId;
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
    image1?: string;
    image2?: string;
    image3: string;
    image4: string;
    image5?: string;
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
    !!leagueId &&
    !!matchday &&
    LEAGUES_WITH_IMAGE_SHARE_BETA.includes(leagueId);

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

    const image5Payload =
      averagePointsThisQuinipolo != null || mostFailed
        ? {
            image5_statistics: {
              ...(matchday != null && { matchday }),
              averagePoints: averagePointsThisQuinipolo ?? 0,
              mostFailedMatch: mostFailed
                ? {
                    matchNumber: mostFailed.matchNumber,
                    homeTeam: mostFailed.homeTeam,
                    awayTeam: mostFailed.awayTeam,
                    correctWinner: mostFailed.correctWinner,
                    mostWrongWinner: mostFailed.mostWrongWinner,
                    wrongCount: mostFailed.wrongCount,
                    totalCount: mostFailed.totalCount,
                    correctGuessesCount:
                      (mostFailed.totalCount ?? 0) - (mostFailed.wrongCount ?? 0),
                  }
                : null,
            },
          }
        : {};

    return {
      image3_quinipoloRanking: {
        ...(matchday != null && { matchday }),
        rankingType: "quinipolo",
        participants: quinipoloParticipants,
      },
      image4_generalLeagueRanking: {
        ...(matchday != null && { matchday }),
        rankingType: "general",
        leagueId,
        participantsLeaderboard: generalParticipants,
      },
      ...image5Payload,
    };
  }, [
    results,
    participantsLeaderboardRaw,
    mergedLeaderboard,
    matchday,
    leagueId,
    averagePointsThisQuinipolo,
    mostFailed,
  ]);

  // Fetch share images (match results always; rankings only when someone answered)
  useEffect(() => {
    if (!canShareImages || shareImages) return;
    const needsRankings = results.length > 0;
    if (needsRankings && mergedLeaderboard === null) return;

    const buildPayload = async () => {
      const rankingPayload = needsRankings ? getRankingPayload() : {};
      if (quinipoloId) {
        try {
          const correctionSee = await apiGet<{
            quinipolo: Array<{
              homeTeam: string;
              awayTeam: string;
              leagueId?: string;
              isGame15?: boolean;
            }>;
            correct_answers: Array<{
              matchNumber: number;
              chosenWinner: string;
              goalsHomeTeam: string;
              goalsAwayTeam: string;
              cancelled?: boolean;
            }>;
          }>(`/api/quinipolos/quinipolo/${quinipoloId}/correction-see`);
          if (
            correctionSee?.quinipolo?.length >= 15 &&
            correctionSee?.correct_answers?.length
          ) {
            return {
              _meta: { matchday: matchday },
              correctionSee: {
                quinipolo: correctionSee.quinipolo,
                correct_answers: correctionSee.correct_answers,
              },
              ...rankingPayload,
            };
          }
        } catch {
          if (Object.keys(rankingPayload).length > 0) {
            return { _meta: { matchday: matchday }, ...rankingPayload };
          }
        }
      }
      return { _meta: { matchday: matchday }, ...rankingPayload };
    };

    setShareImagesLoading(true);
    buildPayload()
      .then((payload) =>
        apiPost<{ matchday: string; images: Record<string, string> }>(
          "/api/graphics/generate",
          payload,
        ),
      )
      .then((res) => {
        const image1 = res.images?.image1;
        const image2 = res.images?.image2;
        const image3 = res.images?.image3;
        const image4 = res.images?.image4;
        const image5 = res.images?.image5;
        const hasMatchResults = image1 && image2;
        const hasRankings = image3 && image4;
        const hasStatistics = !!image5;
        if (hasMatchResults || hasRankings || hasStatistics) {
          setShareImages({
            image1,
            image2,
            image3: image3 ?? "",
            image4: image4 ?? "",
            image5,
          });
        }
      })
      .catch(() => {
        setFeedback({
          message: t("errorGeneratingImages"),
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
    quinipoloId,
    matchday,
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
    let displayN: number | undefined = source[0]?.nQuinipolosParticipated;
    if (matchday) {
      const m = matchday.match(/^J(\d+)$/i);
      if (m) displayN = parseInt(m[1], 10);
    }
    if (leagueId === "global" && typeof displayN === "number") {
      displayN = Math.max(1, displayN - 2);
    }
    let message = `*${t("resultsTitle", {
      n: displayN,
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
    if (!canShareImages || !matchday) return;
    const needsRankings = results.length > 0;
    setSharingWithImages(true);
    try {
      let image1 = shareImages?.image1;
      let image2 = shareImages?.image2;
      let image3 = shareImages?.image3;
      let image4 = shareImages?.image4;
      let image5 = shareImages?.image5;
      const hasMatchResults = image1 && image2;
      const hasRankings = image3 && image4;
      const hasStatistics = !!image5;
      const needsFetch =
        !hasMatchResults ||
        (needsRankings && !hasRankings) ||
        (results.length > 0 && !hasStatistics);

      if (needsFetch) {
        const rankingPayload = needsRankings ? getRankingPayload() : {};
        let payload: Record<string, unknown> = {
          _meta: { matchday: matchday },
          ...rankingPayload,
        };
        if (quinipoloId) {
          try {
            const correctionSee = await apiGet<{
              quinipolo: Array<{
                homeTeam: string;
                awayTeam: string;
                leagueId?: string;
                isGame15?: boolean;
              }>;
              correct_answers: Array<{
                matchNumber: number;
                chosenWinner: string;
                goalsHomeTeam: string;
                goalsAwayTeam: string;
                cancelled?: boolean;
              }>;
            }>(`/api/quinipolos/quinipolo/${quinipoloId}/correction-see`);
            if (
              correctionSee?.quinipolo?.length >= 15 &&
              correctionSee?.correct_answers?.length
            ) {
              payload = {
                ...payload,
                correctionSee: {
                  quinipolo: correctionSee.quinipolo,
                  correct_answers: correctionSee.correct_answers,
                },
              };
            }
          } catch {
            // Use ranking-only payload
          }
        }
        const res = await apiPost<{
          matchday: string;
          images: Record<string, string>;
        }>("/api/graphics/generate", payload);
        image1 = res.images?.image1;
        image2 = res.images?.image2;
        image3 = res.images?.image3;
        image4 = res.images?.image4;
        image5 = res.images?.image5;
        if (image1 && image2)
          setShareImages({
            image1,
            image2,
            image3: image3 ?? "",
            image4: image4 ?? "",
            image5,
          });
      }

      const hasMatchResultsAfterFetch = image1 && image2;
      const hasRankingsAfterFetch = needsRankings ? image3 && image4 : true;
      if (!hasMatchResultsAfterFetch || !hasRankingsAfterFetch) {
        setFeedback({
          message: t("errorGeneratingImages"),
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

      const files: File[] = [];
      if (image1)
        files.push(await dataUrlToFile(image1, "quinipolo-results-1.png"));
      if (image2)
        files.push(await dataUrlToFile(image2, "quinipolo-results-2.png"));
      if (image3 && image4) {
        files.push(await dataUrlToFile(image3, "quinipolo-ranking.png"));
        files.push(
          await dataUrlToFile(image4, "quinipolo-general-ranking.png"),
        );
      }
      if (image5)
        files.push(
          await dataUrlToFile(image5, "quinipolo-statistics.png"),
        );

      const shareData: ShareData = {
        files,
        text: messageToShare,
        title: t("shareTitle"),
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setFeedback({
          message: t("shareSuccess"),
          severity: "success",
          open: true,
        });
      } else {
        setFeedback({
          message: t("shareNotSupported"),
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
        message: t("imageCopied"),
        severity: "success",
        open: true,
      });
    } catch {
      setFeedback({
        message: t("errorCopyingImage"),
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

        {canShareImages &&
          (results.length > 0 || shareImagesLoading || shareImages) && (
            <Box sx={{ mt: 2, width: "100%", maxWidth: 400 }}>
              <p
                className={style.copyCorrection}
                style={{ fontWeight: "bold", marginBottom: 8 }}
              >
                {t("shareImagesTitle")}
              </p>
              {shareImagesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={32} />
                </Box>
              ) : shareImages ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {shareImages.image1 && (
                    <Box>
                      <img
                        src={shareImages.image1}
                        alt={t("matchResultsImageAlt1")}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          display: "block",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          copyImageToClipboard(shareImages.image1!)
                        }
                        sx={{ mt: 1, width: "100%" }}
                      >
                        {t("copyImage")}
                      </Button>
                    </Box>
                  )}
                  {shareImages.image2 && (
                    <Box>
                      <img
                        src={shareImages.image2}
                        alt={t("matchResultsImageAlt2")}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          display: "block",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          copyImageToClipboard(shareImages.image2!)
                        }
                        sx={{ mt: 1, width: "100%" }}
                      >
                        {t("copyImage")}
                      </Button>
                    </Box>
                  )}
                  {shareImages.image3 && (
                    <Box>
                      <img
                        src={shareImages.image3}
                        alt={t("quinipoloRankingImageAlt")}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          display: "block",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => copyImageToClipboard(shareImages.image3)}
                        sx={{ mt: 1, width: "100%" }}
                      >
                        {t("copyImage")}
                      </Button>
                    </Box>
                  )}
                  {shareImages.image4 && (
                    <Box>
                      <img
                        src={shareImages.image4}
                        alt={t("generalRankingImageAlt")}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          display: "block",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => copyImageToClipboard(shareImages.image4)}
                        sx={{ mt: 1, width: "100%" }}
                      >
                        {t("copyImage")}
                      </Button>
                    </Box>
                  )}
                  {shareImages.image5 && (
                    <Box>
                      <img
                        src={shareImages.image5}
                        alt={t("statisticsImageAlt")}
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          display: "block",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          copyImageToClipboard(shareImages.image5!)
                        }
                        sx={{ mt: 1, width: "100%" }}
                      >
                        {t("copyImage")}
                      </Button>
                    </Box>
                  )}
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
        {canShareImages && (results.length > 0 || shareImages?.image1) && (
          <Button
            variant="contained"
            onClick={shareWithImages}
            disabled={sharingWithImages}
            style={{ marginTop: 16 }}
            className="gradient-success"
          >
            {            sharingWithImages
              ? t("shareLoading")
              : `${t("shareOnWhatsAppWithImages")} (beta)`}
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
