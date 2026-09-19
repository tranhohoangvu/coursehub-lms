import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import CourseCard from "../components/CourseCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import NumberTicker from "../components/NumberTicker.jsx";
import Pagination from "../components/Pagination.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  Search,
  Sparkles,
  Users,
  Award,
  Zap,
  Star,
  BookOpen,
  Layers,
  Flame,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Code2,
  ArrowRight,
  ArrowUpRight,
  Play,
  Globe,
  Database,
  Server,
  Compass,
  Check,
  Target,
  Clock,
  Terminal,
  Cpu
} from "lucide-react";

const CATEGORY_ICONS = {
  All: <Flame size={14} />,
  "Web Development": <Code2 size={14} />,
  "Backend": <Layers size={14} />,
  "Database": <BookOpen size={14} />,
};

const DIAGNOSTIC_TRACKS = {
  beginner: {
    tag: "Foundation",
    title: "Core Engineering Foundation Track",
    desc: "Build solid computational thinking, master modern JavaScript (ES6+), and design relational databases before tackling complex systems.",
    duration: "8 - 10 Weeks (1.5h/day)",
    steps: [
      "Computational Thinking & Modern JavaScript (ES6+)",
      "Relational PostgreSQL Schema Design (3NF)",
      "Build Your First RESTful API with Node.js & Express"
    ],
    targetCategory: "Web Development",
    advice: "Spend 80% of your time writing actual code, not passively watching slides."
  },
  fullstack: {
    tag: "Production Ready",
    title: "Full-Stack Production Mastery",
    desc: "Architect end-to-end applications (LMS/E-Commerce) with responsive React interfaces and high-performance native PostgreSQL backends.",
    duration: "12 - 14 Weeks (2h/day)",
    steps: [
      "Master React 19, Custom Hooks & Clean State Management",
      "Multi-tier Auth Security (JWT HttpOnly + Bcrypt Password Hash)",
      "Native PostgreSQL Optimization & Connection Pooling",
      "Docker Containerization & Supabase/Render Cloud Deploy"
    ],
    targetCategory: "Web Development",
    advice: "Focus on mastering one production-ready project rather than dozens of trivial tutorials."
  },
  backend: {
    tag: "High-Perf Systems",
    title: "Backend Architecture & High-Perf SQL (Zero-ORM)",
    desc: "Deep-dive into large-scale query optimization, precision B-Tree indexing, and resilient Connection Pool management.",
    duration: "8 - 10 Weeks (2h/day)",
    steps: [
      "EXPLAIN ANALYZE & Sub-5ms Query Execution Plans",
      "Connection Pooling & Transaction Isolation Levels",
      "Data Protection, SQL Injection Defense & Rate Limiting",
      "Redis Caching Strategy & Scalable Microservices Patterns"
    ],
    targetCategory: "Backend",
    advice: "Always measure latency and buffer hit ratios before and after adding indexes."
  },
  career: {
    tag: "Career Ready",
    title: "Portfolio Engineering & Technical Interviews",
    desc: "Standardize codebases according to Clean Code & SOLID principles, prepare for technical system design interviews, and share verifiable certificates.",
    duration: "4 - 6 Weeks (Intensive)",
    steps: [
      "Refactor Codebases following Clean Architecture & SOLID",
      "Automated Testing with GitHub Actions CI/CD",
      "50+ System Design & Live Coding Interview Scenarios",
      "Verifiable digital completion certificate for your resume"
    ],
    targetCategory: "All",
    advice: "Hiring managers look for engineers who can clearly articulate architectural trade-offs."
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef(null);

  // Interactive SQL Sandbox State
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [queryMetrics, setQueryMetrics] = useState({
    time: "4.2",
    pool: "8/20",
    hit: "99.8%"
  });

  const handleRunQuery = () => {
    if (isQueryRunning) return;
    setIsQueryRunning(true);
    setTimeout(() => {
      const randomizedTime = (3.2 + Math.random() * 1.5).toFixed(1);
      const randomizedPool = `${Math.floor(6 + Math.random() * 6)}/20`;
      setQueryMetrics({
        time: randomizedTime,
        pool: randomizedPool,
        hit: "99.9%"
      });
      setIsQueryRunning(false);
    }, 420);
  };

  // Interactive Career Diagnostic state
  const [diagnosticGoal, setDiagnosticGoal] = useState("fullstack");

  // Handler to select skill track from Bento Hub
  const handleSelectSkillTrack = (categoryTarget) => {
    if (categoryTarget === "diagnostic") {
      const diagSection = document.getElementById("diagnostic-section");
      if (diagSection) {
        diagSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (categoryTarget === "pathways") {
      const pathSection = document.getElementById("career-pathways");
      if (pathSection) {
        pathSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSelectedCategory(categoryTarget);
    const catalogElem = document.getElementById("catalog");
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Debounced search — fire API after 400ms of no typing
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQ(q);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [q]);

  // Load courses when debounced query changes
  const loadCourses = useCallback(async (search = "") => {
    try {
      setLoading(true);
      setError("");
      const data = await api(`/courses${search ? `?q=${encodeURIComponent(search)}` : ""}`);
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses(debouncedQ);
  }, [debouncedQ, loadCourses]);

  // Load enrolled course IDs for the logged-in user
  useEffect(() => {
    if (!user) {
      setEnrolledIds([]);
      return;
    }
    api("/courses/mine")
      .then((data) => setEnrolledIds(data.map((item) => item.course?.id).filter(Boolean)))
      .catch(() => setEnrolledIds([]));
  }, [user]);

  // Derive unique categories dynamically from loaded courses
  const categories = useMemo(() => {
    const list = ["All"];
    courses.forEach((c) => {
      const name = c.category?.name;
      if (name && !list.includes(name)) {
        list.push(name);
      }
    });
    return list;
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.category?.name === selectedCategory);

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "rating":
        result = [...result].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "newest":
      default:
        result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return result;
  }, [courses, selectedCategory, sortBy]);

  // Real stats from loaded data
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
  const totalReviews = courses.reduce((sum, c) => sum + (c.reviewCount || 0), 0);

  // Pagination for Course Catalog
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Reset page when category, search query or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedQ, sortBy]);

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const catalogElem = document.getElementById("catalog");
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setQ("");
    setSelectedCategory("All");
    setSortBy("newest");
    setCurrentPage(1);
    loadCourses("");
  };

  return (
    <>
      {/* 1. Hero Section: Unified Headline, Search & Trust */}
      <section className="hero-editorial" style={{ paddingBottom: "24px" }}>
        <div className="hero-editorial-split">
          {/* Left Column: Typography, Storytelling & Search */}
          <div className="hero-left-col">
            <div className="hero-pill-tag">
              <Sparkles size={13} className="hero-pill-star" />
              <span>{t("home.heroTag")}</span>
            </div>

            <h1 className="hero-editorial-title">
              {t("home.heroTitle")}
            </h1>

            <p className="hero-editorial-desc" dangerouslySetInnerHTML={{ __html: t("home.heroDesc") }} />

            {/* Integrated Quick Search Bar directly in Hero */}
            <div className="hero-search-integrated-box" style={{ margin: "16px 0 20px 0", maxWidth: "100%" }}>
              <Search size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t("home.heroSearchPlaceholder")}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  const catalogElem = document.getElementById("catalog");
                  if (catalogElem && e.target.value.length === 1) {
                    catalogElem.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                aria-label="Search courses from hero"
              />
              {q ? (
                <button
                  className="catalog-search-clear"
                  onClick={() => setQ("")}
                  title="Clear search"
                >
                  <RotateCcw size={12} />
                </button>
              ) : (
                <kbd className="catalog-search-shortcut" title={t("nav.searchShortcutTip")}>
                  /
                </kbd>
              )}
            </div>

            {/* Dual CTA Buttons */}
            <div className="hero-cta-buttons">
              <a href="#catalog" className="btn hero-primary-pill">
                <span>{t("home.exploreCoursesBtn")}</span>
                <ArrowRight size={15} />
              </a>
              <button
                type="button"
                className="btn hero-secondary-pill"
                onClick={() => handleSelectSkillTrack("diagnostic")}
              >
                <Compass size={14} style={{ color: "var(--primary)" }} />
                <span>{t("home.careerAssessmentBtn")}</span>
              </button>
            </div>

            {/* Micro Trust Row */}
            <div className="hero-trust-row">
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>{t("home.trustItem1")}</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>{t("home.trustItem2")}</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>{t("home.trustItem3")}</span></div>
            </div>
          </div>

          {/* Right Column: High-Resolution Visual Asset */}
          <div className="hero-right-col">
            <div className="hero-visual-frame">
              <img
                src="/images/hero_ide_preview.jpg"
                alt="CourseHub High Performance Architecture Workspace"
                className="hero-visual-img"
              />
              <div className="hero-visual-badge">
                <span className="hero-visual-dot" />
                <span>{t("home.queryBadge")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Trust Bar */}
      <div className="credibility-strip">
        <div className="credibility-intro">
          <span className="credibility-badge">{t("home.credibilityBadge")}</span>
          <span className="credibility-title">
            {t("home.credibilityTitle")}
          </span>
        </div>
        <div className="credibility-partners">
          <span className="partner-chip">
            <Database size={13} style={{ color: "var(--primary)" }} />
            PostgreSQL Native
          </span>
          <span className="partner-chip">
            <Globe size={13} style={{ color: "#06B6D4" }} />
            React 19 Ecosystem
          </span>
          <span className="partner-chip">
            <Server size={13} style={{ color: "#10B981" }} />
            Node.js Engine
          </span>
          <span className="partner-chip">
            <Terminal size={13} style={{ color: "#8B5CF6" }} />
            Docker Containers
          </span>
          <span className="partner-chip">
            <ShieldCheck size={13} style={{ color: "#F59E0B" }} />
            Bcrypt + JWT Auth
          </span>
        </div>
      </div>

      {/* 2. Top-Fold Skill Practice Bento Hub */}
      <section className="skill-hub-section">
        <div className="section-header-row">
          <div>
            <div className="section-tag-pill">
              <Compass size={13} />
              <span>{t("home.bentoTag")}</span>
            </div>
            <h2 className="section-heading-lg">{t("home.bentoTitle")}</h2>
            <p className="section-sub-text">
              {t("home.bentoSub")}
            </p>
          </div>
          <button
            type="button"
            className="btn secondary"
            style={{ fontSize: "13px", padding: "8px 16px" }}
            onClick={() => handleSelectSkillTrack("diagnostic")}
          >
            <Target size={14} style={{ color: "var(--primary)" }} />
            <span>{t("home.roadmapBtn")}</span>
          </button>
        </div>

        <div className="skill-hub-grid">
          {/* Track 1: Frontend */}
          <div
            className="skill-hub-card"
            onClick={() => handleSelectSkillTrack("Web Development")}
            role="button"
            tabIndex={0}
          >
            <div className="skill-card-top">
              <div className="skill-card-icon-box">
                <Globe size={22} />
              </div>
              <span className="skill-card-tag pro">PRO TRACK</span>
            </div>
            <h3 className="skill-card-title">{t("home.trackFrontendTitle")}</h3>
            <p className="skill-card-desc">
              {t("home.trackFrontendDesc")}
            </p>
            <div className="skill-card-footer">
              <span>{t("home.trackFrontendAction")}</span>
              <ArrowUpRight size={16} className="skill-card-arrow" />
            </div>
          </div>

          {/* Track 2: Backend */}
          <div
            className="skill-hub-card"
            onClick={() => handleSelectSkillTrack("Backend")}
            role="button"
            tabIndex={0}
          >
            <div className="skill-card-top">
              <div className="skill-card-icon-box">
                <Server size={22} />
              </div>
              <span className="skill-card-tag highlight">ZERO ORM</span>
            </div>
            <h3 className="skill-card-title">{t("home.trackBackendTitle")}</h3>
            <p className="skill-card-desc">
              {t("home.trackBackendDesc")}
            </p>
            <div className="skill-card-footer">
              <span>{t("home.trackBackendAction")}</span>
              <ArrowUpRight size={16} className="skill-card-arrow" />
            </div>
          </div>

          {/* Track 3: Database */}
          <div
            className="skill-hub-card"
            onClick={() => handleSelectSkillTrack("Database")}
            role="button"
            tabIndex={0}
          >
            <div className="skill-card-top">
              <div className="skill-card-icon-box">
                <Database size={22} />
              </div>
              <span className="skill-card-tag">SYSTEM DESIGN</span>
            </div>
            <h3 className="skill-card-title">{t("home.trackDbTitle")}</h3>
            <p className="skill-card-desc">
              {t("home.trackDbDesc")}
            </p>
            <div className="skill-card-footer">
              <span>{t("home.trackDbAction")}</span>
              <ArrowUpRight size={16} className="skill-card-arrow" />
            </div>
          </div>

          {/* Track 4: Cloud & DevOps */}
          <div
            className="skill-hub-card"
            onClick={() => handleSelectSkillTrack("pathways")}
            role="button"
            tabIndex={0}
          >
            <div className="skill-card-top">
              <div className="skill-card-icon-box">
                <Terminal size={22} />
              </div>
              <span className="skill-card-tag pro">PRODUCTION</span>
            </div>
            <h3 className="skill-card-title">{t("home.trackDevopsTitle")}</h3>
            <p className="skill-card-desc">
              {t("home.trackDevopsDesc")}
            </p>
            <div className="skill-card-footer">
              <span>{t("home.trackDevopsAction")}</span>
              <ArrowUpRight size={16} className="skill-card-arrow" />
            </div>
          </div>

          {/* Track 5: Full-Stack */}
          <div
            className="skill-hub-card"
            onClick={() => handleSelectSkillTrack("All")}
            role="button"
            tabIndex={0}
          >
            <div className="skill-card-top">
              <div className="skill-card-icon-box">
                <Cpu size={22} />
              </div>
              <span className="skill-card-tag highlight">CAREER READY</span>
            </div>
            <h3 className="skill-card-title">{t("home.trackPracticeTitle")}</h3>
            <p className="skill-card-desc">
              {t("home.trackPracticeDesc")}
            </p>
            <div className="skill-card-footer">
              <span>{t("home.trackPracticeAction")}</span>
              <ArrowUpRight size={16} className="skill-card-arrow" />
            </div>
          </div>

          {/* Track 6: Free Diagnostic & Roadmap */}
          <div
            className="skill-hub-card"
            onClick={() => handleSelectSkillTrack("diagnostic")}
            role="button"
            tabIndex={0}
            style={{ borderColor: "rgba(56, 189, 248, 0.35)", background: "linear-gradient(145deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)" }}
          >
            <div className="skill-card-top">
              <div className="skill-card-icon-box" style={{ background: "var(--primary)", color: "#ffffff" }}>
                <Compass size={22} />
              </div>
              <span className="skill-card-tag highlight">FREE ASSESS</span>
            </div>
            <h3 className="skill-card-title">{t("home.diagTitle")}</h3>
            <p className="skill-card-desc">
              {t("home.diagSub")}
            </p>
            <div className="skill-card-footer" style={{ color: "#10B981" }}>
              <span>{t("home.careerAssessmentBtn")}</span>
              <ArrowUpRight size={16} className="skill-card-arrow" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Course Catalog Section */}
      <div id="catalog" style={{ scrollMarginTop: "90px", marginTop: "40px" }}>
        {/* Error Message Notification */}
        {error && (
          <div className="error" style={{ marginBottom: "24px" }}>
            <span>{error}</span>
          </div>
        )}

        {/* Catalog Header, Sort & Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {t("home.catalogHeading")}
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
              {loading ? t("common.loading") : t("home.catalogSub")}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Catalog Search Box */}
            <div className="catalog-search-box">
              <Search size={15} style={{ color: "var(--text-light)", flexShrink: 0 }} />
              <input
                id="catalog-search"
                type="text"
                placeholder={t("home.catalogSearchPlaceholder")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search courses"
              />
              {q ? (
                <button
                  className="catalog-search-clear"
                  onClick={() => setQ("")}
                  title="Clear search"
                >
                  <RotateCcw size={12} />
                </button>
              ) : (
                <kbd className="catalog-search-shortcut" title={t("nav.searchShortcutTip")}>
                  /
                </kbd>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-select-wrapper">
              <SlidersHorizontal size={15} style={{ color: "var(--text-muted)" }} />
              <select
                id="sort-courses"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort courses"
              >
                <option value="newest">{t("home.catalogSortNewest")}</option>
                <option value="rating">{t("home.catalogSortRating")}</option>
                <option value="price-asc">{t("home.catalogSortPriceAsc")}</option>
                <option value="price-desc">{t("home.catalogSortPriceDesc")}</option>
              </select>
            </div>

            {(q || selectedCategory !== "All") && (
              <button
                className="btn secondary"
                style={{ fontSize: "13px", padding: "6px 14px" }}
                onClick={handleReset}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="category-chips-wrapper">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-${cat.replace(/\s+/g, "-").toLowerCase()}`}
              className={`chip-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {CATEGORY_ICONS[cat] ?? <Layers size={14} />}
              {cat === "All" ? t("common.all") : cat}
            </button>
          ))}
        </div>

        {/* Loading Skeleton Grid / Empty State / Course Cards */}
        {loading ? (
          <div className="grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "56px 24px", maxWidth: "600px", margin: "0 auto" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--primary-light)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px auto"
              }}
            >
              <Search size={28} />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>
              {t("home.noCoursesFound")}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
              {t("home.noCoursesFoundDesc")}
            </p>
            <button className="btn" onClick={handleReset}>
              {t("home.clearFiltersBtn")}
            </button>
          </div>
        ) : (
          <>
            <div className="grid">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} enrolledIds={enrolledIds} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredCourses.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* 4. Interactive Learning & Architecture Lab (2-Column Split: Pathways + SQL Sandbox) */}
      <section id="career-pathways" className="learning-lab-container" style={{ scrollMarginTop: "90px" }}>
        {/* Left Column: 4-Level Pathways */}
        <div className="learning-lab-col">
          <div style={{ marginBottom: "16px" }}>
            <div className="section-tag-pill">
              <Layers size={13} />
              <span>{t("home.pathwaysTag")}</span>
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", margin: "4px 0 6px 0" }}>
              {t("home.pathwaysTitle")}
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
              {t("home.pathwaysSub")}
            </p>
          </div>

          <div className="pathways-timeline-list">
            {/* Level 1 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num">LEVEL 1 · FOUNDATION</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 4-6 weeks</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                {t("home.level1Title")}
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                {t("home.level1Desc")}
              </p>
            </div>

            {/* Level 2 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num">LEVEL 2 · DEVELOPMENT</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 6-8 weeks</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                {t("home.level2Title")}
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                {t("home.level2Desc")}
              </p>
            </div>

            {/* Level 3 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num" style={{ color: "#38BDF8" }}>LEVEL 3 · OPTIMIZATION</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 6-8 weeks</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                {t("home.level3Title")}
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                {t("home.level3Desc")}
              </p>
            </div>

            {/* Level 4 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num" style={{ color: "#10B981" }}>LEVEL 4 · ARCHITECTURE</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 4-6 weeks</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                {t("home.level4Title")}
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                {t("home.level4Desc")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive SQL Native Sandbox */}
        <div className="learning-lab-col">
          <div className="bento-card bento-hero-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="bento-badge">PRODUCTION ENGINE ARCHITECTURE</div>
              <h3 className="bento-card-title">{t("home.sandboxTitle")}</h3>
              <p className="bento-card-desc">
                {t("home.sandboxSub")}
              </p>

              <div className="bento-code-snippet">
                <div className="bento-code-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                    <span className="bento-code-filename">pool-query-optimizer.sql</span>
                  </div>

                  <button
                    type="button"
                    className={`bento-run-btn ${isQueryRunning ? "running" : ""}`}
                    onClick={handleRunQuery}
                    disabled={isQueryRunning}
                    title="Simulate optimized native query execution"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>{isQueryRunning ? t("home.sandboxRunning") : t("home.sandboxRunBtn")}</span>
                  </button>
                </div>
                <pre className={isQueryRunning ? "code-executing" : ""}>
                  <code>{`-- Native PostgreSQL Query (Zero ORM Latency)
SELECT c.id, c.title, c.price,
       ROUND(AVG(r.rating), 1) AS rating,
       COUNT(DISTINCT e.id) AS enrolled_students
FROM courses c
LEFT JOIN reviews r ON r.course_id = c.id
LEFT JOIN enrollments e ON e.course_id = c.id
WHERE c.status = 'PUBLISHED'
GROUP BY c.id
ORDER BY rating DESC;`}</code>
                </pre>
                <div className="bento-code-status">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span className={`status-dot ${isQueryRunning ? "pulsing-amber" : "green"}`} />
                    <span>
                      {isQueryRunning ? (
                        t("home.sandboxRunning")
                      ) : (
                        <>
                          {t("home.sandboxMetricExec")}: <strong className="tnum">{queryMetrics.time}ms</strong> · {t("home.sandboxMetricPool")}: <span className="tnum">{queryMetrics.pool}</span> · {t("home.sandboxMetricHit")}: <span className="tnum">{queryMetrics.hit}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ flex: 1, background: "var(--bg-subtle)", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "12.5px" }}>
                <span style={{ color: "#10B981", fontWeight: "700" }}>✓ Zero-ORM Overhead:</span> Direct queries respond under 5ms, reducing CPU load by up to 80% on production workloads.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Career Diagnostic Consultation */}
      <section id="diagnostic-section" className="diagnostic-section" style={{ scrollMarginTop: "90px" }}>
        <div className="diagnostic-grid">
          {/* Left Column: Form Question Selection */}
          <div>
            <div className="section-tag-pill">
              <Sparkles size={13} />
              <span>{t("home.diagTag")}</span>
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 8px 0" }}>
              {t("home.diagTitle")}
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              {t("home.diagSub")}
            </p>

            {/* Question 1: Goal */}
            <div className="diagnostic-question-title">{t("home.diagCurrentFocus")}:</div>
            <div className="diagnostic-chip-group">
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "beginner" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("beginner")}
              >
                <Code2 size={14} />
                Start from Foundation
              </button>
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "fullstack" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("fullstack")}
              >
                <Zap size={14} />
                {t("home.diagGoalFullstack")}
              </button>
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "backend" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("backend")}
              >
                <Server size={14} />
                {t("home.diagGoalBackend")}
              </button>
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "career" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("career")}
              >
                <Award size={14} />
                Interview &amp; Portfolio Ready
              </button>
            </div>
          </div>

          {/* Right Column: Instant Live Recommendation Card */}
          <div className="diagnostic-card-result">
            <div className="diagnostic-result-header">
              <span className="diagnostic-result-tag">
                {DIAGNOSTIC_TRACKS[diagnosticGoal]?.tag || "Recommended"}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} /> {DIAGNOSTIC_TRACKS[diagnosticGoal]?.duration}
              </span>
            </div>

            <h3 className="diagnostic-track-name">
              {DIAGNOSTIC_TRACKS[diagnosticGoal]?.title}
            </h3>
            <p className="diagnostic-track-desc">
              {DIAGNOSTIC_TRACKS[diagnosticGoal]?.desc}
            </p>

            <div className="diagnostic-steps-preview">
              {DIAGNOSTIC_TRACKS[diagnosticGoal]?.steps.map((step, idx) => (
                <div key={idx} className="diagnostic-step-item">
                  <CheckCircle2 size={14} style={{ color: "#10B981", flexShrink: 0 }} />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "10px 14px", borderRadius: "var(--radius-md)", marginBottom: "16px", border: "1px dashed var(--border-color)", fontSize: "12.5px", color: "var(--text-main)" }}>
              💡 <strong>Mentor Insight:</strong> {DIAGNOSTIC_TRACKS[diagnosticGoal]?.advice}
            </div>

            <button
              type="button"
              className="btn diagnostic-cta-btn"
              onClick={() => handleSelectSkillTrack(DIAGNOSTIC_TRACKS[diagnosticGoal]?.targetCategory || "All")}
            >
              <span>{t("home.exploreCoursesBtn")}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Platform Performance & Statistics Strip (Social Proof) */}
      <div className="editorial-stats-strip" style={{ marginTop: "24px", marginBottom: "48px" }}>
        <div className="stat-strip-col">
          <div className="stat-strip-num">
            <NumberTicker value={courses.length > 0 ? courses.length : 8} suffix="+" />
          </div>
          <div className="stat-strip-label">Specialized Courses</div>
          <div className="stat-strip-sub">Curated from production systems</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">
            <NumberTicker
              value={totalReviews > 0
                ? (courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / (courses.filter(c => c.averageRating > 0).length || 1)).toFixed(1)
                : 5.0}
              decimals={1}
              suffix="★"
            />
          </div>
          <div className="stat-strip-label">Student Satisfaction</div>
          <div className="stat-strip-sub">High-rigor curriculum feedback</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">
            <NumberTicker value={100} suffix="%" />
          </div>
          <div className="stat-strip-label">Project-Driven</div>
          <div className="stat-strip-sub">Zero passive theory slides</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">
            <NumberTicker value={0} suffix=" ms" />
          </div>
          <div className="stat-strip-label">Zero-ORM Latency</div>
          <div className="stat-strip-sub">Direct native SQL optimization</div>
        </div>
      </div>
    </>
  );
}
