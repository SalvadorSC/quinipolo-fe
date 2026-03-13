import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTranslation } from "react-i18next";

interface Match15LockToggleProps {
  isLocked: boolean;
  onToggle: () => void;
}

export const Match15LockToggle: React.FC<Match15LockToggleProps> = ({
  isLocked,
  onToggle,
}) => {
  const { t } = useTranslation();

  const tooltipText = isLocked
    ? t("match15.lockTooltip")
    : t("match15.unlockTooltip");

  return (
    <Tooltip title={tooltipText} placement="right">
      <IconButton
        onClick={onToggle}
        size="small"
        aria-label={isLocked ? t("match15.unlockAriaLabel") : t("match15.lockAriaLabel")}
        sx={{
          color: "white",
          backgroundColor: isLocked ? "#424242" : "#757575",
          "&:hover": {
            backgroundColor: isLocked ? "#616161" : "#9e9e9e",
          },
        }}
      >
        {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};
