import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import {
  LogIn,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  User,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Redirect to where user came from, or home
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Quick 1-click test accounts — auto-submit immediately
  async function setDemoCredentials(demoEmail) {
    setEmail(demoEmail);
    setPassword("123456");
    // Auto-login with the demo credentials directly
    try {
      setLoading(true);
      await login(demoEmail, "123456");
      navigate(from, { replace: true });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

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
          {t("auth.welcomeBack")}
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginBottom: "28px" }}>
          {t("auth.loginSubtitle")}
        </p>

        <form className="form" id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">{t("auth.emailAddress")}</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                id="login-email"
                className="input"
                type="email"
                required
                style={{ paddingLeft: "42px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">{t("auth.password")}</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                id="login-password"
                className="input"
                type={showPassword ? "text" : "password"}
                required
                style={{ paddingLeft: "42px", paddingRight: "42px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                id="toggle-password-visibility"
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
            id="login-submit"
            className="btn btn-glow"
            style={{ width: "100%", height: "46px", marginTop: "8px", fontSize: "15px" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                {t("auth.authenticating")}
              </>
            ) : (
              t("auth.signInBtn")
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
          {t("auth.noAccount")}{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: "700" }}>
            {t("auth.createOne")}
          </Link>
        </div>

        {/* 1-Click Quick Demo Accounts — auto-login on click */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>
            <Sparkles size={14} style={{ color: "var(--primary)" }} />
            <span>{t("auth.oneClickDemo")}</span>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <div
              id="demo-student"
              className="demo-account-chip"
              onClick={() => !loading && setDemoCredentials("student@example.com")}
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <User size={14} style={{ color: "#0284c7" }} />
                <strong style={{ fontSize: "12.5px" }}>{t("auth.studentDemo")}</strong>
              </div>
              <span className="badge student" style={{ fontSize: "10px" }}>student@example.com</span>
            </div>

            <div
              id="demo-instructor"
              className="demo-account-chip"
              onClick={() => !loading && setDemoCredentials("teacher@example.com")}
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <GraduationCap size={14} style={{ color: "#86198f" }} />
                <strong style={{ fontSize: "12.5px" }}>{t("auth.instructorDemo")}</strong>
              </div>
              <span className="badge instructor" style={{ fontSize: "10px" }}>teacher@example.com</span>
            </div>

            <div
              id="demo-admin"
              className="demo-account-chip"
              onClick={() => !loading && setDemoCredentials("admin@example.com")}
              style={{ opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck size={14} style={{ color: "#b45309" }} />
                <strong style={{ fontSize: "12.5px" }}>{t("auth.adminDemo")}</strong>
              </div>
              <span className="badge admin" style={{ fontSize: "10px" }}>admin@example.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
