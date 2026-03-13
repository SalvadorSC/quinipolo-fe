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
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function renderParagraphWithLinks(text: string) {
  const linkRegex = /\[([^\]]+)\]\(\/([^)]+)\)/g;
  const parts: (string | { text: string; to: string })[] = [];
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ text: match[1], to: `/${match[2]}` });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  if (parts.length === 1 && typeof parts[0] === "string") {
    return <Typography>{parts[0]}</Typography>;
  }
  return (
    <Typography>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          part
        ) : (
          <MuiLink key={i} component={Link} to={part.to}>
            {part.text}
          </MuiLink>
        )
      )}
    </Typography>
  );
}

function Privacy() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sections =
    (t("privacy.sections", { returnObjects: true }) as any[]) || [];
  const lastUpdated = t("privacy.lastUpdated", "30/09/2025");

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

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
            {t("common.back", "Volver")}
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            {t("privacy.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("privacy.lastUpdatedLabel", "Última actualización")}:{" "}
            {lastUpdated}
          </Typography>
          {(t("privacy.intro", "") as string) && (
            <Typography>{t("privacy.intro")}</Typography>
          )}

          {sections.map((section: any, idx: number) => (
            <React.Fragment key={idx}>
              <Typography variant="h6" component="h2">
                {section.title}
              </Typography>
              {(section.paragraphs || []).map((p: string, pIdx: number) => (
                <React.Fragment key={pIdx}>
                  {renderParagraphWithLinks(p)}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
}

export default Privacy;
