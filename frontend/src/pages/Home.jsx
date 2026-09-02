import { useEffect, useState, useMemo } from "react";
import { api } from "../api/client.js";
import CourseCard from "../components/CourseCard.jsx";
import {
  Search,
  Sparkles,
  Users,
  Award,
  Zap,
  Star,
  BookOpen,
  Filter,
  Layers,
  Flame,
  CheckCircle2,
  Code2,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadCourses(search = "") {
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
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      loadCourses(q);
    }
  };

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

  // Filter courses by category selection
  const filteredCourses = useMemo(() => {
    if (selectedCategory === "All") return courses;
    return courses.filter((c) => c.category?.name === selectedCategory);
  }, [courses, selectedCategory]);

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
              type="text"
              placeholder="Search courses, skills, or topics..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={handleKeyDown}
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
              <span>15,000+</span>
            </div>
            <div className="hero-stat-label">Active Learners</div>
          </div>

          <div className="hero-stat-card">
            <div className="hero-stat-number">
              <Star size={20} style={{ color: "#fbbf24" }} />
              <span>4.9 / 5.0</span>
            </div>
            <div className="hero-stat-label">Student Rating</div>
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

      {/* Catalog Header & Category Filter Chips */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            Explore Featured Courses
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
            Showing {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} available for enrollment
          </p>
        </div>

        {q && (
          <button
            className="btn secondary"
            style={{ fontSize: "13px", padding: "6px 14px" }}
            onClick={() => {
              setQ("");
              loadCourses("");
            }}
          >
            <RotateCcw size={13} /> Reset Search
          </button>
        )}
      </div>

      {/* Category Pills Filter Bar */}
      <div className="category-chips-wrapper">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip-btn ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "All" && <Flame size={14} />}
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeleton / State */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
          <div
            style={{
              display: "inline-block",
              width: "44px",
              height: "44px",
              border: "4px solid var(--border-color)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px"
            }}
          ></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: "600" }}>Loading courses from database...</p>
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
          <button
            className="btn"
            onClick={() => {
              setQ("");
              setSelectedCategory("All");
              loadCourses("");
            }}
          >
            View All Courses
          </button>
        </div>
      ) : (
        /* Course Grid */
        <div className="grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </>
  );
}
