import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useUser } from "../../Context/UserContext/UserContext";
import { useFeedback } from "../../Context/FeedbackContext/FeedbackContext";
import { useTranslation } from "react-i18next";
import { apiPost, apiGet } from "../../utils/apiUtils";

interface LeagueTier {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  features: string[];
}

interface CreateLeagueProps {}

const CreateLeague: React.FC<CreateLeagueProps> = () => {
  const [leagueName, setLeagueName] = useState<string>("");
  const [leagueDescription, setLeagueDescription] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [tiers, setTiers] = useState<LeagueTier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTiers, setLoadingTiers] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const { userData } = useUser();
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();
  const flaggedFeatures = new Set([
    "featureCustomBranding",
    "featureAdvancedAnalytics",
  ]);
  const getFeatureLabel = (feature: string) => t(feature);

  // Fetch available league tiers
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await apiGet<LeagueTier[]>("/api/league-stripe/tiers");
        setTiers(response);
      } catch (error) {
        console.error("Error fetching tiers:", error);
        setFeedback({
          message: t("errorFetchingTiers"),
          severity: "error",
          open: true,
        });
      } finally {
        setLoadingTiers(false);
      }
    };

    fetchTiers();
  }, [t, setFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leagueName.trim()) {
      setFeedback({
        message: t("leagueNameRequired"),
        severity: "error",
        open: true,
      });
      return;
    }

    if (!selectedTier) {
      setFeedback({
        message: t("selectTierRequired"),
        severity: "error",
        open: true,
      });
      return;
    }

    setLoading(true);

    try {
      // Create Stripe checkout session
      const response = await apiPost(
        "/api/league-stripe/create-checkout-session",
        {
          tier: selectedTier,
          leagueName: leagueName.trim(),
          leagueDescription: leagueDescription.trim(),
          isPrivate,
          userId: userData.userId,
        }
      );

      if (
        typeof response === "object" &&
        response !== null &&
        "url" in response
      ) {
        // Redirect directly to Stripe Checkout
        window.location.assign((response as any).url);
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setFeedback({
        message: t("errorCreatingLeague"),
        severity: "error",
        open: true,
      });
      setErrorMsg(t("errorCreatingLeague"));
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loadingTiers) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t("createNewLeague")}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4 }}
        >
          {t("createLeagueDescription")}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* League Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t("leagueDetails")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("leagueName")}
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                required
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("leagueDescription")}
                value={leagueDescription}
                onChange={(e) => setLeagueDescription(e.target.value)}
                multiline
                rows={3}
                variant="outlined"
                placeholder={t("leagueDescriptionPlaceholder")}
              />
            </Grid>

            {/* All new leagues will be private by default for now */}

            {/* League Tiers */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t("selectLeagueTier")}
              </Typography>
            </Grid>

            {tiers.map((tier) => (
              <Grid item xs={12} md={6} key={tier.id}>
                <Card
                  variant={selectedTier === tier.id ? "elevation" : "outlined"}
                  sx={{
                    cursor: "pointer",
                    border:
                      selectedTier === tier.id
                        ? "2px solid #1976d2"
                        : "1px solid #e0e0e0",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "#1976d2",
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t(tier.name)}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      {tier.id === "managed" && (
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          sx={{ textDecoration: "line-through", color: "grey" }}
                        >
                          {formatPrice(3999, tier.currency || "eur")}
                        </Typography>
                      )}
                      <Typography variant="h4" color="primary" gutterBottom>
                        {formatPrice(2999, tier.currency || "eur")}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {t(tier.description)}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      {tier.features.map((feature, index) => (
                        <Chip
                          key={index}
                          label={`${getFeatureLabel(feature)}${
                            flaggedFeatures.has(feature) ? "*" : ""
                          }`}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Footnote for in-development features */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                {t("featuresInDevelopment")}
              </Typography>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !selectedTier || !leagueName.trim()}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t("proceedToPayment")
                  )}
                </Button>
              </Box>
              {errorMsg && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errorMsg}
                </Alert>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateLeague;
