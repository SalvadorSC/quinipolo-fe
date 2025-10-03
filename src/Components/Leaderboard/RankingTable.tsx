import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import SearchBox from "../SearchBox/SearchBox";
import style from "./Leaderboard.module.scss";
import {
  BaseResult,
  RankKey,
  computeRanks,
  filterByUsername,
  getCurrentUser,
  rankToMedal,
  toScoreGetter,
} from "../../utils/ranking";

export type RankingTableProps<T extends BaseResult> = {
  rows: T[];
  rankBy: RankKey<T>;
  stickyCurrentUser?: boolean;
  showMedals?: boolean;
  rightValue: (row: T) => React.ReactNode;
  leftSuffix?: (row: T) => React.ReactNode;
  searchPlaceholderKey?: string;
  header: React.ReactNode;
  getRowKey?: (row: T) => string;
  showSearch?: boolean;
};

function defaultGetRowKey<T extends BaseResult>(row: T): string {
  return `@${row.username}`;
}

function RankingTableInner<T extends BaseResult>(props: RankingTableProps<T>) {
  const {
    rows,
    rankBy,
    stickyCurrentUser = true,
    showMedals = true,
    rightValue,
    leftSuffix,
    searchPlaceholderKey,
    header,
    getRowKey = defaultGetRowKey,
    showSearch = true,
  } = props;

  const currentUsername = getCurrentUser();

  const scoreOf = useMemo(() => toScoreGetter(rankBy), [rankBy]);

  // Precompute ranks once per rows change
  const ranks = useMemo(() => computeRanks(rows, scoreOf), [rows, scoreOf]);

  // Split current user row vs others once per rows change
  const { userRow, otherRows } = useMemo(() => {
    const user = rows.find((r) => r.username === currentUsername);
    const others = rows.filter((r) => r.username !== currentUsername);
    return { userRow: user, otherRows: others };
  }, [rows, currentUsername]);

  // Search
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterByUsername(rows, query), [rows, query]);
  const isFiltering = query.trim() !== "";

  const displayRows = isFiltering ? filtered : otherRows;

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        {showSearch ? (
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholderKey={searchPlaceholderKey}
          />
        ) : null}
      </div>
      <TableContainer
        sx={{
          borderRadius: "16px",
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <Table aria-label="ranking table">
          {header}
          <TableBody>
            {stickyCurrentUser && !isFiltering && userRow ? (
              <TableRow
                key={`${getRowKey(userRow)}-sticky`}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: "sticky",
                    top: 56,
                    fontWeight: "bold",
                    zIndex: 1,
                    background: "#fff",
                  }}
                  className={style.stickyUserCell}
                >
                  {showMedals
                    ? rankToMedal(ranks.get(userRow) || 0)
                    : ranks.get(userRow) || 0}
                  . @{userRow.username}
                  {leftSuffix ? <> {leftSuffix(userRow)}</> : null}
                </TableCell>
                <TableCell
                  align="right"
                  className={style.pointsCell}
                  sx={{
                    position: "sticky",
                    top: 56,
                    zIndex: 1,
                    background: "#fff",
                    fontWeight: "bold",
                  }}
                  classes={{ root: style.stickyUserCell } as any}
                >
                  {rightValue(userRow)}
                </TableCell>
              </TableRow>
            ) : null}

            {displayRows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {showMedals
                    ? rankToMedal(ranks.get(row) || 0)
                    : ranks.get(row) || 0}
                  . @{row.username}
                  {leftSuffix ? <> {leftSuffix(row)}</> : null}
                </TableCell>
                <TableCell align="right" className={style.pointsCell}>
                  {rightValue(row)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

// Using a wrapper to preserve generic component type inference on default export with React.memo
function RankingTableComponent<T extends BaseResult>(
  props: RankingTableProps<T>
) {
  return <RankingTableInner {...props} />;
}

export default React.memo(
  RankingTableComponent
) as typeof RankingTableComponent;
