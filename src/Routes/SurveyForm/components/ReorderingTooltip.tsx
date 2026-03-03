import React, { useState, useEffect } from "react";
import { Alert, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useTranslation } from "react-i18next";
import styles from "./ReorderingTooltip.module.scss";

export const ReorderingTooltip: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen this tooltip before
    const hasSeenTooltip = localStorage.getItem("hasSeenReorderingTooltip");
    if (!hasSeenTooltip) {
      setOpen(true);
    } else {
      setDismissed(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setDismissed(true);
    localStorage.setItem("hasSeenReorderingTooltip", "true");
  };

  if (dismissed) return null;

  return (
    <Collapse in={open}>
      <Alert
        severity="info"
        className={styles.tooltip}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        icon={<DragIndicatorIcon />}
        sx={{ mb: 2 }}
      >
        {t("reordering.tooltip")}
      </Alert>
    </Collapse>
  );
};
