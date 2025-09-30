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
import LeagueIconEditModal from "../../Components/LeagueIconEditModal/LeagueIconEditModal";
import ModeratorManagementModal from "../../Components/ModeratorManagementModal/ModeratorManagementModal";
import ShareLinkModal from "../../Components/ShareLinkModal/ShareLinkModal";
import { Tabs, TabsProps } from "antd";
import { useTranslation } from "react-i18next";
import ActionRequests from "./ActionRequests";
import { isSystemModerator } from "../../utils/moderatorUtils";
import LeagueIconBadge from "../../Components/LeagueIconBadge/LeagueIconBadge";

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
  icon_style?: {
    icon?: string;
    icon_color?: string;
    accent_color?: string;
  };
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
  const [participantPetitions, setParticipantPetitions] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSavingLeague, setIsSavingLeague] = useState<boolean>(false);
  const [isModeratorModalOpen, setIsModeratorModalOpen] =
    useState<boolean>(false);
  const [isShareLinkModalOpen, setIsShareLinkModalOpen] =
    useState<boolean>(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState<boolean>(false);
  const queryParams = new URLSearchParams(window.location.search);
  const leagueId = queryParams.get("id");
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();

  const { userData } = useUser();

  const getLeagueData = async () => {
    apiGet(`/api/leagues/${leagueId}`, { cache: { ttlMs: 60000 } })
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
          icon_style: data.icon_style,
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
        // Update separate petition states
        setParticipantPetitions(data.participantPetitions || []);
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
    apiGet(`/api/leagues/${leagueId}/leaderboard`, { cache: { ttlMs: 30000 } })
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
    ) || isSystemModerator(userData.role);

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

  const handleOpenEditIcon = () => {
    setIsIconModalOpen(true);
  };

  const handleCloseEditIcon = () => {
    setIsIconModalOpen(false);
  };

  const handleSaveLeagueEdits = async (data: {
    leagueName: string;
    description?: string;
    icon_style?: {
      icon?: string;
      accent_color?: string;
      icon_color?: string;
    };
  }) => {
    try {
      setIsSavingLeague(true);
      await apiPut(`/api/leagues/${leagueId}`, { ...data });
      setLeagueData((prev) => ({
        ...prev,
        league_name: data.leagueName || prev.league_name,
        description:
          data.description !== undefined ? data.description : prev.description,
        icon_style:
          data.icon_style !== undefined ? data.icon_style : prev.icon_style,
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

  const handleOpenShareLeague = () => {
    setIsShareLinkModalOpen(true);
  };

  const handleCloseShareLeague = () => {
    setIsShareLinkModalOpen(false);
  };

  const handleSaveModerators = async (moderatorIds: string[]) => {
    try {
      await apiPut(`/api/leagues/${leagueId}/moderators`, { moderatorIds });
      // Refresh league data to reflect updated roles
      await getLeagueData();
      setFeedback({ message: t("success"), severity: "success", open: true });
      setIsModeratorModalOpen(false);
    } catch (e) {
      console.error(e);
      setFeedback({ message: t("error"), severity: "error", open: true });
    }
  };

  // Handle petition acceptance - update both league data and petitions
  const handlePetitionAccept = async (petitionId: string) => {
    try {
      const response = (await apiPut(
        `/api/leagues/${leagueId}/participant-petitions/${petitionId}/accept`,
        {}
      )) as any;

      // Update league data (participants, leaderboard, etc.)
      setLeagueData((prev) => ({
        ...prev,
        participants: response.participants,
        moderatorArray: response.moderatorArray,
      }));

      // Update petitions
      setParticipantPetitions(response.participantPetitions || []);

      // Refresh leaderboard to show new participant
      getLeagueLeaderBoardData();

      setFeedback({ message: t("success"), severity: "success", open: true });
    } catch (e) {
      console.error(e);
      setFeedback({ message: t("error"), severity: "error", open: true });
    }
  };

  // Handle petition rejection - update only petitions
  const handlePetitionReject = async (petitionId: string) => {
    try {
      const response = (await apiPut(
        `/api/leagues/${leagueId}/participant-petitions/${petitionId}/reject`,
        {}
      )) as any;

      // Update only petitions, not league data
      setParticipantPetitions(response.participantPetitions || []);

      setFeedback({ message: t("success"), severity: "success", open: true });
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
      children: (
        <div
          style={
            sortedLeaderboardData.length > 7
              ? {
                  maxHeight: "50vh",
                  width: "100%",
                  minHeight: 0,
                  overflowY: "auto",
                }
              : { width: "100%" }
          }
        >
          <Leaderboard sortedResults={sortedLeaderboardData} />
        </div>
      ), // use memoized data
    },
    {
      key: "2",
      label: t("stats"),
      children: (
        <div
          style={
            sortedLeaderboardData.length > 7
              ? {
                  maxHeight: "50vh",
                  width: "100%",
                  minHeight: 0,
                  overflowY: "auto",
                }
              : { width: "100%" }
          }
        >
          <Stats results={leaderboardData} />
        </div>
      ),
    },
    {
      key: "3",
      label: t("info"),
      children: (
        <LeagueInfo
          leagueData={leagueData}
          isUserModerator={isUserModeratorInThisLeague}
          isUserCreator={isUserCreator}
          isSystemModerator={isSystemModerator(userData.role)}
          onEditLeague={handleOpenEditLeague}
          onManageModerators={handleOpenManageModerators}
          onShareLeague={handleOpenShareLeague}
          onEditIcon={handleOpenEditIcon}
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
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <LeagueIconBadge
                  icon={leagueData.icon_style?.icon}
                  accentColor={leagueData.icon_style?.accent_color}
                  marginLeftPx={0}
                  iconColor={leagueData.icon_style?.icon_color}
                />
                <h1 className={styles.leagueTitle}>{leagueData.league_name}</h1>
              </div>
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
                  participantPetitions={participantPetitions}
                  onPetitionAccept={handlePetitionAccept}
                  onPetitionReject={handlePetitionReject}
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
      <LeagueIconEditModal
        open={isIconModalOpen}
        initialIcon={leagueData.icon_style?.icon}
        initialAccentColor={leagueData.icon_style?.accent_color}
        initialTextColor={leagueData.icon_style?.icon_color || "#ffffff"}
        isSaving={isSavingLeague}
        onClose={handleCloseEditIcon}
        onSave={async ({ icon, accentColor, iconColor }) => {
          try {
            setIsSavingLeague(true);
            const iconStyle = {
              icon,
              accent_color: accentColor,
              icon_color: iconColor,
            };
            await apiPut(`/api/leagues/${leagueId}`, { iconStyle });
            setLeagueData((prev) => ({
              ...prev,
              icon_style: iconStyle,
            }));
            setFeedback({
              message: t("success"),
              severity: "success",
              open: true,
            });
            setIsIconModalOpen(false);
          } catch (e) {
            console.error(e);
            setFeedback({ message: t("error"), severity: "error", open: true });
          } finally {
            setIsSavingLeague(false);
          }
        }}
      />
      <ModeratorManagementModal
        open={isModeratorModalOpen}
        participants={leagueData.participants}
        creatorId={leagueData.created_by}
        onClose={handleCloseManageModerators}
        onSave={handleSaveModerators}
      />
      <ShareLinkModal
        open={isShareLinkModalOpen}
        leagueId={leagueId || ""}
        userId={userData.userId}
        onClose={handleCloseShareLeague}
      />
    </div>
  );

  // Add more state variables as needed
};

export default LeagueDashboard;
