import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../Context/UserContext/UserContext";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../utils/apiUtils";
import { CheckCircleOutlined } from "@mui/icons-material";

interface LeagueSuccessProps {}

const LeagueSuccess: React.FC<LeagueSuccessProps> = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [leagueData, setLeagueData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { userData } = useUser();
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!sessionId) {
        setError(t("noSessionId"));
        setLoading(false);
        return;
      }

      try {
        const result = await apiGet<{ session: any; league: any }>(
          `/api/league-stripe/session/${sessionId}`
        );

        if (result.league) {
          setLeagueData({
            id: result.league.id,
            name: result.league.league_name,
            tier: result.league.tier,
            status: result.league.status,
            created_at: result.league.created_at,
          });
          setFeedback({
            message: t("leagueCreatedSuccess"),
            severity: "success",
            open: true,
          });
        } else {
          setError(t("errorVerifyingPayment"));
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        setError(t("errorVerifyingPayment"));
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [sessionId, t, setFeedback]);

  const handleGoToLeague = () => {
    if (leagueData) {
      navigate(`/league-dashboard?id=${leagueData.id}`);
    }
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={3}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          {t("verifyingPayment")}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        gap={3}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            {t("paymentVerificationFailed")}
          </Typography>
          <Typography variant="body1">{error}</Typography>
        </Alert>
        <Button variant="contained" onClick={handleGoToDashboard}>
          {t("goToDashboard")}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Box textAlign="center" mb={4}>
          <CheckCircleOutlined
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            color="success.main"
          >
            {t("paymentSuccessful")}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            {t("leagueCreatedSuccessfully")}
          </Typography>
        </Box>

        {leagueData && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("leagueDetails")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t("leagueName")}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {leagueData.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t("leagueTier")}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    textTransform="capitalize"
                  >
                    {leagueData.tier}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t("status")}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {t("active")}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {t("createdDate")}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(leagueData.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">{t("leagueSuccessInfo")}</Typography>
        </Alert>

        <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
          <Button
            variant="contained"
            size="large"
            onClick={handleGoToLeague}
            sx={{ minWidth: 200 }}
          >
            {t("goToLeague")}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleGoToDashboard}
            sx={{ minWidth: 200 }}
          >
            {t("goToDashboard")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LeagueSuccess;
