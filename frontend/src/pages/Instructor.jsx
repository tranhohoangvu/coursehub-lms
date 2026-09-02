import { useState } from "react";
import { api } from "../api/client.js";
import {
  GraduationCap,
  BookPlus,
  ListPlus,
  Sparkles,
  CheckCircle2,
  Video,
  FileText,
  DollarSign,
  Eye,
  Plus
} from "lucide-react";

export default function Instructor() {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    status: "PUBLISHED",
  });
  const [createdCourse, setCreatedCourse] = useState(null);
  const [lesson, setLesson] = useState({
    title: "",
    content: "",
    order: 1,
    isPreview: false,
    videoUrl: "",
    resourceUrl: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setCourseField(name, value) {
    setCourse((prev) => ({ ...prev, [name]: value }));
  }

  function setLessonField(name, value) {
    setLesson((prev) => ({ ...prev, [name]: value }));
  }

  async function createCourse(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");
      const data = await api("/courses", { method: "POST", body: JSON.stringify(course) });
      setCreatedCourse(data);
      setMessage(`Course "${data.title}" created successfully! Now add lessons to build your curriculum.`);
      setTimeout(() => setMessage(""), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function createLesson(e) {
    e.preventDefault();
    if (!createdCourse) return setError("Please create and submit a course first.");
    try {
      setIsSubmitting(true);
      setError("");
      const data = await api(`/courses/${createdCourse.id}/lessons`, { method: "POST", body: JSON.stringify(lesson) });
      setMessage(`Lesson "${data.title}" added to curriculum successfully!`);
      setTimeout(() => setMessage(""), 5000);
      setLesson({ title: "", content: "", order: lesson.order + 1, isPreview: false, videoUrl: "", resourceUrl: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={20} />
            </div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.6px" }}>
              Instructor Teaching Studio
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
            Publish interactive developer courses, build video curriculum, and share resources with students worldwide.
          </p>
        </div>
      </div>

      {message && <div className="success" style={{ marginBottom: "24px" }}>{message}</div>}
      {error && <div className="error" style={{ marginBottom: "24px" }}>{error}</div>}

      <div className="grid" style={{ alignItems: "start", gap: "32px" }}>
        {/* Step 1: Create Course Details Form Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800" }}>
              1
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>
              Create Course Metadata
            </h2>
          </div>

          <form className="form" onSubmit={createCourse}>
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                className="input"
                required
                placeholder="e.g. Master Full-Stack PostgreSQL & Node.js"
                value={course.title}
                onChange={(e) => setCourseField("title", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description & Syllabus Overview</label>
              <textarea
                className="input"
                required
                placeholder="Describe what key developer capabilities and projects students will build..."
                value={course.description}
                onChange={(e) => setCourseField("description", e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Tuition Price (VND)</label>
                <input
                  className="input"
                  type="number"
                  required
                  min={0}
                  placeholder="0 for Free"
                  value={course.price}
                  onChange={(e) => setCourseField("price", Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Publishing Status</label>
                <select className="input" value={course.status} onChange={(e) => setCourseField("status", e.target.value)}>
                  <option value="DRAFT">Draft Mode</option>
                  <option value="PUBLISHED">Published Live</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Thumbnail Image URL</label>
              <input
                className="input"
                placeholder="https://images.unsplash.com/photo-..."
                value={course.thumbnailUrl}
                onChange={(e) => setCourseField("thumbnailUrl", e.target.value)}
              />
            </div>

            <button className="btn btn-glow" style={{ marginTop: "12px", height: "46px" }} disabled={isSubmitting}>
              <BookPlus size={16} /> {isSubmitting ? "Creating Course..." : "Create Course"}
            </button>
          </form>
        </div>

        {/* Step 2: Add Syllabus Lessons Card */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: createdCourse ? "#10b981" : "#94a3b8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800" }}>
              2
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0, color: "var(--text-main)" }}>
              Add Curriculum Lessons
            </h2>
          </div>

          {createdCourse ? (
            <div style={{ background: "var(--primary-light)", color: "var(--primary-dark)", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "13.5px", marginBottom: "20px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} />
              <span>Target Course: <strong>{createdCourse.title}</strong></span>
            </div>
          ) : (
            <div style={{ background: "#f8fafc", border: "1px dashed var(--border-color)", color: "var(--text-muted)", padding: "16px", borderRadius: "var(--radius-md)", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
              Submit course details on the left first to enable the lesson builder.
            </div>
          )}

          <form className="form" onSubmit={createLesson} style={{ opacity: createdCourse ? 1 : 0.6, pointerEvents: createdCourse ? "auto" : "none" }}>
            <div className="form-group">
              <label className="form-label">Lesson Title</label>
              <input
                className="input"
                required
                placeholder="e.g. 1. Architecture Overview & Setup"
                value={lesson.title}
                onChange={(e) => setLessonField("title", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lesson Content / Notes</label>
              <textarea
                className="input"
                required
                placeholder="Detailed explanations, code snippets, or instructions..."
                value={lesson.content}
                onChange={(e) => setLessonField("content", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">YouTube Video URL (Optional)</label>
              <input
                className="input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={lesson.videoUrl || ""}
                onChange={(e) => setLessonField("videoUrl", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Resource Link (Optional)</label>
              <input
                className="input"
                placeholder="https://github.com/... or slide deck link"
                value={lesson.resourceUrl || ""}
                onChange={(e) => setLessonField("resourceUrl", e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
              <div className="form-group">
                <label className="form-label">Lesson Order Index</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  required
                  value={lesson.order}
                  onChange={(e) => setLessonField("order", Number(e.target.value))}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "22px", cursor: "pointer", fontSize: "13.5px", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  checked={lesson.isPreview}
                  onChange={(e) => setLessonField("isPreview", e.target.checked)}
                />
                Free Preview Lesson
              </label>
            </div>

            <button className="btn success" style={{ marginTop: "12px", height: "46px" }} disabled={isSubmitting}>
              <Plus size={16} /> Add Lesson to Syllabus
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
