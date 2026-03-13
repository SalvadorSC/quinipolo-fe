import { GameType } from "../../types/quinipolo";

export interface SportGoalDisplayConfig {
  leftLabel: string;
  centerLabel: string;
  rightLabel: string;
  centerPayload: string;
}

export const GOAL_DISPLAY_CONFIG: Partial<Record<GameType, SportGoalDisplayConfig>> = {
  waterpolo: {
    leftLabel: "<11",
    centerLabel: "11-12",
    rightLabel: ">12",
    centerPayload: "11/12",
  },
  football: {
    leftLabel: "0",
    centerLabel: "1–2",
    rightLabel: ">2",
    centerPayload: "1/2",
  },
};

export const DEFAULT_GOAL_DISPLAY: SportGoalDisplayConfig =
  GOAL_DISPLAY_CONFIG["waterpolo"]!;
