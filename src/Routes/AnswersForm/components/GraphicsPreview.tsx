import React, { useState, useCallback } from "react";
import { Box, Button, Collapse, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../../utils/apiUtils";
import { prepareAnswersForSubmission } from "../utils/answerUtils";
import { QuinipoloType } from "../../../types/quinipolo";
import { AnswersType } from "../types";
import { useFeedback } from "../../../Context/FeedbackContext/FeedbackContext";
import style from "../AnswersForm.module.scss";

type GraphicsPreviewProps = {
  quinipolo: QuinipoloType;
  answers: AnswersType[];
};

function buildCorrectionSeePayload(
  quinipolo: QuinipoloType,
  answers: AnswersType[]
) {
  const correctAnswers = prepareAnswersForSubmission(answers);
  const quinipoloItems = (quinipolo.quinipolo || []).map((item) => ({
    homeTeam: item.homeTeam,
    awayTeam: item.awayTeam,
    leagueId: item.leagueId || quinipolo.league_id || "DHM",
    isGame15: item.isGame15 ?? false,
  }));

  return {
    _meta: { matchday: "J16" },
    correctionSee: {
      quinipolo: quinipoloItems,
      correct_answers: correctAnswers,
    },
  };
}

export const GraphicsPreview: React.FC<GraphicsPreviewProps> = ({
  quinipolo,
  answers,
}) => {
  const { t } = useTranslation();
  const { setFeedback } = useFeedback();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{
    image1?: string;
    image2?: string;
  } | null>(null);

  const generatePreview = useCallback(async () => {
    if (!quinipolo.quinipolo?.length || quinipolo.quinipolo.length < 15) {
      setFeedback({
        message: t("errorLoadingQuinipolo"),
        severity: "error",
        open: true,
      });
      return;
    }

    setLoading(true);
    setImages(null);
    setExpanded(true);

    try {
      const payload = buildCorrectionSeePayload(quinipolo, answers);
      const res = await apiPost<{
        matchday: string;
        images: Record<string, string>;
      }>("/api/graphics/generate", payload);

      const image1 = res.images?.image1;
      const image2 = res.images?.image2;
      if (image1 || image2) {
        setImages({ image1, image2 });
      } else {
        setFeedback({
          message: t("errorGeneratingImages"),
          severity: "error",
          open: true,
        });
      }
    } catch {
      setFeedback({
        message: t("errorGeneratingImages"),
        severity: "error",
        open: true,
      });
    } finally {
      setLoading(false);
    }
  }, [quinipolo, answers, t, setFeedback]);

  const copyImageToClipboard = async (dataUrl: string) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setFeedback({
        message: t("imageCopied"),
        severity: "success",
        open: true,
      });
    } catch {
      setFeedback({
        message: t("errorCopyingMessage"),
        severity: "error",
        open: true,
      });
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2, width: "100%" }}>
      <Button
        variant="outlined"
        size="small"
        onClick={generatePreview}
        disabled={loading}
        startIcon={loading ? <div className={style.spinner} /> : undefined}
      >
        {loading ? t("loading") : t("previewGraphics")}
      </Button>
      <Collapse in={expanded}>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={32} />
            </Box>
          )}
          {!loading && images && (
            <>
              {images.image1 && (
                <Box>
                  <img
                    src={images.image1}
                    alt={t("matchResultsImageAlt1")}
                    style={{
                      width: "100%",
                      maxWidth: 400,
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyImageToClipboard(images.image1!)}
                    sx={{ mt: 1 }}
                  >
                    {t("copyImage")}
                  </Button>
                </Box>
              )}
              {images.image2 && (
                <Box>
                  <img
                    src={images.image2}
                    alt={t("matchResultsImageAlt2")}
                    style={{
                      width: "100%",
                      maxWidth: 400,
                      borderRadius: 8,
                      display: "block",
                    }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => copyImageToClipboard(images.image2!)}
                    sx={{ mt: 1 }}
                  >
                    {t("copyImage")}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
