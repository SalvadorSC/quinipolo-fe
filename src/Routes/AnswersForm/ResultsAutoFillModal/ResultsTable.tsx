import {
  Box,
  Checkbox,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "react-i18next";
import type { MatchResult } from "../../../services/scraper/types";
import { CONFIDENCE_THRESHOLD_LOW } from "./constants";
import { getLeagueChipStyle } from "../../../utils/leagueChipStyles";
import {
  getConfidenceColor,
  getConfidenceLabel,
  getOutcomeLabel,
  isTie,
} from "./utils";

interface ResultsTableProps {
  matches: MatchResult[];
  selectedMatchNumbers: Set<number>;
  onToggle: (matchNumber: number) => void;
}

export function ResultsTable({
  matches,
  selectedMatchNumbers,
  onToggle,
}: ResultsTableProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" sx={{ px: 1.5 }}></TableCell>
            <TableCell>{t("resultsAutoFill.table.match") || "Match"}</TableCell>
            <TableCell>
              {t("resultsAutoFill.table.result") || "Result"}
            </TableCell>
            <TableCell>
              {t("resultsAutoFill.table.confidence") || "Confidence"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map((match) => {
            const isSelected = selectedMatchNumbers.has(match.matchNumber);
            const formattedDate = dayjs(match.startTime).format("DD/MM HH:mm");
            const leagueStyle = getLeagueChipStyle(match.leagueId);
            const confidenceStyle = getConfidenceColor(match.confidence);
            const isLowConfidence = match.confidence < CONFIDENCE_THRESHOLD_LOW;
            const outcomeLabel = getOutcomeLabel(match.outcome, t);
            const matchIsTie = isTie(match.outcome);

            return (
              <TableRow
                key={match.matchNumber}
                selected={isSelected}
                hover
                sx={{
                  opacity: isLowConfidence && !isSelected ? 0.6 : 1,
                  backgroundColor:
                    isLowConfidence && !isSelected
                      ? "rgba(255, 152, 0, 0.05)"
                      : undefined,
                }}
              >
                <TableCell padding="checkbox" sx={{ px: 1.5 }}>
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => onToggle(match.matchNumber)}
                  />
                </TableCell>
                <TableCell>
                  <Stack
                    direction="column"
                    spacing={0.5}
                    sx={{ maxWidth: 200, margin: "0 auto" }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="space-between"
                    >
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "center", fontWeight: 600 }}
                      >
                        {t("match")} {match.matchNumber}:
                      </Typography>
                      <Chip
                        label={formattedDate}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          color: "#00000080",
                          backgroundColor: "#00000000",
                        }}
                      />
                    </Stack>
                    <Chip
                      label={match.homeTeam}
                      size="small"
                      sx={{
                        background: leagueStyle.background,
                        color: leagueStyle.color,
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" sx={{ textAlign: "center" }}>
                      vs
                    </Typography>
                    <Chip
                      label={match.awayTeam}
                      size="small"
                      sx={{
                        background: leagueStyle.background,
                        color: leagueStyle.color,
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="column" spacing={0.5}>
                    <Chip
                      label={`${match.homeScore} - ${match.awayScore}`}
                      size="medium"
                      sx={{
                        background: "#e0e0e0",
                        color: "#212121",
                        fontWeight: 600,
                        fontSize: "1rem",
                        justifyContent: "center",
                      }}
                    />
                    <Chip
                      label={outcomeLabel}
                      size="small"
                      sx={{
                        background: matchIsTie ? "#9e9e9e" : "#4caf50",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${getConfidenceLabel(match.confidence, t)} (${(
                      match.confidence * 100
                    ).toFixed(0)}%)`}
                    size="small"
                    sx={{
                      background: confidenceStyle.background,
                      color: confidenceStyle.color,
                      fontWeight: 600,
                    }}
                  />
                  {isLowConfidence && (
                    <Tooltip
                      title={
                        t("resultsAutoFill.lowConfidenceTooltip") ||
                        "Low confidence match - please verify online"
                      }
                    >
                      <WarningAmberIcon
                        sx={{ color: "#ff9800", fontSize: 16, ml: 0.5 }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
