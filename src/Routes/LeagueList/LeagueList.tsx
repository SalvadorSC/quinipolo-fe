import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import styles from "./LeagueList.module.scss";
import { useUser } from "../../Context/UserContext/UserContext";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { apiGet, apiPost, apiPut } from "../../utils/apiUtils";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import LockIcon from "@mui/icons-material/Lock";
import { useTranslation } from "react-i18next";

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
  const [open, setOpen] = useState<boolean>(true);
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
      (petition) => petition.username === userData.username
    );
  };

  const participantIsInMoreThan2Leagues =
    leagueListData.filter((league) => isUserInLeague(league)).length > 2 &&
    userData.role === "user";

  const fetchLeagueListData = useCallback(async () => {
    // Fetch data logic
    apiGet<LeaguesTypes[]>(`/api/leagues`)
      .then((data) => {
        setLeagueListData(data);
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
  }, [setFeedback]);

  const handleJoinLeague = (index: number) => {
    // Logic to handle joining a league
    if (leagueListData?.[index] && isUserInLeague(leagueListData[index])) {
      navigate("/league-dashboard?id=" + leagueListData[index].id);
    } else if (leagueListData?.[index]?.is_private) {
      apiPost(
        `/api/leagues/${leagueListData?.[index].id}/request-participant`,
        {
          userId: userData.userId,
          username: userData.username,
        }
      )
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
    } else {
      apiPut(`/api/leagues/${leagueListData[index].id}/join`, {
        leagueId: leagueListData[index].id,
        username: userData.username,
      })
        .then((data) => {
          setLeagueListData((prevData) => {
            const newData = [...prevData];
            newData[index].participants.push({
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
        {loading || leagueListData.length === 0 ? (
          <CircularProgress sx={{ m: 4 }} />
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table aria-label="simple table">
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
                {leagueListData?.map((league) => (
                  <TableRow
                    key={league.league_name}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
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
                    <TableCell align="center">
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
                          style={{ width: "80px", minWidth: "fit-content" }}
                          className={`gradient-primary`}
                          onClick={() =>
                            handleJoinLeague(leagueListData?.indexOf(league))
                          }
                          loading={!leagueListData}
                          disabled={hasPendingPetition(league)}
                        >
                          {isUserInLeague(league)
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
