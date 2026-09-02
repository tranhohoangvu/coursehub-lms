import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  Award,
  Sparkles,
  Search,
  RotateCcw,
  Check,
  Clock,
  Video,
  FileText,
  Flame,
  Layers
} from "lucide-react";

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCourseId = searchParams.get("courseId");
  const activeLessonId = searchParams.get("lessonId");

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.course.title.toLowerCase().includes(query) ||
      (item.course.description && item.course.description.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    api("/courses/mine")
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setMessage(err.message);
        setLoading(false);
      });
  }, []);

  async function toggleLessonCompletion(courseId, lessonId, isCurrentlyCompleted) {
    try {
      const endpoint = isCurrentlyCompleted ? "incomplete" : "complete";
      await api(`/courses/lessons/${lessonId}/${endpoint}`, { method: "POST" });

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.course.id === courseId) {
            return {
              ...item,
              course: {
                ...item.course,
                lessons: item.course.lessons.map((lesson) =>
                  lesson.id === lessonId ? { ...lesson, completed: !isCurrentlyCompleted } : lesson
                ),
              },
            };
          }
          return item;
        })
      );

      setMessage(isCurrentlyCompleted ? "Lesson marked as incomplete." : "Awesome! Lesson completed.");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setMessage(err.message);
    }
  }

  // Summary Metrics
  const totalCourses = items.length;
  const completedCoursesCount = items.filter((item) => {
    const lessons = item.course.lessons || [];
    return lessons.length > 0 && lessons.every((l) => l.completed);
  }).length;

  if (loading) {
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
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: "600" }}>Loading your learning dashboard...</p>
      </div>
    );
  }

  // =========================================================================
  // CLASSROOM WORKSPACE VIEW
  // =========================================================================
  if (activeCourseId) {
    const activeCourseItem = items.find((item) => item.course.id === activeCourseId);

    if (activeCourseItem) {
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

      return (
        <div>
          {/* Workspace Top Bar */}
          <div className="classroom-header">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button
                className="btn secondary"
                style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: "13px" }}
                onClick={() => setSearchParams({})}
              >
                <ArrowLeft size={14} /> Back to My Courses
              </button>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                {course.title}
              </h1>
            </div>

            <div style={{ minWidth: "260px", background: "var(--bg-surface)", padding: "12px 18px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                <span>Overall Progress</span>
                <span style={{ color: isGraduated ? "#10b981" : "var(--primary)" }}>{progressPercent}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
                {completedLessons} of {totalLessons} lessons completed
              </div>
            </div>
          </div>

          {/* Feedback message banner */}
          {message && <div className="success" style={{ marginBottom: "20px" }}>{message}</div>}

          {/* Celebration Banner when 100% completed */}
          {isGraduated && (
            <div
              style={{
                background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
                color: "#ffffff",
                padding: "20px 24px",
                borderRadius: "var(--radius-lg)",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                boxShadow: "0 10px 25px rgba(6, 95, 70, 0.3)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={24} />
                </div>
                <div>
                  <strong style={{ fontSize: "16px", display: "block" }}>🎉 Congratulations on Graduating!</strong>
                  <span style={{ fontSize: "13.5px", opacity: 0.9 }}>
                    You have successfully completed all lessons in this curriculum.
                  </span>
                </div>
              </div>
              <span className="badge" style={{ background: "#ffffff", color: "#065f46", fontWeight: "800", padding: "6px 14px" }}>
                Verified Graduate
              </span>
            </div>
          )}

          {lessons.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
              <p>No lessons published yet for this course.</p>
            </div>
          ) : (
            <div className="detail-grid">
              {/* Left Column: Video and Lesson Viewer */}
              <div>
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
                        ></iframe>
                      </div>
                    ) : currentLesson.videoUrl ? (
                      <div style={{ background: "#0f172a", color: "#ffffff", padding: "32px 24px", borderRadius: "var(--radius-md)", marginBottom: "24px", textAlign: "center" }}>
                        <Video size={36} style={{ color: "var(--primary)", margin: "0 auto 12px auto" }} />
                        <h4 style={{ marginBottom: "8px", fontSize: "16px" }}>Watch Video on YouTube</h4>
                        <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glow" style={{ display: "inline-flex", marginTop: "8px" }}>
                          Open Video Player
                        </a>
                      </div>
                    ) : null}

                    {/* Lesson Title & Completion Action */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
                      <div>
                        <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Lesson {currentLesson.order} of {totalLessons}
                        </span>
                        <h2 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "800", color: "var(--text-main)" }}>
                          {currentLesson.title}
                        </h2>
                      </div>

                      <div>
                        {currentLesson.completed ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="badge success" style={{ padding: "8px 14px", fontSize: "13px" }}>
                              <CheckCircle2 size={16} /> Completed
                            </span>
                            <button
                              className="btn secondary"
                              style={{ padding: "8px 14px", fontSize: "13px", color: "var(--danger)", borderColor: "var(--danger-light)" }}
                              onClick={() => toggleLessonCompletion(course.id, currentLesson.id, true)}
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn success"
                            style={{ padding: "8px 18px", fontSize: "14px" }}
                            onClick={() => toggleLessonCompletion(course.id, currentLesson.id, false)}
                          >
                            <Check size={16} /> Mark as Complete
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="divider" style={{ margin: "20px 0" }}></div>

                    {/* Lesson Content Markdown/Text */}
                    <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px", color: "var(--text-main)" }}>
                      Lesson Notes & Explanation
                    </h3>
                    <p style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", fontSize: "14.5px", lineHeight: "1.75", marginBottom: "24px" }}>
                      {currentLesson.content || "Follow along with the instructions and video above to master this chapter."}
                    </p>

                    {/* Resource Box */}
                    {currentLesson.resourceUrl && (
                      <div className="resource-box" style={{ background: "var(--bg-base)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <FileText size={24} style={{ color: "var(--primary)" }} />
                          <div>
                            <strong style={{ display: "block", fontSize: "14px", color: "var(--text-main)" }}>Downloadable Lesson Assets</strong>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Source code, lecture notes, or cheat-sheets</span>
                          </div>
                        </div>
                        <a href={currentLesson.resourceUrl} target="_blank" rel="noopener noreferrer" className="btn secondary" style={{ fontSize: "12.5px", padding: "8px 14px" }}>
                          <Download size={14} /> Download
                        </a>
                      </div>
                    )}

                    {/* Previous / Next Lesson Navigation Controls */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
                      {prevLesson ? (
                        <button
                          className="btn secondary"
                          style={{ fontSize: "13px", padding: "8px 16px" }}
                          onClick={() => setSearchParams({ courseId: activeCourseId, lessonId: prevLesson.id })}
                        >
                          <ArrowLeft size={14} /> Previous: {prevLesson.title}
                        </button>
                      ) : (
                        <div></div>
                      )}

                      {nextLesson && (
                        <button
                          className="btn"
                          style={{ fontSize: "13px", padding: "8px 16px" }}
                          onClick={() => setSearchParams({ courseId: activeCourseId, lessonId: nextLesson.id })}
                        >
                          Next: {nextLesson.title} <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
                    <p>Select a lesson from the syllabus on the right to start studying.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Syllabus Checklist Sidebar */}
              <div>
                <div className="card" style={{ position: "sticky", top: "100px", padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800" }}>Course Syllabus</h3>
                    <span className="badge" style={{ fontSize: "11px" }}>{lessons.length} Modules</span>
                  </div>

                  <div style={{ maxHeight: "65vh", overflowY: "auto", display: "grid", gap: "8px" }}>
                    {lessons.map((lesson) => {
                      const isActive = lesson.id === (currentLesson?.id || "");
                      return (
                        <div
                          key={lesson.id}
                          className="workspace-lesson-row"
                          onClick={() => setSearchParams({ courseId: activeCourseId, lessonId: lesson.id })}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 14px",
                            borderRadius: "var(--radius-md)",
                            border: `1px solid ${isActive ? "var(--primary)" : "var(--border-color)"}`,
                            background: isActive ? "var(--primary-light)" : lesson.completed ? "#f8fafc" : "var(--bg-surface)",
                            cursor: "pointer",
                            transition: "var(--transition-fast)"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                            {lesson.completed ? (
                              <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0 }} />
                            ) : (
                              <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #cbd5e1", flexShrink: 0 }}></div>
                            )}

                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: isActive ? "700" : "500",
                                color: isActive ? "var(--primary-dark)" : lesson.completed ? "var(--text-muted)" : "var(--text-main)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                              }}
                            >
                              {lesson.order}. {lesson.title}
                            </span>
                          </div>

                          {lesson.isPreview && (
                            <span className="badge success" style={{ fontSize: "9px", padding: "2px 6px", marginLeft: "6px" }}>
                              Preview
                            </span>
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
  }

  // =========================================================================
  // DASHBOARD LIST VIEW (STANDARD VIEW)
  // =========================================================================
  return (
    <div>
      {/* Learning Dashboard Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "28px", fontWeight: "800", letterSpacing: "-0.6px" }}>
            My Learning Journey
          </h1>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
            Track your progress, resume classroom lectures, and achieve course certificates.
          </p>
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

      {message && <div className="success" style={{ marginBottom: "24px" }}>{message}</div>}

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" }}>
            <BookOpen size={30} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "8px" }}>You have no enrolled courses yet</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>
            Discover our curated catalogue of cutting-edge technology courses and start building your portfolio today.
          </p>
          <Link className="btn btn-glow" to="/">
            <Sparkles size={16} /> Explore Course Marketplace
          </Link>
        </div>
      ) : (
        <>
          {/* Search bar inside my learning */}
          <div className="search-container" style={{ marginBottom: "32px", maxWidth: "540px" }}>
            <div className="search-input-wrapper">
              <Search
                size={18}
                style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}
              />
              <input
                type="text"
                placeholder="Search enrolled courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <button
                className="btn secondary"
                onClick={() => setSearchQuery("")}
                style={{ fontSize: "13px", padding: "0 16px" }}
              >
                Clear
              </button>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
              <Search size={32} style={{ margin: "0 auto 12px auto", color: "#cbd5e1" }} />
              <h3 style={{ color: "var(--text-main)", marginBottom: "6px" }}>No courses match "{searchQuery}"</h3>
              <p>Try searching for a different keyword or reset your filter.</p>
              <button className="btn secondary" style={{ marginTop: "12px" }} onClick={() => setSearchQuery("")}>
                Reset Search
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "24px" }}>
              {filteredItems.map((item) => {
                const lessons = item.course.lessons || [];
                const completedLessons = lessons.filter((l) => l.completed).length;
                const totalLessons = lessons.length;
                const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                const isFinished = progressPercent === 100 && totalLessons > 0;

                return (
                  <div className="card" key={item.id} style={{ padding: "24px" }}>
                    <div className="my-courses-header-wrapper" style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <img
                        src={item.course.thumbnailUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"}
                        alt={item.course.title}
                        className="my-courses-img"
                        style={{ width: "180px", height: "115px", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80";
                        }}
                      />

                      <div style={{ flex: 1, minWidth: "260px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                          <div>
                            <span className="badge" style={{ fontSize: "11px", marginBottom: "6px" }}>
                              {item.course.category?.name || "Development"}
                            </span>
                            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800" }}>
                              {item.course.title}
                            </h2>
                          </div>

                          <button
                            className="btn btn-glow"
                            style={{ padding: "8px 18px", fontSize: "13.5px" }}
                            onClick={() => {
                              const firstUncompleted = lessons.find((l) => !l.completed) || lessons[0];
                              setSearchParams({ courseId: item.course.id, lessonId: firstUncompleted?.id || "" });
                            }}
                          >
                            <PlayCircle size={16} /> Resume Classroom
                          </button>
                        </div>

                        <p style={{ fontSize: "13.5px", color: "var(--text-muted)", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.course.description}
                        </p>

                        {/* Progress Bar & Indicators */}
                        <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "12.5px" }}>
                            <span style={{ fontWeight: "700", color: isFinished ? "#10b981" : "var(--text-main)" }}>
                              {isFinished ? "🏆 Course Completed!" : "In Progress"}
                            </span>
                            <span style={{ fontWeight: "800", color: "var(--primary)" }}>{progressPercent}%</span>
                          </div>
                          <div className="progress-track" style={{ height: "6px" }}>
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                            {completedLessons} of {totalLessons} lessons finished
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
