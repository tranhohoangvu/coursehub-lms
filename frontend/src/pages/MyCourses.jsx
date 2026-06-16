import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Classroom workspace search parameters (URL-based state for back button compatibility)
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCourseId = searchParams.get("courseId");
  const activeLessonId = searchParams.get("lessonId");

  // Filter enrolled courses based on search query
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
      
      // Update local state instantly
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
      
      setMessage(isCurrentlyCompleted ? "Lesson marked as incomplete!" : "Lesson marked as completed!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid var(--border-color)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "16px" }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p>Loading your courses...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CLASSROOM WORKSPACE VIEW
  // -------------------------------------------------------------
  if (activeCourseId) {
    const activeCourseItem = items.find((item) => item.course.id === activeCourseId);
    if (activeCourseItem) {
      const course = activeCourseItem.course;
      const lessons = course.lessons || [];
      const completedLessons = lessons.filter((l) => l.completed).length;
      const totalLessons = lessons.length;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      // Determine current active lesson
      const currentLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0] || null;
      const youtubeId = currentLesson ? getYouTubeId(currentLesson.videoUrl) : null;

      return (
        <div>
          {/* Workspace Header */}
          <div className="classroom-header">
            <div className="classroom-title-area">
              <button 
                className="btn secondary" 
                style={{ alignSelf: "flex-start", marginBottom: "8px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "6px" }}
                onClick={() => setSearchParams({})}
              >
                ← Back to My Learning
              </button>
              <h1 style={{ margin: 0, fontSize: "24px" }}>{course.title}</h1>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "260px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden", marginBottom: "4px" }}>
                  <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--success)", transition: "width 0.4s ease" }}></div>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                  {progressPercent}% Complete ({completedLessons}/{totalLessons} lessons)
                </span>
              </div>
            </div>
          </div>

          {message && <p className="success" style={{ marginBottom: "24px" }}>{message}</p>}

          {lessons.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No lessons are available for this course.</p>
            </div>
          ) : (
            <div className="classroom-layout">
              {/* Left Column: Video and lesson detail */}
              <div>
                {currentLesson ? (
                  <div className="classroom-main">
                    {youtubeId ? (
                      <div className="video-container">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={currentLesson.title}
                        ></iframe>
                      </div>
                    ) : currentLesson.videoUrl ? (
                      <div style={{ background: "#f1f5f9", padding: "24px", borderRadius: "var(--radius-md)", marginBottom: "24px", textAlign: "center" }}>
                        <p style={{ marginBottom: "12px", color: "var(--text-muted)" }}>This lesson contains an external video link:</p>
                        <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ display: "inline-flex" }}>
                          Watch Video on YouTube
                        </a>
                      </div>
                    ) : null}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                      <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>
                        {currentLesson.order}. {currentLesson.title}
                      </h2>
                      
                      <div>
                        {currentLesson.completed ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="badge success" style={{ padding: "8px 16px" }}>✓ Completed</span>
                            <button 
                              className="btn secondary" 
                              style={{ borderColor: "var(--danger)", color: "var(--danger)", padding: "8px 16px" }}
                              onClick={() => toggleLessonCompletion(course.id, currentLesson.id, true)}
                            >
                              Mark Incomplete
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn" 
                            style={{ background: "var(--success)", padding: "8px 16px" }}
                            onClick={() => toggleLessonCompletion(course.id, currentLesson.id, false)}
                          >
                            ✓ Complete Lesson
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="divider" style={{ margin: "16px 0" }}></div>

                    <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "var(--text-main)" }}>Lesson Content</h3>
                    <p style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.7", marginBottom: "24px" }}>
                      {currentLesson.content}
                    </p>

                    {currentLesson.resourceUrl && (
                      <div className="resource-box">
                        <div className="resource-box-info">
                          <svg style={{ width: "24px", height: "24px", color: "var(--primary)" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <strong style={{ display: "block", fontSize: "14px" }}>Learning Resources</strong>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Download additional materials for this lesson</span>
                          </div>
                        </div>
                        <a href={currentLesson.resourceUrl} target="_blank" rel="noopener noreferrer" className="btn secondary" style={{ fontSize: "12px", padding: "8px 16px" }}>
                          Download Resource
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
                    <p>Select a lesson from the syllabus to start learning!</p>
                  </div>
                )}
              </div>

              {/* Right Column: Syllabus Sidebar */}
              <div className="classroom-sidebar">
                <h3 style={{ margin: 0 }}>Course Syllabus</h3>
                <div style={{ maxHeight: "60vh", overflowY: "auto", marginTop: "16px" }}>
                  {lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId || (!activeLessonId && lesson.id === currentLesson?.id);
                    return (
                      <div 
                        key={lesson.id} 
                        className={`workspace-lesson-row ${isActive ? "active" : ""}`}
                        onClick={() => setSearchParams({ courseId: activeCourseId, lessonId: lesson.id })}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                          {lesson.completed ? (
                            <svg style={{ width: "16px", height: "16px", color: "var(--success)", flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <div style={{ width: "16px", height: "16px", border: "2px solid #cbd5e1", borderRadius: "50%", flexShrink: 0 }}></div>
                          )}
                          <span style={{ 
                            fontSize: "13px", 
                            fontWeight: "500", 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis",
                            textDecoration: lesson.completed ? "line-through" : "none",
                            color: isActive ? "var(--primary-dark)" : (lesson.completed ? "var(--text-muted)" : "var(--text-main)")
                          }}>
                            {lesson.order}. {lesson.title}
                          </span>
                        </div>
                        
                        {lesson.isPreview && (
                          <span className="badge success" style={{ fontSize: "9px", padding: "2px 6px", marginLeft: "8px" }}>Free</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  // -------------------------------------------------------------
  // DASHBOARD LIST VIEW (STANDARD VIEW)
  // -------------------------------------------------------------
  return (
    <div>
      <h1 style={{ marginBottom: "24px" }}>My Learning</h1>
      
      {message && <p className="success" style={{ marginBottom: "24px" }}>{message}</p>}

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <svg style={{ width: "64px", height: "64px", color: "#cbd5e1", margin: "0 auto 16px auto", display: "block" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>No enrolled courses</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>You haven't enrolled in any courses yet. Find your next topic now!</p>
          <Link className="btn" to="/">Browse Marketplace</Link>
        </div>
      ) : (
        <>
          <div className="search-container" style={{ marginBottom: "32px", maxWidth: "600px" }}>
            <div className="search-input-wrapper">
              <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#94a3b8" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                className="input" 
                style={{ paddingLeft: "42px", paddingRight: "42px", height: "46px", background: "white", color: "var(--text-main)" }} 
                placeholder="Search your courses by title or description..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
                  title="Clear search"
                >
                  <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
              <svg style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 16px auto", display: "block" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 style={{ color: "var(--text-main)", marginBottom: "8px" }}>No Courses Found</h3>
              <p>We couldn't find any enrolled courses matching your search query. Try searching for something else or clear the search field.</p>
              <button className="btn secondary" style={{ marginTop: "16px" }} onClick={() => setSearchQuery("")}>Clear Search</button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "32px" }}>
              {filteredItems.map((item) => {
                const lessons = item.course.lessons || [];
                const completedLessons = lessons.filter((l) => l.completed).length;
                const totalLessons = lessons.length;
                const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                return (
                  <div className="card" key={item.id} style={{ padding: "28px" }}>
                    <div className="my-courses-header-wrapper" style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap", marginBottom: "24px" }}>
                      <img 
                        src={item.course.thumbnailUrl || "https://placehold.co/600x400?text=Course"} 
                        alt={item.course.title} 
                        className="my-courses-img"
                        style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}
                      />
                      <div style={{ flex: 1, minWidth: "250px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
                          <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>{item.course.title}</h2>
                          
                          <button 
                            className="btn" 
                            style={{ padding: "8px 16px", fontSize: "13px" }}
                            onClick={() => {
                              const firstUncompleted = lessons.find((l) => !l.completed) || lessons[0];
                              setSearchParams({ courseId: item.course.id, lessonId: firstUncompleted?.id || "" });
                            }}
                          >
                            Resume Course
                          </button>
                        </div>
                        
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.course.description}
                        </p>
                        
                        {/* Progress Bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--primary)", transition: "width 0.4s ease" }}></div>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)", minWidth: "35px" }}>
                            {progressPercent}%
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            ({completedLessons}/{totalLessons} lessons)
                          </span>
                        </div>
                      </div>
                    </div>

                    <h3 style={{ fontSize: "16px", marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", color: "var(--text-main)" }}>
                      Course Syllabus (Click to study a lesson)
                    </h3>

                    <div className="lesson-list">
                      {lessons.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No lessons are available for this course.</p>
                      ) : (
                        lessons.map((lesson) => (
                          <div 
                            className="row syllabus-row" 
                            key={lesson.id} 
                            onClick={() => {
                              setSearchParams({ courseId: item.course.id, lessonId: lesson.id });
                            }}
                            style={{ 
                              justifyContent: "space-between", 
                              padding: "12px 16px", 
                              background: lesson.completed ? "#f8fafc" : "white", 
                              border: "1px solid var(--border-color)", 
                              borderRadius: "var(--radius-md)",
                              opacity: lesson.completed ? 0.85 : 1,
                              cursor: "pointer",
                              transition: "var(--transition-smooth)"
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              {lesson.completed ? (
                                <svg style={{ width: "20px", height: "20px", color: "var(--success)" }} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <div style={{ width: "20px", height: "20px", border: "2px solid #cbd5e1", borderRadius: "50%" }}></div>
                              )}
                              <span style={{ fontWeight: "500", textDecoration: lesson.completed ? "line-through" : "none", color: lesson.completed ? "var(--text-muted)" : "var(--text-main)" }}>
                                {lesson.order}. {lesson.title}
                              </span>
                            </div>
                            
                            <div className="action-btn-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                              {lesson.completed ? (
                                <>
                                  <span className="badge success" style={{ fontSize: "11px" }}>Completed</span>
                                  <button 
                                    className="btn secondary" 
                                    style={{ padding: "6px 12px", fontSize: "12px", borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }} 
                                    onClick={() => toggleLessonCompletion(item.course.id, lesson.id, true)}
                                    title="Mark this lesson as incomplete"
                                  >
                                    Reset
                                  </button>
                                </>
                              ) : (
                                <button 
                                  className="btn secondary" 
                                  style={{ padding: "6px 12px", fontSize: "12px" }} 
                                  onClick={() => toggleLessonCompletion(item.course.id, lesson.id, false)}
                                >
                                  Mark as Complete
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
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
