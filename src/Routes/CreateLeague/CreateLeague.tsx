import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { config } from "../../utils/config";
import { createLeagueInDev } from "../../utils/leagueCreation";
import {
  ICON_OPTIONS,
  LeagueIconKey,
  getLeagueIcon,
} from "../../utils/leagueIcons";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

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
  const navigate = useNavigate();
  const [leagueName, setLeagueName] = useState<string>("");
  const [leagueDescription, setLeagueDescription] = useState<string>("");
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [tiers, setTiers] = useState<LeagueTier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTiers, setLoadingTiers] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [selectedIcon, setSelectedIcon] =
    useState<LeagueIconKey>("sports_volleyball");
  const [accentColor, setAccentColor] = useState<string>("#1976d2");
  const [iconColor, setIconColor] = useState<string>("#ffffff");
  const presetAccentColors = [
    { label: "Azul clarito", value: "#2273B9" },
    { label: "Azul", value: "#1B3F7B" },
    { label: "Azul oscuro", value: "#1F3057" },
  ];
  const presetTextColors = [
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
  ];

  const { userData } = useUser();
  const { setFeedback } = useFeedback();
  const { t } = useTranslation();
  const flaggedFeatures = new Set([
    "featureCustomBranding",
    "featureAdvancedAnalytics",
  ]);
  const getFeatureLabel = (feature: string) => t(feature);

  const isDevelopment = config.isDevelopment;
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

    if (!selectedTier && !isDevelopment) {
      setFeedback({
        message: t("selectTierRequired"),
        severity: "error",
        open: true,
      });
      return;
    }

    setLoading(true);

    try {
      // In development, bypass Stripe and create the league directly
      if (isDevelopment) {
        const devParams: any = {
          leagueName,
          isPrivate,
          tier: selectedTier,
          userId: userData.userId,
          description: leagueDescription,
          iconStyle: {
            icon: selectedIcon,
            accent_color: accentColor,
            icon_color: iconColor,
          },
        };
        const createdLeague = await createLeagueInDev(devParams);
        navigate(`/league-dashboard?id=${createdLeague.id}`);
        return;
      }

      // Production: Create Stripe checkout session
      const response = await apiPost(
        "/api/league-stripe/create-checkout-session",
        {
          tier: selectedTier,
          leagueName: leagueName.trim(),
          leagueDescription: leagueDescription.trim(),
          isPrivate,
          userId: userData.userId,
          iconStyle: {
            icon: selectedIcon,
            accent_color: accentColor,
            icon_color: iconColor,
          },
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

            {/* Icon selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t("selectLeagueIcon")}
              </Typography>
              <ToggleButtonGroup
                color="primary"
                exclusive
                value={selectedIcon}
                onChange={(e, v) => v && setSelectedIcon(v)}
                size="small"
                sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
              >
                {ICON_OPTIONS.map((opt) => (
                  <ToggleButton key={opt.key} value={opt.key} sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getLeagueIcon(opt.key, { color: iconColor })}
                    </Box>
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>

            {/* Accent Color */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t("accentColor")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  sx={{ width: 120 }}
                  inputProps={{ "aria-label": "accent color" }}
                />
                {presetAccentColors.map((c) => (
                  <Button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    variant={
                      accentColor.toLowerCase() === c.value.toLowerCase()
                        ? "contained"
                        : "outlined"
                    }
                    sx={{
                      minWidth: 0,
                      width: 36,
                      height: 28,
                      p: 0,
                      borderRadius: 1,
                      backgroundColor: c.value,
                      border: "1px solid #e0e0e0",
                      borderColor: c.value,
                    }}
                    title={c.label}
                  />
                ))}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                    backgroundColor: accentColor,
                  }}
                />
              </Box>
            </Grid>

            {/* Icon Color */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t("iconColor")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextField
                  type="color"
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  sx={{ width: 120 }}
                  inputProps={{ "aria-label": "icon color" }}
                />
                {presetTextColors.map((c) => (
                  <Button
                    key={c.value}
                    onClick={() => setIconColor(c.value)}
                    variant={
                      iconColor.toLowerCase() === c.value.toLowerCase()
                        ? "contained"
                        : "outlined"
                    }
                    sx={{
                      minWidth: 0,
                      width: 36,
                      height: 28,
                      p: 0,
                      borderRadius: 1,
                      backgroundColor: c.value,
                      border: "1px solid #e0e0e0",
                      borderColor: c.value,
                    }}
                    title={c.label}
                  />
                ))}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                    backgroundColor: iconColor,
                  }}
                />
              </Box>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    (loading || !selectedTier || !leagueName.trim()) &&
                    !isDevelopment
                  }
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
