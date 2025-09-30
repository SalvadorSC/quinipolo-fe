import React, { useMemo } from "react";
import RankingTable from "../Leaderboard/RankingTable";
import LeaderboardHead from "../Leaderboard/LeaderboardHead/LeaderboardHead";

type Result = {
  username: string;
  totalPoints: number;
  nQuinipolosParticipated: number;
  averagePoints?: number;
};

const Stats = ({ results }: { results: Result[] }) => {
  const rowsWithAvg = useMemo(
    () =>
      results
        .map((row) => ({
          ...row,
          averagePoints: row.nQuinipolosParticipated
            ? row.totalPoints / row.nQuinipolosParticipated
            : 0,
        }))
        .sort((a, b) => b.averagePoints! - a.averagePoints!),
    [results]
  );

  return (
    <RankingTable
      rows={rowsWithAvg}
      rankBy={(r) => r.averagePoints || 0}
      header={<LeaderboardHead />}
      leftSuffix={(r) => <>({r.nQuinipolosParticipated})</>}
      rightValue={(r) => (r.averagePoints || 0).toFixed(2)}
      getRowKey={(row) => `@${row.username}-${row.averagePoints}`}
    />
  );
};

export default Stats;
