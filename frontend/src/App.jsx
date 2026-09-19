import { useState, useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { useCart } from "./context/CartContext.jsx";
import { useLanguage } from "./context/LanguageContext.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import BackToTop from "./components/BackToTop.jsx";
import {
  Menu,
  X,
  Sparkles,
  BookOpen,
  ShoppingCart,
  GraduationCap,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Compass,
  Heart,
  Code2,
  Globe
} from "lucide-react";

export default function App() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll-aware nav shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global keyboard shortcut: press "/" anywhere to focus search
  useEffect(() => {
    const handleGlobalSlash = (e) => {
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
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("catalog-search");
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };
    window.addEventListener("keydown", handleGlobalSlash);
    return () => window.removeEventListener("keydown", handleGlobalSlash);
  }, []);

  // Determine user role badge style
  const getRoleBadgeClass = (role) => {
    if (role === "ADMIN") return "badge admin";
    if (role === "INSTRUCTOR") return "badge instructor";
    return "badge student";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Sticky Clean Navbar */}
      <nav className={`nav${isScrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="logo" onClick={() => setIsSidebarOpen(false)}>
            <div className="logo-icon">
              <BookOpen size={18} />
            </div>
            <span>CourseHub</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links desktop-only">
            <NavLink to="/" end>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Compass size={16} /> {t("nav.explore")}
              </span>
            </NavLink>

            {user && (
              <NavLink to="/my-courses">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <BookOpen size={16} /> {t("nav.myLearning")}
                </span>
              </NavLink>
            )}

            {user && (
              <NavLink to="/cart" className="cart-nav-link" title={t("nav.cartItemsTooltip", { count: cartCount })}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShoppingCart size={16} /> {t("nav.cart")}
                </span>
                {cartCount > 0 && (
                  <span className="cart-count-badge">{cartCount}</span>
                )}
              </NavLink>
            )}

            {user?.role === "INSTRUCTOR" && (
              <NavLink to="/instructor">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <GraduationCap size={16} /> {t("nav.instructorStudio")}
                </span>
              </NavLink>
            )}

            {user?.role === "ADMIN" && (
              <NavLink to="/admin">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} /> {t("nav.adminDashboard")}
                </span>
              </NavLink>
            )}

            {!user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "8px" }}>
                <NavLink className="btn nav-btn-login" to="/login">
                  <LogIn size={15} /> {t("nav.logIn")}
                </NavLink>
                <NavLink className="btn nav-btn-register" to="/register">
                  <UserPlus size={15} /> {t("nav.register")}
                </NavLink>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "8px" }}>
                <div className="user-nav-profile">
                  <div className="user-avatar-initial">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span style={{ color: "var(--text-main)" }}>{user.name}</span>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </div>
                <button
                  className="btn nav-btn-logout"
                  onClick={logout}
                  title={t("nav.logOut")}
                  style={{ padding: "0 12px", height: "38px" }}
                >
                  <LogOut size={15} /> {t("nav.logOut")}
                </button>
              </div>
            )}

            {/* Language Switcher Button (EN / VI) */}
            <LanguageToggle />

            {/* Theme Toggle Button (Light/Dark mode) */}
            <ThemeToggle />
          </div>

          {/* Mobile Right Controls: Language, Theme & Burger Menu */}
          <div className="mobile-only" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LanguageToggle showLabel={false} />
            <ThemeToggle />
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay and Sidebar */}
      {isSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <Link to="/" className="logo" onClick={() => setIsSidebarOpen(false)}>
                <div className="logo-icon" style={{ width: "28px", height: "28px" }}>
                  <BookOpen size={16} />
                </div>
                <span>CourseHub</span>
              </Link>
              <button
                className="sidebar-close"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="sidebar-links">
              <NavLink to="/" end onClick={() => setIsSidebarOpen(false)}>
                <Compass size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                {t("nav.explore")}
              </NavLink>
              {user && (
                <NavLink to="/my-courses" onClick={() => setIsSidebarOpen(false)}>
                  <BookOpen size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  {t("nav.myLearning")}
                </NavLink>
              )}
              {user && (
                <NavLink to="/cart" onClick={() => setIsSidebarOpen(false)}>
                  <ShoppingCart size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  {t("nav.cart")} {cartCount > 0 && <span className="cart-count-badge" style={{ marginLeft: "4px" }}>{cartCount}</span>}
                </NavLink>
              )}
              {user?.role === "INSTRUCTOR" && (
                <NavLink to="/instructor" onClick={() => setIsSidebarOpen(false)}>
                  <GraduationCap size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  {t("nav.instructorStudio")}
                </NavLink>
              )}
              {user?.role === "ADMIN" && (
                <NavLink to="/admin" onClick={() => setIsSidebarOpen(false)}>
                  <ShieldCheck size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  {t("nav.adminDashboard")}
                </NavLink>
              )}

              <div className="sidebar-divider"></div>

              {!user ? (
                <div style={{ display: "grid", gap: "10px", width: "100%", marginTop: "8px" }}>
                  <NavLink
                    className="btn nav-btn-login"
                    to="/login"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <LogIn size={16} /> {t("nav.logIn")}
                  </NavLink>
                  <NavLink
                    className="btn nav-btn-register"
                    to="/register"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <UserPlus size={16} /> {t("nav.register")}
                  </NavLink>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px", width: "100%" }}>
                  <div className="user-nav-profile" style={{ justifyContent: "center", width: "100%", padding: "8px 12px" }}>
                    <div className="user-avatar-initial">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span style={{ color: "var(--text-main)" }}>{user.name}</span>
                    <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                  </div>
                  <button
                    className="btn nav-btn-logout"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => {
                      logout();
                      setIsSidebarOpen(false);
                    }}
                  >
                    <LogOut size={16} /> {t("nav.logOut")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="container" style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Rich Multi-Column Modern Footer */}
      <footer className="footer">
        <div className="container" style={{ padding: "0 24px" }}>
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="logo" style={{ marginBottom: "14px" }}>
                <div className="logo-icon" style={{ width: "28px", height: "28px" }}>
                  <BookOpen size={16} />
                </div>
                <span>CourseHub</span>
              </div>
              <p style={{ maxWidth: "340px", fontSize: "14px", lineHeight: "1.6", color: "var(--text-muted)" }}>
                {t("footer.tagline")}
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                <span className="badge" style={{ fontSize: "11px" }}>PostgreSQL</span>
                <span className="badge" style={{ fontSize: "11px" }}>React 19</span>
                <span className="badge" style={{ fontSize: "11px" }}>Node.js</span>
              </div>
              {/* Social links */}
              <div className="footer-social">
                <a
                  href="https://github.com/tranhohoangvu/coursehub-lms"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link"
                  title="GitHub Repository"
                >
                  <Code2 size={16} />
                </a>
                <a
                  href="https://coursehub-lms-eight.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-link"
                  title="Live Demo"
                >
                  <Globe size={16} />
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h5>{t("footer.tracksHeading")}</h5>
              <ul className="footer-links">
                <li><Link to="/#catalog">Frontend Engineering</Link></li>
                <li><Link to="/#catalog">Backend &amp; Native SQL</Link></li>
                <li><Link to="/#catalog">Database Architecture</Link></li>
                <li><Link to="/#catalog">Full-Stack Mastery</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>{t("footer.platformHeading")}</h5>
              <ul className="footer-links">
                <li><a href="/#career-pathways">{t("footer.quickPathways")}</a></li>
                <li><a href="/#diagnostic-section">{t("home.careerAssessmentBtn")}</a></li>
                <li><Link to="/#catalog">{t("footer.quickCatalog")}</Link></li>
                <li><Link to="/my-courses">{t("footer.quickClassroom")}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>{t("footer.legalHeading")}</h5>
              <ul className="footer-links">
                <li><Link to="/my-courses">{t("classroom.viewCertificate")}</Link></li>
                <li><Link to="/instructor">{t("nav.instructorStudio")}</Link></li>
                <li><a href="https://github.com/tranhohoangvu/coursehub-lms" target="_blank" rel="noreferrer">{t("footer.legalSecurity")}</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="footer-status-dot" />
              <span>All systems operational</span>
              <span style={{ color: "#475569", margin: "0 8px" }}>·</span>
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
              Crafted with <Heart size={14} style={{ color: "#f43f5e" }} /> by Hoang Vu
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back To Top Button */}
      <BackToTop />
    </div>
  );
}
