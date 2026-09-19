import React from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import { Globe } from "lucide-react";

export default function LanguageToggle({ className = "", showLabel = true }) {
  const { language, toggleLanguage } = useLanguage();

  const isVi = language === "vi";

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`lang-toggle-btn ${className}`}
      aria-label={isVi ? "Chuyển sang Tiếng Anh (Switch to English)" : "Switch to Vietnamese (Chuyển sang Tiếng Việt)"}
      title={isVi ? "Ngôn ngữ: Tiếng Việt (Bấm để chuyển sang English)" : "Language: English (Click to switch to Tiếng Việt)"}
    >
      <Globe size={15} className="lang-icon" />
      <span className="lang-code-tag">
        {isVi ? "VI" : "EN"}
      </span>
      {showLabel && (
        <span className="lang-label-sub">
          {isVi ? "Tiếng Việt" : "English"}
        </span>
      )}
    </button>
  );
}
