import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    detection: {
      order: [
        "navigator",
        "htmlTag",
        "localStorage",
        "cookie",
        "path",
        "subdomain",
      ],
      caches: ["localStorage", "cookie"],
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/i18n/{{lng}}/{{ns}}.json",
    },
  });
