import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Snackbar from "@mui/material/Snackbar";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

import {
  COOKIE_CONSENT_STORAGE_KEY,
  setStoredConsent,
} from "../../utils/consent";

function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    setStoredConsent("accepted");
    setVisible(false);
  }

  function handleDecline() {
    setStoredConsent("declined");
    setVisible(false);
  }

  return (
    <Snackbar
      open={visible}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <Paper
        elevation={6}
        sx={{
          p: 2,
          maxWidth: 900,
          width: "calc(100% - 32px)",
          borderRadius: "20px",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1, mr: { sm: 2 } }}>
            <Typography variant="body2">
              {t("cookies.message")}{" "}
              <Link component={RouterLink} to="/privacy" underline="hover">
                {t("footer.privacy")}
              </Link>
              {", "}
              <Link component={RouterLink} to="/cookies" underline="hover">
                {t("cookies.policy")}
              </Link>
              .
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            justifyContent={{ xs: "flex-end", sm: "initial" }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleDecline}
              aria-label={t("cookies.decline")}
            >
              {t("cookies.decline")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAccept}
              aria-label={t("cookies.accept")}
            >
              {t("cookies.accept")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Snackbar>
  );
}

export default CookieBanner;
