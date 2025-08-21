import React from "react";
import { IconButton, Button } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "../../Context/ThemeContext/ThemeContext";
import { useTranslation } from "react-i18next";

type Props = {
  mode?: "icon" | "button";
  variant?: "outlined" | "contained";
};

const ThemeToggle: React.FC<Props> = ({
  mode = "icon",
  variant = "outlined",
}) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  if (mode === "button") {
    return (
      <Button variant={variant} onClick={toggleTheme} sx={{ width: "100%" }}>
        {theme === "light" ? (
          <DarkModeIcon sx={{ mr: 1 }} />
        ) : (
          <LightModeIcon sx={{ mr: 1 }} />
        )}
        {theme === "light" ? t("darkMode") : t("lightMode")}
      </Button>
    );
  }

  return (
    <IconButton onClick={toggleTheme}>
      {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
};

export default ThemeToggle;
