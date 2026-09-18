import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Code2
} from "lucide-react";

const CATEGORY_ICONS = {
  All: <Flame size={14} />,
  "Web Development": <Code2 size={14} />,
  "Backend": <Layers size={14} />,
  "Database": <BookOpen size={14} />,
};

export default function Home() {
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

  return (
    <>
      {/* High-Tech Futuristic Hero Section */}
      <section className="hero">
        <div className="hero-pill-badge">
          <Sparkles size={14} style={{ color: "#38bdf8" }} />
          <span>Next-Generation Learning Platform · 2026 Edition</span>
        </div>

        <h1>
          Master Modern Tech Stack with <br />
          <span className="hero-gradient-text">Industry-Grade Courses</span>
        </h1>

        <p>
          Elevate your developer career with practical, high-performance courses. Built with modern architecture, native SQL query optimization, and real-world projects.
        </p>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                pointerEvents: "none"
              }}
            />
            <input
              id="home-search"
              type="text"
              placeholder="Search courses, skills, or topics..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search courses"
            />
          </div>
          <button className="btn btn-glow" onClick={() => loadCourses(q)}>
            <Search size={16} /> Search
          </button>
        </div>

        {/* Live Metrics Stats Banner */}
        <div className="hero-stats">
          <div className="hero-stat-card">
            <div className="hero-stat-number">
              <Users size={20} style={{ color: "#38bdf8" }} />
              <span>{courses.length > 0 && totalEnrollments > 0 ? `${totalEnrollments.toLocaleString()}+` : `${courses.length}+`}</span>
            </div>
            <div className="hero-stat-label">
              {totalEnrollments > 0 ? "Total Enrollments" : "Available Courses"}
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-number">
              <Star size={20} style={{ color: "#fbbf24" }} />
              <span>
                {totalReviews > 0
                  ? (courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) / courses.filter(c => c.averageRating > 0).length || 0).toFixed(1)
                  : "5.0"}
              </span>
            </div>
            <div className="hero-stat-label">Average Rating</div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-number">
              <Zap size={20} style={{ color: "#a855f7" }} />
              <span>100%</span>
            </div>
            <div className="hero-stat-label">Hands-on Practice</div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-number">
              <Award size={20} style={{ color: "#34d399" }} />
              <span>Verified</span>
            </div>
            <div className="hero-stat-label">Course Certifications</div>
          </div>
        </div>
      </section>

      {/* Feature Value Props Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div className="card" style={{ display: "flex", gap: "16px", alignItems: "center", padding: "18px 20px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "rgba(99, 102, 241, 0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>Native SQL Engine</h4>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>Zero-ORM latency with native pg driver</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: "16px", alignItems: "center", padding: "18px 20px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>JWT & RBAC Security</h4>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>Role-based security across all endpoints</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: "16px", alignItems: "center", padding: "18px 20px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Award size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "2px" }}>Structured Syllabus</h4>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>Interactive classroom & video lessons</p>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
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
