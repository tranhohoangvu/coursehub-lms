import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../i18n/en.js";
import vi from "../i18n/vi.js";

const dictionaries = { en, vi };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("coursehub-lang");
      if (stored === "en" || stored === "vi") return stored;
    }
    return "en";
  });

  const setLanguage = (lang) => {
    if (lang !== "en" && lang !== "vi") return;
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("coursehub-lang", lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "vi" : "en");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  /**
   * Helper to retrieve translated string by dot notation path
   * e.g. t("home.heroTitle") or t("cart.cartItemsTooltip", { count: 3 })
   */
  const t = (path, params = {}) => {
    const keys = path.split(".");
    let current = dictionaries[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    // Fallback to English if missing in chosen language
    if (current === undefined && language !== "en") {
      let fallback = dictionaries.en;
      for (const key of keys) {
        if (fallback && typeof fallback === "object" && key in fallback) {
          fallback = fallback[key];
        } else {
          fallback = undefined;
          break;
        }
      }
      current = fallback;
    }

    if (typeof current !== "string") {
      return path; // Fallback to path itself if not found
    }

    // Parameter interpolation: replace {key} with value
    return current.replace(/\{(\w+)\}/g, (_, k) => (k in params ? params[k] : `{${k}}`));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
