import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, AlertCircle, ArrowRight, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleFillDemo = () => {
    setEmail("student@billwise.ai");
    setPassword("password123");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="brand-logo" style={{ justifyContent: "center" }}>
            <div className="logo-icon-box"><Zap size={22} /></div>
            <span className="brand-text">BillWise<span>AI</span></span>
          </Link>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage and analyze your utility bills</p>
        </div>

        {errorMessage && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                type="email"
                className="form-control auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={18} className="auth-input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className="form-control auth-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} className="auth-input-icon" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px" }} disabled={isSubmitting}>
            <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-demo-box">
          <span style={{ color: "var(--text-muted)" }}>Demo Credentials:</span>
          <button type="button" onClick={handleFillDemo} className="btn btn-outline btn-sm">
            <KeyRound size={12} />
            <span>Fill Demo</span>
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account yet?{" "}
          <Link to="/register" className="auth-link">Register now</Link>
        </div>
      </div>
    </div>
  );
}