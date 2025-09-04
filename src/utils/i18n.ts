import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import ca from "../locales/ca/translation.json";
import fr from "../locales/fr/translation.json";
import de from "../locales/de/translation.json";
import it from "../locales/it/translation.json";
import pt from "../locales/pt/translation.json";
import ja from "../locales/ja/translation.json";
import zh from "../locales/zh/translation.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  ca: { translation: ca },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ja: { translation: ja },
  zh: { translation: zh },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    supportedLngs: ["en", "es", "ca", "fr", "de", "it", "pt", "ja", "zh"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: [
        "localStorage",
        "navigator",
        "htmlTag",
        "cookie",
        "path",
        "subdomain",
      ],
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
