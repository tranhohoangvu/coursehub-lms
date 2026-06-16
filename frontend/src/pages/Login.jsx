import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@example.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ padding: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", textAlign: "center" }}>Welcome Back</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginBottom: "28px" }}>
          Log in to your account to continue learning
        </p>

        {error && <p className="error" style={{ marginBottom: "20px" }}>{error}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button className="btn" style={{ width: "100%", height: "46px", marginTop: "8px", fontSize: "15px" }}>Sign In</button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "underline" }}>Register here</Link>
        </div>

        <div style={{ marginTop: "24px", background: "var(--bg-base)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", fontSize: "12px", color: "var(--text-muted)" }}>
          <strong style={{ color: "var(--text-main)", display: "block", marginBottom: "4px" }}>Demo Credentials:</strong>
          <span style={{ display: "block" }}>• Student: <code>student@example.com</code> / <code>123456</code></span>
          <span style={{ display: "block" }}>• Instructor: <code>teacher@example.com</code> / <code>123456</code></span>
          <span style={{ display: "block" }}>• Admin: <code>admin@example.com</code> / <code>123456</code></span>
        </div>
      </div>
    </div>
  );
}
