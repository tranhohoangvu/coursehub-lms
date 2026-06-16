import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import CourseCard from "../components/CourseCard.jsx";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function loadCourses(search = "") {
    try {
      setError("");
      const data = await api(`/courses${search ? `?q=${encodeURIComponent(search)}` : ""}`);
      setCourses(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadCourses(); }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      loadCourses(q);
    }
  };

  return (
    <>
      <section className="hero">
        <h1>Find Your Next Skill</h1>
        <p>Explore a collection of interactive courses designed to accelerate your career. Empower your learning with role-based features, instructor panels, and progressive tracking.</p>
        <div className="search-container">
          <div className="search-input-wrapper">
            <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#94a3b8" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              className="input" 
              style={{ paddingLeft: "42px", height: "46px", background: "white", color: "var(--text-main)", border: "none" }} 
              placeholder="Search courses by name or keyword..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="btn" style={{ height: "46px", padding: "0 24px" }} onClick={() => loadCourses(q)}>Search</button>
        </div>
      </section>

      {error && <p className="error" style={{ marginBottom: "24px" }}>{error}</p>}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px" }}>
        <h2 style={{ margin: 0 }}>Browse Courses</h2>
        <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>
          Showing {courses.length} courses
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
          <svg style={{ width: "48px", height: "48px", color: "#cbd5e1", margin: "0 auto 16px auto", display: "block" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 style={{ color: "var(--text-main)", marginBottom: "8px" }}>No Courses Found</h3>
          <p>We couldn't find any courses matching your search query. Try searching for something else or clear the search field.</p>
          <button className="btn secondary" style={{ marginTop: "16px" }} onClick={() => { setQ(""); loadCourses(""); }}>Clear Search</button>
        </div>
      ) : (
        <div className="grid">
          {courses.map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      )}
    </>
  );
}
