import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ResultsAutoFillModalProps } from "./types";
import { primaryActionStyles, secondaryActionStyles } from "./constants";
import { LeagueLegend } from "./LeagueLegend";
import { ResultsTable } from "./ResultsTable";
import { LoadingState } from "./LoadingState";
import { SummarySection } from "./SummarySection";
import { ModalHeader } from "./ModalHeader";
import { useResultsData } from "./useResultsData";

export function ResultsAutoFillModal({
  open,
  onClose,
  onConfirm,
  quinipoloId,
}: ResultsAutoFillModalProps) {
  const { t } = useTranslation();
  const {
    loading,
    error,
    data,
    selectedMatchNumbers,
    setSelectedMatchNumbers,
    selectedLeagues,
    setSelectedLeagues,
    lowConfidenceMatches,
    nonHighConfidenceMatches,
    selectedMatches,
    leaguesWithCounts,
    displayedMatches,
  } = useResultsData(open, quinipoloId);

  const handleToggle = (matchNumber: number) => {
    setSelectedMatchNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(matchNumber)) {
        newSet.delete(matchNumber);
      } else {
        newSet.add(matchNumber);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    if (!data || selectedMatches.length === 0) {
      return;
    }

    onConfirm(selectedMatches);
    onClose();
  };

  const handleLeagueToggle = (leagueId: string) => {
    setSelectedLeagues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(leagueId)) {
        if (newSet.size > 1) {
          newSet.delete(leagueId);
        }
      } else {
        newSet.add(leagueId);
      }
      return newSet;
    });
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="xl"
      onClose={onClose}
      data-testid="results-auto-fill-modal"
      sx={{
        xs: { width: "100%" },
      }}
      PaperProps={{
        sx: {
          width: { xs: "calc(100% - 16px)", sm: "auto" },
          margin: { xs: "8px", sm: "0" },
        },
      }}
    >
      <ModalHeader />
      <DialogContent
        dividers
        sx={{ minHeight: 400, px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}
      >
        {loading && <LoadingState />}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && data && (
          <Stack spacing={2}>
            <SummarySection
              selectedCount={selectedMatches.length}
              totalCount={data.length}
              filteredCount={displayedMatches.length}
              lowConfidenceMatches={lowConfidenceMatches}
              nonHighConfidenceMatches={nonHighConfidenceMatches}
            />

            <LeagueLegend
              leagues={leaguesWithCounts}
              selectedLeagues={selectedLeagues}
              onToggle={handleLeagueToggle}
            />

            <ResultsTable
              matches={displayedMatches}
              selectedMatchNumbers={selectedMatchNumbers}
              onToggle={handleToggle}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={secondaryActionStyles}>
          {t("resultsAutoFill.cancel") || "Cancel"}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedMatches.length === 0 || !data}
          sx={primaryActionStyles}
        >
          {t("resultsAutoFill.apply") || "Apply Selection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

