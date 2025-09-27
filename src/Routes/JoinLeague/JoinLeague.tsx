import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
} from "@mui/material";
import { CheckCircle, Error, Group } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useUser } from "../../Context/UserContext/UserContext";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { apiPost } from "../../utils/apiUtils";

interface LeagueInfo {
  id: string;
  league_name: string;
  description?: string;
}

const JoinLeague: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userData } = useUser();
  const { setFeedback } = useFeedback();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null);

  const handleJoinLeague = useCallback(async () => {
    if (!shareToken || !userData.userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = (await apiPost(
        `/api/leagues/join-by-link/${shareToken}`,
        {
          userId: userData.userId,
          username: userData.username,
        }
      )) as { league: LeagueInfo };

      setLeagueInfo(response.league);
      setSuccess(true);

      setFeedback({
        message: t("successfullyJoinedLeague"),
        severity: "success",
        open: true,
      });

      // Redirect to the league dashboard after a short delay
      setTimeout(() => {
        navigate(`/league-dashboard?id=${response.league.id}`);
      }, 2000);
    } catch (error: any) {
      console.error("Error joining league:", error);

      let errorMessage = t("errorJoiningLeague");

      if (error.response?.status === 404) {
        errorMessage = t("invalidShareLink");
      } else if (error.response?.status === 410) {
        errorMessage = t("shareLinkExpired");
      } else if (error.response?.status === 400) {
        errorMessage = t("alreadyInLeague");
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    shareToken,
    userData.userId,
    userData.username,
    t,
    setFeedback,
    navigate,
  ]);

  useEffect(() => {
    if (!userData.userId) {
      // Redirect to login if user is not authenticated
      navigate("/login");
      return;
    }

    if (shareToken) {
      handleJoinLeague();
    }
  }, [shareToken, userData.userId, handleJoinLeague, navigate]);

  const handleGoToLeague = () => {
    if (leagueInfo) {
      navigate(`/league-dashboard?id=${leagueInfo.id}`);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} />
          <Typography variant="h6">{t("joiningLeague")}...</Typography>
        </Stack>
      </Box>
    );
  }

  if (success && leagueInfo) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        p={2}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%" }}>
          <Stack alignItems="center" spacing={3}>
            <CheckCircle color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h4" textAlign="center" color="success.main">
              {t("successfullyJoinedLeague")}
            </Typography>

            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <Group color="primary" />
                  <Typography variant="h6">{leagueInfo.league_name}</Typography>
                </Stack>
                {leagueInfo.description && (
                  <Typography variant="body2" color="text.secondary">
                    {leagueInfo.description}
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {t("redirectingToLeague")}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleGoToLeague} fullWidth>
                {t("goToLeague")}
              </Button>
              <Button variant="outlined" onClick={handleGoHome} fullWidth>
                {t("goHome")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
        p={2}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: "100%" }}>
          <Stack alignItems="center" spacing={3}>
            <Error color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h5" textAlign="center" color="error">
              {t("errorJoiningLeague")}
            </Typography>

            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleGoHome} fullWidth>
                {t("goHome")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return null;
};

export default JoinLeague;
