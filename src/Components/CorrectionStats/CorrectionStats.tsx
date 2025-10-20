import React from "react";
import { useTranslation } from "react-i18next";

export type MostFailedInfo =
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
  | undefined;

export default function CorrectionStats({
  averagePoints,
  mostFailed,
  copyClassName,
}: {
  averagePoints?: number;
  mostFailed?: MostFailedInfo;
  copyClassName?: string;
}) {
  const { t } = useTranslation();

  if (
    typeof averagePoints !== "number" &&
    !(mostFailed && mostFailed.matchNumber)
  ) {
    return null;
  }

  const renderWinner = (w?: string, homeTeam?: string, awayTeam?: string) => {
    if (w === "home") return homeTeam || t("home");
    if (w === "away") return awayTeam || t("away");
    return t("draw");
  };

  const counts =
    mostFailed && mostFailed.wrongCount != null && mostFailed.totalCount != null
      ? ` ${mostFailed.wrongCount}/${mostFailed.totalCount}`
      : "";

  return (
    <div style={{ width: "100%", marginBottom: 8 }}>
      {typeof averagePoints === "number" ? (
        <p className={copyClassName}>
          {t("averagePointsThisQuinipolo")}: {averagePoints.toFixed(2)}
        </p>
      ) : null}
      {mostFailed && mostFailed.matchNumber ? (
        <p className={copyClassName} title={t("mostFailedMatch") || undefined}>
          {t("mostFailedMatch")} {t("match")} {mostFailed.matchNumber} ·{" "}
          {mostFailed.failedPercentage.toFixed(1)}% {t("failed")}
          {counts ? ` (${counts})` : ""} ({t("mostAnsweredWrong")}{" "}
          {renderWinner(
            mostFailed.mostWrongWinner,
            mostFailed.homeTeam,
            mostFailed.awayTeam
          )}
          {mostFailed.correctWinner ? (
            <>
              , {t("correct-2")}{" "}
              {renderWinner(
                mostFailed.correctWinner,
                mostFailed.homeTeam,
                mostFailed.awayTeam
              )}
            </>
          ) : null}
          )
        </p>
      ) : null}
    </div>
  );
}
