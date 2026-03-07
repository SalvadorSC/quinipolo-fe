import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Link } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../../utils/apiUtils";
import { config } from "../../utils/config";

const STORAGE_KEY = "logo-mapper-needs-revision";

function extractHexFromFilename(filename: string): string | null {
  const match = filename.match(/_([0-9A-Fa-f]{6})(?:\.[^.]+)?$/);
  return match ? `#${match[1].toUpperCase()}` : null;
}

function extractBaseName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base
    .replace(/_[0-9A-Fa-f]{6}$/i, "")
    .replace(/_\d+x\d+$/i, "")
    .toUpperCase();
}

function loadNeedsRevision(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNeedsRevision(data: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

type LogosResponse = { logos: string[] };
type RenameResponse = { success: boolean; filename: string };

const LogoMapperPage = () => {
  const [logos, setLogos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("#FFFFFF");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [needsRevision, setNeedsRevision] =
    useState<Record<string, boolean>>(loadNeedsRevision);
  const [error, setError] = useState<string | null>(null);

  const similarGroups = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const f of logos) {
      const base = extractBaseName(f);
      const list = groups.get(base) ?? [];
      list.push(f);
      groups.set(base, list);
    }
    return groups;
  }, [logos]);

  const duplicateLogos = useMemo(
    () => logos.filter((f) => (similarGroups.get(extractBaseName(f))?.length ?? 0) > 1),
    [logos, similarGroups]
  );

  const displayLogos = useMemo(() => {
    let list = logos;
    if (showFlaggedOnly) list = list.filter((f) => needsRevision[f]);
    if (showDuplicatesOnly) list = list.filter((f) => duplicateLogos.includes(f));
    return list;
  }, [logos, showFlaggedOnly, showDuplicatesOnly, needsRevision, duplicateLogos]);

  const fetchLogos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<LogosResponse>("/api/logo-mapper/logos");
      setLogos(res.logos || []);
      setCurrentIndex(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load logos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  useEffect(() => {
    setCurrentIndex((i) =>
      displayLogos.length === 0 ? 0 : Math.min(i, displayLogos.length - 1),
    );
  }, [showFlaggedOnly, showDuplicatesOnly, displayLogos.length]);

  const currentFilename = displayLogos[currentIndex] ?? null;
  const imageUrl = currentFilename
    ? `${config.apiBaseUrl}/api/logo-mapper/logos/${encodeURIComponent(
        currentFilename,
      )}/image`
    : null;

  useEffect(() => {
    if (currentFilename) {
      const hex = extractHexFromFilename(currentFilename);
      setSelectedColor(hex || "#FFFFFF");
    }
  }, [currentFilename]);

  const handleNeedsRevisionChange = (checked: boolean) => {
    if (!currentFilename) return;
    const next = { ...needsRevision, [currentFilename]: checked };
    setNeedsRevision(next);
    saveNeedsRevision(next);
  };

  const handleSave = async () => {
    if (!currentFilename) return;
    const hex = selectedColor.replace(/^#/, "");
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      setError("Invalid color (use 6 hex chars)");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiPost<RenameResponse>(
        "/api/logo-mapper/logos/rename",
        {
          filename: currentFilename,
          hex,
        },
      );
      const newFilename = res.filename;
      const newLogos = [...logos];
      const idxInFull = logos.indexOf(currentFilename);
      if (idxInFull >= 0) newLogos[idxInFull] = newFilename;
      setLogos(newLogos);
      const nextRevision = { ...needsRevision };
      delete nextRevision[currentFilename];
      nextRevision[newFilename] = needsRevision[currentFilename] ?? false;
      setNeedsRevision(nextRevision);
      saveNeedsRevision(nextRevision);
      setCurrentIndex((i) => Math.min(displayLogos.length - 1, i + 1));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to rename logo");
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setCurrentIndex((i) => Math.min(displayLogos.length - 1, i + 1));
  };

  const handleDelete = async () => {
    if (!currentFilename) return;
    if (!window.confirm(`Delete ${currentFilename}?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await apiDelete(
        `/api/logo-mapper/logos/${encodeURIComponent(currentFilename)}`,
      );
      const newLogos = logos.filter((f) => f !== currentFilename);
      setLogos(newLogos);
      const nextRevision = { ...needsRevision };
      delete nextRevision[currentFilename];
      setNeedsRevision(nextRevision);
      saveNeedsRevision(nextRevision);
      let newDisplay = newLogos;
      if (showFlaggedOnly) newDisplay = newDisplay.filter((f) => nextRevision[f]);
      if (showDuplicatesOnly) {
        const newGroups = new Map<string, string[]>();
        for (const f of newDisplay) {
          const base = extractBaseName(f);
          const list = newGroups.get(base) ?? [];
          list.push(f);
          newGroups.set(base, list);
        }
        newDisplay = newDisplay.filter((f) => (newGroups.get(extractBaseName(f))?.length ?? 0) > 1);
      }
      setCurrentIndex((i) => Math.min(i, Math.max(0, newDisplay.length - 1)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete logo");
    } finally {
      setDeleting(false);
    }
  };

  const handleNextDuplicate = () => {
    const start = currentIndex + 1;
    for (let i = start; i < displayLogos.length; i++) {
      if ((similarGroups.get(extractBaseName(displayLogos[i]))?.length ?? 0) > 1) {
        setCurrentIndex(i);
        return;
      }
    }
    for (let i = 0; i < currentIndex; i++) {
      if ((similarGroups.get(extractBaseName(displayLogos[i]))?.length ?? 0) > 1) {
        setCurrentIndex(i);
        return;
      }
    }
  };

  const handleNextFlagged = () => {
    const start = currentIndex + 1;
    for (let i = start; i < displayLogos.length; i++) {
      if (needsRevision[displayLogos[i]]) {
        setCurrentIndex(i);
        return;
      }
    }
    for (let i = 0; i < currentIndex; i++) {
      if (needsRevision[displayLogos[i]]) {
        setCurrentIndex(i);
        return;
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h5" gutterBottom>
          Logo Mapper
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Assign background colors to logos. Saves as TEAM_WxH_hex.png where WxH
          are the actual image dimensions (e.g. AESE_512x512_3431b4.png).
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
          <Button
            component={Link}
            to="/graphics"
            size="small"
            variant="contained"
          >
            ← Graphics
          </Button>
          <Button
            component={Link}
            to="/teams-curator"
            size="small"
            variant="contained"
          >
            Teams curator
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {logos.length === 0 ? (
          <Typography color="text.secondary">No logos found.</Typography>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showFlaggedOnly}
                    onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                  />
                }
                label={`Flagged only (${Object.values(needsRevision).filter(Boolean).length})`}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showDuplicatesOnly}
                    onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
                  />
                }
                label={`Similar names (${duplicateLogos.length})`}
              />
              <Button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                variant="contained"
              >
                Prev
              </Button>
              <Typography variant="body1">
                {currentIndex + 1} / {displayLogos.length}
              </Typography>
              <Button
                onClick={handleNext}
                disabled={currentIndex === displayLogos.length - 1}
                variant="contained"
              >
                Next
              </Button>
              <Button onClick={handleNextFlagged} variant="contained">
                Next flagged
              </Button>
              <Button onClick={handleNextDuplicate} variant="contained">
                Next duplicate
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {currentFilename}
              </Typography>
              {currentFilename && (() => {
                const siblings = similarGroups.get(extractBaseName(currentFilename)) ?? [];
                if (siblings.length <= 1) return null;
                return (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Variants ({siblings.length}): {siblings.join(", ")}
                  </Typography>
                );
              })()}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: "20%",
                  overflow: "hidden",
                  bgcolor: selectedColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #666",
                  padding: 2,
                }}
              >
                {imageUrl && (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt={currentFilename ?? ""}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body2">BG color:</Typography>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: 48, height: 32, cursor: "pointer" }}
                />
                <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                  {selectedColor}
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={needsRevision[currentFilename ?? ""] ?? false}
                    onChange={(e) =>
                      handleNeedsRevisionChange(e.target.checked)
                    }
                  />
                }
                label="Needs revision"
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Save (rename file)"
                  )}
                </Button>
                <Button
                  color="error"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <CircularProgress size={24} /> : "Delete"}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Card>
  );
};

export default LogoMapperPage;
