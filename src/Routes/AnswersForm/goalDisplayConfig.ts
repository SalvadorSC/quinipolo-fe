export type SupportedSport = "waterpolo" | "football" | (string & {});

export interface SportGoalDisplayConfig {
  leftLabel: string; // display label for '<' option
  centerLabel: string; // display label for mid-range option
  rightLabel: string; // display label for '>' option
  centerPayload: string; // payload value for the mid-range option (e.g., '9/10')
}

// Central registry for sport-specific goal display rules.
// To add a new sport, add an entry here and ensure backend expects the
// appropriate centerPayload for game 15 goals.
export const GOAL_DISPLAY_CONFIG: Record<
  SupportedSport,
  SportGoalDisplayConfig
> = {
  waterpolo: {
    leftLabel: "<9",
    centerLabel: "9–10",
    rightLabel: ">10",
    centerPayload: "9/10",
  },
  football: {
    leftLabel: "0",
    centerLabel: "1–2",
    rightLabel: ">2",
    centerPayload: "1/2",
  },
};

// Sensible default if an unknown sport is received. Falls back to waterpolo.
export const DEFAULT_GOAL_DISPLAY: SportGoalDisplayConfig =
  GOAL_DISPLAY_CONFIG["waterpolo"];
