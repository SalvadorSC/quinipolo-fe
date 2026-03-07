import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Drawer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { apiGet, apiPatch, apiPost } from "../../utils/apiUtils";

type TeamFull = {
  id: string;
  name: string;
  sport: string;
  gender: string | null;
  alias: string[];
  team_type: string | null;
  created_at: string;
  logoStatus: { resolved: boolean; logoFile?: string; closestMatch?: string | null };
};

type SortableColumn = "name" | "gender" | "aliases" | "logo" | "created_at";
type SortDirection = "asc" | "desc";

type DuplicateGroup = {
  canonicalId: string;
  canonicalName: string;
  duplicates: Array<{ id: string; name: string }>;
};

const KNOWN_COUNTRIES = [
  "España",
  "ESPAÑA",
  "España F",
  "Francia",
  "FRANCIA",
  "Francia F",
  "Grecia",
  "GRECIA",
  "Grecia F",
  "Hungria",
  "HUNGRIA",
  "Hungria F",
  "Italia",
  "ITALIA",
  "Italia F",
  "Alemania",
  "Croacia",
  "Croacia F",
  "Serbia",
  "SERBIA",
  "Rumania",
  "RUMANIA",
  "Rumania F",
  "Portugal",
  "Portugal F",
  "Paises Bajos",
  "PAISES BAJOS",
  "Paises Bajos F",
  "Holanda F",
  "Gran Bretaña F",
  "Israel",
  "ISRAEL",
  "Eslovaquia",
  "ESLOVAQUIA",
  "Georgia",
  "GEORGIA",
  "Montenegro",
  "MONTENEGRO",
];

function isLikelyCountry(name: string): boolean {
  return KNOWN_COUNTRIES.some((c) => c.toLowerCase() === name.toLowerCase());
}

