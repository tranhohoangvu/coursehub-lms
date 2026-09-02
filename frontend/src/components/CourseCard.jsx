import { Link } from "react-router-dom";
import { Star, ArrowRight, BookOpen, Clock, CheckCircle2 } from "lucide-react";

export default function CourseCard({ course }) {
  const isFree = Number(course.price) === 0;

  // Derive initial for instructor avatar
  const instructorName = course.instructor?.name || "Instructor";
  const instructorInitial = instructorName.charAt(0).toUpperCase();

  return (
    <div className="course-card">
      {/* Thumbnail Container */}
      <div className="course-thumbnail-box">
        <img
          src={course.thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"}
          alt={course.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80";
          }}
        />
        <div className="course-thumbnail-overlay-badge">
          <span className="badge" style={{ background: "rgba(15, 23, 42, 0.75)", color: "#ffffff", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
            {course.category?.name || "Development"}
          </span>
        </div>
      </div>

      {/* Course Body */}
      <div className="course-content-body">
        {/* Rating and Meta Indicators */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12.5px", fontWeight: "700", color: "#f59e0b" }}>
            <Star size={14} fill="#f59e0b" />
            <span>4.9</span>
            <span style={{ color: "var(--text-light)", fontWeight: "500" }}>(120+ reviews)</span>
          </div>

          <span style={{ fontSize: "12px", color: "var(--text-light)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={13} /> Self-paced
          </span>
        </div>

        {/* Title */}
        <Link to={`/courses/${course.id}`} className="course-title-link" title={course.title}>
          {course.title}
        </Link>

        {/* Description Snippet */}
        <p className="course-desc-snippet">
          {course.description || "Master essential modern concepts, hands-on projects, and real-world architectures."}
        </p>

        {/* Instructor Info Row */}
        <div className="course-meta-row">
          <div className="instructor-pill">
            <div className="instructor-avatar-circle">
              {instructorInitial}
            </div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "4px" }}>
              {instructorName}
              <CheckCircle2 size={13} style={{ color: "#10b981" }} />
            </span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="course-footer-row">
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Tuition
            </span>
            {isFree ? (
              <span className="price-tag free">FREE</span>
            ) : (
              <span className="price-tag">
                {Number(course.price).toLocaleString("vi-VN")} <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>VND</span>
              </span>
            )}
          </div>

          <Link
            className="btn"
            to={`/courses/${course.id}`}
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            Explore <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
