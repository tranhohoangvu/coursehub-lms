import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Menu, X } from "lucide-react";

export default function App() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo" onClick={() => setIsSidebarOpen(false)}>CourseHub</Link>

          {/* Desktop Only Navigation Links */}
          <div className="nav-links desktop-only">
            <NavLink to="/" end>Home</NavLink>
            {user && <NavLink to="/cart">Cart</NavLink>}
            {user && <NavLink to="/my-courses">My Courses</NavLink>}
            {user?.role === "INSTRUCTOR" && <NavLink to="/instructor">Instructor</NavLink>}
            {user?.role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}
            {!user ? (
              <>
                <NavLink className="btn nav-btn-login" to="/login">Login</NavLink>
                <NavLink className="btn nav-btn-register" to="/register">Register</NavLink>
              </>
            ) : (
              <>
                <span className={`badge ${user.role.toLowerCase()}`}>{user.name} · {user.role}</span>
                <button className="btn nav-btn-logout" onClick={logout}>Logout</button>
              </>
            )}
          </div>

          {/* Toggle Burger Menu on Mobile */}
          <button className="mobile-menu-toggle" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation menu">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay and Sidebar */}
      {isSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <span className="logo">CourseHub</span>
              <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation menu">
                <X size={24} />
              </button>
            </div>

            <div className="sidebar-links">
              <NavLink to="/" end onClick={() => setIsSidebarOpen(false)}>Home</NavLink>
              {user && <NavLink to="/cart" onClick={() => setIsSidebarOpen(false)}>Cart</NavLink>}
              {user && <NavLink to="/my-courses" onClick={() => setIsSidebarOpen(false)}>My Courses</NavLink>}
              {user?.role === "INSTRUCTOR" && <NavLink to="/instructor" onClick={() => setIsSidebarOpen(false)}>Instructor</NavLink>}
              {user?.role === "ADMIN" && <NavLink to="/admin" onClick={() => setIsSidebarOpen(false)}>Admin</NavLink>}

              <div className="sidebar-divider"></div>

              {!user ? (
                <div style={{ display: "grid", gap: "12px", width: "100%" }}>
                  <NavLink className="btn nav-btn-login" to="/login" onClick={() => setIsSidebarOpen(false)}>Login</NavLink>
                  <NavLink className="btn nav-btn-register" to="/register" onClick={() => setIsSidebarOpen(false)}>Register</NavLink>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px", width: "100%", alignItems: "center" }}>
                  <span className={`badge ${user.role.toLowerCase()}`} style={{ justifyContent: "center", width: "100%" }}>{user.name} · {user.role}</span>
                  <button className="btn nav-btn-logout" style={{ width: "100%" }} onClick={() => { logout(); setIsSidebarOpen(false); }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="container" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container" style={{ padding: "20px 24px" }}>
          <p>© {new Date().getFullYear()} CourseHub — A Portfolio Course Marketplace App.</p>
        </div>
      </footer>
    </div>
  );
}
