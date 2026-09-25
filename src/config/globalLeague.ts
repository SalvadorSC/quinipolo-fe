/**
 * Global league ids.
 *
 * The 2025–26 Global league UUID stays hardcoded because historical
 * quinipolos still need image share and the legacy matchday offset (J - 2).
 * The 2026–27 Global league is a new row. Set its UUID with
 * `REACT_APP_GLOBAL_LEAGUE_ID` or `window.__APP_CONFIG__.globalLeagueId`.
 * Signup still joins the slug `"global"`, which the backend resolves to the
 * active Global league — do not hardcode the new UUID here.
 *
 * The matchday offset applies only to the legacy id. A new season must not
 * subtract 2.
 */

/** 2025–26 Global league (image share + legacy matchday offset). */
export const LEGACY_GLOBAL_LEAGUE_ID = "351a1949-f6c5-4940-ac70-1c7dd08e8b1a";

/** Display matchday adjustment used only for the 2025–26 Global league. */
export const LEGACY_GLOBAL_MATCHDAY_OFFSET = 2;

export function getActiveGlobalLeagueId(): string | undefined {
  const fromEnv = process.env.REACT_APP_GLOBAL_LEAGUE_ID?.trim();
  if (fromEnv) return fromEnv;
  const fromRuntime =
    typeof window !== "undefined"
      ? window.__APP_CONFIG__?.globalLeagueId?.trim()
      : undefined;
  return fromRuntime || undefined;
}

export function isLegacyGlobalLeague(leagueId?: string | null): boolean {
  if (!leagueId) return false;
  return leagueId === LEGACY_GLOBAL_LEAGUE_ID || leagueId === "global";
}

/**
 * Apply the 2025–26 Global J-2 offset only when the backend has not already
 * sent an adjusted matchday. Never apply it to the 2026–27 Global id.
 */
export function adjustLegacyGlobalDisplayMatchday(
  leagueId: string | undefined,
  displayN: number | undefined,
  matchdayAlreadySet: boolean
): number | undefined {
  if (typeof displayN !== "number" || Number.isNaN(displayN)) return displayN;
  if (matchdayAlreadySet || !isLegacyGlobalLeague(leagueId)) return displayN;
  return Math.max(1, displayN - LEGACY_GLOBAL_MATCHDAY_OFFSET);
}
