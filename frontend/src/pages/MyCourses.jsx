import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function MyCourses() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

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
        <div style={{ display: "grid", gap: "32px" }}>
          {items.map((item) => {
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
                    <h2 style={{ margin: "0 0 8px 0", fontSize: "22px", fontWeight: "800" }}>{item.course.title}</h2>
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
                  Course Syllabus
                </h3>

                <div className="lesson-list">
                  {lessons.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No lessons are available for this course.</p>
                  ) : (
                    lessons.map((lesson) => (
                      <div 
                        className="row syllabus-row" 
                        key={lesson.id} 
                        style={{ 
                          justifyContent: "space-between", 
                          padding: "12px 16px", 
                          background: lesson.completed ? "#f8fafc" : "white", 
                          border: "1px solid var(--border-color)", 
                          borderRadius: "var(--radius-md)",
                          opacity: lesson.completed ? 0.75 : 1
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
                        
                        {lesson.completed ? (
                          <div className="action-btn-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="badge success" style={{ fontSize: "11px" }}>Completed</span>
                            <button 
                              className="btn secondary" 
                              style={{ padding: "6px 12px", fontSize: "12px", borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }} 
                              onClick={() => toggleLessonCompletion(item.course.id, lesson.id, true)}
                              title="Mark this lesson as incomplete"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="btn secondary action-btn-wrapper" 
                            style={{ padding: "6px 12px", fontSize: "12px" }} 
                            onClick={() => toggleLessonCompletion(item.course.id, lesson.id, false)}
                          >
                            Mark as Complete
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
