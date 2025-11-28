import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { AnswerStatistics as AnswerStatisticsType } from "../../../types/quinipolo";

interface AnswerStatisticsProps {
  homeTeam: string;
  awayTeam: string;
  matchNumber: number;
  statistics?: AnswerStatisticsType["matches"][0]["statistics"];
  totalResponses: number;
}

export const AnswerStatistics: React.FC<AnswerStatisticsProps> = ({
  homeTeam,
  awayTeam,
  matchNumber,
  statistics,
  totalResponses,
}) => {
  const { t } = useTranslation();

  if (!statistics || totalResponses === 0) {
    return null;
  }

  const {
    homeTeam: homeStats,
    awayTeam: awayStats,
    empat: drawStats,
  } = statistics;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      sx={{
        mt: 2,
        p: 1.5,
        backgroundColor: "rgba(0, 0, 0, 0.02)",
        borderRadius: 1,
        border: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
        {t("answerStatisticsTitle")}
      </Typography>
      {/* Segmented bar - visual representation */}
      <Box
        sx={{
          display: "flex",
          height: 24,
          borderRadius: 1,
          overflow: "hidden",
          mb: 1.5,
          border: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Home team segment */}
        {homeStats.percentage > 0 && (
          <Box
            sx={{
              width: `${homeStats.percentage}%`,
              backgroundColor: "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 600,
              transition: "width 0.3s ease",
              minWidth: homeStats.percentage > 0 ? "2px" : 0,
            }}
            title={`${homeTeam}: ${homeStats.percentage}%`}
          >
            {homeStats.percentage > 10 &&
              `${Math.round(homeStats.percentage)}%`}
          </Box>
        )}
        {/* Draw segment */}
        {drawStats.percentage > 0 && (
          <Box
            sx={{
              width: `${drawStats.percentage}%`,
              backgroundColor: "#ed6c02",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 600,
              transition: "width 0.3s ease",
              borderLeft:
                homeStats.percentage > 0
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "none",
              borderRight:
                awayStats.percentage > 0
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "none",
              minWidth: drawStats.percentage > 0 ? "2px" : 0,
            }}
            title={`${t("draw")}: ${drawStats.percentage}%`}
          >
            {drawStats.percentage > 10 &&
              `${Math.round(drawStats.percentage)}%`}
          </Box>
        )}
        {/* Away team segment */}
        {awayStats.percentage > 0 && (
          <Box
            sx={{
              width: `${awayStats.percentage}%`,
              backgroundColor: "#2e7d32",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 600,
              transition: "width 0.3s ease",
              minWidth: awayStats.percentage > 0 ? "2px" : 0,
            }}
            title={`${awayTeam}: ${awayStats.percentage}%`}
          >
            {awayStats.percentage > 10 &&
              `${Math.round(awayStats.percentage)}%`}
          </Box>
        )}
      </Box>

      {/* Percentage values - detailed breakdown */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          fontSize: "0.75rem",
          color: "text.secondary",
        }}
      >
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: "block" }}
          >
            {homeTeam}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#1976d2", fontWeight: 500 }}
          >
            {homeStats.percentage.toFixed(1)}%
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", opacity: 0.7 }}
          >
            ({homeStats.count}/{totalResponses})
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: "block" }}
          >
            {t("draw")}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#ed6c02", fontWeight: 500 }}
          >
            {drawStats.percentage.toFixed(1)}%
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", opacity: 0.7 }}
          >
            ({drawStats.count}/{totalResponses})
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, display: "block" }}
          >
            {awayTeam}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#2e7d32", fontWeight: 500 }}
          >
            {awayStats.percentage.toFixed(1)}%
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontSize: "0.65rem", opacity: 0.7 }}
          >
            ({awayStats.count}/{totalResponses})
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
