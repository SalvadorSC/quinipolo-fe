import React from "react";
import {
  Container,
  Stack,
  Typography,
  Paper,
  Button,
  Link as MuiLink,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function DeleteAccount() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const steps = (t("deleteAccount.steps", { returnObjects: true }) as string[]) || [];
  const dataDeleted = (t("deleteAccount.dataDeleted", { returnObjects: true }) as string[]) || [];
  const dataKept = (t("deleteAccount.dataKept", { returnObjects: true }) as string[]) || [];

  return (
    <Container maxWidth="md" sx={{ p: 0 }}>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          p: 2,
          pt: 4,
          pb: 4,
          borderRadius: "20px",
          textAlign: "left",
          mb: 2,
        }}
      >
        <Stack spacing={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ alignSelf: "flex-start" }}
          >
            {t("common.back", "Back")}
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            {t("deleteAccount.title")}
          </Typography>
          <Typography variant="body1">{t("deleteAccount.intro")}</Typography>

          <Typography variant="h6" component="h2">
            {t("deleteAccount.stepsTitle")}
          </Typography>
          <Stack component="ol" spacing={1} sx={{ pl: 2 }}>
            {steps.map((step: string, idx: number) => (
              <Typography key={idx} component="li">
                {step}
              </Typography>
            ))}
          </Stack>

          <Typography variant="body1">
            {t("deleteAccount.emailInstruction")}{" "}
            <MuiLink
              href="mailto:info@quinipolo.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              info@quinipolo.com
            </MuiLink>
          </Typography>

          <Typography variant="h6" component="h2">
            {t("deleteAccount.dataDeletedTitle")}
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ pl: 2 }}>
            {dataDeleted.map((item: string, idx: number) => (
              <Typography key={idx} component="li">
                {item}
              </Typography>
            ))}
          </Stack>

          <Typography variant="h6" component="h2">
            {t("deleteAccount.dataKeptTitle")}
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ pl: 2 }}>
            {dataKept.map((item: string, idx: number) => (
              <Typography key={idx} component="li">
                {item}
              </Typography>
            ))}
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {t("deleteAccount.retention")}
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}

export default DeleteAccount;
