import { Chip, ChipProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  getLeagueLifecycleStatus,
  getLeagueStatusChipColor,
  getLeagueStatusLabelKey,
} from "../../utils/leagueStatus";

type LeagueStatusChipProps = {
  status?: string | null;
  sx?: ChipProps["sx"];
  /**
   * `semantic` uses success/warning outlines on light surfaces.
   * `inherit` keeps the existing outlined chip readable on gradient buttons.
   */
  contrast?: "semantic" | "inherit";
};

/**
 * Status badge for a league row. Same size and outlined Chip as the
 * finished-league badge. Renders nothing when status is missing or unknown.
 */
export function LeagueStatusChip({
  status,
  sx,
  contrast = "semantic",
}: LeagueStatusChipProps) {
  const { t } = useTranslation();
  const lifecycle = getLeagueLifecycleStatus({ status });
  if (!lifecycle) return null;

  return (
    <Chip
      size="small"
      variant="outlined"
      color={
        contrast === "inherit" ? "default" : getLeagueStatusChipColor(lifecycle)
      }
      label={t(getLeagueStatusLabelKey(lifecycle))}
      sx={
        contrast === "inherit"
          ? [{ color: "inherit", borderColor: "currentColor" }, ...(sx ? [sx] : [])]
          : sx
      }
    />
  );
}
