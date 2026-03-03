import { Alert, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import type { MatchResult } from "../../../services/scraper/types";

interface SummarySectionProps {
  selectedCount: number;
  totalCount: number;
  filteredCount: number;
  lowConfidenceMatches: MatchResult[];
  nonHighConfidenceMatches: MatchResult[];
}

export function SummarySection({
  selectedCount,
  totalCount,
  filteredCount,
  lowConfidenceMatches,
  nonHighConfidenceMatches,
}: SummarySectionProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={2} alignItems="center">
      <Typography fontWeight="bold">
        {t("resultsAutoFill.selectedCount", {
          count: selectedCount,
          total: totalCount,
        })}
        {filteredCount !== totalCount && (
          <Typography
            component="span"
            variant="body2"
            sx={{ ml: 1, fontWeight: "normal", color: "text.secondary" }}
          >
            ({t("resultsAutoFill.filtered")}: {filteredCount})
          </Typography>
        )}
      </Typography>

      {nonHighConfidenceMatches.length > 0 && (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ mb: 2, maxWidth: "600px" }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {t("resultsAutoFill.autoSelectInfo.title")}
          </Typography>
          <Typography variant="body2">
            {t("resultsAutoFill.autoSelectInfo.message", {
              count: nonHighConfidenceMatches.length,
            })}
          </Typography>
        </Alert>
      )}

      {lowConfidenceMatches.length > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            {t("resultsAutoFill.lowConfidenceWarning")}
          </Typography>
          <Typography variant="body2">
            {t("resultsAutoFill.lowConfidenceMessage", { count: lowConfidenceMatches.length })}
          </Typography>
        </Alert>
      )}
    </Stack>
  );
}
