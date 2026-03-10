function getFeatureFlag(envKey: string, defaultValue: boolean): boolean {
  const envValue = process.env[envKey];
  if (envValue !== undefined) {
    return envValue === "true";
  }
  const runtimeConfig =
    typeof window !== "undefined" ? window.__APP_CONFIG__ : undefined;
  return ((runtimeConfig as Record<string, unknown>)?.[envKey] ?? defaultValue) === true;
}

export const FEATURE_FLAGS = {
  multiSport: getFeatureFlag("REACT_APP_MULTI_SPORT", false),
} as const;
