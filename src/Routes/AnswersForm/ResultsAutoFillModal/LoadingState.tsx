import { Box, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={300}
      flexDirection="column"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="body2">
        {t("resultsAutoFill.loading") ||
          t("loading") ||
          "Loading results..."}
      </Typography>
    </Box>
  );
}

