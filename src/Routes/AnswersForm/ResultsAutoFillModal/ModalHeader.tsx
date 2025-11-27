import { DialogTitle, Typography, IconButton, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "react-i18next";

export function ModalHeader() {
  const { t } = useTranslation();
  return (
    <DialogTitle
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        background: "linear-gradient(120deg, #0d47a1, #5e35b1)",
        color: "#fff",
        borderBottom: "3px solid rgba(255,255,255,0.25)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          flexGrow: 1,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {t("resultsAutoFill.title") || "Auto-fill Correction Results"}
      </Typography>
      <Tooltip
        title={
          t("resultsAutoFill.helperText") ||
          "Select matches to automatically fill correction form. High confidence matches are auto-selected."
        }
      >
        <IconButton size="small" sx={{ color: "#fff" }}>
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </DialogTitle>
  );
}

