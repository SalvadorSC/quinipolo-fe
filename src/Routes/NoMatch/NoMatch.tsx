import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box, Paper } from "@mui/material";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import styles from "./NoMatch.module.scss";

const NoMatch: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: "600px",
          p: window.innerWidth > 400 ? 4 : 2,
          borderRadius: "20px",
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "4rem", sm: "6rem" },
              fontWeight: "bold",
              color: "primary.main",
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              mb: 2,
              color: "text.primary",
            }}
          >
            {t("pageNotFound")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: "text.secondary",
              maxWidth: "400px",
              mx: "auto",
            }}
          >
            {t("pageNotFoundMessage")}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            justifyContent: "center",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{ minWidth: "160px" }}
          >
            {t("goHome")}
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ minWidth: "160px" }}
          >
            {t("goBack")}
          </Button>
        </Box>
      </Paper>
    </div>
  );
};

export default NoMatch;
