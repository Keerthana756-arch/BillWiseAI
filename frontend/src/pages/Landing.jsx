import { Link } from "react-router-dom";
import { 
  Zap, 
  UploadCloud, 
  AlertTriangle, 
  TrendingUp, 
  Bot, 
  PieChart, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Wallet,
  Calendar
} from "lucide-react";
import StatCard from "../components/StatCard";

export default function Landing() {
  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-header">
        <Link to="/" className="brand-logo">
          <div className="logo-icon-box">
            <Zap size={22} />
          </div>
          <span className="brand-text">
            BillWise<span>AI</span>
          </span>
        </Link>

        <nav className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-badge">
          <Sparkles size={16} />
          <span>Smart AI-Powered Utility Bill Management</span>
        </div>

        <h1 className="landing-headline">
          Understand Your Bills. <br />
          <span className="text-gradient">Take Control of Your Expenses.</span>
        </h1>

        <p className="landing-subtext">
          Upload bills or enter amounts manually. BillWiseAI extracts key data, flags unusual spikes, predicts future costs, and gives you actionable ways to save.
        </p>

        <div className="landing-hero-actions">
          <Link to="/register" className="btn btn-teal btn-lg">
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline btn-lg">
            Sign In to Dashboard
          </Link>
        </div>

        {/* Live Dashboard Preview */}
        <div className="landing-preview-box">
          <div className="browser-bar">
            <div className="dot-red" />
            <div className="dot-yellow" />
            <div className="dot-green" />
            <span style={{ marginLeft: "8px" }}>app.billwiseai.com/dashboard</span>
          </div>

          <div className="stat-grid">
            <StatCard 
              title="This Month's Spending" 
              value="₹2,480.00" 
              subtitle="vs previous month" 
              trend="▲ 12.4%" 
              icon={Wallet} 
            />
            <StatCard 
              title="Estimated Next Month" 
              value="₹2,200.00" 
              subtitle="Statistical forecast" 
              icon={TrendingUp} 
              iconBg="#ecfdf5" 
              iconColor="#059669" 
            />
            <StatCard 
              title="Outstanding Bills" 
              value="₹680.00" 
              subtitle="1 bill due soon" 
              icon={Calendar} 
              iconBg="#fff1f2" 
              iconColor="#e11d48" 
            />
            <StatCard 
              title="AI Anomaly Status" 
              value="1 Alert" 
              subtitle="Electricity +28% spike" 
              icon={AlertTriangle} 
              iconBg="#fffbeb" 
              iconColor="#d97706" 
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ background: "#f8fafc", padding: "70px 24px" }}>
        <div className="section-container" style={{ padding: 0 }}>
          <div className="section-heading">
            <h2 className="section-title">Built for Modern Utility Tracking</h2>
            <p className="section-subtitle">Track Electricity, Water, Gas, Internet, and Mobile in one organized dashboard.</p>
          </div>

          <div className="features-grid">
            <div className="card">
              <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb", marginBottom: "14px" }}>
                <UploadCloud size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Smart OCR Text Extraction</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Upload PDF or image statements. Automated text extraction reads vendors, amounts, and dates into an editable form.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon" style={{ background: "#fffbeb", color: "#d97706", marginBottom: "14px" }}>
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Unusual Bill Detection</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Detects bills with unusual cost jumps compared to your category average and suggests checking your usage.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon" style={{ background: "#ecfdf5", color: "#059669", marginBottom: "14px" }}>
                <TrendingUp size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Future Bill Predictions</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Uses statistical trend averages to estimate upcoming spending so you can budget with confidence.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon" style={{ background: "#f5f3ff", color: "#7c3aed", marginBottom: "14px" }}>
                <Bot size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Ask BillWiseAI Chat</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Chat with an AI assistant that answers questions grounded strictly in your real recorded bills.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon" style={{ background: "#f0fdfa", color: "#0d9488", marginBottom: "14px" }}>
                <PieChart size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Interactive Analytics</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Visualize monthly trends and category distributions with clean, interactive charts.
              </p>
            </div>

            <div className="card">
              <div className="stat-icon" style={{ background: "#fef2f2", color: "#e11d48", marginBottom: "14px" }}>
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Due Date Reminders</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Track upcoming deadlines with in-app notifications and mark bills as Paid or Unpaid with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section-container">
        <div className="section-heading">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three easy steps to master your utility spending.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number" style={{ background: "#eff6ff", color: "var(--primary-blue)" }}>1</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Upload or Enter Bills</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Upload a statement or quickly type in your bill details.</p>
          </div>
          <div className="step-card">
            <div className="step-number" style={{ background: "#f0fdfa", color: "var(--primary-teal)" }}>2</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Automated Analysis</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>The Java backend analyzes spending trends and checks for unusual spikes.</p>
          </div>
          <div className="step-card">
            <div className="step-number" style={{ background: "#f5f3ff", color: "#7c3aed" }}>3</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>Get Insights & Save</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Review personalized saving recommendations and chat with the AI.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-banner">
        <h2 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "12px" }}>
          Ready to Take Control of Your Utility Bills?
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "1rem", marginBottom: "28px" }}>
          Create an account and discover smart utility management.
        </p>
        <Link to="/register" className="btn btn-teal btn-lg">
          <span>Create Free Account</span>
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Zap size={16} color="var(--primary-blue)" />
          <strong>BillWiseAI</strong> — Smart Utility Management
        </div>
        <div>Java Spring Boot &bull; MySQL &bull; React &bull; AI</div>
      </footer>
    </div>
  );
}
