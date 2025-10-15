import React from "react";
import { useTranslation } from "react-i18next";

export type MostFailedInfo =
  | {
      matchNumber: number;
      failedPercentage: number;
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

  return (
    <div style={{ width: "100%", marginBottom: 8 }}>
      {typeof averagePoints === "number" ? (
        <p className={copyClassName}>
          {t("averagePointsThisQuinipolo")}: {averagePoints.toFixed(2)}
        </p>
      ) : null}
      {mostFailed && mostFailed.matchNumber ? (
        <p className={copyClassName}>
          {t("mostFailedMatch")} {t("match")} {mostFailed.matchNumber} ·{" "}
          {mostFailed.failedPercentage.toFixed(1)}% {t("failed")}{" "}
          {mostFailed.correctWinner ? (
            <>
              ({t("correct")}{" "}
              {(() => {
                const w = mostFailed.correctWinner;
                if (w === "home") return mostFailed.homeTeam || t("home");
                if (w === "away") return mostFailed.awayTeam || t("away");
                return t("draw");
              })()}
              {mostFailed.mostWrongWinner ? (
                <>
                  , {t("mostAnsweredWrong")}{" "}
                  {(() => {
                    const w = mostFailed.mostWrongWinner;
                    if (w === "home") return mostFailed.homeTeam || t("home");
                    if (w === "away") return mostFailed.awayTeam || t("away");
                    return t("draw");
                  })()}
                </>
              ) : null}
              )
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
