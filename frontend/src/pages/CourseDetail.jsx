import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  Star,
  ShoppingCart,
  CheckCircle2,
  PlayCircle,
  Clock,
  BookOpen,
  Award,
  ShieldCheck,
  User,
  ArrowLeft,
  Sparkles,
  Send,
  MessageSquare,
  GraduationCap
} from "lucide-react";

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
  const { showToast } = useToast();
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);

  async function loadCourse() {
    const data = await api(`/courses/${id}`);
    setCourse(data);
  }

  async function checkEnrollment() {
    if (!user) {
      setIsEnrolled(false);
      return;
    }
    try {
      const res = await api(`/courses/${id}/enrollment`);
      setIsEnrolled(!!res.enrolled);
    } catch {
      setIsEnrolled(false);
    }
  }

  useEffect(() => {
    loadCourse().catch((err) => showToast(err.message, "error"));
  }, [id]);

  useEffect(() => {
    checkEnrollment();
  }, [user, id]);

  async function addToCart() {
    try {
      setAddingToCart(true);
      await api("/cart/items", { method: "POST", body: JSON.stringify({ courseId: id }) });
      await refreshCartCount();
      showToast("Course added to your cart!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAddingToCart(false);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api(`/courses/${id}/reviews`, { method: "POST", body: JSON.stringify(review) });
      showToast("Thank you! Review submitted.", "success");
      loadCourse();
      setReview({ rating: 5, comment: "" });
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function renderStars(rating, size = 16) {
    return (
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= rating ? "#fbbf24" : "none"}
            style={{ color: star <= rating ? "#fbbf24" : "#cbd5e1" }}
          />
        ))}
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px", color: "var(--text-muted)" }}>
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
        <p style={{ fontWeight: "600" }}>Loading course details...</p>
      </div>
    );
  }

  const isFree = Number(course.price) === 0;
  // Use real average rating from backend
  const avgRating = course.averageRating > 0
    ? course.averageRating.toFixed(1)
    : (course.reviews?.length
        ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
        : null);

  const previewLessons = course.lessons?.filter((l) => l.isPreview) || [];

  return (
    <div>
      {/* Breadcrumb Back Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Hero Header Banner */}
      <div className="detail-header-card">
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
          <span className="badge" style={{ background: "rgba(255, 255, 255, 0.15)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.2)" }}>
            {course.category?.name || "Software Engineering"}
          </span>
          <span className="badge cyan" style={{ fontSize: "11px" }}>
            <Sparkles size={12} /> Bestseller
          </span>
          {isEnrolled && (
            <span className="badge success" style={{ fontSize: "11px" }}>
              <CheckCircle2 size={12} /> Enrolled
            </span>
          )}
        </div>

        <h1>{course.title}</h1>

        <p style={{ fontSize: "16px", color: "#cbd5e1", maxWidth: "800px", lineHeight: "1.65", marginBottom: "24px" }}>
          {course.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", fontSize: "14px", color: "#e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Star size={16} fill="#fbbf24" style={{ color: "#fbbf24" }} />
            <strong>{avgRating || "New"}</strong>
            <span style={{ color: "#94a3b8" }}>({course.reviews?.length || 0} reviews)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <User size={16} style={{ color: "#38bdf8" }} />
            <span>Instructor: <strong>{course.instructor?.name || "Expert Mentor"}</strong></span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <BookOpen size={16} style={{ color: "#a855f7" }} />
            <span>{course.lessons?.length || 0} Lessons</span>
          </div>
        </div>
      </div>

      {/* Split Grid Content Layout */}
      <div className="detail-grid">
        {/* Left Column: Syllabus & Reviews */}
        <div>
          {/* What You'll Learn Checklist Card */}
          <div className="what-you-learn-box">
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)", marginBottom: "4px" }}>
              What you'll master in this course
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0 }}>
              Key takeaways and engineering capabilities you will acquire
            </p>

            <div className="learn-checklist-grid">
              <div className="learn-item">
                <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                <span>Deep dive into architectural patterns and raw database queries.</span>
              </div>
              <div className="learn-item">
                <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                <span>Master authentication, authorization, and secure JWT token flows.</span>
              </div>
              <div className="learn-item">
                <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                <span>Hands-on practice with step-by-step coding lessons.</span>
              </div>
              <div className="learn-item">
                <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                <span>Full industry-level certificate of completion upon graduation.</span>
              </div>
            </div>
          </div>

          {/* Curriculum Section */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>
                Curriculum &amp; Lessons ({course.lessons?.length || 0})
              </h2>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                {previewLessons.length > 0 ? `${previewLessons.length} Free Previews` : "Interactive Syllabus"}
              </span>
            </div>

            <div className="lesson-list">
              {!course.lessons || course.lessons.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  <BookOpen size={32} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
                  <p style={{ margin: 0 }}>No lessons published for this course yet.</p>
                </div>
              ) : (
                course.lessons.map((lesson) => {
                  const youtubeId = getYouTubeId(lesson.videoUrl);
                  const isPreviewLesson = lesson.isPreview;
                  const isActive = previewLesson?.id === lesson.id;

                  return (
                    <div key={lesson.id} className="lesson-item-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                        <div className="lesson-number-circle">
                          {lesson.order}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "2px" }}>
                            <strong style={{ fontSize: "15px", color: "var(--text-main)" }}>
                              {lesson.title}
                            </strong>
                            {isPreviewLesson && (
                              <span className="badge success" style={{ fontSize: "10px", padding: "2px 8px" }}>
                                Free Preview
                              </span>
                            )}
                          </div>
                          {lesson.content && (
                            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {lesson.content}
                            </p>
                          )}
                          {/* Inline preview player */}
                          {isPreviewLesson && isActive && youtubeId && (
                            <div style={{ marginTop: "12px", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "16/9" }}>
                              <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={lesson.title}
                                style={{ width: "100%", height: "100%", border: 0 }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        {isPreviewLesson ? (
                          <button
                            className="btn secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                            onClick={() => setPreviewLesson(isActive ? null : lesson)}
                          >
                            <PlayCircle size={14} style={{ color: "var(--primary)" }} />
                            {isActive ? "Close" : "Preview"}
                          </button>
                        ) : (
                          <PlayCircle size={18} style={{ color: "#cbd5e1" }} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Reviews & Feedback Section */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>
                Student Reviews &amp; Ratings
              </h2>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                {course.reviews?.length || 0} Ratings
              </span>
            </div>

            <div className="review-list" style={{ display: "grid", gap: "16px" }}>
              {!course.reviews || course.reviews.length === 0 ? (
                <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", borderStyle: "dashed" }}>
                  <MessageSquare size={32} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
                  <p style={{ margin: 0, fontWeight: "600" }}>No reviews yet. Be the first learner to leave a rating!</p>
                </div>
              ) : (
                course.reviews.map((r) => (
                  <div key={r.id} className="card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div className="user-avatar-initial" style={{ width: "30px", height: "30px", fontSize: "12px" }}>
                          {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span style={{ fontWeight: "700", color: "var(--text-main)", fontSize: "14px" }}>
                          {r.user?.name || "Student"}
                        </span>
                      </div>
                      {renderStars(r.rating, 14)}
                    </div>
                    <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                      {r.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Card — only show if enrolled */}
            {user && isEnrolled && (
              <div className="card" style={{ marginTop: "32px", background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", marginBottom: "4px" }}>Leave Your Review</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                  Share your experience with fellow learners.
                </p>

                <form className="form" onSubmit={submitReview}>
                  <div className="form-group">
                    <label className="form-label">Your Rating</label>
                    <div style={{ display: "flex", gap: "8px", margin: "4px 0" }}>
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
                            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star
                              size={28}
                              fill={isLit ? "#fbbf24" : "none"}
                              style={{
                                color: isLit ? "#fbbf24" : "#cbd5e1",
                                transform: hoverRating === star ? "scale(1.2)" : "scale(1)",
                                transition: "all 0.15s ease"
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Feedback</label>
                    <textarea
                      className="input"
                      required
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      placeholder="What did you enjoy the most about this course?"
                    />
                  </div>

                  <button className="btn" style={{ justifySelf: "start" }}>
                    <Send size={15} /> Submit Feedback
                  </button>
                </form>
              </div>
            )}

            {/* Prompt to enroll if logged in but not enrolled */}
            {user && !isEnrolled && (
              <div style={{ marginTop: "24px", padding: "16px", background: "var(--primary-light)", borderRadius: "var(--radius-md)", fontSize: "13.5px", color: "var(--primary-dark)" }}>
                <GraduationCap size={16} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                Enroll in this course to leave a review and access all lessons.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Purchase Widget */}
        <div>
          <div className="purchase-card-sticky">
            <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden", marginBottom: "20px", height: "180px", background: "#0f172a" }}>
              <img
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                src={course.thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"}
                alt={course.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80";
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", fontWeight: "600", textTransform: "uppercase" }}>
                Total Tuition
              </span>
              {isFree ? (
                <span className="price-tag free" style={{ fontSize: "26px", display: "inline-block", marginTop: "4px" }}>
                  FREE
                </span>
              ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "4px" }}>
                  <span className="price" style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>
                    {Number(course.price).toLocaleString("vi-VN")}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-muted)" }}>VND</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {isEnrolled ? (
              <Link
                to={`/my-courses?courseId=${id}`}
                className="btn success btn-glow"
                style={{ width: "100%", height: "48px", fontSize: "15px" }}
              >
                <PlayCircle size={18} /> Go to Classroom
              </Link>
            ) : user ? (
              <div style={{ display: "grid", gap: "10px" }}>
                <button
                  className="btn btn-glow"
                  style={{ width: "100%", height: "48px", fontSize: "15px" }}
                  onClick={addToCart}
                  disabled={addingToCart}
                >
                  <ShoppingCart size={18} />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
                <Link
                  to="/cart"
                  className="btn secondary"
                  style={{ width: "100%", height: "44px", fontSize: "14px" }}
                >
                  Go to Checkout
                </Link>
              </div>
            ) : (
              <div style={{ background: "var(--primary-light)", padding: "16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                <p style={{ fontSize: "13.5px", color: "var(--primary-dark)", margin: "0 0 12px 0", fontWeight: "600" }}>
                  Sign in or create an account to enroll in this course.
                </p>
                <Link
                  to="/login"
                  className="btn"
                  style={{ width: "100%", height: "44px", fontSize: "14px", justifyContent: "center" }}
                >
                  Sign In to Enroll
                </Link>
              </div>
            )}

            <div className="divider" style={{ margin: "24px 0" }}></div>

            {/* Value guarantee bullet points */}
            <div style={{ display: "grid", gap: "14px", fontSize: "13.5px", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldCheck size={18} style={{ color: "#10b981", flexShrink: 0 }} />
                <span>30-Day Money-Back Guarantee</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>Full Lifetime Access</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Award size={18} style={{ color: "#f59e0b", flexShrink: 0 }} />
                <span>Certificate of Completion</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <BookOpen size={18} style={{ color: "#06b6d4", flexShrink: 0 }} />
                <span>Access on Mobile, Tablet &amp; Desktop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
