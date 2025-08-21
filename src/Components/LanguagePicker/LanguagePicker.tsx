import React from "react";
import { Select } from "antd";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "ca", label: "CA" },
  { value: "fr", label: "FR" },
  { value: "de", label: "DE" },
  { value: "it", label: "IT" },
  { value: "pt", label: "PT" },
  { value: "ja", label: "JA" },
  { value: "zh", label: "ZH" },
];

type Props = {
  inDrawer?: boolean;
};

const LanguagePicker: React.FC<Props> = ({ inDrawer = false }) => {
  const { i18n } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <Select
      value={i18n.language}
      onChange={(value) => i18n.changeLanguage(value)}
      options={LANGUAGES}
      size={inDrawer ? "large" : "small"}
      style={{
        minWidth: 60,
        fontSize: inDrawer ? 18 : 12,
        marginLeft: inDrawer ? 0 : 8,
        marginRight: inDrawer ? 0 : 8,
        display: inDrawer ? "block" : isMobile ? "none" : "inline-block",
      }}
      getPopupContainer={(trigger) => document.body}
      dropdownStyle={{ zIndex: 3000 }}
    />
  );
};

export default LanguagePicker;
