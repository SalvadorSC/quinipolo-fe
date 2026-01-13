/**
 * Shared league chip styles for consistent styling across the application
 */

export const leagueChipStyles: Record<
  string,
  { background: string; color: string }
> = {
  CL: {
    background: "linear-gradient(135deg, #b8860b, #ffd54f)",
    color: "#2d1600",
  },
  DHM: {
    background: "linear-gradient(135deg, #0d47a1, #42a5f5)",
    color: "#e3f2fd",
  },
  DHF: {
    background: "linear-gradient(135deg, #0288d1, #80d8ff)",
    color: "#e3f2fd",
  },
  PDM: {
    background: "linear-gradient(135deg, #b71c1c, #ff5252)",
    color: "#fff5f5",
  },
  PDF: {
    background: "linear-gradient(135deg, #e64a19, #ffab40)",
    color: "#fff8e1",
  },
  SDM: {
    background: "linear-gradient(135deg, #9575cd, #d1c4e9)",
    color: "#2f1b4d",
  },
  "SEL. M": {
    background: "linear-gradient(135deg, #4caf50, #81c784)",
    color: "#ffffff",
  },
  "SEL. F": {
    background: "linear-gradient(135deg, #9c27b0, #e91e63)",
    color: "#ffffff",
  },
};

export const defaultLeagueChipStyle = {
  background: "linear-gradient(135deg, #37474f, #607d8b)",
  color: "#ffffff",
};

/**
 * Get the style for a league chip based on league ID
 */
export const getLeagueChipStyle = (
  leagueId?: string | null
): { background: string; color: string } => {
  if (!leagueId) {
    return defaultLeagueChipStyle;
  }
  return leagueChipStyles[leagueId] ?? defaultLeagueChipStyle;
};
