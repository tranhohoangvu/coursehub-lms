import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import {
  Menu,
  X,
  Sparkles,
  BookOpen,
  ShoppingCart,
  GraduationCap,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  Compass,
  Code,
  Database,
  Server,
  Heart
} from "lucide-react";

export default function App() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine user role badge style
  const getRoleBadgeClass = (role) => {
    if (role === "ADMIN") return "badge admin";
    if (role === "INSTRUCTOR") return "badge instructor";
    return "badge student";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Accent Gradient Bar */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, #4f46e5 0%, #8b5cf6 50%, #06b6d4 100%)" }}></div>

      {/* Sticky Glassmorphic Navbar */}
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="logo" onClick={() => setIsSidebarOpen(false)}>
            <div className="logo-sparkle">
              <Sparkles size={18} />
            </div>
            <span>CourseHub</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links desktop-only">
            <NavLink to="/" end>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Compass size={16} /> Explore
              </span>
            </NavLink>

            {user && (
              <NavLink to="/my-courses">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <BookOpen size={16} /> My Learning
                </span>
              </NavLink>
            )}

            {user && (
              <NavLink to="/cart" className="cart-nav-link">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShoppingCart size={16} /> Cart
                </span>
              </NavLink>
            )}

            {user?.role === "INSTRUCTOR" && (
              <NavLink to="/instructor">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <GraduationCap size={16} /> Instructor Hub
                </span>
              </NavLink>
            )}

            {user?.role === "ADMIN" && (
              <NavLink to="/admin">
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} /> Admin Portal
                </span>
              </NavLink>
            )}

            {!user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "8px" }}>
                <NavLink className="btn nav-btn-login" to="/login">
                  <LogIn size={15} /> Sign In
                </NavLink>
                <NavLink className="btn nav-btn-register" to="/register">
                  <UserPlus size={15} /> Get Started
                </NavLink>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "8px" }}>
                <div className="user-nav-profile">
                  <div className="user-avatar-initial">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span style={{ color: "var(--text-main)" }}>{user.name}</span>
                  <span className={getRoleBadgeClass(user.role)}>
                    {user.role}
                  </span>
                </div>
                <button
                  className="btn nav-btn-logout"
                  onClick={logout}
                  title="Sign out of your account"
                  style={{ padding: "0 12px", height: "38px" }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Toggle Burger Menu on Mobile */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay and Sidebar */}
      {isSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <Link to="/" className="logo" onClick={() => setIsSidebarOpen(false)}>
                <div className="logo-sparkle">
                  <Sparkles size={16} />
                </div>
                <span>CourseHub</span>
              </Link>
              <button
                className="sidebar-close"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="sidebar-links">
              <NavLink to="/" end onClick={() => setIsSidebarOpen(false)}>
                <Compass size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                Explore Courses
              </NavLink>
              {user && (
                <NavLink to="/my-courses" onClick={() => setIsSidebarOpen(false)}>
                  <BookOpen size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  My Learning
                </NavLink>
              )}
              {user && (
                <NavLink to="/cart" onClick={() => setIsSidebarOpen(false)}>
                  <ShoppingCart size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  Shopping Cart
                </NavLink>
              )}
              {user?.role === "INSTRUCTOR" && (
                <NavLink to="/instructor" onClick={() => setIsSidebarOpen(false)}>
                  <GraduationCap size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  Instructor Hub
                </NavLink>
              )}
              {user?.role === "ADMIN" && (
                <NavLink to="/admin" onClick={() => setIsSidebarOpen(false)}>
                  <ShieldCheck size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                  Admin Portal
                </NavLink>
              )}

              <div className="sidebar-divider"></div>

              {!user ? (
                <div style={{ display: "grid", gap: "10px", width: "100%", marginTop: "8px" }}>
                  <NavLink
                    className="btn nav-btn-login"
                    to="/login"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <LogIn size={16} /> Sign In
                  </NavLink>
                  <NavLink
                    className="btn nav-btn-register"
                    to="/register"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <UserPlus size={16} /> Get Started
                  </NavLink>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px", width: "100%" }}>
                  <div className="user-nav-profile" style={{ justifyContent: "center", width: "100%", padding: "8px 12px" }}>
                    <div className="user-avatar-initial">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span style={{ color: "var(--text-main)" }}>{user.name}</span>
                    <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                  </div>
                  <button
                    className="btn nav-btn-logout"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => {
                      logout();
                      setIsSidebarOpen(false);
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="container" style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Rich Multi-Column Modern Footer */}
      <footer className="footer">
        <div className="container" style={{ padding: "0 24px" }}>
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="logo" style={{ marginBottom: "14px" }}>
                <div className="logo-sparkle" style={{ width: "28px", height: "28px" }}>
                  <Sparkles size={15} />
                </div>
                <span style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}>CourseHub</span>
              </div>
              <p style={{ maxWidth: "340px", fontSize: "14px", lineHeight: "1.6", color: "#94a3b8" }}>
                Next-generation Learning Management System built for developers and digital creators. Powered by PostgreSQL & native SQL performance.
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                <span className="badge cyan" style={{ fontSize: "11px" }}>PostgreSQL</span>
                <span className="badge" style={{ fontSize: "11px" }}>React 19</span>
                <span className="badge success" style={{ fontSize: "11px" }}>Express Native</span>
              </div>
            </div>

            <div className="footer-col">
              <h5>Platform</h5>
              <ul className="footer-links">
                <li><Link to="/">Browse Catalog</Link></li>
                <li><Link to="/my-courses">My Learning</Link></li>
                <li><Link to="/cart">Cart & Checkout</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Instructors</h5>
              <ul className="footer-links">
                <li><Link to="/instructor">Teaching Studio</Link></li>
                <li><Link to="/login">Instructor Login</Link></li>
                <li><Link to="/register">Become a Mentor</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Developer</h5>
              <ul className="footer-links">
                <li><a href="https://github.com/tranhohoangvu/coursehub-lms" target="_blank" rel="noreferrer">GitHub Repository</a></li>
                <li><a href="https://coursehub-lms.onrender.com" target="_blank" rel="noreferrer">Backend API</a></li>
                <li><a href="https://supabase.com" target="_blank" rel="noreferrer">Supabase Cloud</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>
              © {new Date().getFullYear()} <strong>CourseHub</strong>. Engineered with passion for modern engineering standards.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
              Crafted with <Heart size={14} style={{ color: "#f43f5e" }} /> by Hoang Vu
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
