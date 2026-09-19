import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import CourseCard from "../components/CourseCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
import NumberTicker from "../components/NumberTicker.jsx";
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
    tag: "Lộ Trình Nhập Môn",
    title: "Kỹ Sư Nền Tảng (Core Foundation Track)",
    desc: "Xây dựng tư duy thuật toán vững chắc, làm chủ JavaScript ES6+ và thiết kế cơ sở dữ liệu quan hệ trước khi bước vào dự án lớn.",
    duration: "Khoảng 8 - 10 tuần (1.5h/ngày)",
    steps: [
      "Tư duy cấu trúc dữ liệu & JavaScript Modern ES6+",
      "Thiết kế cơ sở dữ liệu quan hệ PostgreSQL chuẩn 3NF",
      "Xây dựng RESTful API đầu tay với Express & Node.js"
    ],
    targetCategory: "Web Development",
    advice: "Dành 80% thời gian gõ code thực tế, không học vẹt lý thuyết qua slide."
  },
  fullstack: {
    tag: "Lộ Trình Thực Chiến",
    title: "Kỹ Sư Full-Stack Production (Full-Stack Mastery)",
    desc: "Xây dựng hoàn chỉnh nền tảng quy mô lớn (LMS/E-Commerce) từ giao diện React mượt mà đến backend PostgreSQL Native chịu tải cao.",
    duration: "Khoảng 12 - 14 tuần (2h/ngày)",
    steps: [
      "Làm chủ React 19, Custom Hooks & Clean State Management",
      "Bảo mật Auth đa tầng (JWT HttpOnly + Bcrypt Password Hash)",
      "Tối ưu hóa PostgreSQL Native & Connection Pool",
      "Đóng gói Docker Containers & Deploy Cloud Supabase/Render"
    ],
    targetCategory: "Web Development",
    advice: "Tập trung hoàn thiện 1 đồ án lớn chuẩn doanh nghiệp thay vì làm nhiều bài tập nhỏ rời rạc."
  },
  backend: {
    tag: "Lộ Trình Chuyên Sâu",
    title: "Kiến Trúc Backend & High-Perf SQL (Zero-ORM)",
    desc: "Chuyên sâu vào tối ưu hóa truy vấn cơ sở dữ liệu quy mô lớn, đánh B-Tree index chính xác và kiểm soát Connection Pool an toàn.",
    duration: "Khoảng 8 - 10 tuần (2h/ngày)",
    steps: [
      "Phân tích EXPLAIN ANALYZE & Tối ưu Execution Plan dưới 5ms",
      "Cấu hình Connection Pool & Transaction Isolation Levels",
      "Bảo vệ dữ liệu, chống SQL Injection & Rate Limiting",
      "Triển khai Redis Cache & Chuẩn hóa Microservices Architecture"
    ],
    targetCategory: "Backend",
    advice: "Luôn đo đạc độ trễ và số lượt quét đĩa trước và sau khi đánh index."
  },
  career: {
    tag: "Lộ Trình Tuyển Dụng",
    title: "Portfolio Kỹ Sư & Luyện Phỏng Vấn (Career Ready)",
    desc: "Chuẩn hóa mã nguồn theo Clean Architecture, chuẩn bị câu hỏi phỏng vấn kỹ thuật và nhận mã tra cứu chứng chỉ số hóa đính kèm CV.",
    duration: "Khoảng 4 - 6 tuần (Tập trung cao)",
    steps: [
      "Refactor Codebase theo nguyên lý Clean Code & SOLID",
      "Thiết lập CI/CD GitHub Actions kiểm thử tự động",
      "Luyện 50 câu hỏi phỏng vấn System Design & Live Coding",
      "Chứng chỉ hoàn thành có mã xác thực số hóa gửi nhà tuyển dụng"
    ],
    targetCategory: "All",
    advice: "Nhà tuyển dụng đánh giá cao khả năng giải thích lý do lựa chọn giải pháp kiến trúc."
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleReset = () => {
    setQ("");
    setSelectedCategory("All");
    setSortBy("newest");
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
              <span>Nền tảng đào tạo kỹ thuật thực chiến chuẩn doanh nghiệp</span>
            </div>

            <h1 className="hero-editorial-title">
              Học kỹ thuật lập trình thực chiến từ dự án thật.
            </h1>

            <p className="hero-editorial-desc">
              Chương trình đào tạo chuyên sâu về kiến trúc hệ thống thực tế, tối ưu hóa <strong>PostgreSQL Native</strong>, thiết kế full-stack hoàn chỉnh và sẵn sàng triển khai production.
            </p>

            {/* Integrated Quick Search Bar directly in Hero */}
            <div className="hero-search-integrated-box" style={{ margin: "16px 0 20px 0", maxWidth: "100%" }}>
              <Search size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Tìm nhanh khóa học, kỹ năng (React, PostgreSQL, Docker...)..."
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
                  title="Xóa tìm kiếm"
                >
                  <RotateCcw size={12} />
                </button>
              ) : (
                <kbd className="catalog-search-shortcut" title="Nhấn / để tìm kiếm nhanh">
                  /
                </kbd>
              )}
            </div>

            {/* Dual CTA Buttons */}
            <div className="hero-cta-buttons">
              <a href="#catalog" className="btn hero-primary-pill">
                <span>Khám phá khóa học</span>
                <ArrowRight size={15} />
              </a>
              <button
                type="button"
                className="btn hero-secondary-pill"
                onClick={() => handleSelectSkillTrack("diagnostic")}
              >
                <Compass size={14} style={{ color: "var(--primary)" }} />
                <span>Khảo sát lộ trình miễn phí</span>
              </button>
            </div>

            {/* Micro Trust Row */}
            <div className="hero-trust-row">
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>100% Codebase dự án thật</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Kèm sát code review 1-1</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Chứng chỉ số hóa QR</span></div>
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
                <span>PostgreSQL Native · 4.2ms Query Execution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Trust Bar */}
      <div className="credibility-strip">
        <div className="credibility-intro">
          <span className="credibility-badge">Cam kết chuẩn kỹ sư</span>
          <span className="credibility-title">
            Chương trình đào tạo chuyên sâu chuẩn kiến trúc doanh nghiệp
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

      {/* 2. Top-Fold Skill Practice Bento Hub (Inspired by TID 6 Practice Tracks) */}
      <section className="skill-hub-section">
        <div className="section-header-row">
          <div>
            <div className="section-tag-pill">
              <Compass size={13} />
              <span>Chuyên Mục Rèn Luyện Thực Chiến</span>
            </div>
            <h2 className="section-heading-lg">Rèn Luyện Kỹ Năng — Chuẩn Kỹ Sư Công Nghệ</h2>
            <p className="section-sub-text">
              Giáo trình phân theo từng miền chuyên môn. Chọn chuyên mục để lọc nhanh các khóa học tương ứng bên dưới.
            </p>
          </div>
          <button
            type="button"
            className="btn secondary"
            style={{ fontSize: "13px", padding: "8px 16px" }}
            onClick={() => handleSelectSkillTrack("diagnostic")}
          >
            <Target size={14} style={{ color: "var(--primary)" }} />
            <span>Khảo sát định hướng lộ trình</span>
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
            <h3 className="skill-card-title">Frontend Engineering</h3>
            <p className="skill-card-desc">
              Làm chủ React 19, TypeScript, Clean Component Architecture và kỹ thuật tối ưu hóa hiệu năng render 60fps mượt mà.
            </p>
            <div className="skill-card-footer">
              <span>Lọc khóa học Frontend</span>
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
            <h3 className="skill-card-title">Backend &amp; Native SQL</h3>
            <p className="skill-card-desc">
              Xây dựng RESTful API chuẩn mực, tối ưu hóa truy vấn PostgreSQL Native không qua ORM cồng kềnh, cấu hình Connection Pools.
            </p>
            <div className="skill-card-footer">
              <span>Lọc khóa học Backend</span>
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
            <h3 className="skill-card-title">Database Architecture</h3>
            <p className="skill-card-desc">
              Thiết kế Schema chuẩn 3NF, phân tích EXPLAIN ANALYZE, đánh B-Tree Index và kiểm soát Transaction an toàn.
            </p>
            <div className="skill-card-footer">
              <span>Lọc khóa học Database</span>
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
            <h3 className="skill-card-title">DevOps &amp; Cloud Deploy</h3>
            <p className="skill-card-desc">
              Container hóa ứng dụng với Docker, thiết lập CI/CD tự động và triển khai trên Render &amp; Supabase Cloud bảo mật.
            </p>
            <div className="skill-card-footer">
              <span>Xem lộ trình DevOps</span>
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
            <h3 className="skill-card-title">Full-Stack Mastery</h3>
            <p className="skill-card-desc">
              Xây dựng hoàn chỉnh nền tảng LMS và E-Commerce end-to-end với phân quyền Role-Based, giỏ hàng, thanh toán và chứng chỉ.
            </p>
            <div className="skill-card-footer">
              <span>Xem tất cả khóa học</span>
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
              <span className="skill-card-tag highlight">MIỄN PHÍ</span>
            </div>
            <h3 className="skill-card-title">Định Hướng Lộ Trình</h3>
            <p className="skill-card-desc">
              Khảo sát 30 giây để nhận bản đồ lộ trình học tập cá nhân hóa phù hợp với thời gian và mục tiêu nghề nghiệp của bạn.
            </p>
            <div className="skill-card-footer" style={{ color: "#10B981" }}>
              <span>Làm khảo sát ngay</span>
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
              Danh Sách Khóa Học Chuyên Sâu
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
              {loading ? "Đang tải dữ liệu..." : `Hiển thị ${filteredCourses.length} khóa học phù hợp`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Catalog Search Box */}
            <div className="catalog-search-box">
              <Search size={15} style={{ color: "var(--text-light)", flexShrink: 0 }} />
              <input
                id="catalog-search"
                type="text"
                placeholder="Lọc theo tên khóa học..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search courses"
              />
              {q ? (
                <button
                  className="catalog-search-clear"
                  onClick={() => setQ("")}
                  title="Xóa tìm kiếm"
                >
                  <RotateCcw size={12} />
                </button>
              ) : (
                <kbd className="catalog-search-shortcut" title="Nhấn / để tìm kiếm nhanh">
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
                <option value="newest">Mới nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
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
              {cat}
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
              Không tìm thấy khóa học phù hợp
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
              Không có khóa học nào khớp với điều kiện tìm kiếm hiện tại. Bạn có thể chọn danh mục khác hoặc xóa bộ lọc.
            </p>
            <button className="btn" onClick={handleReset}>
              Xem tất cả khóa học
            </button>
          </div>
        ) : (
          <div className="grid">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} enrolledIds={enrolledIds} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Interactive Learning & Architecture Lab (2-Column Split: Pathways + SQL Sandbox) */}
      <section id="career-pathways" className="learning-lab-container" style={{ scrollMarginTop: "90px" }}>
        {/* Left Column: 4-Level Pathways */}
        <div className="learning-lab-col">
          <div style={{ marginBottom: "16px" }}>
            <div className="section-tag-pill">
              <Layers size={13} />
              <span>Lộ Trình Đào Tạo 4 Cấp Độ</span>
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-main)", margin: "4px 0 6px 0" }}>
              Hành Trình Kỹ Sư Toàn Diện
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
              Từ người mới bắt đầu đến tự tin kiến trúc hệ thống và triển khai Cloud Production.
            </p>
          </div>

          <div className="pathways-timeline-list">
            {/* Level 1 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num">CẤP ĐỘ 1 · FOUNDATION</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 4-6 tuần</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                Nền Tảng Kỹ Thuật &amp; JavaScript Modern
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                Tư duy thuật toán, JS ES6+, DOM API, HTML5/CSS3 Semantic và quy trình Git Flow nhóm.
              </p>
            </div>

            {/* Level 2 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num">CẤP ĐỘ 2 · DEVELOPMENT</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 6-8 tuần</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                Ứng Dụng React 19 &amp; RESTful API Engine
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                Xây dựng Single-Page App với React 19, backend Express/Node.js và cơ sở dữ liệu PostgreSQL.
              </p>
            </div>

            {/* Level 3 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num" style={{ color: "#38BDF8" }}>CẤP ĐỘ 3 · OPTIMIZATION</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 6-8 tuần</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                PostgreSQL Native &amp; Bảo Mật Đa Tầng
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                Tối ưu truy vấn Native dưới 5ms, phân tích EXPLAIN ANALYZE, Auth JWT HttpOnly và Bcrypt.
              </p>
            </div>

            {/* Level 4 */}
            <div className="pathway-step-card-compact">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span className="pathway-step-num" style={{ color: "#10B981" }}>CẤP ĐỘ 4 · ARCHITECTURE</span>
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}><Clock size={11} /> 4-6 tuần</span>
              </div>
              <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 6px 0", color: "var(--text-main)" }}>
                Cloud Native, DevOps &amp; System Design
              </h4>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.4" }}>
                Container hóa Docker, CI/CD tự động hóa, triển khai Cloud và hoàn thiện portfolio kỹ sư.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive SQL Native Sandbox */}
        <div className="learning-lab-col">
          <div className="bento-card bento-hero-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="bento-badge">KIẾN TRÚC PRODUCTION ENGINE</div>
              <h3 className="bento-card-title">Phòng Thí Nghiệm SQL Native &amp; Zero-ORM</h3>
              <p className="bento-card-desc">
                Trải nghiệm sự khác biệt về hiệu năng khi thực thi trực tiếp trên PostgreSQL Native so với ORM cồng kềnh.
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
                    title="Chạy mô phỏng truy vấn tối ưu"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>{isQueryRunning ? "Đang chạy..." : "Chạy truy vấn"}</span>
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
                        "Đang thực thi truy vấn qua Connection Pool..."
                      ) : (
                        <>
                          Executed in <strong className="tnum">{queryMetrics.time}ms</strong> · Pool: <span className="tnum">{queryMetrics.pool}</span> · Hit: <span className="tnum">{queryMetrics.hit}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ flex: 1, background: "var(--bg-subtle)", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "12.5px" }}>
                <span style={{ color: "#10B981", fontWeight: "700" }}>✓ Zero-ORM Overhead:</span> Tối ưu truy vấn trực tiếp giúp API phản hồi dưới 5ms, giảm 80% tải CPU trên server production.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Career Diagnostic Consultation (TID Consultation Banner) */}
      <section id="diagnostic-section" className="diagnostic-section" style={{ scrollMarginTop: "90px" }}>
        <div className="diagnostic-grid">
          {/* Left Column: Form Question Selection */}
          <div>
            <div className="section-tag-pill">
              <Sparkles size={13} />
              <span>Định Hướng Lộ Trình Cá Nhân Hóa</span>
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 8px 0" }}>
              Nhận Bản Đồ Định Hướng Lộ Trình Học Tập
            </h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5", margin: "0 0 20px 0" }}>
              Chọn mục tiêu hiện tại để nhận kế hoạch rèn luyện chuẩn kỹ sư từ đội ngũ giảng viên CourseHub.
            </p>

            {/* Question 1: Goal */}
            <div className="diagnostic-question-title">Mục tiêu trọng tâm của bạn:</div>
            <div className="diagnostic-chip-group">
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "beginner" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("beginner")}
              >
                <Code2 size={14} />
                Bắt đầu từ con số 0
              </button>
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "fullstack" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("fullstack")}
              >
                <Zap size={14} />
                Lên Kỹ Sư Full-Stack Thực Chiến
              </button>
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "backend" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("backend")}
              >
                <Server size={14} />
                Tối ưu Backend &amp; High-Perf SQL
              </button>
              <button
                type="button"
                className={`diagnostic-chip-btn ${diagnosticGoal === "career" ? "active" : ""}`}
                onClick={() => setDiagnosticGoal("career")}
              >
                <Award size={14} />
                Luyện Phỏng Vấn &amp; Portfolio
              </button>
            </div>
          </div>

          {/* Right Column: Instant Live Recommendation Card */}
          <div className="diagnostic-card-result">
            <div className="diagnostic-result-header">
              <span className="diagnostic-result-tag">
                {DIAGNOSTIC_TRACKS[diagnosticGoal]?.tag || "Khuyến Nghị"}
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
              💡 <strong>Lời khuyên Mentor:</strong> {DIAGNOSTIC_TRACKS[diagnosticGoal]?.advice}
            </div>

            <button
              type="button"
              className="btn diagnostic-cta-btn"
              onClick={() => handleSelectSkillTrack(DIAGNOSTIC_TRACKS[diagnosticGoal]?.targetCategory || "All")}
            >
              <span>Bắt đầu lộ trình này ngay</span>
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
          <div className="stat-strip-label">Khóa học chuyên sâu</div>
          <div className="stat-strip-sub">Tuyển chọn từ bài toán thực tế</div>
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
          <div className="stat-strip-label">Đánh giá học viên</div>
          <div className="stat-strip-sub">Chất lượng giảng dạy uy tín</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">
            <NumberTicker value={100} suffix="%" />
          </div>
          <div className="stat-strip-label">Thực hành dự án</div>
          <div className="stat-strip-sub">Không bài tập lý thuyết suông</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">
            <NumberTicker value={0} suffix=" ms" />
          </div>
          <div className="stat-strip-label">Độ trễ ORM rườm rà</div>
          <div className="stat-strip-sub">Tối ưu truy vấn native SQL</div>
        </div>
      </div>
    </>
  );
}
