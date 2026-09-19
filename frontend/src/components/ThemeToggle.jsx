import React, { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.getAttribute("data-theme") ||
        localStorage.getItem("coursehub-theme") ||
        "light"
      );
    }
    return "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("coursehub-theme", nextTheme);
  };

  useEffect(() => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") ||
      localStorage.getItem("coursehub-theme") ||
      "light";
    setTheme(currentTheme);

    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input, textarea or editable element
      const tag = e.target.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        e.target.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={isDark ? "Chuyển sang giao diện sáng (Phím T)" : "Chuyển sang giao diện tối (Phím T)"}
      title={isDark ? "Giao diện sáng (Phím T)" : "Giao diện tối (Phím T)"}
    >
      <div className={`theme-toggle-icon-wrap ${isDark ? "is-dark" : "is-light"}`}>
        {/* Sun Icon */}
        <svg
          className="theme-icon sun-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>

        {/* Moon Icon */}
        <svg
          className="theme-icon moon-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>

      <span className="theme-shortcut-badge">T</span>
    </button>
  );
}