const TeamsCuratorPage = () => {
  const [teams, setTeams] = useState<TeamFull[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState(0);
  const [search, setSearch] = useState("");
  const [editTeam, setEditTeam] = useState<TeamFull | null>(null);
  const [editForm, setEditForm] = useState<{ gender: string; sport: string; aliases: string[] }>({
    gender: "",
    sport: "",
    aliases: [],
  });
  const [newAlias, setNewAlias] = useState("");
  const [saving, setSaving] = useState(false);
  const [renameDialog, setRenameDialog] = useState<{ newName: string } | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [mergeDialog, setMergeDialog] = useState<{
    open: boolean;
    canonical: { id: string; name: string };
    duplicate: { id: string; name: string };
    quinipoloCount?: number;
  } | null>(null);
  const [merging, setMerging] = useState(false);
  const [sortBy, setSortBy] = useState<SortableColumn>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const handleSort = (column: SortableColumn) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir(column === "created_at" ? "desc" : "asc");
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamsRes, dupRes] = await Promise.all([
        apiGet<TeamFull[]>("/api/teams/waterpolo/full"),
        apiGet<DuplicateGroup[]>("/api/teams/waterpolo/duplicates"),
      ]);
      setTeams(teamsRes ?? []);
      setDuplicateGroups(dupRes ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTeams = teams
    .filter((t) => {
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.alias || []).some((a) => a.toLowerCase().includes(search.toLowerCase()));
      if (!matchSearch) return false;
      if (filterTab === 1) return t.team_type === "country" || isLikelyCountry(t.name);
      if (filterTab === 2) return t.team_type === "club" || (!t.team_type && !isLikelyCountry(t.name));
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "gender":
          return dir * (a.gender ?? "").localeCompare(b.gender ?? "");
        case "aliases":
          return dir * ((a.alias?.length ?? 0) - (b.alias?.length ?? 0));
        case "logo": {
          const aScore = a.logoStatus?.resolved ? 2 : a.logoStatus?.closestMatch ? 1 : 0;
          const bScore = b.logoStatus?.resolved ? 2 : b.logoStatus?.closestMatch ? 1 : 0;
          return dir * (aScore - bScore);
        }
        case "created_at":
          return dir * (a.created_at ?? "").localeCompare(b.created_at ?? "");
        default:
          return 0;
      }
    });

  const handleEdit = (team: TeamFull) => {
    setEditTeam(team);
    setEditForm({
      gender: team.gender ?? "",
      sport: team.sport ?? "waterpolo",
      aliases: Array.isArray(team.alias) ? [...team.alias] : [],
    });
    setNewAlias("");
    setRenameInput(team.name);
    setRenameDialog(null);
  };

  const handleSaveEdit = async (overrideNewName?: string) => {
    if (!editTeam) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        gender: editForm.gender || null,
        sport: editForm.sport,
        alias: editForm.aliases,
      };
      if (overrideNewName) {
        payload.name = overrideNewName;
      }
      await apiPatch("/api/teams/" + editTeam.id, payload);
      setEditTeam(null);
      setRenameDialog(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    } finally {
      setSaving(false);
    }
  };

  const handleRenameConfirm = () => {
    if (!editTeam || !renameDialog) return;
    const oldName = editTeam.name;
    const aliases = editForm.aliases.includes(oldName)
      ? editForm.aliases
      : [...editForm.aliases, oldName];
    setEditForm((f) => ({ ...f, aliases }));
    handleSaveEdit(renameDialog.newName);
  };

  const openMergeDialog = async (
    canonical: { id: string; name: string },
    duplicate: { id: string; name: string }
  ) => {
    try {
      const res = await apiGet<{ count: number }>(
        "/api/teams/quinipolo-count?teamName=" + encodeURIComponent(duplicate.name)
      );
      setMergeDialog({
        open: true,
        canonical,
        duplicate,
        quinipoloCount: res?.count ?? 0,
      });
    } catch {
      setMergeDialog({ open: true, canonical, duplicate });
    }
  };

  const handleMerge = async () => {
    if (!mergeDialog) return;
    setMerging(true);
    try {
      await apiPost("/api/teams/merge", {
        canonicalId: mergeDialog.canonical.id,
        duplicateId: mergeDialog.duplicate.id,
      });
      setMergeDialog(null);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to merge teams");
    } finally {
      setMerging(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Teams Curator
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Analyze teams, detect duplicates, merge into aliases, edit metadata (gender, team_type).
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Button component={RouterLink} to="/graphics/teams" size="small">
          Logo audit
        </Button>
        <Button
          size="small"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Refresh"}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Tabs value={filterTab} onChange={(_, v) => setFilterTab(v)} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Countries" />
        <Tab label="Clubs" />
      </Tabs>

      <TextField
        placeholder="Search teams..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, minWidth: 200 }}
      />

      {duplicateGroups.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Duplicate groups ({duplicateGroups.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {duplicateGroups.map((g) => (
              <Paper key={g.canonicalId} sx={{ p: 2, minWidth: 280 }}>
                <Typography variant="body2" fontWeight="bold">
                  {g.canonicalName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  + {g.duplicates.map((d) => d.name).join(", ")}
                </Typography>
                <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {g.duplicates.map((d) => (
                    <Button
                      key={d.id}
                      size="small"
                      color="primary"
                      onClick={() =>
                        openMergeDialog(
                          { id: g.canonicalId, name: g.canonicalName },
                          { id: d.id, name: d.name }
                        )
                      }
                    >
                      Merge {d.name} →
                    </Button>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Teams ({filteredTeams.length})
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {([
                ["name", "Name"],
                ["gender", "Gender"],
                ["aliases", "Aliases"],
                ["logo", "Logo"],
                ["created_at", "Created"],
              ] as [SortableColumn, string][]).map(([col, label]) => (
                <TableCell key={col} sortDirection={sortBy === col ? sortDir : false}>
                  <TableSortLabel
                    active={sortBy === col}
                    direction={sortBy === col ? sortDir : "asc"}
                    onClick={() => handleSort(col)}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeams.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.gender || "-"}</TableCell>
                <TableCell>
                  {(t.alias || []).length > 0
                    ? (t.alias || []).map((a) => (
                        <Chip key={a} label={a} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))
                    : "-"}
                </TableCell>
                <TableCell>
                  {t.logoStatus?.resolved ? (
                    <Chip size="small" label={t.logoStatus.logoFile} color="success" />
                  ) : t.logoStatus?.closestMatch ? (
                    <Chip size="small" label={`~${t.logoStatus.closestMatch}`} color="warning" />
                  ) : (
                    <Chip size="small" label="missing" color="error" />
                  )}
                </TableCell>
                <TableCell>
                  {t.created_at
                    ? new Date(t.created_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleEdit(t)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Drawer anchor="right" open={!!editTeam} onClose={() => setEditTeam(null)}>
        <Box sx={{ width: 360, p: 2 }}>
          {editTeam && (
            <>
              <Typography variant="h6" gutterBottom>
                Edit {editTeam.name}
              </Typography>
              <TextField
                label="Team name"
                size="small"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              {renameInput.trim() && renameInput.trim() !== editTeam.name && (
                <Button
                  size="small"
                  color="warning"
                  sx={{ mb: 2 }}
                  onClick={() => setRenameDialog({ newName: renameInput.trim() })}
                >
                  Rename to "{renameInput.trim()}"
                </Button>
              )}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Sport</InputLabel>
                <Select
                  value={editForm.sport}
                  label="Sport"
                  onChange={(e) => setEditForm((f) => ({ ...f, sport: e.target.value }))}
                >
                  <MenuItem value="waterpolo">Waterpolo</MenuItem>
                  <MenuItem value="football">Football</MenuItem>
                  <MenuItem value="basketball">Basketball</MenuItem>
                  <MenuItem value="handball">Handball</MenuItem>
                  <MenuItem value="tennis">Tennis</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={editForm.gender}
                  label="Gender"
                  onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                >
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="m">M</MenuItem>
                  <MenuItem value="f">F</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Aliases ({editForm.aliases.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                {editForm.aliases.map((alias) => (
                  <Chip
                    key={alias}
                    label={alias}
                    size="small"
                    onDelete={() =>
                      setEditForm((f) => ({
                        ...f,
                        aliases: f.aliases.filter((a) => a !== alias),
                      }))
                    }
                  />
                ))}
              </Box>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="New alias"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAlias.trim()) {
                      e.preventDefault();
                      const trimmed = newAlias.trim();
                      if (!editForm.aliases.includes(trimmed)) {
                        setEditForm((f) => ({ ...f, aliases: [...f.aliases, trimmed] }));
                      }
                      setNewAlias("");
                    }
                  }}
                  fullWidth
                />
                <Button
                  size="small"
                  disabled={!newAlias.trim()}
                  onClick={() => {
                    const trimmed = newAlias.trim();
                    if (trimmed && !editForm.aliases.includes(trimmed)) {
                      setEditForm((f) => ({ ...f, aliases: [...f.aliases, trimmed] }));
                    }
                    setNewAlias("");
                  }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={() => handleSaveEdit()} disabled={saving}>
                  {saving ? <CircularProgress size={24} /> : "Save"}
                </Button>
                <Button onClick={() => setEditTeam(null)}>Cancel</Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      <Dialog open={!!renameDialog} onClose={() => setRenameDialog(null)}>
        {renameDialog && editTeam && (
          <>
            <DialogTitle>Rename team</DialogTitle>
            <DialogContent>
              <Typography>
                Rename <strong>{editTeam.name}</strong> to{" "}
                <strong>{renameDialog.newName}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                The current name "{editTeam.name}" will be added as an alias so
                existing quinipolos that reference it will still match.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRenameDialog(null)}>Cancel</Button>
              <Button
                variant="contained"
                color="warning"
                onClick={handleRenameConfirm}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : "Rename"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={!!mergeDialog} onClose={() => setMergeDialog(null)}>
        {mergeDialog && (
          <>
            <DialogTitle>Merge teams</DialogTitle>
            <DialogContent>
              <Typography>
                Merge <strong>{mergeDialog.duplicate.name}</strong> into{" "}
                <strong>{mergeDialog.canonical.name}</strong>?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {mergeDialog.canonical.name} will gain {mergeDialog.duplicate.name} as an alias.
                {mergeDialog.quinipoloCount !== undefined && (
                  <> {mergeDialog.quinipoloCount} quinipolo(s) reference this team.</>
                )}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setMergeDialog(null)}>Cancel</Button>
              <Button variant="contained" onClick={handleMerge} disabled={merging}>
                {merging ? <CircularProgress size={24} /> : "Merge"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TeamsCuratorPage;
