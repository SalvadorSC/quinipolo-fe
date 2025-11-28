import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { getLeagueChipStyle } from "../../utils/leagueChipStyles";

export interface LeagueChipProps extends Omit<ChipProps, "label"> {
  leagueId?: string | null;
  label?: string | React.ReactNode;
  size?: "small" | "medium";
  clickable?: boolean;
  selected?: boolean;
  className?: string;
}

/**
 * Reusable LeagueChip component for displaying league badges with consistent styling
 * 
 * @param leagueId - The league ID to determine the color scheme
 * @param label - Custom label (defaults to leagueId if not provided)
 * @param size - Size of the chip (default: "small")
 * @param clickable - Whether the chip is clickable (default: false)
 * @param selected - Whether the chip is in selected state (for clickable chips)
 * @param className - Additional CSS class name
 * @param sx - Additional Material-UI sx styles
 * @param ...otherProps - Other Chip props
 */
export const LeagueChip: React.FC<LeagueChipProps> = ({
  leagueId,
  label,
  size = "small",
  clickable = false,
  selected = false,
  className,
  sx,
  onClick,
  ...otherProps
}) => {
  const leagueStyle = getLeagueChipStyle(leagueId);
  const displayLabel = label ?? leagueId ?? "";

  // Base styles
  const baseStyles = {
    background: leagueStyle.background,
    color: leagueStyle.color,
    fontWeight: 600,
  };

  // Styles for clickable/selectable chips (like in LeagueLegend)
  const clickableStyles = clickable
    ? {
        cursor: "pointer",
        opacity: selected ? 1 : 0.6,
        border: selected ? "0px solid transparent" : "2px solid rgba(0,0,0,0.2)",
        background: selected ? leagueStyle.background : "rgba(0,0,0,0.1)",
        color: selected ? leagueStyle.color : "#666",
        "&:hover": {
          opacity: 1,
          transform: "scale(1.05)",
          transition: "all 0.2s ease",
        },
      }
    : {};

  return (
    <Chip
      label={displayLabel}
      size={size}
      className={className}
      onClick={clickable ? onClick : undefined}
      sx={{
        ...baseStyles,
        ...clickableStyles,
        ...sx,
      }}
      {...otherProps}
    />
  );
};

