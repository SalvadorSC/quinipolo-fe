import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Checkbox,
  Radio,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";
import { fetchScraperDataV2 } from "../../services/scraper/scraperService";
import {
  ScraperMatchV2,
  ScraperPresetResponse,
} from "../../services/scraper/types";

type DifficultyPreset = "easy" | "moderate" | "hard" | "custom";
type DifficultySort = "none" | "asc" | "desc";
type ModalStep = "selection" | "pleno";

const MAX_SELECTION = 15;
const LEAGUE_ORDER = ["CL", "DHM", "DHF", "PDM", "PDF", "SDM"];
const difficultyRanking: Record<ScraperMatchV2["difficulty"], number> = {
  hard: 0,
  moderate: 1,
  easy: 2,
  unknown: 3,
};

const difficultyGradients: Record<
  ScraperMatchV2["difficulty"],
  { background: string; color: string }
> = {
  easy: {
    background: "linear-gradient(135deg, #43a047, #8bc34a)",
    color: "#ffffff",
  },
  moderate: {
    background: "linear-gradient(135deg, #f9a825, #ffca28)",
    color: "#2d1600",
  },
  hard: {
    background: "linear-gradient(135deg, #c62828, #ff7043)",
    color: "#ffffff",
  },
  unknown: {
    background: "linear-gradient(135deg, #607d8b, #90a4ae)",
    color: "#ffffff",
  },
};

const presetGradients: Record<
  Exclude<DifficultyPreset, "custom">,
  { background: string; hover: string }
> = {
  easy: {
    background: "linear-gradient(135deg, #43a047, #8bc34a)",
    hover: "linear-gradient(135deg, #2e7d32, #689f38)",
  },
  moderate: {
    background: "linear-gradient(135deg, #f9a825, #ffca28)",
    hover: "linear-gradient(135deg, #f57f17, #ffb300)",
  },
  hard: {
    background: "linear-gradient(135deg, #c62828, #ff7043)",
    hover: "linear-gradient(135deg, #8e0000, #f4511e)",
  },
};

const presetTextColors: Record<Exclude<DifficultyPreset, "custom">, string> = {
  easy: "#2e7d32",
  moderate: "#f57f17",
  hard: "#c62828",
};

const leagueChipStyles: Record<string, { background: string; color: string }> =
  {
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
  };

const defaultLeagueChipStyle = {
  background: "linear-gradient(135deg, #37474f, #607d8b)",
  color: "#ffffff",
};

const primaryActionStyles = {
  background: "linear-gradient(120deg, #0d47a1, #5e35b1)",
  color: "#fff",
  borderRadius: 999,
  fontWeight: 700,
  px: 3,
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  "&:hover": {
    background: "linear-gradient(120deg, #0a3184, #4527a0)",
  },
  "&.Mui-disabled": {
    color: "rgba(255,255,255,0.7)",
    background:
      "linear-gradient(120deg, rgba(13,71,161,0.4), rgba(94,53,177,0.4))",
  },
};

const secondaryActionStyles = {
  borderRadius: 999,
  fontWeight: 600,
  px: 2.5,
  color: "#4527a0",
  border: "2px solid #4527a0",
  "&:hover": {
    borderColor: "#311b92",
    color: "#311b92",
    backgroundColor: "rgba(69,39,160,0.05)",
  },
};

interface MatchAutoFillModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    matches: ScraperMatchV2[];
    plenoMatchId: string | null;
    preset: DifficultyPreset;
  }) => void;
}

