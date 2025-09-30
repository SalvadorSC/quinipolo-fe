import React from "react";
import LeaderboardHead from "./LeaderboardHead/LeaderboardHead";
import RankingTable from "./RankingTable";
import style from "./Leaderboard.module.scss";
import { Result } from "../../Routes/CorrectionSuccess/CorrectionSuccess";

const Leaderboard = ({
  sortedResults,
  showSearch = true,
}: {
  sortedResults: Result[];
  showSearch?: boolean;
}) => {
  return (
    <RankingTable
      rows={sortedResults}
      rankBy="totalPoints"
      header={<LeaderboardHead />}
      showSearch={showSearch}
      rightValue={(r) => (
        <>
          {r.totalPoints}{" "}
          {r.pointsEarned !== undefined ? (
            <span
              className={
                r.correct15thGame && r.pointsEarned === 15
                  ? style.correct15
                  : ""
              }
            >
              {r.pointsEarned > 0
                ? `(+${r.pointsEarned})`
                : `(${r.pointsEarned})`}
            </span>
          ) : null}
        </>
      )}
      getRowKey={(row) => `@${row.username}-${row.totalPoints}`}
    />
  );
};

export default React.memo(Leaderboard);
