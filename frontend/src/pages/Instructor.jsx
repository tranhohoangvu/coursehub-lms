import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  GraduationCap, BookPlus, ListPlus, CheckCircle2, Plus,
  Pencil, Trash2, ChevronDown, ChevronUp, Eye, EyeOff,
  Layers, Loader2, RefreshCw, BookOpen
} from "lucide-react";

// Step indicator component
function StepIndicator({ current, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "32px" }}>
      {steps.map((step, idx) => {
        const isActive = idx === current;
        const isDone = idx < current;
        return (
          <div key={idx} style={{ display: "flex", alignItems: "center", flex: idx < steps.length - 1 ? 1 : "none" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 16px", borderRadius: "var(--radius-md)",
              background: isActive ? "var(--primary)" : isDone ? "var(--success-light)" : "var(--bg-subtle)",
              color: isActive ? "#fff" : isDone ? "var(--success-dark)" : "var(--text-muted)",
              fontWeight: "700", fontSize: "13px", whiteSpace: "nowrap",
              boxShadow: isActive ? "0 4px 12px var(--primary-glow)" : "none",
              transition: "var(--transition-smooth)"
            }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                background: isActive ? "rgba(255,255,255,0.25)" : isDone ? "#10b981" : "var(--border-color)",
                color: isDone ? "#fff" : "inherit",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "800"
              }}>
                {isDone ? <CheckCircle2 size={14} /> : idx + 1}
              </div>
              {step}
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: "2px", background: isDone ? "#10b981" : "var(--border-color)", margin: "0 8px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Instructor() {
  const { showToast } = useToast();

  // Step wizard: 0=Course Info, 1=Add Lessons, 2=Done/My Courses
  const [step, setStep] = useState(0);

  // Course form
  const [course, setCourse] = useState({
    title: "", description: "", price: 0,
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    status: "PUBLISHED",
  });
  const [createdCourse, setCreatedCourse] = useState(null);

  // Lesson form
  const [lesson, setLesson] = useState({ title: "", content: "", order: 1, isPreview: false, videoUrl: "", resourceUrl: "" });

  // My courses list
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  // Edit lesson modal
  const [editingLesson, setEditingLesson] = useState(null);
  const [editLessonForm, setEditLessonForm] = useState({});

  // Edit course modal
  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({});

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STEPS = ["Course Info", "Build Lessons", "My Courses"];

  // Load categories and instructor's courses on mount
  async function loadMyCourses() {
    try {
      setLoadingCourses(true);
      // Get all published + draft courses belonging specifically to this instructor
      const data = await api("/courses/instructor/mine");
      setMyCourses(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingCourses(false);
    }
  }

  useEffect(() => {
    loadMyCourses();
    api("/courses/categories").then(setCategories).catch(() => {});
  }, []);

  function openEditCourse(c) {
    setEditingCourse(c);
    setEditCourseForm({
      title: c.title,
      description: c.description,
      price: c.price,
      status: c.status,
      categoryId: c.categoryId || "",
      thumbnailUrl: c.thumbnailUrl || "",
    });
  }

  async function handleEditCourseSave(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api(`/courses/${editingCourse.id}`, {
        method: "PATCH",
        body: JSON.stringify(editCourseForm),
      });
      showToast("Course details updated successfully!", "success");
      setEditingCourse(null);
      loadMyCourses();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteLesson(lessonId, lessonTitle) {
    if (!window.confirm(`Are you sure you want to delete lesson "${lessonTitle}"?`)) return;
    try {
      await api(`/courses/lessons/${lessonId}`, { method: "DELETE" });
      showToast(`Lesson "${lessonTitle}" deleted.`, "success");
      loadMyCourses();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleDeleteCourse(courseId, courseTitle) {
    if (!window.confirm(`Are you sure you want to delete course "${courseTitle}"? All associated lessons will be permanently deleted.`)) return;
    try {
      await api(`/courses/${courseId}`, { method: "DELETE" });
      showToast(`Course "${courseTitle}" deleted.`, "success");
      if (createdCourse?.id === courseId) setCreatedCourse(null);
      loadMyCourses();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = await api("/courses", { method: "POST", body: JSON.stringify(course) });
      setCreatedCourse(data);
      showToast(`Course "${data.title}" created! Now add lessons.`, "success");
      setStep(1);
      loadMyCourses();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateLesson(e) {
    e.preventDefault();
    if (!createdCourse) return showToast("Create a course first.", "error");
    try {
      setIsSubmitting(true);
      const data = await api(`/courses/${createdCourse.id}/lessons`, { method: "POST", body: JSON.stringify(lesson) });
      showToast(`Lesson "${data.title}" added!`, "success");
      setLesson({ title: "", content: "", order: lesson.order + 1, isPreview: false, videoUrl: "", resourceUrl: "" });
      loadMyCourses();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditLessonSave(e) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api(`/courses/lessons/${editingLesson.id}`, { method: "PATCH", body: JSON.stringify(editLessonForm) });
      showToast("Lesson updated!", "success");
      setEditingLesson(null);
      loadMyCourses();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditLesson(l) {
    setEditingLesson(l);
    setEditLessonForm({ title: l.title, content: l.content, videoUrl: l.videoUrl || "", resourceUrl: l.resourceUrl || "", isPreview: l.isPreview, order: l.order });
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={20} />
          </div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.6px" }}>Instructor Teaching Studio</h1>
        </div>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
          Publish interactive developer courses, build video curriculum, and share resources with students worldwide.
        </p>
      </div>

      {/* Step Wizard Tabs */}
      <div className="tab-bar" style={{ marginBottom: "28px" }}>
        {STEPS.map((s, idx) => (
          <button
            key={idx}
            className={`tab-btn ${step === idx ? "active" : ""}`}
            onClick={() => setStep(idx)}
            id={`instructor-step-${idx}`}
          >
            <div style={{
              width: "20px", height: "20px", borderRadius: "50%",
              background: step === idx ? "var(--primary)" : idx < step ? "#10b981" : "#cbd5e1",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "800", flexShrink: 0
            }}>
              {idx < step ? <CheckCircle2 size={12} /> : idx + 1}
            </div>
            {s}
          </button>
        ))}
      </div>

      {/* ---- STEP 0: Create Course ---- */}
      {step === 0 && (
        <div className="card" style={{ maxWidth: "700px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800" }}>1</div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Create Course Metadata</h2>
          </div>

          <form className="form" onSubmit={handleCreateCourse}>
            <div className="form-group">
              <label className="form-label" htmlFor="course-title">Course Title</label>
              <input id="course-title" className="input" required placeholder="e.g. Master Full-Stack PostgreSQL & Node.js" value={course.title} onChange={(e) => setCourse({ ...course, title: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-desc">Description &amp; Syllabus Overview</label>
              <textarea id="course-desc" className="input" required placeholder="Describe what students will build and learn..." value={course.description} onChange={(e) => setCourse({ ...course, description: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="course-price">Tuition Price (VND)</label>
                <input id="course-price" className="input" type="number" required min={0} placeholder="0 for Free" value={course.price} onChange={(e) => setCourse({ ...course, price: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="course-category">Category Track</label>
                <select id="course-category" className="input" value={course.categoryId || ""} onChange={(e) => setCourse({ ...course, categoryId: e.target.value })}>
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="course-status">Publishing Status</label>
                <select id="course-status" className="input" value={course.status} onChange={(e) => setCourse({ ...course, status: e.target.value })}>
                  <option value="DRAFT">Draft Mode</option>
                  <option value="PUBLISHED">Published Live</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-thumbnail">Thumbnail Image URL</label>
              <input id="course-thumbnail" className="input" placeholder="https://images.unsplash.com/photo-..." value={course.thumbnailUrl} onChange={(e) => setCourse({ ...course, thumbnailUrl: e.target.value })} />
              {course.thumbnailUrl && (
                <img src={course.thumbnailUrl} alt="preview" style={{ marginTop: "10px", width: "100%", height: "140px", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }} onError={(e) => { e.target.style.display = "none"; }} />
              )}
            </div>

            <button id="create-course-btn" className="btn btn-glow" style={{ marginTop: "12px", height: "46px" }} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : <><BookPlus size={16} /> Create Course &amp; Continue</>}
            </button>
          </form>
        </div>
      )}

      {/* ---- STEP 1: Add Lessons ---- */}
      {step === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>
          {/* Lesson Form */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid var(--border-color)" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: createdCourse ? "#10b981" : "#94a3b8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800" }}>2</div>
              <h2 style={{ fontSize: "18px", fontWeight: "800", margin: 0 }}>Add Curriculum Lessons</h2>
            </div>

            {createdCourse ? (
              <div style={{ background: "var(--primary-light)", color: "var(--text-main)", border: "1px solid var(--border-color)", padding: "12px 16px", borderRadius: "var(--radius-md)", fontSize: "13.5px", marginBottom: "20px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} style={{ color: "var(--primary)" }} />
                Target: <strong>{createdCourse.title}</strong>
              </div>
            ) : (
              <div style={{ background: "var(--bg-subtle)", border: "1px dashed var(--border-color)", color: "var(--text-muted)", padding: "16px", borderRadius: "var(--radius-md)", fontSize: "13px", marginBottom: "20px", textAlign: "center" }}>
                Go to Step 1 to create a course first.
              </div>
            )}

            <form className="form" onSubmit={handleCreateLesson} style={{ opacity: createdCourse ? 1 : 0.5, pointerEvents: createdCourse ? "auto" : "none" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-title">Lesson Title</label>
                <input id="lesson-title" className="input" required placeholder="e.g. Architecture Overview & Setup" value={lesson.title} onChange={(e) => setLesson({ ...lesson, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-content">Lesson Content / Notes</label>
                <textarea id="lesson-content" className="input" required placeholder="Detailed explanation, code snippets..." value={lesson.content} onChange={(e) => setLesson({ ...lesson, content: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-video">YouTube Video URL (Optional)</label>
                <input id="lesson-video" className="input" placeholder="https://www.youtube.com/watch?v=..." value={lesson.videoUrl || ""} onChange={(e) => setLesson({ ...lesson, videoUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-resource">Resource Link (Optional)</label>
                <input id="lesson-resource" className="input" placeholder="https://github.com/..." value={lesson.resourceUrl || ""} onChange={(e) => setLesson({ ...lesson, resourceUrl: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="lesson-order">Lesson Order</label>
                  <input id="lesson-order" className="input" type="number" min={1} required value={lesson.order} onChange={(e) => setLesson({ ...lesson, order: Number(e.target.value) })} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "22px", cursor: "pointer", fontSize: "13.5px", fontWeight: "600" }}>
                  <input type="checkbox" style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} checked={lesson.isPreview} onChange={(e) => setLesson({ ...lesson, isPreview: e.target.checked })} />
                  Free Preview Lesson
                </label>
              </div>
              <button id="add-lesson-btn" className="btn success" style={{ marginTop: "12px", height: "46px" }} disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Adding...</> : <><Plus size={16} /> Add Lesson</>}
              </button>
            </form>
          </div>

          {/* Added lessons preview */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Lessons Added</h3>
              {createdCourse && (
                <button className="btn secondary" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={loadMyCourses}>
                  <RefreshCw size={13} /> Refresh
                </button>
              )}
            </div>
            {!createdCourse ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                <ListPlus size={32} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
                <p>Lessons will appear here after you create a course.</p>
              </div>
            ) : (() => {
              const myC = myCourses.find((c) => c.id === createdCourse.id);
              const lessons = myC?.lessons || [];
              return lessons.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)", fontSize: "14px" }}>
                  <BookOpen size={32} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
                  <p>No lessons yet. Add your first lesson.</p>
                </div>
              ) : (
                <div className="lesson-list">
                  {lessons.map((l) => (
                    <div key={l.id} className="lesson-item-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        <div className="lesson-number-circle">{l.order}</div>
                        <div>
                          <strong style={{ fontSize: "14px" }}>{l.title}</strong>
                          {l.isPreview && <span className="badge success" style={{ fontSize: "9px", padding: "2px 6px", marginLeft: "8px" }}>Preview</span>}
                          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>{l.content?.slice(0, 60)}{l.content?.length > 60 ? "..." : ""}</p>
                        </div>
                      </div>
                      <button className="btn secondary" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => openEditLesson(l)}>
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}

            {createdCourse && (
              <button className="btn" style={{ width: "100%", marginTop: "20px" }} onClick={() => { setStep(2); loadMyCourses(); }}>
                Done - View My Courses →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- STEP 2: My Courses List ---- */}
      {step === 2 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>
              My Published Courses <span className="tab-count" style={{ marginLeft: "8px" }}>{myCourses.length}</span>
            </h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn secondary" style={{ fontSize: "13px" }} onClick={loadMyCourses} disabled={loadingCourses}>
                <RefreshCw size={14} /> Refresh
              </button>
              <button className="btn" style={{ fontSize: "13px" }} onClick={() => { setStep(0); setCreatedCourse(null); setCourse({ title: "", description: "", price: 0, thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80", status: "PUBLISHED" }); }}>
                <BookPlus size={14} /> New Course
              </button>
            </div>
          </div>

          {loadingCourses ? (
            <div style={{ display: "grid", gap: "16px" }}>
              {[1, 2].map((i) => (
                <div key={i} className="card skeleton-card" style={{ padding: "24px" }}>
                  <div style={{ display: "grid", gap: "12px" }}>
                    <div className="skeleton skeleton-line tall medium" />
                    <div className="skeleton skeleton-line full" />
                    <div className="skeleton skeleton-line short" />
                  </div>
                </div>
              ))}
            </div>
          ) : myCourses.length === 0 ? (
            <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
              <GraduationCap size={40} style={{ margin: "0 auto 16px", color: "#cbd5e1" }} />
              <h3 style={{ color: "var(--text-main)", marginBottom: "8px" }}>No courses yet</h3>
              <p style={{ marginBottom: "20px" }}>Create your first course to start teaching.</p>
              <button className="btn" onClick={() => setStep(0)}><BookPlus size={15} /> Create First Course</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {myCourses.map((c) => {
                const isExpanded = expandedCourseId === c.id;
                return (
                  <div key={c.id} className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                      <img src={c.thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"} alt={c.title}
                        style={{ width: "120px", height: "75px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", flexShrink: 0 }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"; }}
                      />
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>{c.title}</h3>
                          <span className={`badge ${c.status === "PUBLISHED" ? "success" : "danger"}`} style={{ fontSize: "10px" }}>{c.status}</span>
                          {c.price === 0 && <span className="badge cyan" style={{ fontSize: "10px" }}>FREE</span>}
                        </div>
                        <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-muted)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.description}</p>
                        <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                          <span><strong style={{ color: "var(--text-main)" }}>{c.lessons?.length || 0}</strong> lessons</span>
                          <span>⭐ {c.averageRating > 0 ? c.averageRating.toFixed(1) : "No ratings"}</span>
                          <span>{Number(c.price).toLocaleString("vi-VN")} VND</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          className="btn secondary"
                          style={{ fontSize: "12.5px", padding: "8px 12px" }}
                          onClick={() => openEditCourse(c)}
                          title="Edit Course Details"
                        >
                          <Pencil size={14} /> Edit Info
                        </button>
                        <button
                          className="btn secondary"
                          style={{ fontSize: "12.5px", padding: "8px 14px" }}
                          onClick={() => { setExpandedCourseId(isExpanded ? null : c.id); setCreatedCourse(c); }}
                        >
                          {isExpanded ? <><ChevronUp size={14} /> Collapse</> : <><Layers size={14} /> Manage Lessons</>}
                        </button>
                        <button
                          className="btn danger"
                          style={{ fontSize: "12.5px", padding: "8px 12px" }}
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          title="Delete Course"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable lesson list */}
                    {isExpanded && (
                      <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>Lessons ({c.lessons?.length || 0})</h4>
                          <button className="btn success" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => { setStep(1); setCreatedCourse(c); }}>
                            <Plus size={12} /> Add Lesson
                          </button>
                        </div>
                        {(!c.lessons || c.lessons.length === 0) ? (
                          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No lessons yet. Click "Add Lesson" to build your curriculum.</p>
                        ) : (
                          <div className="lesson-list">
                            {c.lessons.map((l) => (
                              <div key={l.id} className="lesson-item-card">
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                                  <div className="lesson-number-circle">{l.order}</div>
                                  <div style={{ minWidth: 0 }}>
                                    <strong style={{ fontSize: "14px" }}>{l.title}</strong>
                                    {l.isPreview && <span className="badge success" style={{ fontSize: "9px", padding: "2px 6px", marginLeft: "8px" }}>Preview</span>}
                                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.content?.slice(0, 70)}{l.content?.length > 70 ? "..." : ""}</p>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button className="btn secondary" style={{ padding: "5px 10px", fontSize: "12px", flexShrink: 0 }} onClick={() => openEditLesson(l)}>
                                    <Pencil size={12} /> Edit
                                  </button>
                                  <button className="btn danger" style={{ padding: "5px 10px", fontSize: "12px", flexShrink: 0 }} onClick={() => handleDeleteLesson(l.id, l.title)} title="Delete Lesson">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="modal-overlay" onClick={() => setEditingLesson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Edit Lesson</h2>
              <button onClick={() => setEditingLesson(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>✕</button>
            </div>

            <form className="form" onSubmit={handleEditLessonSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-lesson-title">Title</label>
                <input id="edit-lesson-title" className="input" required value={editLessonForm.title || ""} onChange={(e) => setEditLessonForm({ ...editLessonForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-lesson-content">Content / Notes</label>
                <textarea id="edit-lesson-content" className="input" required value={editLessonForm.content || ""} onChange={(e) => setEditLessonForm({ ...editLessonForm, content: e.target.value })} style={{ minHeight: "120px" }} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-lesson-video">YouTube Video URL</label>
                <input id="edit-lesson-video" className="input" placeholder="https://www.youtube.com/watch?v=..." value={editLessonForm.videoUrl || ""} onChange={(e) => setEditLessonForm({ ...editLessonForm, videoUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-lesson-resource">Resource URL</label>
                <input id="edit-lesson-resource" className="input" placeholder="https://github.com/..." value={editLessonForm.resourceUrl || ""} onChange={(e) => setEditLessonForm({ ...editLessonForm, resourceUrl: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-lesson-order">Order</label>
                  <input id="edit-lesson-order" className="input" type="number" min={1} value={editLessonForm.order || 1} onChange={(e) => setEditLessonForm({ ...editLessonForm, order: Number(e.target.value) })} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "22px", cursor: "pointer", fontSize: "13.5px", fontWeight: "600" }}>
                  <input type="checkbox" style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }} checked={editLessonForm.isPreview || false} onChange={(e) => setEditLessonForm({ ...editLessonForm, isPreview: e.target.checked })} />
                  Free Preview
                </label>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button id="edit-lesson-save" className="btn" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : "Save Changes"}
                </button>
                <button type="button" className="btn secondary" style={{ flex: 1 }} onClick={() => setEditingLesson(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="modal-overlay" onClick={() => setEditingCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>Edit Course Details</h2>
              <button onClick={() => setEditingCourse(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>✕</button>
            </div>

            <form className="form" onSubmit={handleEditCourseSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-course-title">Course Title</label>
                <input id="edit-course-title" className="input" required value={editCourseForm.title || ""} onChange={(e) => setEditCourseForm({ ...editCourseForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-course-desc">Description</label>
                <textarea id="edit-course-desc" className="input" required value={editCourseForm.description || ""} onChange={(e) => setEditCourseForm({ ...editCourseForm, description: e.target.value })} style={{ minHeight: "100px" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-course-price">Price (VND)</label>
                  <input id="edit-course-price" className="input" type="number" min={0} required value={editCourseForm.price || 0} onChange={(e) => setEditCourseForm({ ...editCourseForm, price: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-course-category">Category Track</label>
                  <select id="edit-course-category" className="input" value={editCourseForm.categoryId || ""} onChange={(e) => setEditCourseForm({ ...editCourseForm, categoryId: e.target.value })}>
                    <option value="">-- Choose Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-course-status">Status</label>
                  <select id="edit-course-status" className="input" value={editCourseForm.status || "DRAFT"} onChange={(e) => setEditCourseForm({ ...editCourseForm, status: e.target.value })}>
                    <option value="DRAFT">Draft Mode</option>
                    <option value="PUBLISHED">Published Live</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-course-thumb">Thumbnail URL</label>
                <input id="edit-course-thumb" className="input" value={editCourseForm.thumbnailUrl || ""} onChange={(e) => setEditCourseForm({ ...editCourseForm, thumbnailUrl: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button id="edit-course-save" className="btn" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Saving...</> : "Save Changes"}
                </button>
                <button type="button" className="btn secondary" style={{ flex: 1 }} onClick={() => setEditingCourse(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
