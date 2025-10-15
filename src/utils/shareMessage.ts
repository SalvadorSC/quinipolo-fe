// Utilities to format shareable correction messages in smaller, composable parts.

type TFunc = (key: string, opts?: any) => string;

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

export function formatStatsSummary(
  t: TFunc,
  averagePointsThisQuinipolo?: number,
  mostFailed?: MostFailedInfo
): string {
  let out = "";
  if (typeof averagePointsThisQuinipolo === "number") {
    out += `*${t(
      "averagePointsThisQuinipolo"
    )}:* ${averagePointsThisQuinipolo.toFixed(2)}\n`;
  }
  if (mostFailed && mostFailed.matchNumber) {
    const mf = mostFailed;
    const mapWinner = (w?: string) =>
      w === "home"
        ? mf.homeTeam || t("home")
        : w === "away"
        ? mf.awayTeam || t("away")
        : t("draw");
    out += `*${t("mostFailedMatch")}:* ${t("match")} ${
      mf.matchNumber
    } — ${mf.failedPercentage.toFixed(1)}% ${t("failed")}`;
    if (mf.correctWinner) {
      out += ` (${t("correct-2")}: ${mapWinner(mf.correctWinner)}`;
      if (mf.mostWrongWinner) {
        out += `, ${t("mostAnsweredWrong")} ${mapWinner(mf.mostWrongWinner)}`;
      }
      out += ")";
    }
    out += "\n\n";
  }
  return out;
}

// groupedPoints: Array of [pointsAsString, usernames[]], sorted as desired by caller
export function formatPointsEarnedDistribution(
  t: TFunc,
  groupedPoints: Array<[string, string[]]>
): string {
  let out = `*${t("pointsEarnedThisQuinipolo")}*\n`;
  for (const [points, usernames] of groupedPoints) {
    if (Number(points) === 0) {
      const limit = 10;
      if (usernames.length > limit) {
        const hiddenCount = usernames.length;
        out += `- ${t("andMoreDidntParticipate", { count: hiddenCount })}\n`;
      } else {
        out += `- ${usernames.join(", ")}: *${points}p*\n`;
      }
    } else {
      out += `- ${usernames.join(", ")}: *${points}p*\n`;
    }
  }
  return out;
}

// groupedLeaderboard: Array of [pointsAsString, usernames[]] representing tie groups in order
export function formatLeaderboardSection(
  t: TFunc,
  groupedLeaderboard: Array<[string, string[]]>
): string {
  let out = `\n*${t("leaderboardTitle")}*\n`;
  let position = 1;
  for (const [points, usernames] of groupedLeaderboard) {
    let prefix = `${position}.-`;
    if (position === 1) prefix = "🥇";
    else if (position === 2) prefix = "🥈";
    else if (position === 3) prefix = "🥉";

    if (Number(points) === 0 && usernames.length > 10) {
      out += `${prefix} ${t("andMoreDidntParticipate", {
        count: usernames.length,
      })}\n`;
    } else {
      out += `${prefix} ${usernames.join(", ")}: *${points}p*\n`;
    }
    position += usernames.length;
  }
  return out;
}

export type ResultLike = {
  username: string;
  pointsEarned?: number;
  totalPoints: number;
  correct15thGame: boolean;
};

export function formatWinnersSection(t: TFunc, results: ResultLike[]): string {
  let out = "";
  const hasWinner = results.some(
    (r) => r.correct15thGame && r.pointsEarned === 15
  );
  if (hasWinner) {
    out += `\n *${t("quinipoloWinners")}:* \n`;
    for (const r of results) {
      if (r.correct15thGame && r.pointsEarned === 15) {
        out += `- ${r.username}: ${r.totalPoints}p *${
          r.pointsEarned && r.pointsEarned > 0 ? "+" : ""
        }${r.pointsEarned || 0}* 🌟\n`;
      }
    }
  } else {
    out += `\n ${t("noWinner")} 😢\n`;
  }
  return out;
}
