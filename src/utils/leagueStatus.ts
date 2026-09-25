/**
 * League lifecycle on the API.
 *
 * quinipolo-be stores this on `leagues.status`. Existing values are
 * `active`, `inactive`, and `suspended`. The parallel backend change adds
 * `finished`. Only `finished` blocks new Quinipolos.
 *
 * Do not infer finished from the league name or from "not Global".
 * Leagues such as CNBeras stay `active` and keep create flows.
 */
export const FINISHED_LEAGUE_STATUS = "finished";

/** Values stored on `leagues.status`. */
export const LEAGUE_LIFECYCLE_STATUSES = [
  "active",
  "inactive",
  "suspended",
  "finished",
] as const;

export type LeagueLifecycleStatus = (typeof LEAGUE_LIFECYCLE_STATUSES)[number];

export type LeagueStatusFields = {
  status?: string | null;
};

const LEAGUE_STATUS_LABEL_KEY: Record<LeagueLifecycleStatus, string> = {
  active: "leagueActive",
  inactive: "leagueInactive",
  suspended: "leagueSuspended",
  finished: "leagueFinished",
};

export type LeagueStatusChipColor = "default" | "success" | "warning";

export function getLeagueLifecycleStatus(
  league?: LeagueStatusFields | null
): LeagueLifecycleStatus | null {
  if (!league?.status || typeof league.status !== "string") return null;
  const normalized = league.status.trim().toLowerCase();
  if ((LEAGUE_LIFECYCLE_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as LeagueLifecycleStatus;
  }
  return null;
}

export function getLeagueStatusLabelKey(status: LeagueLifecycleStatus): string {
  return LEAGUE_STATUS_LABEL_KEY[status];
}

/** Outlined Chip color. Finished stays the existing default outline. */
export function getLeagueStatusChipColor(
  status: LeagueLifecycleStatus
): LeagueStatusChipColor {
  if (status === "active") return "success";
  if (status === "suspended") return "warning";
  return "default";
}

export function isLeagueFinished(
  league?: LeagueStatusFields | null
): boolean {
  return getLeagueLifecycleStatus(league) === FINISHED_LEAGUE_STATUS;
}

/**
 * Active leagues sort before finished, inactive, suspended, and unknown.
 * Equal ranks compare as 0 so callers can keep their existing tie-break.
 */
export function compareLeaguesActiveFirst(
  a?: LeagueStatusFields | null,
  b?: LeagueStatusFields | null
): number {
  const rank = (league?: LeagueStatusFields | null) =>
    getLeagueLifecycleStatus(league) === "active" ? 0 : 1;
  return rank(a) - rank(b);
}

const FINISHED_CODE = /^(league_finished|finished_league|league_is_finished)$/i;
const FINISHED_WORD =
  /finished|finalizad|finalitzad|terminad|beendet|conclus/i;
const LEAGUE_WORD = /league|liga|lliga|ligue|leghe|リーグ|联赛/i;

function errorPayload(error: unknown): {
  status?: number;
  code: string;
  message: string;
  leagueStatus: string;
} {
  const err = error as {
    message?: string;
    response?: { status?: number; data?: unknown };
  };
  const data = err?.response?.data;
  const record =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const code = String(record.code ?? record.errorCode ?? "");
  const leagueStatus = String(
    record.leagueStatus ?? record.league_status ?? record.status ?? ""
  );
  const messageParts = [
    record.message,
    record.error,
    typeof data === "string" ? data : "",
    err?.message,
  ]
    .filter((part) => typeof part === "string" && part.length > 0)
    .join(" ");
  return {
    status: err?.response?.status,
    code,
    message: messageParts,
    leagueStatus,
  };
}

/** True when create-quinipolo (or similar) was rejected because the league is finished. */
export function isFinishedLeagueApiError(error: unknown): boolean {
  const { code, message, leagueStatus } = errorPayload(error);
  if (FINISHED_CODE.test(code.trim())) return true;
  if (leagueStatus.trim().toLowerCase() === FINISHED_LEAGUE_STATUS) return true;
  return FINISHED_WORD.test(message) && LEAGUE_WORD.test(message);
}
