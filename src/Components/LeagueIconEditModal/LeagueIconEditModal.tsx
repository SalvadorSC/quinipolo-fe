import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useTranslation } from "react-i18next";
import {
  ICON_OPTIONS,
  LeagueIconKey,
  getLeagueIcon,
} from "../../utils/leagueIcons";

interface LeagueIconEditModalProps {
  open: boolean;
  initialIcon?: string;
  initialAccentColor?: string;
  initialTextColor?: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (data: {
    icon?: string;
    accentColor?: string;
    iconColor?: string;
  }) => void;
}

const LeagueIconEditModal: React.FC<LeagueIconEditModalProps> = ({
  open,
  initialIcon,
  initialAccentColor,
  initialTextColor,
  isSaving = false,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [icon, setIcon] = useState<LeagueIconKey>("sports_volleyball");
  const [accentColor, setAccentColor] = useState<string>("#1976d2");
  const [iconColor, setIconColor] = useState<string>("#ffffff");
  const presetAccentColors = [
    { label: "Azul clarito", value: "#2273B9" },
    { label: "Azul", value: "#1B3F7B" },
    { label: "Azul oscuro", value: "#1F3057" },
  ];
  const presetTextColors = [
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#000000" },
  ];

  useEffect(() => {
    if (open) {
      setIcon((initialIcon as LeagueIconKey) || "sports_volleyball");
      setAccentColor(initialAccentColor || "#1976d2");
      setIconColor(initialTextColor || "#ffffff");
    }
  }, [open, initialIcon, initialAccentColor, initialTextColor]);

  const handleSubmit = () => {
    onSave({ icon, accentColor, iconColor });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: "left", fontWeight: 600 }}>
        {t("editIcon")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 3,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getLeagueIcon(icon as any, { color: iconColor, fontSize: 60 })}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Preset accent colors */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <TextField
                label={t("accentColor")}
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                sx={{ width: 140 }}
              />
              {presetAccentColors.map((c) => (
                <Button
                  key={c.value}
                  onClick={() => setAccentColor(c.value)}
                  variant={
                    accentColor.toLowerCase() === c.value.toLowerCase()
                      ? "contained"
                      : "outlined"
                  }
                  sx={{
                    minWidth: 0,
                    width: 36,
                    height: 28,
                    p: 0,
                    borderRadius: 1,
                    backgroundColor: c.value,
                    border: "1px solid #e0e0e0",
                    borderColor: c.value,
                  }}
                  title={c.label}
                />
              ))}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <TextField
                label={t("iconColor")}
                type="color"
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                sx={{ width: 140 }}
              />
              {/* Preset text colors */}
              {presetTextColors.map((c) => (
                <Button
                  key={c.value}
                  onClick={() => setIconColor(c.value)}
                  variant={
                    iconColor.toLowerCase() === c.value.toLowerCase()
                      ? "contained"
                      : "outlined"
                  }
                  sx={{
                    minWidth: 0,
                    width: 36,
                    height: 28,
                    p: 0,
                    borderRadius: 1,
                    backgroundColor: c.value,
                    borderColor: c.value,
                    border: "1px solid #e0e0e0",
                  }}
                  title={c.label}
                />
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              width: "100%",
              justifyContent: "center",
            }}
          >
            {ICON_OPTIONS.map((opt) => {
              const isSelected = icon === (opt.key as LeagueIconKey);
              return (
                <Button
                  key={opt.key}
                  onClick={() => setIcon(opt.key as LeagueIconKey)}
                  variant={isSelected ? "contained" : "outlined"}
                  size="small"
                  sx={{
                    p: 1.5,
                    minWidth: 0,
                    width: 44,
                    height: 44,
                    color: isSelected ? "#ffffff" : "primary.main",
                  }}
                  aria-pressed={isSelected}
                >
                  {getLeagueIcon(opt.key, {
                    color: isSelected ? "#ffffff" : undefined,
                  })}
                </Button>
              );
            })}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("cancel")}</Button>
        <LoadingButton
          onClick={handleSubmit}
          variant="contained"
          loading={isSaving}
        >
          {t("saveChanges")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default LeagueIconEditModal;
