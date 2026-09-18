import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "", cls: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak", cls: "weak" };
  if (score === 2) return { level: 2, label: "Fair", cls: "fair" };
  if (score === 3) return { level: 3, label: "Good", cls: "good" };
  return { level: 4, label: "Strong", cls: "strong" };
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      showToast("Account created! Welcome to CourseHub 🎉", "success");
      navigate("/");
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
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
            boxShadow: "0 8px 16px var(--success-glow)"
          }}
        >
          <UserPlus size={24} />
        </div>

        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "6px", textAlign: "center", letterSpacing: "-0.5px" }}>
          Create Free Account
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginBottom: "28px" }}>
          Join thousands of engineers learning high-demand tech skills
        </p>

        <form className="form" id="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                id="register-name"
                className="input"
                required
                style={{ paddingLeft: "42px" }}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Alex Morgan"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                id="register-email"
                className="input"
                type="email"
                required
                style={{ paddingLeft: "42px" }}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                id="register-password"
                className="input"
                type={showPassword ? "text" : "password"}
                required
                style={{ paddingLeft: "42px", paddingRight: "42px" }}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="At least 6 characters"
                disabled={loading}
              />
              <button
                type="button"
                id="toggle-register-password"
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

            {/* Password Strength Indicator */}
            {form.password && (
              <>
                <div className="password-strength" role="progressbar" aria-label={`Password strength: ${strength.label}`}>
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`strength-bar ${bar <= strength.level ? strength.cls : ""}`}
                    />
                  ))}
                </div>
                <span className={`strength-label ${strength.cls}`}>{strength.label} password</span>
              </>
            )}
          </div>

          <button
            id="register-submit"
            className="btn success btn-glow"
            style={{ width: "100%", height: "46px", marginTop: "8px", fontSize: "15px" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Creating Account...
              </>
            ) : (
              "Create Free Account"
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: "700" }}>
            Sign in here
          </Link>
        </div>

        {/* Benefits checklist */}
        <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border-color)", display: "grid", gap: "8px", fontSize: "12.5px", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={14} style={{ color: "#10b981" }} />
            <span>Instant access to free course previews &amp; tutorials</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={14} style={{ color: "#10b981" }} />
            <span>Track progress with interactive syllabus checklist</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={14} style={{ color: "#10b981" }} />
            <span>Earn certificates upon course completion</span>
          </div>
        </div>
      </div>
    </div>
  );
}
