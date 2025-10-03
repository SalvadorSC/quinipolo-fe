export type BaseResult = {
  username: string;
};

export type RankKey<T> = keyof T | ((row: T) => number);

// Stable ranks with ties (first index for a score → rank)
export function computeRanks<T>(
  rows: T[],
  scoreOf: (row: T) => number
): Map<T, number> {
  const rowsWithScore = rows.map((row, idx) => ({
    row,
    idx,
    score: scoreOf(row),
  }));
  // Sort by score desc, then by original index asc to keep stability
  rowsWithScore.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx;
  });

  const scoreToFirstRank = new Map<number, number>();
  const map = new Map<T, number>();
  rowsWithScore.forEach((item, sortedIdx) => {
    const existing = scoreToFirstRank.get(item.score);
    const rank = existing !== undefined ? existing : sortedIdx + 1;
    if (existing === undefined) scoreToFirstRank.set(item.score, rank);
    map.set(item.row, rank);
  });
  return map;
}

// Medal helper
export function rankToMedal(rank: number): string | number {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
}

// Current user selector
export function getCurrentUser(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("username") || "";
}

// Case-insensitive filter by username
export function filterByUsername<T extends BaseResult>(
  rows: T[],
  q: string
): T[] {
  const trimmed = q.trim().toLowerCase();
  if (!trimmed) return rows;
  return rows.filter((r) => r.username.toLowerCase().includes(trimmed));
}

export function toScoreGetter<T>(rankBy: RankKey<T>): (row: T) => number {
  if (typeof rankBy === "function") return rankBy as (row: T) => number;
  const key = rankBy as keyof T;
  return (row: T) => {
    const value = row[key];
    return typeof value === "number" ? value : 0;
  };
}
