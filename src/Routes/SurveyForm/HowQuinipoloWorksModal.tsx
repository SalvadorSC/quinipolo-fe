import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
};

const HowQuinipoloWorksModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("howWorks.title")}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, textAlign: "left" }}>
          <Typography
            variant="body1"
            component="div"
            sx={{ lineHeight: 1.6, textAlign: "left" }}
          >
            {t("howWorks.intro")}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("howWorks.steps.title")}
            </Typography>
            <ol style={{ paddingLeft: 18, marginTop: 8 }}>
              <li>{t("howWorks.steps.create")}</li>
              <li>{t("howWorks.steps.deadline")}</li>
              <li>{t("howWorks.steps.share")}</li>
              <li>{t("howWorks.steps.results")}</li>
              <li>{t("howWorks.steps.points")}</li>
              <li>{t("howWorks.steps.compete")}</li>
            </ol>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("howWorks.scoring.title")}
            </Typography>
            <ul style={{ paddingLeft: 18, marginTop: 8 }}>
              <li>{t("howWorks.scoring.rule1")}</li>
              <li>{t("howWorks.scoring.rule15")}</li>
            </ul>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t("howWorks.goalRanges.title")}
            </Typography>
            <ul style={{ paddingLeft: 18, marginTop: 8 }}>
              <li>{t("howWorks.goalRanges.waterpolo")}</li>
              <li>{t("howWorks.goalRanges.football")}</li>
            </ul>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HowQuinipoloWorksModal;
