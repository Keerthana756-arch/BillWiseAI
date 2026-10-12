import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, User, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await register(fullName, email, password, confirmPassword);
    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="brand-logo" style={{ justifyContent: "center" }}>
            <div className="logo-icon-box"><Zap size={22} /></div>
            <span className="brand-text">BillWise<span>AI</span></span>
          </Link>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Start managing your utility expenses with BillWiseAI</p>
        </div>

        {errorMessage && (
          <div className="alert-banner alert-danger">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="auth-input-wrapper">
              <input
                type="text"
                className="form-control auth-input"
                placeholder="Alex Morgan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <User size={18} className="auth-input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                type="email"
                className="form-control auth-input"
                placeholder="alex@example.com"
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} className="auth-input-icon" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="auth-input-wrapper">
              <input
                type="password"
                className="form-control auth-input"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Lock size={18} className="auth-input-icon" />
            </div>
          </div>

          <button type="submit" className="btn btn-teal" style={{ width: "100%", padding: "12px" }} disabled={isSubmitting}>
            <span>{isSubmitting ? "Creating..." : "Create Account"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}