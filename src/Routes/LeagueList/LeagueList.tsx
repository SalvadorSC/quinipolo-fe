import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import styles from "./LeagueList.module.scss";
import { useUser } from "../../Context/UserContext/UserContext";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { apiGet, apiPost, apiPut } from "../../utils/apiUtils";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import LockIcon from "@mui/icons-material/Lock";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import { isSystemAdmin } from "../../utils/moderatorUtils";
import { filterVisibleLeagues } from "../../utils/leagueVisibility";

type LeagueParticipant = {
  user_id: string;
  username: string;
  role: string;
};

type LeaguePetition = {
  userId: string;
  username: string;
  status: string;
  date: string;
};

type LeaguesTypes = {
  // DB fields
  id: string;
  league_name: string;
  created_at?: string;
  created_by?: string;
  tier?: string;
  status?: string;
  is_private: boolean;
  current_participants?: number;
  updated_at?: string;
  description?: string | null;

  // Enriched fields from API
  participants: LeagueParticipant[];
  participantsCount?: number;
  participantPetitions: LeaguePetition[];
  moderatorPetitions?: LeaguePetition[];
  moderatorArray: string[];
  quinipolosToAnswer: any[];
  leaguesToCorrect: any[];

  // Some endpoints (e.g., create) may return camelCase
  isPrivate?: boolean;
};

const LeagueList = () => {
  const navigate = useNavigate();
  const [leagueListData, setLeagueListData] = useState<LeaguesTypes[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();

  const { userData } = useUser();

  // Helper function to check if user is in a league
  const isUserInLeague = (league: LeaguesTypes) => {
    return league.participants.some(
      (participant) => participant.username === userData.username
    );
  };

  // Helper function to check if user has a pending petition
  const hasPendingPetition = (league: LeaguesTypes) => {
    return league.participantPetitions.some(
      (petition) =>
        petition.username === userData.username && petition.status === "pending"
    );
  };

  const fetchLeagueListData = useCallback(async () => {
    // Fetch data logic
    apiGet<LeaguesTypes[]>(`/api/leagues`)
      .then((data) => {
        const filtered = filterVisibleLeagues(
          data as any,
          userData.role
        ) as any;
        setLeagueListData(filtered as any);
      })
      .catch((error) => {
        console.log(error);
        setFeedback({
          message: "Error cargando los datos de la liga",
          severity: "error",
          open: true,
        });
      });
    setLoading(false);
  }, [setFeedback, userData.role]);

  const handleJoinLeague = (league: LeaguesTypes) => {
    // Logic to handle joining a league
    if (league && (isUserInLeague(league) || isSystemAdmin(userData.role))) {
      navigate("/league-dashboard?id=" + league.id);
      return;
    }

    if (league?.is_private) {
      apiPost(`/api/leagues/${league.id}/request-participant`, {
        userId: userData.userId,
        username: userData.username,
      })
        .then((data: any) => {
          setLeagueListData(data);
          setFeedback({
            message: t("requestSent"),
            severity: "success",
            open: true,
          });
        })
        .catch((error) => {
          console.log(error);
          setFeedback({
            message: t("errorJoiningLeague"),
            severity: "error",
            open: true,
          });
        });
      return;
    }

    const originalIndex = leagueListData.findIndex((l) => l.id === league.id);

    if (originalIndex !== -1) {
      apiPut(`/api/leagues/${league.id}/join`, {
        leagueId: league.id,
        username: userData.username,
      })
        .then((data) => {
          setLeagueListData((prevData) => {
            const newData = [...prevData];
            newData[originalIndex].participants.push({
              user_id: userData.userId,
              username: userData.username,
              role: "user",
            });
            return newData;
          });
          setFeedback({
            message: t("joinedLeague"),
            severity: "success",
            open: true,
          });
        })

        .catch((error) => {
          console.log(error);
          setFeedback({
            message: t("errorJoiningLeague"),
            severity: "error",
            open: true,
          });
        });
    }
  };

  const displayLeagues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = leagueListData.filter((league) => {
      if (!query) return true;
      const nameMatch = league.league_name?.toLowerCase().includes(query);
      return Boolean(nameMatch);
    });

    const withMembershipPriority = filtered.slice().sort((a, b) => {
      const aIn = isUserInLeague(a) ? 1 : 0;
      const bIn = isUserInLeague(b) ? 1 : 0;
      if (aIn !== bIn) return bIn - aIn; // in-league first

      const aCount = a.participants?.length ?? 0;
      const bCount = b.participants?.length ?? 0;
      return bCount - aCount; // desc by players
    });

    return withMembershipPriority;
  }, [leagueListData, searchQuery, userData.username]);

  useEffect(() => {
    setLoading(true);
    fetchLeagueListData();
  }, [fetchLeagueListData]);

  return (
    <div className={styles.leagueListContainer}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: 2,
          pt: 4,
          pb: 4,
          borderRadius: "20px",
          marginBottom: "100px",
        }}
      >
        <h1 style={{ marginBottom: 20 }}>{t("leagues")}</h1>
        <div style={{ marginBottom: 16, display: "flex" }}>
          <TextField
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
        {loading || leagueListData.length === 0 ? (
          <CircularProgress sx={{ m: 4 }} />
        ) : (
          <TableContainer
            component={Paper}
            sx={{ boxShadow: "none", maxHeight: 520 }}
          >
            <Table aria-label="simple table" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t("name")}</TableCell>
                  <TableCell align="center">
                    <EmojiPeopleIcon />
                  </TableCell>
                  <TableCell align="center">
                    <LockIcon />
                  </TableCell>
                  <TableCell align="center">
                    <MoreHorizIcon />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayLeagues?.map((league) => (
                  <TableRow
                    key={league.league_name}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      style={{ fontWeight: "bold" }}
                      component="th"
                      scope="row"
                    >
                      {league.league_name}
                    </TableCell>
                    <TableCell
                      style={{ paddingLeft: 0, paddingRight: 0 }}
                      align="center"
                    >
                      {league.participants.length}
                    </TableCell>
                    <TableCell align="left">
                      {league.is_private ? t("private") : t("public")}
                    </TableCell>
                    <TableCell align="left">
                      <Tooltip
                        title={
                          isUserInLeague(league)
                            ? t("goToLeague")
                            : hasPendingPetition(league)
                            ? t("pendingRequest")
                            : t("joinLeague")
                        }
                      >
                        <LoadingButton
                          variant="contained"
                          style={{
                            minWidth: "fit-content",
                            width: "100%",
                            justifyContent: "flex-start",
                            textAlign: "left",
                          }}
                          className={`gradient-primary`}
                          onClick={() => handleJoinLeague(league)}
                          loading={!leagueListData}
                          disabled={hasPendingPetition(league)}
                        >
                          {isUserInLeague(league) ||
                          isSystemAdmin(userData.role)
                            ? t("go")
                            : hasPendingPetition(league)
                            ? t("pending")
                            : t("join")}
                        </LoadingButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );

  // Add more state variables as needed
};

export default LeagueList;
