import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import {
  BookOpen, CheckCircle2, PlayCircle, ArrowLeft, ArrowRight,
  Download, Award, Sparkles, Search, RotateCcw, Check,
  Clock, Video, FileText, Layers, Keyboard, Printer
} from "lucide-react";

// --- Certificate print helper (HTML print) ---
function printCertificate(courseName, userName) {
  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Certificate of Completion - ${courseName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 40px;
    }
    .cert {
      background: #ffffff;
      border-radius: 24px;
      padding: 64px 72px;
      max-width: 820px;
      width: 100%;
      text-align: center;
      position: relative;
      box-shadow: 0 40px 80px rgba(0,0,0,0.4);
      border: 2px solid #e0e7ff;
    }
    .cert::before {
      content: "";
      position: absolute; inset: 12px;
      border: 2px solid #c7d2fe;
      border-radius: 14px;
      pointer-events: none;
    }
    .badge-top {
      display: inline-flex; align-items: center; gap: 8px;
      background: #eef2ff; color: #4f46e5;
      padding: 8px 20px; border-radius: 999px;
      font-size: 13px; font-weight: 700;
      letter-spacing: 1px; text-transform: uppercase;
      margin-bottom: 32px;
    }
    h1 { font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: #64748b; margin-bottom: 16px; }
    .name { font-size: 48px; font-weight: 800; color: #0f172a; letter-spacing: -1px; margin-bottom: 12px; }
    .sub { font-size: 18px; color: #64748b; margin-bottom: 8px; }
    .course-name {
      font-size: 28px; font-weight: 800; color: #4f46e5;
      margin: 20px 0 32px; line-height: 1.3;
    }
    .date { font-size: 14px; color: #94a3b8; margin-top: 32px; }
    .seal {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%);
      display: flex; align-items: center; justify-content: center;
      margin: 32px auto 0;
      font-size: 32px;
    }
    @media print {
      body { background: white; }
      .cert { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="badge-top">🎓 Certificate of Completion</div>
    <h1>This certifies that</h1>
    <div class="name">${userName}</div>
    <div class="sub">has successfully completed all lessons in</div>
    <div class="course-name">${courseName}</div>
    <p style="color:#475569;font-size:15px;line-height:1.6;">
      Demonstrating expertise, commitment, and practical mastery of the course curriculum.
    </p>
    <div class="seal">🏆</div>
    <div class="date">Issued on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · CourseHub LMS</div>
  </div>
  <script>setTimeout(() => window.print(), 600);<\/script>
</body>
</html>`);
  win.document.close();
}

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/^.*(youtu\.be\/|v\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return m && m[2].length === 11 ? m[2] : null;
}

// --- Skeleton placeholder for dashboard list ---
function MyCoursesSkeleton() {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card" style={{ padding: "24px", display: "flex", gap: "24px" }}>
          <div className="skeleton" style={{ width: "180px", height: "115px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "grid", gap: "14px" }}>
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line tall full" />
            <div className="skeleton skeleton-line medium" />
            <div className="skeleton" style={{ height: "42px", borderRadius: "var(--radius-md)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Classroom Workspace Component (Legal Top-Level Hooks) ---
function ClassroomWorkspace({
  activeCourseItem,
  activeCourseId,
  activeLessonId,
  setSearchParams,
  toggleLessonCompletion,
  saveResumeLesson
}) {
  const course = activeCourseItem.course;
  const lessons = course.lessons || [];
  const completedLessons = lessons.filter((l) => l.completed).length;
  const totalLessons = lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const isGraduated = progressPercent === 100 && totalLessons > 0;

  const currentLessonIndex = lessons.findIndex((l) => l.id === activeLessonId);
  const currentLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex] : lessons[0] || null;
  const youtubeId = currentLesson ? getYouTubeId(currentLesson.videoUrl) : null;
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  // Save last lesson when it changes
  useEffect(() => {
    if (currentLesson) saveResumeLesson(activeCourseId, currentLesson.id);
  }, [currentLesson?.id, activeCourseId, saveResumeLesson]);

  // Keyboard navigation: ArrowLeft/Right to move between lessons
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight" && nextLesson)
        setSearchParams({ courseId: activeCourseId, lessonId: nextLesson.id });
      if (e.key === "ArrowLeft" && prevLesson)
        setSearchParams({ courseId: activeCourseId, lessonId: prevLesson.id });
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextLesson, prevLesson, activeCourseId, setSearchParams]);

  // Get the userName for certificate (from localStorage token)
  const userName = (() => {
    try { return JSON.parse(atob(localStorage.getItem("token")?.split(".")[1] || ""))?.name || "Student"; } catch { return "Student"; }
  })();

  return (
    <div>
      {/* Workspace Top Bar */}
      <div className="classroom-header">
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button className="btn secondary" style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: "13px" }} onClick={() => setSearchParams({})}>
            <ArrowLeft size={14} /> Back to My Courses
          </button>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px" }}>{course.title}</h1>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Keyboard hint */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", background: "var(--bg-subtle)", padding: "6px 12px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-color)" }}>
            <Keyboard size={13} /> ← → to navigate lessons
          </div>

          {/* Progress widget */}
          <div style={{ minWidth: "240px", background: "var(--bg-surface)", padding: "12px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
              <span>Progress</span>
              <span style={{ color: isGraduated ? "var(--success)" : "var(--primary)" }}>{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%`, background: "var(--primary)" }} />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
              {completedLessons}/{totalLessons} lessons
            </div>
          </div>
        </div>
      </div>

      {/* 100% Graduation Banner with Certificate Button */}
      {isGraduated && (
        <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", color: "#ffffff", padding: "20px 24px", borderRadius: "var(--radius-lg)", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={24} />
            </div>
            <div>
              <strong style={{ fontSize: "16px", display: "block" }}>🎉 Congratulations on Graduating!</strong>
              <span style={{ fontSize: "13.5px", opacity: 0.9 }}>You have successfully completed all lessons in this curriculum.</span>
            </div>
          </div>
          <button
            className="btn-download-cert"
            onClick={() => printCertificate(course.title, userName)}
          >
            <Printer size={16} /> Download Certificate
          </button>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
          <p>No lessons published yet for this course.</p>
        </div>
      ) : (
        <div className="detail-grid">
          {/* Left: Video & Lesson Content */}
          <div className="detail-main-col">
            {currentLesson ? (
              <div className="card" style={{ padding: "28px" }}>
                {/* Video Player */}
                {youtubeId ? (
                  <div className="video-theatre">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={currentLesson.title}
                    />
                  </div>
                ) : currentLesson.videoUrl ? (
                  <div style={{ background: "var(--bg-subtle)", color: "var(--text-main)", padding: "32px 24px", borderRadius: "var(--radius-md)", marginBottom: "24px", textAlign: "center", border: "1px solid var(--border-color)" }}>
                    <Video size={36} style={{ color: "var(--primary)", margin: "0 auto 12px auto" }} />
                    <h4 style={{ marginBottom: "8px" }}>Watch Video on YouTube</h4>
                    <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glow" style={{ display: "inline-flex", marginTop: "8px" }}>
                      Open Video Player
                    </a>
                  </div>
                ) : null}

                {/* Lesson Title & Completion */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Lesson {currentLesson.order} of {totalLessons}
                    </span>
                    <h2 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "800" }}>{currentLesson.title}</h2>
                  </div>
                  <div>
                    {currentLesson.completed ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="badge success" style={{ padding: "8px 14px", fontSize: "13px" }}>
                          <CheckCircle2 size={16} /> Completed
                        </span>
                        <button className="btn secondary" style={{ padding: "8px 14px", fontSize: "13px", color: "var(--danger)", borderColor: "var(--danger-light)" }}
                          onClick={() => toggleLessonCompletion(course.id, currentLesson.id, true)}>
                          Reset
                        </button>
                      </div>
                    ) : (
                      <button className="btn success" style={{ padding: "8px 18px", fontSize: "14px" }}
                        onClick={() => toggleLessonCompletion(course.id, currentLesson.id, false)}>
                        <Check size={16} /> Mark as Complete
                      </button>
                    )}
                  </div>
                </div>

                <div className="divider" style={{ margin: "20px 0" }} />

                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px" }}>Lesson Notes &amp; Explanation</h3>
                <p style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", fontSize: "14.5px", lineHeight: "1.75", marginBottom: "24px" }}>
                  {currentLesson.content || "Follow along with the instructions and video above."}
                </p>

                {currentLesson.resourceUrl && (
                  <div style={{ background: "var(--bg-base)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <FileText size={24} style={{ color: "var(--primary)" }} />
                      <div>
                        <strong style={{ display: "block", fontSize: "14px" }}>Downloadable Lesson Assets</strong>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Source code, lecture notes, or cheat-sheets</span>
                      </div>
                    </div>
                    <a href={currentLesson.resourceUrl} target="_blank" rel="noopener noreferrer" className="btn secondary" style={{ fontSize: "12.5px", padding: "8px 14px" }}>
                      <Download size={14} /> Download
                    </a>
                  </div>
                )}

                {/* Lesson Navigation Prev / Next */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                  {prevLesson ? (
                    <button className="btn secondary" style={{ fontSize: "13.5px" }}
                      onClick={() => setSearchParams({ courseId: activeCourseId, lessonId: prevLesson.id })}>
                      <ArrowLeft size={15} /> Previous: Lesson {prevLesson.order}
                    </button>
                  ) : <div />}

                  {nextLesson ? (
                    <button className="btn" style={{ fontSize: "13.5px" }}
                      onClick={() => setSearchParams({ courseId: activeCourseId, lessonId: nextLesson.id })}>
                      Next: Lesson {nextLesson.order} <ArrowRight size={15} />
                    </button>
                  ) : (
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>
                      🎉 Final Lesson Reached
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: Lesson Playlist Sidebar */}
          <div className="detail-side-col">
            <div className="card" style={{ padding: "20px", position: "sticky", top: "96px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={16} /> Course Syllabus
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{totalLessons} lessons</span>
              </div>

              <div style={{ display: "grid", gap: "6px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
                {lessons.map((lesson) => {
                  const isActive = currentLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      className="workspace-lesson-row"
                      onClick={() => setSearchParams({ courseId: activeCourseId, lessonId: lesson.id })}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 14px", borderRadius: "var(--radius-md)",
                        border: `1px solid ${isActive ? "var(--primary)" : "var(--border-color)"}`,
                        background: isActive ? "var(--primary-light)" : lesson.completed ? "var(--bg-subtle)" : "var(--bg-surface)",
                        cursor: "pointer", transition: "var(--transition-fast)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                        {lesson.completed ? (
                          <CheckCircle2 size={18} style={{ color: "var(--success)", flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #cbd5e1", flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: "13px", fontWeight: isActive ? "700" : "500", color: isActive ? "var(--primary-dark)" : lesson.completed ? "var(--text-muted)" : "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lesson.order}. {lesson.title}
                        </span>
                      </div>
                      {lesson.isPreview && (
                        <span className="badge success" style={{ fontSize: "9px", padding: "2px 6px", marginLeft: "6px", flexShrink: 0 }}>Preview</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyCourses() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCourseId = searchParams.get("courseId");
  const activeLessonId = searchParams.get("lessonId");

  // Smart resume: save last lesson per course in localStorage
  const RESUME_KEY = "coursehub_last_lesson";
  const getResumeMap = () => {
    try { return JSON.parse(localStorage.getItem(RESUME_KEY) || "{}"); } catch { return {}; }
  };
  const saveResumeLesson = useCallback((courseId, lessonId) => {
    const map = getResumeMap();
    map[courseId] = lessonId;
    localStorage.setItem(RESUME_KEY, JSON.stringify(map));
  }, []);

  const filteredItems = useMemo(() =>
    items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return item.course.title.toLowerCase().includes(q) ||
        (item.course.description && item.course.description.toLowerCase().includes(q));
    }),
  [items, searchQuery]);

  const totalCourses = items.length;
  const completedCoursesCount = items.filter((item) => {
    const ls = item.course.lessons || [];
    return ls.length > 0 && ls.every((l) => l.completed);
  }).length;

  useEffect(() => {
    api("/courses/mine")
      .then((data) => { setItems(data); setLoading(false); })
      .catch((err) => { showToast(err.message, "error"); setLoading(false); });
  }, []);

  async function toggleLessonCompletion(courseId, lessonId, isCompleted) {
    try {
      const endpoint = isCompleted ? "incomplete" : "complete";
      await api(`/courses/lessons/${lessonId}/${endpoint}`, { method: "POST" });
      setItems((prev) =>
        prev.map((item) =>
          item.course.id !== courseId ? item : {
            ...item,
            course: {
              ...item.course,
              lessons: item.course.lessons.map((l) =>
                l.id === lessonId ? { ...l, completed: !isCompleted } : l
              ),
            },
          }
        )
      );
      showToast(isCompleted ? "Marked as incomplete." : "🎉 Lesson completed!", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  // =========================================================================
  // CLASSROOM WORKSPACE VIEW
  // =========================================================================
  if (activeCourseId) {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "100px 24px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              border: "4px solid var(--border-color)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px"
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>
            Loading classroom...
          </p>
        </div>
      );
    }

    const activeCourseItem = items.find((item) => item.course?.id === activeCourseId);
    if (!activeCourseItem) {
      return (
        <div className="card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: "600px", margin: "40px auto" }}>
          <BookOpen size={48} style={{ color: "var(--text-muted)", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>Course not found in your learning list</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            You might not be enrolled in this course yet, or it has been removed.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="btn secondary" onClick={() => setSearchParams({})}>
              Back to My Courses
            </button>
            <Link to="/" className="btn">
              Explore Courses
            </Link>
          </div>
        </div>
      );
    }

    return (
      <ClassroomWorkspace
        activeCourseItem={activeCourseItem}
        activeCourseId={activeCourseId}
        activeLessonId={activeLessonId}
        setSearchParams={setSearchParams}
        toggleLessonCompletion={toggleLessonCompletion}
        saveResumeLesson={saveResumeLesson}
      />
    );
  }

  // =========================================================================
  // DASHBOARD LIST VIEW
  // =========================================================================
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.6px" }}>My Learning Journey</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>Track your progress, resume classroom lectures, and earn course certificates.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="card" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: "13px", fontWeight: "700" }}>{totalCourses} Enrolled</span>
          </div>
          <div className="card" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Award size={16} style={{ color: "#10b981" }} />
            <span style={{ fontSize: "13px", fontWeight: "700" }}>{completedCoursesCount} Completed</span>
          </div>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
            <BookOpen size={30} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>No enrolled courses yet</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
            Discover our curated catalogue of cutting-edge technology courses and start building your portfolio today.
          </p>
          <Link className="btn btn-glow" to="/"><Sparkles size={16} /> Explore Course Marketplace</Link>
        </div>
      ) : loading ? (
        <MyCoursesSkeleton />
      ) : (
        <>
          {/* Search bar */}
          <div className="search-container" style={{ marginBottom: "32px", maxWidth: "540px" }}>
            <div className="search-input-wrapper">
              <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
              <input type="text" placeholder="Search enrolled courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            {searchQuery && (
              <button className="btn secondary" onClick={() => setSearchQuery("")} style={{ fontSize: "13px", padding: "0 16px" }}>
                <RotateCcw size={13} /> Clear
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
              <Search size={32} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
              <h3 style={{ color: "var(--text-main)", marginBottom: "6px" }}>No courses match "{searchQuery}"</h3>
              <button className="btn secondary" style={{ marginTop: "12px" }} onClick={() => setSearchQuery("")}>Reset</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "24px" }}>
              {filteredItems.map((item) => {
                const lessons = item.course.lessons || [];
                const done = lessons.filter((l) => l.completed).length;
                const total = lessons.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const isFinished = pct === 100 && total > 0;

                // Smart resume: pick saved lesson or first uncompleted
                const resumeMap = getResumeMap();
                const savedLessonId = resumeMap[item.course.id];
                const savedLesson = savedLessonId ? lessons.find((l) => l.id === savedLessonId) : null;
                const resumeLesson = savedLesson || lessons.find((l) => !l.completed) || lessons[0];

                return (
                  <div className="card" key={item.id} style={{ padding: "24px" }}>
                    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <img
                        src={item.course.thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"}
                        alt={item.course.title}
                        style={{ width: "180px", height: "115px", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", flexShrink: 0 }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"; }}
                      />

                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                          <div>
                            <span className="badge" style={{ fontSize: "11px", marginBottom: "6px" }}>{item.course.category?.name || "Development"}</span>
                            <h2 style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "800" }}>{item.course.title}</h2>
                          </div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {isFinished && (
                              <button
                                className="btn secondary"
                                style={{ padding: "8px 14px", fontSize: "12.5px", color: "var(--primary)", borderColor: "var(--border-color)" }}
                                onClick={() => printCertificate(item.course.title, "Student")}
                              >
                                <Printer size={13} /> Certificate
                              </button>
                            )}
                            <button
                              className="btn btn-glow"
                              style={{ padding: "8px 18px", fontSize: "13.5px" }}
                              onClick={() => setSearchParams({ courseId: item.course.id, lessonId: resumeLesson?.id || "" })}
                            >
                              <PlayCircle size={16} /> {savedLesson ? "Resume" : "Start"} Classroom
                            </button>
                          </div>
                        </div>

                        <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.course.description}
                        </p>

                        <div style={{ background: "var(--bg-subtle)", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "12.5px" }}>
                            <span style={{ fontWeight: "700", color: isFinished ? "#10b981" : "var(--text-main)" }}>
                              {isFinished ? "🏆 Completed!" : savedLesson ? `📍 Last: Lesson ${savedLesson.order}` : "In Progress"}
                            </span>
                            <span style={{ fontWeight: "800", color: "var(--primary)" }}>{pct}%</span>
                          </div>
                          <div className="progress-track" style={{ height: "6px" }}>
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                            {done} of {total} lessons finished
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
