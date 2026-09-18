import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import CourseCard from "../components/CourseCard.jsx";
import SkeletonCard from "../components/SkeletonCard.jsx";
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
  ArrowRight
} from "lucide-react";

const CATEGORY_ICONS = {
  All: <Flame size={14} />,
  "Web Development": <Code2 size={14} />,
  "Backend": <Layers size={14} />,
  "Database": <BookOpen size={14} />,
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

  const [activeHeroTab, setActiveHeroTab] = useState("preview");

  return (
    <>
      {/* Warm Editorial Asymmetrical Hero Section */}
      <section className="hero-editorial">
        <div className="hero-editorial-split">
          {/* Left Column: Typography, Storytelling & CTAs */}
          <div className="hero-left-col">
            <div className="hero-pill-tag">
              <span className="hero-pill-star">✦</span>
              <span>Học thật · Làm thật · Kiến trúc chuẩn Production</span>
            </div>

            <h1 className="hero-editorial-title">
              Học kỹ thuật lập trình <br />
              <em>thực chiến</em> từ dự án thật.
            </h1>

            <p className="hero-editorial-desc">
              Chương trình đào tạo chuyên sâu xây dựng trên kiến trúc hệ thống thực tế — từ tối ưu hóa <strong>PostgreSQL Native</strong>, thiết kế full-stack hoàn chỉnh đến deploy production. Tự tin làm chủ mã nguồn, không lý thuyết suông.
            </p>

            {/* Inline Search Bar */}
            <div className="hero-search-inline">
              <Search size={16} className="hero-search-icon" />
              <input
                id="home-search"
                type="text"
                placeholder="Tìm khóa học, kỹ năng (React, SQL, Node.js...)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadCourses(q);
                    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                aria-label="Search courses"
              />
              <button
                className="btn hero-search-btn"
                onClick={() => {
                  loadCourses(q);
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Tìm kiếm
              </button>
            </div>

            {/* Dual CTA Buttons */}
            <div className="hero-cta-buttons">
              <a href="#catalog" className="btn hero-primary-pill">
                <span>Khám phá khóa học</span>
                <div className="btn-icon-circle"><ArrowRight size={14} /></div>
              </a>
              <button
                className="btn hero-secondary-pill"
                onClick={() => {
                  const first = courses[0];
                  if (first) navigate(`/courses/${first.id}`);
                }}
              >
                <Zap size={14} />
                <span>Học thử ngay</span>
              </button>
            </div>

            {/* Micro Trust Row */}
            <div className="hero-trust-row">
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Codebase dự án thật</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Kèm sát tiến độ</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Chứng chỉ hoàn thành</span></div>
            </div>
          </div>

          {/* Right Column: Interactive Spotlight Stage */}
          <div className="hero-right-col">
            <div className="interactive-stage-card">
              {/* Card Window Chrome */}
              <div className="stage-card-header">
                <div className="stage-window-dots">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="stage-tab-buttons">
                  <button
                    className={`stage-tab-btn ${activeHeroTab === "preview" ? "active" : ""}`}
                    onClick={() => setActiveHeroTab("preview")}
                  >
                    <span>✦ Trải nghiệm bài học</span>
                  </button>
                  <button
                    className={`stage-tab-btn ${activeHeroTab === "code" ? "active" : ""}`}
                    onClick={() => setActiveHeroTab("code")}
                  >
                    <span>Mô phỏng SQL</span>
                  </button>
                </div>
              </div>

              {activeHeroTab === "preview" ? (
                <div className="stage-card-content">
                  <div className="stage-lesson-meta">
                    <span className="badge-micro">BÀI 03 · CHUYÊN ĐỀ BACKEND</span>
                    <span className="badge-preview-tag">⚡ LIVE PREVIEW</span>
                  </div>

                  <h3 className="stage-lesson-title">
                    Tối ưu hóa Truy vấn PostgreSQL &amp; Connection Pool
                  </h3>
                  <p className="stage-lesson-sub">
                    Tối ưu query native không qua ORM cồng kềnh, phân trang tập chỉ mục và kiểm soát transaction an toàn.
                  </p>

                  {/* Interactive Player Screen */}
                  <div className="stage-player-box">
                    <div className="stage-player-screen">
                      <div className="stage-player-glow" />
                      <div className="stage-player-center-play">
                        <BookOpen size={20} />
                      </div>
                      <div className="stage-player-badge">Video 1080p · 24:15</div>
                    </div>
                    <div className="stage-player-controls">
                      <div className="stage-progress-bar">
                        <div className="stage-progress-fill" style={{ width: "42%" }} />
                      </div>
                      <div className="stage-time-display">
                        <span>10:15 / 24:15</span>
                        <span>Đã lưu tiến độ</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructor Verification Row */}
                  <div className="stage-instructor-row">
                    <div className="stage-instructor-avatar">HV</div>
                    <div>
                      <div className="stage-instructor-name">
                        Trần Hoàng Vũ <span className="verified-badge">✓ Đứng lớp trực tiếp</span>
                      </div>
                      <div className="stage-instructor-role">Software Architect &amp; Giảng viên CourseHub</div>
                    </div>
                  </div>

                  {/* Feature Chips */}
                  <div className="stage-feature-pills">
                    <span className="stage-pill">100% Code thật</span>
                    <span className="stage-pill">Lưu vị trí tự động</span>
                    <span className="stage-pill">Hỏi đáp trực tiếp</span>
                  </div>
                </div>
              ) : (
                <div className="stage-card-content">
                  <div className="stage-lesson-meta">
                    <span className="badge-micro">NATIVE SQL ENGINE</span>
                    <span className="badge-preview-tag green">⚡ 4.2ms LATENCY</span>
                  </div>

                  <h3 className="stage-lesson-title" style={{ fontFamily: "var(--font-family)" }}>
                    PostgreSQL Connection Pooling
                  </h3>

                  <div className="stage-code-block">
                    <pre>
                      <code>{`-- Native SQL Query Execution
const { rows } = await pool.query(\`
  SELECT 
    c.id, c.title, c.price,
    ROUND(AVG(r.rating), 1) AS rating,
    COUNT(DISTINCT e.id) AS students
  FROM courses c
  LEFT JOIN reviews r ON r.course_id = c.id
  LEFT JOIN enrollments e ON e.course_id = c.id
  WHERE c.status = 'PUBLISHED'
  GROUP BY c.id
  ORDER BY rating DESC;
\`);`}</code>
                    </pre>
                  </div>

                  <div className="stage-code-status">
                    <span className="status-dot green" />
                    <span>Executed in <strong>4.2ms</strong> · Zero ORM overhead</span>
                  </div>

                  <div className="stage-feature-pills" style={{ marginTop: "16px" }}>
                    <span className="stage-pill">Không phụ thuộc ORM</span>
                    <span className="stage-pill">Tốc độ tối đa</span>
                    <span className="stage-pill">PostgreSQL Native</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker Bar (Golden / Warm Slate) */}
      <div className="editorial-ticker">
        <div className="ticker-track">
          <span>✦ KHÓA HỌC LẬP TRÌNH THỰC CHIẾN 2026</span>
          <span>✦ NATIVE POSTGRESQL OPTIMIZATION</span>
          <span>✦ 100% CODEBASE DỰ ÁN THỰC TẾ</span>
          <span>✦ PHÒNG HỌC TƯƠNG TÁC THÔNG MINH</span>
          <span>✦ CẤP CHỨNG CHỈ TỐT NGHIỆP</span>
          <span>✦ HỖ TRỢ GIẢI ĐÁP CHUYÊN SÂU</span>
          <span>✦ KHÓA HỌC LẬP TRÌNH THỰC CHIẾN 2026</span>
          <span>✦ NATIVE POSTGRESQL OPTIMIZATION</span>
          <span>✦ 100% CODEBASE DỰ ÁN THỰC TẾ</span>
        </div>
      </div>

      {/* Full-Width Editorial Stats Strip */}
      <div className="editorial-stats-strip">
        <div className="stat-strip-col">
          <div className="stat-strip-num">{courses.length > 0 ? courses.length : "8+"}</div>
          <div className="stat-strip-label">Khóa học chuyên sâu</div>
          <div className="stat-strip-sub">Tuyển chọn từ bài toán thực tế</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">
            {totalReviews > 0
              ? `${(courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / (courses.filter(c => c.averageRating > 0).length || 1)).toFixed(1)}★`
              : "5.0★"}
          </div>
          <div className="stat-strip-label">Đánh giá học viên</div>
          <div className="stat-strip-sub">Chất lượng giảng dạy uy tín</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">100%</div>
          <div className="stat-strip-label">Thực hành dự án</div>
          <div className="stat-strip-sub">Không bài tập lý thuyết suông</div>
        </div>
        <div className="stat-strip-col">
          <div className="stat-strip-num">0 ms</div>
          <div className="stat-strip-label">Độ trễ ORM rườm rà</div>
          <div className="stat-strip-sub">Tối ưu truy vấn native SQL</div>
        </div>
      </div>

      {/* 3 Core Editorial Value Pillars */}
      <div className="editorial-pillars-grid">
        <div className="editorial-pillar-card">
          <div className="pillar-icon-circle">
            <Code2 size={22} />
          </div>
          <h3>Codebase thực chiến &amp; Kiến trúc sạch</h3>
          <p>
            Không dạy các ví dụ sơ sài. Bạn sẽ xây dựng ứng dụng quy mô lớn, chuẩn modular, tách lớp rõ ràng và sẵn sàng deploy production.
          </p>
        </div>

        <div className="editorial-pillar-card">
          <div className="pillar-icon-circle">
            <BookOpen size={22} />
          </div>
          <h3>Phòng học tương tác &amp; Ghi nhớ thông minh</h3>
          <p>
            Phát video sắc nét, ghi chú chi tiết theo từng bài học, phím tắt điều hướng nhanh và tự động lưu vị trí học dở để tiếp tục bất cứ lúc nào.
          </p>
        </div>

        <div className="editorial-pillar-card">
          <div className="pillar-icon-circle">
            <Award size={22} />
          </div>
          <h3>Chứng chỉ Tốt nghiệp &amp; Portfolio vững vàng</h3>
          <p>
            Hoàn thành 100% giáo trình để nhận chứng chỉ hoàn thành có định dạng in ấn chuyên nghiệp và mã xác thực, sẵn sàng đính kèm CV.
          </p>
        </div>
      </div>

      {/* Error Message Notification */}
      {error && (
        <div className="error" style={{ marginBottom: "24px" }}>
          <span>{error}</span>
        </div>
      )}

      {/* Catalog Header, Sort & Category Filter */}
      <div id="catalog" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px", scrollMarginTop: "90px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Explore Featured Courses
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
            {loading ? "Loading..." : `Showing ${filteredCourses.length} ${filteredCourses.length === 1 ? "course" : "courses"} available for enrollment`}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
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

      {/* Loading Skeleton Grid */}
      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        /* Empty Search Results Card */
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
            No matching courses found
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
            We couldn't find any courses matching your criteria. Try adjusting your search query or selecting a different category.
          </p>
          <button className="btn" onClick={handleReset}>
            View All Courses
          </button>
        </div>
      ) : (
        /* Course Grid */
        <div className="grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} enrolledIds={enrolledIds} />
          ))}
        </div>
      )}
    </>
  );
}
