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

export type LeagueStatusFields = {
  status?: string | null;
};

export function isLeagueFinished(
  league?: LeagueStatusFields | null
): boolean {
  if (!league?.status || typeof league.status !== "string") return false;
  return league.status.trim().toLowerCase() === FINISHED_LEAGUE_STATUS;
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
