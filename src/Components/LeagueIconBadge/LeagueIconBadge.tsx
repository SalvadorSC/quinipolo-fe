import React from "react";
import { Box } from "@mui/material";
import { getLeagueIcon } from "../../utils/leagueIcons";

export type LeagueIconBadgeProps = {
  icon?: string;
  sizePx?: number; // outer circle size
  color?: string; // icon color
  marginLeftPx?: number;
  accentColor?: string; // background color for the badge
  iconColor?: string; // icon color
};

const LeagueIconBadge: React.FC<LeagueIconBadgeProps> = ({
  icon,
  sizePx = 40,
  marginLeftPx = 10,
  accentColor = "#ddd",
  iconColor = "#3f51b5",
}) => {
  console.log("iconColor", iconColor);
  return (
    <Box
      sx={{
        marginLeft: `${marginLeftPx}px`,
        width: `${sizePx}px`,
        background: accentColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: `${sizePx}px`,
        borderRadius: "50%",
        flex: "0 0 auto",
        color: iconColor,
      }}
    >
      {getLeagueIcon(icon as any, { color: iconColor })}
    </Box>
  );
};

export default LeagueIconBadge;
