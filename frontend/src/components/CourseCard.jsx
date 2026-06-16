import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <img className="course-img" src={course.thumbnailUrl || "https://placehold.co/600x400?text=Course"} alt={course.title} />
      <div style={{ marginBottom: "8px" }}>
        <span className="badge">{course.category?.name || "General"}</span>
      </div>
      <h3 style={{ fontSize: "17px", fontWeight: "700", marginBottom: "8px", flexGrow: 0 }}>
        {course.title}
      </h3>
      <p style={{ fontSize: "13.5px", color: "var(--text-muted)", flexGrow: 1, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {course.description}
      </p>
      
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
        <svg style={{ width: "16px", height: "16px" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Instructor: <strong>{course.instructor?.name}</strong></span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
        <div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", fontWeight: "500" }}>Price</span>
          <span className="price" style={{ fontSize: "16px", fontWeight: "800" }}>
            {course.price === 0 ? "Free" : `${course.price.toLocaleString("vi-VN")} VND`}
          </span>
        </div>
        <Link className="btn" to={`/courses/${course.id}`} style={{ padding: "8px 14px", fontSize: "13px" }}>
          View Detail
        </Link>
      </div>
    </div>
  );
}