export function MatchAutoFillModal({
  open,
  onClose,
  onConfirm,
}: MatchAutoFillModalProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    matches: ScraperMatchV2[];
    presets: ScraperPresetResponse;
    quotas: Record<string, number>;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [plenoMatchId, setPlenoMatchId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<DifficultyPreset>("custom");
  const [selectionWarning, setSelectionWarning] = useState<string | null>(null);
  const [showUnselected, setShowUnselected] = useState(true);
  const [difficultySort, setDifficultySort] = useState<DifficultySort>("none");
  const [currentStep, setCurrentStep] = useState<ModalStep>("selection");
  const [lessThan15Dismissed, setLessThan15Dismissed] = useState(false);

  const presetLabels: Record<Exclude<DifficultyPreset, "custom">, string> = {
    easy: t("autoFillModal.easyPreset") || "Easy",
    moderate: t("autoFillModal.moderatePreset") || "Moderate",
    hard: t("autoFillModal.hardPreset") || "Hard",
  };

  const difficultyLabels: Record<ScraperMatchV2["difficulty"], string> = {
    easy: t("autoFillDifficulty.easy") || "Easy",
    moderate: t("autoFillDifficulty.moderate") || "Moderate",
    hard: t("autoFillDifficulty.hard") || "Hard",
    unknown: t("autoFillDifficulty.unknown") || "Unknown",
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    if (data) {
      return;
    }
    setLoading(true);
    fetchScraperDataV2()
      .then((response) => {
        setData(response);
        setSelectedIds([]);
        setPlenoMatchId(null);
        setActivePreset("custom");
        setCurrentStep("selection");
        setShowUnselected(true);
        setDifficultySort("none");
        setSelectionWarning(null);
        setLessThan15Dismissed(false);
      })
      .catch((err) => {
        console.error(err);
        setError(
          err?.message ??
            t("autoFillModal.fetchError") ??
            "Unable to fetch matches. Please try again in a few moments."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, data, t]);

  useEffect(() => {
    if (!open) {
      setCurrentStep("selection");
      setShowUnselected(true);
      setDifficultySort("none");
      setSelectionWarning(null);
      setLessThan15Dismissed(false);
      setActivePreset("custom");
      return;
    }
    if (!data) {
      return;
    }
    if (!plenoMatchId || !selectedIds.includes(plenoMatchId)) {
      setPlenoMatchId(selectedIds[selectedIds.length - 1] ?? null);
    }
  }, [selectedIds, plenoMatchId, open, data]);

  const matchMap = useMemo(() => {
    if (!data) return new Map<string, ScraperMatchV2>();
    return new Map(data.matches.map((match) => [match.matchId, match]));
  }, [data]);

  const selectedMatches = useMemo(() => {
    return selectedIds
      .map((id) => matchMap.get(id))
      .filter(Boolean) as ScraperMatchV2[];
  }, [selectedIds, matchMap]);

  const championsCount = selectedMatches.filter(
    (match) => match.isChampionsLeague
  ).length;
  const selectedCount = selectedIds.length;
  const isLessThanMaxSelection =
    selectedCount > 0 && selectedCount < MAX_SELECTION;
  const isMaxSelection = selectedCount === MAX_SELECTION;

  useEffect(() => {
    setLessThan15Dismissed(false);
  }, [selectedCount]);

  const handlePresetClick = (preset: Exclude<DifficultyPreset, "custom">) => {
    if (!data) return;
    const presetIds = data.presets[preset] ?? [];
    if (presetIds.length === 0) {
      return;
    }
    const filtered = presetIds.filter((id) => matchMap.has(id)).slice(0, 15);
    setSelectedIds(filtered);
    setActivePreset(preset);
    setSelectionWarning(null);
    setCurrentStep("selection");
    setShowUnselected(false);
  };

  const handleToggle = (matchId: string) => {
    if (!matchMap.has(matchId)) return;
    setActivePreset("custom");
    setSelectionWarning(null);
    setSelectedIds((prev) => {
      if (prev.includes(matchId)) {
        return prev.filter((id) => id !== matchId);
      }
      if (prev.length >= MAX_SELECTION) {
        setSelectionWarning(
          t("autoFillModal.limitWarning") || "You can select up to 15 matches."
        );
        return prev;
      }
      return [...prev, matchId];
    });
  };

  const handleNext = () => {
    if (selectedIds.length === 0) {
      setSelectionWarning(
        t("autoFillModal.noMatchesSelected") ||
          "Please select at least one match to continue."
      );
      return;
    }
    setSelectionWarning(null);
    setCurrentStep("pleno");
    setPlenoMatchId(
      selectedIds[selectedIds.length - 1] ?? plenoMatchId ?? null
    );
  };

  const handleConfirm = () => {
    if (!data) return;
    const selection = selectedMatches;
    if (
      !plenoMatchId ||
      !selection.some((match) => match.matchId === plenoMatchId)
    ) {
      setSelectionWarning(
        t("autoFillModal.noPlenoSelected") ||
          "Select a Pleno al 15 before applying the selection."
      );
      return;
    }
    onConfirm({
      matches: selection,
      plenoMatchId,
      preset: activePreset,
    });
    onClose();
  };

  const renderDifficultyChip = (match: ScraperMatchV2) => (
    <Chip
      label={difficultyLabels[match.difficulty]}
      size="small"
      sx={{
        background: difficultyGradients[match.difficulty].background,
        color: difficultyGradients[match.difficulty].color,
        fontWeight: 600,
      }}
    />
  );

  const leagueOrderValue = (leagueId: string) => {
    const index = LEAGUE_ORDER.indexOf(leagueId);
    return index === -1 ? LEAGUE_ORDER.length : index;
  };

  const displayedMatches = useMemo(() => {
    if (!data) return [];
    let list = [...data.matches];
    if (!showUnselected) {
      list = list.filter((match) => selectedIds.includes(match.matchId));
    }
    list.sort((a, b) => {
      const leagueDiff =
        leagueOrderValue(a.leagueId) - leagueOrderValue(b.leagueId);
      if (leagueDiff !== 0) return leagueDiff;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    if (difficultySort !== "none") {
      const multiplier = difficultySort === "asc" ? 1 : -1;
      list = [...list].sort(
        (a, b) =>
          multiplier *
          (difficultyRanking[a.difficulty] - difficultyRanking[b.difficulty])
      );
    }
    return list;
  }, [data, showUnselected, selectedIds, difficultySort]);

  const selectedOnly = useMemo(() => {
    return selectedIds
      .map((id) => matchMap.get(id))
      .filter(Boolean) as ScraperMatchV2[];
  }, [selectedIds, matchMap]);

  const renderSelectionStep = () => (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Typography fontWeight="bold">
          {t("autoFillModal.selectedCount", {
            count: selectedIds.length,
            max: MAX_SELECTION,
          }) || `Selected ${selectedIds.length} / ${MAX_SELECTION}`}
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent={{ xs: "space-between", md: "center" }}
          sx={{ width: "100%" }}
        >
          {(["easy", "moderate", "hard"] as const).map((preset) => {
            const isActive = activePreset === preset;
            return (
              <Button
                key={preset}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => handlePresetClick(preset)}
                sx={{
                  borderRadius: 999,
                  // minWidth: 140,
                  border: isActive
                    ? "none"
                    : `2px solid ${presetTextColors[preset]}`,
                  color: isActive ? "#fff" : presetTextColors[preset],
                  background: isActive
                    ? presetGradients[preset].background
                    : "transparent",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  boxShadow: isActive ? "0 10px 24px rgba(0,0,0,0.25)" : "none",
                  opacity: isActive ? 1 : 0.85,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: isActive
                      ? presetGradients[preset].hover
                      : "rgba(0,0,0,0.03)",
                    color: isActive ? "#fff" : presetTextColors[preset],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {presetLabels[preset]}
              </Button>
            );
          })}
        </Stack>
      </Stack>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        {selectedIds.length > 0 && (
          <FormControlLabel
            control={
              <Switch
                checked={showUnselected}
                onChange={(event) => setShowUnselected(event.target.checked)}
              />
            }
            label={
              t("autoFillModal.showUnselected") || "Show unselected matches"
            }
          />
        )}
        {/* Sort by difficulty dropdown 
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">
            {t("autoFillModal.sortDifficulty") || "Sort by difficulty"}
          </Typography>
          <Select
            size="small"
            value={difficultySort}
            onChange={(event) =>
              setDifficultySort(event.target.value as DifficultySort)
            }
          >
            <MenuItem value="none">
              {t("autoFillModal.sortDifficultyNone") || "None"}
            </MenuItem>
            <MenuItem value="asc">
              {t("autoFillModal.sortDifficultyAsc") || "Easier first"}
            </MenuItem>
            <MenuItem value="desc">
              {t("autoFillModal.sortDifficultyDesc") || "Harder first"}
            </MenuItem>
          </Select>
        </Stack>
        </Stack>*/}
      </Stack>
      {selectionWarning && (
        <Alert severity="warning" onClose={() => setSelectionWarning(null)}>
          {selectionWarning}
        </Alert>
      )}
      {isLessThanMaxSelection && !lessThan15Dismissed && (
        <Typography variant="body2" color="text.secondary">
          {t("autoFillModal.lessThan15Warning") ||
            "Selecting fewer than 15 matches means the deadline will not be set automatically."}
        </Typography>
      )}
      {isMaxSelection && (
        <Typography
          variant="body2"
          sx={{
            fontStyle: "italic",
            color: "text.secondary",
            px: 0.5,
          }}
        >
          {t("autoFillModal.autoDeadlineInfo") ||
            "Deadline will auto-set to the earliest kickoff. You can adjust it before submitting."}
        </Typography>
      )}
      {championsCount > 0 && (
        <Alert severity="info">
          {t("autoFillModal.championsInfo", {
            count: championsCount,
          }) ||
            (championsCount === 1
              ? "1 Champions League match selected."
              : `${championsCount} Champions League matches selected.`)}
        </Alert>
      )}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ px: 1.5 }}>
                {/* {t("autoFillModal.table.select") || "Select"} */}
              </TableCell>
              {/* <TableCell>
                {t("autoFillModal.table.league") || "League"}
              </TableCell> */}
              {/* <TableCell>{t("autoFillModal.table.date") || "Date"}</TableCell> */}
              <TableCell>{t("autoFillModal.table.match") || "Match"}</TableCell>
              <TableCell>{t("autoFillModal.table.info") || "Info"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedMatches.map((match) => {
              const isSelected = selectedIds.includes(match.matchId);
              const formattedDate = dayjs(match.startTime).format(
                "DD/MM HH:mm"
              );
              const leagueStyle =
                leagueChipStyles[match.leagueId] ?? defaultLeagueChipStyle;
              return (
                <TableRow
                  key={match.matchId}
                  selected={isSelected}
                  hover
                  sx={{
                    opacity: showUnselected || isSelected ? 1 : 0.5,
                  }}
                >
                  <TableCell padding="checkbox" sx={{ px: 1.5 }}>
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => handleToggle(match.matchId)}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="column"
                      spacing={0.5}
                      sx={{ maxWidth: 200, margin: "0 auto" }}
                    >
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
                  <TableCell
                    sx={{
                      textAlign: "center",
                    }}
                  >
                    <Stack direction="column" spacing={0.5}>
                      <Chip
                        label={match.leagueId}
                        size="small"
                        sx={{
                          background: leagueStyle.background,
                          color: leagueStyle.color,
                          fontWeight: 600,
                        }}
                      />
                      {match.isChampionsLeague && (
                        <Chip
                          label="CL"
                          size="small"
                          sx={{
                            background: leagueChipStyles.CL?.background,
                            color: leagueChipStyles.CL?.color,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <Chip
                        label={formattedDate}
                        size="small"
                        sx={{
                          fontWeight: 600,
                        }}
                      />
                      {renderDifficultyChip(match)}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );

  const renderPlenoStep = () => (
    <Stack spacing={2}>
      <Typography>
        {t("autoFillModal.plenoInstructions") ||
          "Choose which of the selected matches will be the Pleno al 15 (it will be placed last)."}
      </Typography>
      {selectionWarning && <Alert severity="warning">{selectionWarning}</Alert>}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ px: 1.5 }}></TableCell>
              <TableCell>{t("autoFillModal.table.match") || "Match"}</TableCell>
              <TableCell>{t("autoFillModal.table.info") || "Info"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedOnly.map((match) => {
              const formattedDate = dayjs(match.startTime).format(
                "DD/MM HH:mm"
              );
              const isPleno = plenoMatchId === match.matchId;
              const leagueStyle =
                leagueChipStyles[match.leagueId] ?? defaultLeagueChipStyle;
              return (
                <TableRow key={match.matchId} selected={isPleno} hover>
                  <TableCell padding="checkbox" sx={{ px: 1.5 }}>
                    <Radio
                      size="small"
                      checked={isPleno}
                      onChange={() => setPlenoMatchId(match.matchId)}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="column"
                      spacing={0.5}
                      sx={{ maxWidth: 200, margin: "0 auto" }}
                    >
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
                  <TableCell
                    sx={{
                      textAlign: "center",
                    }}
                  >
                    <Stack direction="column" spacing={0.5}>
                      <Chip
                        label={match.leagueId}
                        size="small"
                        sx={{
                          background: leagueStyle.background,
                          color: leagueStyle.color,
                          fontWeight: 600,
                        }}
                      />
                      {match.isChampionsLeague && (
                        <Chip
                          label="CL"
                          size="small"
                          sx={{
                            background: leagueChipStyles.CL?.background,
                            color: leagueChipStyles.CL?.color,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <Chip
                        label={formattedDate}
                        size="small"
                        sx={{
                          fontWeight: 600,
                        }}
                      />
                      {renderDifficultyChip(match)}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );

  const title =
    currentStep === "selection"
      ? t("autoFillModal.stepSelectionTitle") || "Select Matches to Auto-fill"
      : t("autoFillModal.stepPlenoTitle") || "Choose Pleno al 15";

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="xl"
      onClose={onClose}
      data-testid="auto-fill-modal"
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
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          background: "linear-gradient(120deg, #0d47a1, #5e35b1)",
          color: "#fff",
          borderBottom: "3px solid rgba(255,255,255,0.25)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </Typography>
        <Tooltip
          title={
            t("autoFillModal.helperText") ||
            "Choose up to 15 matches. Selecting 15 will auto-set the Quinipolo deadline (you can edit it later)."
          }
        >
          <IconButton size="small" sx={{ color: "#fff" }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ minHeight: 400, px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}
      >
        {loading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={300}
            flexDirection="column"
            gap={2}
          >
            <CircularProgress />
            <Typography variant="body2">
              {t("autoFillModal.loadingMatches") ||
                t("loading") ||
                "Loading matches..."}
            </Typography>
          </Box>
        )}
        {!loading && error && <Alert severity="error">{error}</Alert>}
        {!loading && data && (
          <>
            {currentStep === "selection"
              ? renderSelectionStep()
              : renderPlenoStep()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={secondaryActionStyles}>
          {t("autoFillModal.cancel") || "Cancel"}
        </Button>
        {currentStep === "selection" && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={selectedIds.length === 0 || !data}
            sx={primaryActionStyles}
          >
            {t("autoFillModal.next") || "Next"}
          </Button>
        )}
        {currentStep === "pleno" && (
          <>
            <Button
              onClick={() => setCurrentStep("selection")}
              sx={secondaryActionStyles}
            >
              {t("autoFillModal.back") || "Back"}
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              sx={primaryActionStyles}
            >
              {t("autoFillModal.apply") || "Apply Selection"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
