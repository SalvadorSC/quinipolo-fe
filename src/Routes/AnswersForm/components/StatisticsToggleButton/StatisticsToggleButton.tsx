import React from "react";
import { Button, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useTranslation } from "react-i18next";
import styles from "./StatisticsToggleButton.module.scss";

interface StatisticsToggleButtonProps {
  showStatistics: boolean;
  onToggle: () => void;
  disabled?: boolean;
  hasNoAnswers?: boolean;
}

export const StatisticsToggleButton: React.FC<StatisticsToggleButtonProps> = ({
  showStatistics,
  onToggle,
  disabled = false,
  hasNoAnswers = false,
}) => {
  const { t } = useTranslation();

  const getTooltipTitle = () => {
    if (disabled && hasNoAnswers) {
      return (
        t("statisticsNoAnswers") ||
        "Statistics unavailable: No one has answered this quinipolo yet"
      );
    }
    if (disabled) {
      return t("loadingStatistics") || "Loading statistics...";
    }
    return showStatistics
      ? t("hideStatistics") || "Hide Statistics"
      : t("showStatistics") || "Show Statistics";
  };

  return (
    <Tooltip title={getTooltipTitle()} arrow placement="top">
      <Button
        variant={showStatistics ? "contained" : "outlined"}
        onClick={onToggle}
        disabled={disabled}
        className={`${styles.button} ${
          showStatistics ? styles.active : styles.outlined
        }`}
        sx={{
          minWidth: 0,
          padding: "10px 8px",
          borderRadius: "12px",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontWeight: 700,
          textTransform: "none",
          background: showStatistics
            ? "linear-gradient(135deg, #b8860b, #ffd54f)"
            : undefined,
          color: "#3e2723",
          border: "none",
          boxShadow: showStatistics
            ? "0 4px 14px 0 rgba(184, 134, 11, 0.4)"
            : "0 2px 8px 0 rgba(0, 0, 0, 0.1)",
          "&:hover": {
            background: showStatistics
              ? "linear-gradient(135deg, #a07007, #ffca28)"
              : undefined,
            color: "#3e2723",
            boxShadow: showStatistics
              ? "0 6px 20px 0 rgba(184, 134, 11, 0.5)"
              : undefined,
            transform: showStatistics ? "translateY(-2px)" : undefined,
          },
          "&:active": {
            transform: "translateY(0px)",
            boxShadow: showStatistics
              ? "0 2px 10px 0 rgba(184, 134, 11, 0.4)"
              : undefined,
          },
          "&.Mui-disabled": {
            background: showStatistics
              ? "linear-gradient(135deg, rgba(184,134,11,0.4), rgba(255,213,79,0.4))"
              : undefined,
            color: showStatistics ? "rgba(62,39,35,0.6)" : undefined,
            opacity: showStatistics ? 1 : 0.5,
          },
        }}
      >
        {showStatistics ? (
          <VisibilityIcon className={styles.icon} />
        ) : (
          <VisibilityOffIcon className={styles.icon} />
        )}
        <BarChartIcon className={styles.icon} />
      </Button>
    </Tooltip>
  );
};
