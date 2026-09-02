import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LogIn,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  User,
  Eye,
  EyeOff
} from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Quick 1-click test accounts
  const setDemoCredentials = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword("123456");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header Icon */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "var(--radius-md)",
            background: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            boxShadow: "0 8px 16px var(--primary-glow)"
          }}
        >
          <LogIn size={24} />
        </div>

        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "6px", textAlign: "center", letterSpacing: "-0.5px" }}>
          Welcome Back
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginBottom: "28px" }}>
          Log in to your CourseHub account to continue learning
        </p>

        {error && <div className="error" style={{ marginBottom: "20px" }}>{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                className="input"
                type="email"
                required
                style={{ paddingLeft: "42px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                required
                style={{ paddingLeft: "42px", paddingRight: "42px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px"
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            className="btn btn-glow"
            style={{ width: "100%", height: "46px", marginTop: "8px", fontSize: "15px" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Account"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: "700" }}>
            Create one for free
          </Link>
        </div>

        {/* 1-Click Quick Demo Accounts Selection */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>
            <Sparkles size={14} style={{ color: "var(--primary)" }} />
            <span>One-Click Demo Accounts:</span>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <div
              className="demo-account-chip"
              onClick={() => setDemoCredentials("student@example.com", "STUDENT")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={14} style={{ color: "#0284c7" }} />
                <strong style={{ fontSize: "12.5px" }}>Student Demo</strong>
              </div>
              <span className="badge student" style={{ fontSize: "10px" }}>student@example.com</span>
            </div>

            <div
              className="demo-account-chip"
              onClick={() => setDemoCredentials("teacher@example.com", "INSTRUCTOR")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GraduationCap size={14} style={{ color: "#86198f" }} />
                <strong style={{ fontSize: "12.5px" }}>Instructor Demo</strong>
              </div>
              <span className="badge instructor" style={{ fontSize: "10px" }}>teacher@example.com</span>
            </div>

            <div
              className="demo-account-chip"
              onClick={() => setDemoCredentials("admin@example.com", "ADMIN")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={14} style={{ color: "#b45309" }} />
                <strong style={{ fontSize: "12.5px" }}>Admin Demo</strong>
              </div>
              <span className="badge admin" style={{ fontSize: "10px" }}>admin@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
