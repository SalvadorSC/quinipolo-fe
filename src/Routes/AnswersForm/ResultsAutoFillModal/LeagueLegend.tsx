import { Box, Chip, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  leagueChipStyles,
  defaultLeagueChipStyle,
} from "./constants";
import type { LeagueWithCount } from "./types";

interface LeagueLegendProps {
  leagues: LeagueWithCount[];
  selectedLeagues: Set<string>;
  onToggle: (leagueId: string) => void;
}

export function LeagueLegend({
  leagues,
  selectedLeagues,
  onToggle,
}: LeagueLegendProps) {
  const { t } = useTranslation();

  if (leagues.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
        {t("resultsAutoFill.leagueLegend") || "Filter by League:"}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        justifyContent="center"
        sx={{ gap: 1 }}
      >
        {leagues.map((league) => {
          const isSelected = selectedLeagues.has(league.id);
          const leagueStyle =
            leagueChipStyles[league.id] ?? defaultLeagueChipStyle;

          return (
            <Chip
              key={league.id}
              label={`${league.id} (${league.count})`}
              onClick={() => onToggle(league.id)}
              sx={{
                background: isSelected
                  ? leagueStyle.background
                  : "rgba(0,0,0,0.1)",
                color: isSelected ? leagueStyle.color : "#666",
                fontWeight: 600,
                cursor: "pointer",
                opacity: isSelected ? 1 : 0.6,
                border: isSelected
                  ? "0px solid transparent"
                  : "2px solid rgba(0,0,0,0.2)",
                "&:hover": {
                  opacity: 1,
                  transform: "scale(1.05)",
                  transition: "all 0.2s ease",
                },
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

