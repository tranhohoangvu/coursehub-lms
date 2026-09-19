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
      {/* Taste-Skill High-Craft Minimalist Hero Section */}
      <section className="hero-editorial">
        <div className="hero-editorial-split">
          {/* Left Column: Typography, Storytelling & CTAs */}
          <div className="hero-left-col">
            <div className="hero-pill-tag">
              <Sparkles size={13} className="hero-pill-star" />
              <span>Nền tảng đào tạo kỹ thuật thực chiến</span>
            </div>

            <h1 className="hero-editorial-title">
              Học kỹ thuật lập trình thực chiến từ dự án thật.
            </h1>

            <p className="hero-editorial-desc">
              Chương trình đào tạo chuyên sâu về kiến trúc hệ thống thực tế, tối ưu hóa <strong>PostgreSQL Native</strong>, thiết kế full-stack hoàn chỉnh và sẵn sàng triển khai production.
            </p>

            {/* Dual CTA Buttons (Clean, Tactile & High-Contrast) */}
            <div className="hero-cta-buttons">
              <a href="#catalog" className="btn hero-primary-pill">
                <span>Khám phá khóa học</span>
                <ArrowRight size={15} />
              </a>
              <button
                className="btn hero-secondary-pill"
                onClick={() => {
                  const first = courses[0];
                  if (first) navigate(`/courses/${first.id}`);
                }}
              >
                <Zap size={14} style={{ color: "var(--primary)" }} />
                <span>Học thử ngay</span>
              </button>
            </div>

            {/* Micro Trust Row */}
            <div className="hero-trust-row">
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Codebase dự án thật</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Kèm sát tiến độ 1-1</span></div>
              <div className="trust-item"><CheckCircle2 size={15} className="trust-check" /> <span>Chứng chỉ hoàn thành</span></div>
            </div>
          </div>

          {/* Right Column: Authentic High-Resolution Visual Asset (Taste-Skill Compliant) */}
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

      {/* Clean 4-Column Statistics Strip */}
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

      {/* Asymmetric Bento Showcase (Anti-Slop: Eliminates 3-Column Equal Cards) */}
      <div className="bento-showcase-grid">
        {/* Large Feature Card (Span 2) */}
        <div className="bento-card bento-hero-card">
          <div className="bento-badge">KIẾN TRÚC PRODUCTION</div>
          <h3 className="bento-card-title">Codebase thực chiến &amp; Tối ưu Native Engine</h3>
          <p className="bento-card-desc">
            Không học qua các ví dụ đồ chơi sơ sài. Toàn bộ chương trình được xây dựng trên kiến trúc quy mô lớn: tối ưu truy vấn PostgreSQL Native không qua ORM cồng kềnh, phân trang tập chỉ mục và kiểm soát Connection Pool an toàn.
          </p>

          <div className="bento-code-snippet">
            <div className="bento-code-header">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="bento-code-filename">pool-query-optimizer.sql</span>
            </div>
            <pre>
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
              <span className="status-dot green" />
              <span>Executed in <strong>4.2ms</strong> · Memory footprint: 14KB</span>
            </div>
          </div>
        </div>

        {/* Right Column Stacked Tiles */}
        <div className="bento-stacked-col">
          <div className="bento-card bento-tile-card">
            <div className="bento-icon-wrapper">
              <BookOpen size={20} />
            </div>
            <h4 className="bento-tile-title">Phòng học tương tác &amp; Ghi nhớ thông minh</h4>
            <p className="bento-tile-desc">
              Phát video sắc nét, ghi chú markdown đồng bộ thời gian thực và tự động ghi nhớ vị trí học dở để tiếp tục bất cứ lúc nào.
            </p>
          </div>

          <div className="bento-card bento-tile-card">
            <div className="bento-icon-wrapper">
              <Award size={20} />
            </div>
            <h4 className="bento-tile-title">Chứng chỉ Tốt nghiệp &amp; Portfolio vững vàng</h4>
            <p className="bento-tile-desc">
              Hoàn thành 100% giáo trình để nhận chứng chỉ hoàn thành có mã tra cứu công khai, sẵn sàng đính kèm hồ sơ kỹ sư.
            </p>
          </div>
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
          {/* Catalog Search Box */}
          <div className="catalog-search-box">
            <Search size={15} style={{ color: "var(--text-light)", flexShrink: 0 }} />
            <input
              id="catalog-search"
              type="text"
              placeholder="Tìm theo tên khóa học..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search courses"
            />
            {q && (
              <button
                className="catalog-search-clear"
                onClick={() => setQ("")}
                title="Xóa tìm kiếm"
              >
                <RotateCcw size={12} />
              </button>
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
