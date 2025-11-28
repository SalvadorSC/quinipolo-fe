import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LeagueChip } from "../../../Components/LeagueChip/LeagueChip";
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

          return (
            <LeagueChip
              key={league.id}
              leagueId={league.id}
              label={`${league.id} (${league.count})`}
              clickable
              selected={isSelected}
              onClick={() => onToggle(league.id)}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
