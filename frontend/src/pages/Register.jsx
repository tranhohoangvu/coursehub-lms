import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff
} from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
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

        {error && <div className="error" style={{ marginBottom: "20px" }}>{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                className="input"
                required
                style={{ paddingLeft: "42px" }}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Alex Morgan"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                className="input"
                type="email"
                required
                style={{ paddingLeft: "42px" }}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
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
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="At least 6 characters"
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
            className="btn success btn-glow"
            style={{ width: "100%", height: "46px", marginTop: "8px", fontSize: "15px" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Free Account"}
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
            <span>Instant access to free course previews & tutorials</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={14} style={{ color: "#10b981" }} />
            <span>Track progress with interactive syllabus checklist</span>
          </div>
        </div>
      </div>
    </div>
  );
}
