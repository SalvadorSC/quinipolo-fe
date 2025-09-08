import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Paper, Stack, Box } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { LoadingButton } from "@mui/lab";
import styles from "./LeagueDashboard.module.scss";
import QuinipolosToAnswer from "../../Components/QuinipolosToAnswer/QuinipolosToAnswer";
import { useUser } from "../../Context/UserContext/UserContext";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { apiGet, apiPost, apiPut } from "../../utils/apiUtils";
import Leaderboard from "../../Components/Leaderboard/Leaderboard";
import Stats from "../../Components/Stats/Stats";
import LeagueInfo from "../../Components/LeagueInfo/LeagueInfo";
import LeagueEditModal from "../../Components/LeagueEditModal/LeagueEditModal";
import ModeratorManagementModal from "../../Components/ModeratorManagementModal/ModeratorManagementModal";
import { Tabs, TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import ActionRequests from "./ActionRequests";
import { isSystemAdmin } from "../../utils/moderatorUtils";

export type LeaguesTypes = {
  quinipolosToAnswer: any[];
  leaguesToCorrect: any[];
  moderatorArray: string[];
  league_name: string;
  isPrivate: boolean;
  id: string;
  created_at?: string;
  created_by?: string;
  creator?: {
    username: string;
    full_name?: string;
  };
  description?: string;
  moderatorPetitions: {
    userId: string;
    username: string;
    date: Date;
    _id: string;
    status: "pending" | "accepted" | "rejected" | "cancelled";
  }[];
  participantPetitions: {
    userId: string;
    username: string;
    date: Date;
    _id: string;
    status: "pending" | "accepted" | "rejected" | "cancelled";
  }[];
  participants: {
    user_id: string;
    username: string;
    role: string;
  }[];
};

type LeaderboardScore = {
  username: string;
  nQuinipolosParticipated: number;
  points: number;
  fullCorrectQuinipolos: number;
};

type TransformedLeaderboardScore = {
  username: string;
  nQuinipolosParticipated: number;
  totalPoints: number;
  fullCorrectQuinipolos: number;
};

const LeagueDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [leagueData, setLeagueData] = useState<LeaguesTypes>({
    quinipolosToAnswer: [],
    leaguesToCorrect: [],
    moderatorArray: [],
    league_name: "",
    id: "",
    moderatorPetitions: [],
    participantPetitions: [],
    participants: [],
    isPrivate: false,
  });
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSavingLeague, setIsSavingLeague] = useState<boolean>(false);
  const [isModeratorModalOpen, setIsModeratorModalOpen] =
    useState<boolean>(false);
  const queryParams = new URLSearchParams(window.location.search);
  const leagueId = queryParams.get("id");
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();

  const { userData } = useUser();

  const getLeagueData = async () => {
    apiGet(`/api/leagues/${leagueId}`)
      .then((data: any) => {
        setLeagueData({
          quinipolosToAnswer: data.quinipolosToAnswer,
          leaguesToCorrect: data.leaguesToCorrect,
          moderatorArray: data.moderatorArray,
          league_name: data.league_name,
          id: data.id,
          created_at: data.created_at,
          created_by: data.created_by,
          creator: data.creator,
          description: data.description,
          moderatorPetitions: data.moderatorPetitions,
          participantPetitions: data.participantPetitions,
          participants: data.participants,
          isPrivate:
            data.isPrivate !== undefined
              ? data.isPrivate
              : data.is_private !== undefined
              ? data.is_private
              : false,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setFeedback({
          message: t("errorLoadingLeagueData"),
          severity: "error",
          open: true,
        });
        setLoading(false);
      });
  };

  const getLeagueLeaderBoardData = async (retries = 0) => {
    apiGet(`/api/leagues/${leagueId}/leaderboard`)
      .then((data: any) => {
        const transformedLeaderboardData = data.participantsLeaderboard.map(
          (score: LeaderboardScore) => {
            return {
              username: score.username,
              nQuinipolosParticipated: score.nQuinipolosParticipated,
              totalPoints: score.points,
              fullCorrectQuinipolos: score.fullCorrectQuinipolos,
            };
          }
        );
        const sortedScores = transformedLeaderboardData.sort(
          (a: TransformedLeaderboardScore, b: TransformedLeaderboardScore) =>
            b.totalPoints - a.totalPoints
        );
        setLeaderboardData(sortedScores);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setFeedback({
          message: "Error cargando los datos de la liga",
          severity: "error",
          open: true,
        });
        setLoading(false);
      });
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!userData || userData.username === "" || hasFetched.current) {
      if (!userData || userData.username === "") navigate("/sign-in");
      return;
    }
    hasFetched.current = true;
    setLoading(true);
    getLeagueData();
    getLeagueLeaderBoardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData.username]);

  // Derived value for moderator status
  const isUserModeratorInThisLeague =
    !!leagueData.participants.find(
      (p) =>
        p.username === userData.username &&
        p.role &&
        p.role.toLowerCase() === "moderator"
    ) || isSystemAdmin(userData.role);

  // Derived value for creator status
  const isUserCreator = leagueData.created_by === userData.userId;

  // Debug: Find the specific participant entry for current user
  const currentUserParticipant = leagueData.participants.find(
    (p) => p.username === userData.username
  );

  const handleSolicitarPermisos = () => {
    setLoading(true);
    // set feedback on success and on error
    apiPost(`/api/leagues/${leagueId}/request-moderator`, {
      userId: userData.userId,
      username: userData.username,
    })
      .then(() => {
        setFeedback({
          message: t("success"),
          severity: "success",
          open: true,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setFeedback({
          message: t("error"),
          severity: "error",
          open: true,
        });
        setLoading(false);
      });
  };

  const handleBasicActionButtonClick = () => {
    if (!isUserModeratorInThisLeague) {
      handleSolicitarPermisos();
      return;
    }

    // Logic to handle creation of new Quinipolo
    navigate(`/crear-quinipolo?leagueId=${leagueId}`);
  };

  const handleOpenEditLeague = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditLeague = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveLeagueEdits = async (data: {
    leagueName: string;
    description?: string;
  }) => {
    try {
      setIsSavingLeague(true);
      await apiPut(`/api/leagues/${leagueId}`, { ...data });
      setLeagueData((prev) => ({
        ...prev,
        league_name: data.leagueName || prev.league_name,
        description:
          data.description !== undefined ? data.description : prev.description,
      }));
      setFeedback({ message: t("success"), severity: "success", open: true });
      setIsEditModalOpen(false);
    } catch (e) {
      console.error(e);
      setFeedback({ message: t("error"), severity: "error", open: true });
    } finally {
      setIsSavingLeague(false);
    }
  };

  const handleOpenManageModerators = () => {
    setIsModeratorModalOpen(true);
  };

  const handleCloseManageModerators = () => {
    setIsModeratorModalOpen(false);
  };

  const handleSaveModerators = async (moderatorIds: string[]) => {
    try {
      // TODO: Implement API call to update moderator roles
      // For now, just update the local state optimistically
      setLeagueData((prev) => ({
        ...prev,
        participants: prev.participants.map((p) => ({
          ...p,
          role: moderatorIds.includes(p.user_id) ? "moderator" : "participant",
        })),
      }));
      setFeedback({ message: t("success"), severity: "success", open: true });
      setIsModeratorModalOpen(false);
    } catch (e) {
      console.error(e);
      setFeedback({ message: t("error"), severity: "error", open: true });
    }
  };

  const sortedLeaderboardData = useMemo(() => {
    return leaderboardData
      .slice()
      .sort(
        (a: TransformedLeaderboardScore, b: TransformedLeaderboardScore) =>
          b.totalPoints - a.totalPoints
      );
  }, [leaderboardData]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: t("points"),
      children: <Leaderboard sortedResults={sortedLeaderboardData} />, // use memoized data
    },
    {
      key: "2",
      label: t("stats"),
      children: <Stats results={leaderboardData} />,
    },
    {
      key: "3",
      label: t("info"),
      children: (
        <LeagueInfo
          leagueData={leagueData}
          isUserModerator={isUserModeratorInThisLeague}
          isUserCreator={isUserCreator}
          onEditLeague={handleOpenEditLeague}
          onManageModerators={handleOpenManageModerators}
        />
      ),
    },
  ];

  return (
    <div className={styles.leagueDashboardContainer}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: 4,
          borderRadius: "20px",
          marginBottom: "100px",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                gap: 12,
              }}
            >
              <h1 className={styles.leagueTitle}>{leagueData.league_name}</h1>
              {isUserModeratorInThisLeague && (
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <LoadingButton
                    size="small"
                    variant="contained"
                    onClick={handleBasicActionButtonClick}
                    loading={!leagueData || loading}
                  >
                    {t("createQuinipolo")}
                  </LoadingButton>
                </Box>
              )}
            </div>

            <QuinipolosToAnswer
              wrapperLoading={loading}
              leagueId={leagueId!}
              appLocation="league-dashboard"
            />
            <Stack>
              <Tabs defaultActiveKey="1" items={items} />
            </Stack>
            {isUserModeratorInThisLeague ? (
              <>
                <h2 className={styles.actionsTitle}>{t("actions")}</h2>
                <hr style={{ marginBottom: 16 }} />
                <ActionRequests
                  leagueId={leagueId!}
                  leagueData={leagueData}
                  setLeagueData={setLeagueData}
                  onAfterChange={() => {
                    // Refresh league and leaderboard after petitions change
                    getLeagueLeaderBoardData();
                    getLeagueData();
                  }}
                />

                <Box
                  sx={{
                    position: "sticky",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    pt: 1,
                    pb: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
                    mt: 2,
                    px: 2,
                    display: { xs: "block", md: "none" },
                    zIndex: 1,
                  }}
                >
                  <LoadingButton
                    fullWidth
                    variant="contained"
                    onClick={handleBasicActionButtonClick}
                    loading={!leagueData || loading}
                    startIcon={<AddRoundedIcon />}
                    className={styles.stickyCtaButton}
                    classes={{
                      root: `${styles.stickyCtaButton} gradient-primary`,
                    }}
                  >
                    {t("createQuinipolo")}
                  </LoadingButton>
                </Box>
              </>
            ) : null}
          </>
        )}
      </Paper>
      <LeagueEditModal
        open={isEditModalOpen}
        initialName={leagueData.league_name}
        initialDescription={leagueData.description}
        isSaving={isSavingLeague}
        onClose={handleCloseEditLeague}
        onSave={handleSaveLeagueEdits}
      />
      <ModeratorManagementModal
        open={isModeratorModalOpen}
        participants={leagueData.participants}
        creatorId={leagueData.created_by}
        onClose={handleCloseManageModerators}
        onSave={handleSaveModerators}
      />
    </div>
  );

  // Add more state variables as needed
};

export default LeagueDashboard;
