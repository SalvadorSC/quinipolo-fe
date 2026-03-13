/**
 * League UUIDs allowed for image share (beta).
 * Can be overridden at runtime via window.__APP_CONFIG__.leaguesWithImageShareBeta
 * or REACT_APP_LEAGUES_IMAGE_SHARE_BETA (comma-separated UUIDs).
 */

const DEFAULT_LEAGUES_WITH_IMAGE_SHARE_BETA = [
  "351a1949-f6c5-4940-ac70-1c7dd08e8b1a", // Global
  "4cae8d44-f3bd-42a5-a899-78e64fdb0181", // Sant Feliu
  "3cc750df-b2ee-4a1f-92e4-cc743b9d01c4", // TEST
];

declare global {
  interface Window {
    __APP_CONFIG__?: {
      leaguesWithImageShareBeta?: string[];
    };
  }
}

function getLeaguesWithImageShareBeta(): string[] {
  const envValue = process.env.REACT_APP_LEAGUES_IMAGE_SHARE_BETA;
  if (envValue) {
    return envValue.split(",").map((id) => id.trim()).filter(Boolean);
  }
  const runtimeConfig = (typeof window !== "undefined" && window.__APP_CONFIG__)
    ? window.__APP_CONFIG__.leaguesWithImageShareBeta
    : undefined;
  return runtimeConfig ?? DEFAULT_LEAGUES_WITH_IMAGE_SHARE_BETA;
}

export const LEAGUES_WITH_IMAGE_SHARE_BETA = getLeaguesWithImageShareBeta();
