import { useState } from "react";
import { api } from "../api/client.js";

export default function Instructor() {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: 0,
    thumbnailUrl: "https://placehold.co/600x400?text=Course",
    status: "PUBLISHED",
  });
  const [createdCourse, setCreatedCourse] = useState(null);
  const [lesson, setLesson] = useState({ title: "", content: "", order: 1, isPreview: false, videoUrl: "", resourceUrl: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function setCourseField(name, value) {
    setCourse((prev) => ({ ...prev, [name]: value }));
  }

  function setLessonField(name, value) {
    setLesson((prev) => ({ ...prev, [name]: value }));
  }

  async function createCourse(e) {
    e.preventDefault();
    try {
      setError("");
      const data = await api("/courses", { method: "POST", body: JSON.stringify(course) });
      setCreatedCourse(data);
      setMessage("Course created successfully!");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createLesson(e) {
    e.preventDefault();
    if (!createdCourse) return setError("Create a course first");
    try {
      setError("");
      const data = await api(`/courses/${createdCourse.id}/lessons`, { method: "POST", body: JSON.stringify(lesson) });
      setMessage(`Lesson "${data.title}" added successfully!`);
      setTimeout(() => setMessage(""), 5000);
      setLesson({ title: "", content: "", order: lesson.order + 1, isPreview: false, videoUrl: "", resourceUrl: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: "8px" }}>Instructor Dashboard</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
        Design high-quality educational experiences. Manage your course curriculum and lessons in one dashboard.
      </p>

      {message && <p className="success" style={{ marginBottom: "24px" }}>{message}</p>}
      {error && <p className="error" style={{ marginBottom: "24px" }}>{error}</p>}

      <div className="grid" style={{ alignItems: "start" }}>
        {/* Create Course Form Card */}
        <div className="card">
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginTop: 0, marginBottom: "20px", color: "var(--text-main)" }}>
            1. Create Course Details
          </h2>
          <form className="form" onSubmit={createCourse}>
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                className="input"
                required
                placeholder="e.g. Master React in 30 Days"
                value={course.title}
                onChange={(e) => setCourseField("title", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                required
                placeholder="Write a concise overview of what students will learn..."
                value={course.description}
                onChange={(e) => setCourseField("description", e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Price (VND)</label>
                <input
                  className="input"
                  type="number"
                  required
                  min={0}
                  placeholder="Price"
                  value={course.price}
                  onChange={(e) => setCourseField("price", Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" value={course.status} onChange={(e) => setCourseField("status", e.target.value)}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Thumbnail Image URL</label>
              <input
                className="input"
                placeholder="https://image-host.com/my-thumbnail.png"
                value={course.thumbnailUrl}
                onChange={(e) => setCourseField("thumbnailUrl", e.target.value)}
              />
            </div>

            <button className="btn" style={{ marginTop: "10px", height: "46px" }}>
              Create Course
            </button>
          </form>
        </div>

        {/* Add Lesson Form Card */}
        <div className="card">
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginTop: 0, marginBottom: "20px", color: "var(--text-main)" }}>
            2. Add Syllabus Lessons
          </h2>

          {createdCourse ? (
            <div style={{ background: "var(--primary-light)", color: "var(--primary-dark)", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "20px", fontWeight: "500" }}>
              Adding lessons to: <strong>{createdCourse.title}</strong>
            </div>
          ) : (
            <div style={{ background: "#f1f5f9", color: "var(--text-muted)", padding: "16px", borderRadius: "var(--radius-md)", fontSize: "14px", marginBottom: "20px", textAlign: "center" }}>
              Please fill out and submit the course creation form on the left first to start building lessons.
            </div>
          )}

          <form className="form" onSubmit={createLesson} style={{ opacity: createdCourse ? 1 : 0.6, pointerEvents: createdCourse ? "auto" : "none" }}>
            <div className="form-group">
              <label className="form-label">Lesson Title</label>
              <input
                className="input"
                required
                placeholder="e.g. Introduction to React components"
                value={lesson.title}
                onChange={(e) => setLessonField("title", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lesson Content / URL</label>
              <textarea
                className="input"
                required
                placeholder="Enter description, text content, or video streaming links for this lesson..."
                value={lesson.content}
                onChange={(e) => setLessonField("content", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">YouTube Video Link (Optional)</label>
              <input
                className="input"
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={lesson.videoUrl || ""}
                onChange={(e) => setLessonField("videoUrl", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Resource Attachment Link (Optional)</label>
              <input
                className="input"
                placeholder="e.g. https://resource-host.com/slides.pdf"
                value={lesson.resourceUrl || ""}
                onChange={(e) => setLessonField("resourceUrl", e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
              <div className="form-group">
                <label className="form-label">Lesson Order</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  required
                  value={lesson.order}
                  onChange={(e) => setLessonField("order", Number(e.target.value))}
                />
              </div>
              <label className="row" style={{ marginTop: "20px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                <input
                  type="checkbox"
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
                  checked={lesson.isPreview}
                  onChange={(e) => setLessonField("isPreview", e.target.checked)}
                />
                Preview Lesson
              </label>
            </div>

            <button className="btn secondary" style={{ marginTop: "10px", height: "46px", borderColor: "var(--primary)", color: "var(--primary)" }}>
              + Add Lesson to Curriculum
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
