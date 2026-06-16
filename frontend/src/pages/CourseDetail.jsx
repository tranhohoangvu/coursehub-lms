import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);

  async function loadCourse() {
    const data = await api(`/courses/${id}`);
    setCourse(data);
  }

  useEffect(() => { loadCourse().catch((err) => setError(err.message)); }, [id]);

  async function addToCart() {
    try {
      setMessage("");
      setError("");
      await api("/cart/items", { method: "POST", body: JSON.stringify({ courseId: id }) });
      setMessage("Added to cart");
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api(`/courses/${id}/reviews`, { method: "POST", body: JSON.stringify(review) });
      setMessage("Review submitted");
      loadCourse();
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  // Draw star rating
  function renderStars(rating) {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            style={{ width: "16px", height: "16px", color: star <= rating ? "#fbbf24" : "#e2e8f0" }}
            fill={star <= rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p>Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="detail-grid">
      {/* Left Column: Course Main Details */}
      <div>
        <h1 style={{ fontSize: "32px", marginBottom: "16px" }}>{course.title}</h1>
        <p style={{ fontSize: "16px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.7" }}>
          {course.description}
        </p>

        <div className="divider"></div>

        <h2>Lessons ({course.lessons.length})</h2>
        <div className="lesson-list">
          {course.lessons.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No lessons uploaded for this course yet.</p>
          ) : (
            course.lessons.map((lesson) => (
              <div className="card" key={lesson.id} style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "36px", height: "36px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "50%", fontWeight: "700", fontSize: "14px" }}>
                  {lesson.order}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "16px", color: "var(--text-main)" }}>{lesson.title}</strong>
                    {lesson.isPreview && <span className="badge success" style={{ fontSize: "10px", padding: "2px 8px" }}>Preview Lesson</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>{lesson.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="divider"></div>

        <h2>Reviews & Feedback</h2>
        <div className="review-list">
          {course.reviews.length === 0 ? (
            <div className="card" style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", borderStyle: "dashed" }}>
              <p style={{ margin: 0 }}>No reviews yet. Be the first to review this course!</p>
            </div>
          ) : (
            course.reviews.map((r) => (
              <div key={r.id} className="card" style={{ padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{r.user.name}</span>
                  {renderStars(r.rating)}
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>{r.comment}</p>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className="card" style={{ marginTop: "24px", background: "#f8fafc" }}>
            <h3 style={{ marginBottom: "16px" }}>Write a review</h3>
            <form className="form" onSubmit={submitReview}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: "flex", gap: "6px", margin: "4px 0" }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = (hoverRating || review.rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px",
                          outline: "none"
                        }}
                        onClick={() => setReview({ ...review, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <svg
                          style={{
                            width: "28px",
                            height: "28px",
                            color: isLit ? "#fbbf24" : "#cbd5e1",
                            transform: hoverRating === star ? "scale(1.15)" : "scale(1)",
                            transition: "all 0.15s ease"
                          }}
                          fill={isLit ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Review Comment</label>
                <textarea className="input" required value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder="Tell others what you learned or thought about this course..." />
              </div>
              <button className="btn" style={{ justifySelf: "start" }}>Submit Review</button>
            </form>
          </div>
        )}
      </div>

      {/* Right Column: Sticky Sidebar Checkout Widget */}
      <div className="sidebar-sticky">
        <div className="card" style={{ padding: "24px", overflow: "hidden" }}>
          <img className="course-img" style={{ height: "160px", marginBottom: "16px" }} src={course.thumbnailUrl || "https://placehold.co/600x400?text=Course"} alt={course.title} />
          
          <div style={{ marginBottom: "16px" }}>
            <span className="badge">{course.category?.name || "General"}</span>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", display: "block", fontWeight: "500" }}>Total Cost</span>
            <span className="price" style={{ fontSize: "28px", fontWeight: "800" }}>
              {course.price === 0 ? "Free" : `${course.price.toLocaleString("vi-VN")} VND`}
            </span>
          </div>

          {user ? (
            <button className="btn" style={{ width: "100%", height: "46px", fontSize: "15px" }} onClick={addToCart}>
              <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Cart
            </button>
          ) : (
            <div style={{ background: "var(--danger-light)", color: "var(--danger)", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "13px", textAlign: "center", fontWeight: "500" }}>
              Please <Link to="/login" style={{ textDecoration: "underline", fontWeight: "700" }}>login</Link> to purchase this course.
            </div>
          )}

          {message && <p className="success" style={{ marginTop: "16px" }}>{message}</p>}
          {error && <p className="error" style={{ marginTop: "16px" }}>{error}</p>}

          <div className="divider" style={{ margin: "20px 0" }}></div>

          <div style={{ display: "grid", gap: "12px", fontSize: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg style={{ width: "16px", height: "16px", color: "var(--text-muted)" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Instructor: <strong>{course.instructor?.name}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg style={{ width: "16px", height: "16px", color: "var(--text-muted)" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Full lifetime access</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg style={{ width: "16px", height: "16px", color: "var(--text-muted)" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>Certificate of completion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
