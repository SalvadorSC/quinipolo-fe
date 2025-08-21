import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { useUser } from "../../Context/UserContext/UserContext";
import { apiGet, apiPatch } from "../../utils/apiUtils";
import { useTranslation } from "react-i18next";
import LanguagePicker from "../../Components/LanguagePicker/LanguagePicker";
import ThemeToggle from "../../Components/ThemeToggle/ThemeToggle";

type LeagueSummary = {
  id: string;
  name: string;
  role: string;
  userRank?: number;
  userPoints?: number;
};

type LeaderboardEntry = {
  username: string;
  nQuinipolosParticipated: number;
  totalPoints: number;
  fullCorrectQuinipolos: number;
};

const Profile: React.FC = () => {
  const { userData, updateUser, signOut } = useUser();
  const { t } = useTranslation();

  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formUsername, setFormUsername] = useState(userData.username || "");
  const [formEmail, setFormEmail] = useState(userData.emailAddress || "");
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const userLeagueRoles = useMemo(() => {
    const map = new Map<string, string>();
    (userData.userLeagues || []).forEach((ul) =>
      map.set(ul.league_id, ul.role)
    );
    return map;
  }, [userData.userLeagues]);

  const fetchLeagues = useCallback(async () => {
    try {
      setIsLoadingLeagues(true);
      const leagueIds = (userData.leagues || []) as unknown as string[];
      const summaries: LeagueSummary[] = await Promise.all(
        leagueIds.map(async (id) => {
          const leagueData: any = await apiGet(`/api/leagues/${id}`);
          const leaderboard: any = await apiGet(
            `/api/leagues/${id}/leaderboard`
          );
          const entries: LeaderboardEntry[] = (
            leaderboard?.participantsLeaderboard || []
          ).map((score: any) => ({
            username: score.username,
            nQuinipolosParticipated: score.nQuinipolosParticipated,
            totalPoints: score.points,
            fullCorrectQuinipolos: score.fullCorrectQuinipolos,
          }));
          const sorted = entries.sort((a, b) => b.totalPoints - a.totalPoints);
          const index = sorted.findIndex(
            (e) => e.username === userData.username
          );
          return {
            id,
            name: leagueData.league_name || leagueData.leagueName || id,
            role: userLeagueRoles.get(id) || "participant",
            userRank: index >= 0 ? index + 1 : undefined,
            userPoints: index >= 0 ? sorted[index].totalPoints : undefined,
          };
        })
      );
      setLeagues(summaries);
    } catch (e) {
      // Best-effort; ignore errors here
    } finally {
      setIsLoadingLeagues(false);
    }
  }, [userData.leagues, userData.username, userLeagueRoles]);

  useEffect(() => {
    if (userData.userId) {
      fetchLeagues();
    }
  }, [userData.userId, fetchLeagues]);

  const openEdit = () => {
    setFormUsername(userData.username || "");
    setFormEmail(userData.emailAddress || "");
    setUsernameError("");
    setIsEditOpen(true);
  };

  const closeEdit = () => setIsEditOpen(false);

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      setUsernameError("");

      // Client-side validation
      if (formUsername.length < 3) {
        setUsernameError("Username must be at least 3 characters long");
        return;
      }

      if (formUsername.length > 15) {
        setUsernameError("Username cannot exceed 15 characters");
        return;
      }

      if (formUsername.toLowerCase().includes("quinipolo")) {
        setUsernameError(t("usernameSecurityError"));
        return;
      }

      const body: any = { username: formUsername, email: formEmail };
      const updated = await apiPatch<{
        id: string;
        username: string;
        email: string;
      }>(`/api/users/me/profile`, body);
      updateUser({ username: updated.username, emailAddress: updated.email });
      setIsEditOpen(false);
    } catch (e: any) {
      // Handle server-side validation errors
      if (e?.response?.data?.error) {
        const errorMessage = e.response.data.error;
        if (
          errorMessage.includes("quinipolo") ||
          errorMessage.includes("already exists")
        ) {
          setUsernameError(errorMessage);
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Mobile-first layout wrapped in MUI Paper (consistent with other pages)
  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        p: window.innerWidth > 400 ? 4 : 2,
        borderRadius: "20px",
      }}
    >
      {/* Add profile title */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "600", color: "primary.main" }}
          >
            @{userData.username}
          </Typography>
          <Button size="small" variant="outlined" onClick={openEdit}>
            {t("edit")}
          </Button>
        </Box>

        <Divider />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Tooltip title={userData.emailAddress}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "80vw",
              }}
            >
              {userData.emailAddress}
            </Typography>
          </Tooltip>
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 1, textAlign: "left", fontWeight: "600" }}
          >
            {t("leagues")}
          </Typography>
          {isLoadingLeagues ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {t("loading")}...
              </Typography>
            </Box>
          ) : (
            <List dense>
              {leagues.map((l) => (
                <ListItem key={l.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={`${l.name}`}
                    secondary={
                      `${t("role")}: ${t(l.role)}` +
                      (l.userRank
                        ? ` • ${t("rank")}: ${l.userRank}${
                            l.userPoints !== undefined
                              ? ` • ${l.userPoints} ${t("points")}`
                              : ""
                          }`
                        : "")
                    }
                  />
                </ListItem>
              ))}
              {leagues.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t("noLeagues")}
                </Typography>
              )}
            </List>
          )}
        </Box>

        <Box>
          <Typography
            variant="h6"
            sx={{ mb: 1, textAlign: "left", fontWeight: "600" }}
          >
            {t("preferences")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <ThemeToggle mode="button" />
            </Box>
            <LanguagePicker inDrawer />
          </Box>
        </Box>

        <Box>
          <Button color="error" variant="outlined" onClick={signOut}>
            {t("signOut")}
          </Button>
        </Box>

        <Dialog open={isEditOpen} onClose={closeEdit} fullWidth maxWidth="xs">
          <DialogTitle>{t("editProfile")}</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                label={t("username")}
                value={formUsername}
                onChange={(e) => {
                  setFormUsername(e.target.value);
                  setUsernameError("");
                }}
                error={!!usernameError}
                helperText={usernameError}
                fullWidth
              />
              <TextField
                label={t("email")}
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                type="email"
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEdit}>{t("cancel")}</Button>
            <Button
              onClick={saveProfile}
              variant="contained"
              disabled={isSaving}
            >
              {t("save")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Paper>
  );
};

export default Profile;
