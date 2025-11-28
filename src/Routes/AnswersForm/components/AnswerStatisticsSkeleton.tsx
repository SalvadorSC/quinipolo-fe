import React from "react";
import { Box, Skeleton } from "@mui/material";
import { motion } from "motion/react";

export const AnswerStatisticsSkeleton: React.FC = () => {
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
      {/* Segmented bar skeleton */}
      <Skeleton
        variant="rectangular"
        height={24}
        sx={{
          borderRadius: 1,
          mb: 1.5,
        }}
      />

      {/* Percentage values skeleton */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        {[1, 2, 3].map((index) => (
          <Box key={index} sx={{ textAlign: "center", flex: 1 }}>
            <Skeleton variant="text" width={60} sx={{ mx: "auto", mb: 0.5 }} />
            <Skeleton variant="text" width={40} sx={{ mx: "auto", mb: 0.5 }} />
            <Skeleton variant="text" width={50} sx={{ mx: "auto" }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

