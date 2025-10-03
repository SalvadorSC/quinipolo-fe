import React from "react";
import {
  Container,
  Stack,
  Typography,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../Components/Layout/Layout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <Layout>
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
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                sx={{ flex: 1 }}
              >
                {t("about.title")}
              </Typography>
            </Stack>

            <Typography variant="body1">{t("about.intro")}</Typography>
            <Typography variant="body1">{t("about.howItWorks")}</Typography>

            <Typography variant="h6" component="h2" fontWeight={700}>
              {t("about.disclaimerTitle")}
            </Typography>
            <Typography variant="body1">{t("about.disclaimerText")}</Typography>

            <Typography variant="h6" component="h2" fontWeight={700}>
              {t("about.whyTitle")}
            </Typography>
            <Typography variant="body1">{t("about.whyText")}</Typography>

            <Typography variant="h6" component="h2" fontWeight={700}>
              {t("about.whatTitle")}
            </Typography>
            <ul style={{ paddingLeft: "1.25rem", margin: 0 }}>
              <li>{t("about.what.items.predict") as string}</li>
              <li>{t("about.what.items.rankings") as string}</li>
              <li>{t("about.what.items.leagues") as string}</li>
              <li>{t("about.what.items.progress") as string}</li>
            </ul>

            <Typography variant="h6" component="h2" fontWeight={700}>
              {t("about.philosophyTitle")}
            </Typography>
            <Typography variant="body1">{t("about.philosophyText")}</Typography>
            <Button
              variant="outlined"
              onClick={handleBack}
              sx={{ margin: "0 auto" }}
            >
              {t("goBack")}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Layout>
  );
}

export default About;
