/**
 * League UUIDs allowed for image share (beta).
 * Can be overridden at runtime via window.__APP_CONFIG__.leaguesWithImageShareBeta
 * or REACT_APP_LEAGUES_IMAGE_SHARE_BETA (comma-separated UUIDs).
 *
 * The legacy 2025–26 Global UUID stays in the default list so old quinipolos
 * can still be shared as images. The active 2026–27 Global id
 * (REACT_APP_GLOBAL_LEAGUE_ID or window.__APP_CONFIG__.globalLeagueId) is
 * appended when set, including when the beta list is overridden.
 */

import {
  getActiveGlobalLeagueId,
  LEGACY_GLOBAL_LEAGUE_ID,
} from "./globalLeague";

const TEST_LEAGUE_ID = "3cc750df-b2ee-4a1f-92e4-cc743b9d01c4";

export const DEFAULT_LEAGUES_WITH_IMAGE_SHARE_BETA = [
  LEGACY_GLOBAL_LEAGUE_ID, // Global 2025–26
  TEST_LEAGUE_ID, // TEST
];

declare global {
  interface Window {
    __APP_CONFIG__?: {
      leaguesWithImageShareBeta?: string[];
      /** Active Global league UUID for the current season (2026–27). */
      globalLeagueId?: string;
    };
  }
}

export function mergeImageShareLeagueIds(
  base: string[],
  activeGlobalLeagueId?: string | null
): string[] {
  const ids = base.map((id) => id.trim()).filter(Boolean);
  const activeId = activeGlobalLeagueId?.trim();
  if (!activeId || ids.includes(activeId)) return ids;
  const legacyIndex = ids.indexOf(LEGACY_GLOBAL_LEAGUE_ID);
  if (legacyIndex >= 0) {
    ids.splice(legacyIndex + 1, 0, activeId);
  } else {
    ids.unshift(activeId);
  }
  return ids;
}

export function resolveLeaguesWithImageShareBeta(input?: {
  envList?: string | null;
  runtimeList?: string[] | null;
  activeGlobalLeagueId?: string | null;
}): string[] {
  const envList = input?.envList?.trim();
  let base: string[];
  if (envList) {
    base = envList
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  } else if (input?.runtimeList && input.runtimeList.length > 0) {
    base = input.runtimeList.map((id) => id.trim()).filter(Boolean);
  } else {
    base = [...DEFAULT_LEAGUES_WITH_IMAGE_SHARE_BETA];
  }
  return mergeImageShareLeagueIds(base, input?.activeGlobalLeagueId);
}

function getLeaguesWithImageShareBeta(): string[] {
  const runtimeConfig =
    typeof window !== "undefined" ? window.__APP_CONFIG__ : undefined;
  return resolveLeaguesWithImageShareBeta({
    envList: process.env.REACT_APP_LEAGUES_IMAGE_SHARE_BETA,
    runtimeList: runtimeConfig?.leaguesWithImageShareBeta,
    activeGlobalLeagueId: getActiveGlobalLeagueId(),
  });
}

export const LEAGUES_WITH_IMAGE_SHARE_BETA = getLeaguesWithImageShareBeta();
