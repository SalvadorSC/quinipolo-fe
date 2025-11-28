import React from "react";
import { Button } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useTranslation } from "react-i18next";
import styles from "./AutoFillButton.module.scss";

interface AutoFillButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const AutoFillButton: React.FC<AutoFillButtonProps> = ({
  onClick,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Button
        variant="contained"
        startIcon={<AutoAwesomeIcon />}
        onClick={onClick}
        disabled={disabled}
        className={styles.button}
      >
        {t("resultsAutoFill.button") || "Auto-fill Results"}
      </Button>
    </div>
  );
};

