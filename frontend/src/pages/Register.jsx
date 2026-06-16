import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ padding: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", textAlign: "center" }}>Create Account</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginBottom: "28px" }}>
          Start your learning journey with CourseHub today
        </p>

        {error && <p className="error" style={{ marginBottom: "20px" }}>{error}</p>}

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="input" required value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="name@example.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" required value={form.password} onChange={(e) => setField("password", e.target.value)} placeholder="••••••••" />
          </div>

          <button className="btn" style={{ width: "100%", height: "46px", marginTop: "8px", fontSize: "15px" }}>Create Account</button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "underline" }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
}
