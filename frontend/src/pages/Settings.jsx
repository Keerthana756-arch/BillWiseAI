import { useAuth } from "../context/AuthContext";
import { User, Mail, Database, Bot, Shield, LogOut } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-subtitle">Account details and system configuration status</p>
        </div>
      </div>

      <div className="grid-2">
        {/* User Account Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">User Account</h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary-blue), var(--primary-teal))",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: "800"
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: "700" }}>{user?.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={15} /> User ID
              </span>
              <strong>#{user?.id || 1}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={15} /> Email Address
              </span>
              <strong>{user?.email}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Shield size={15} /> Account Security
              </span>
              <span className="badge badge-paid">JWT & BCrypt Encrypted</span>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button
              type="button"
              onClick={logout}
              className="btn btn-outline btn-sm"
              style={{ color: "#dc2626", borderColor: "#fecaca" }}
            >
              <LogOut size={14} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>

        {/* System & Architecture Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">System Status & Environment</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "4px" }}>
                <Database size={16} color="var(--primary-blue)" />
                <span>Backend & Database</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Spring Boot (Java 17) connected to MySQL database on port 3306.
              </p>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "4px" }}>
                <Bot size={16} color="var(--primary-teal)" />
                <span>AI Intelligence Engine</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                LLM API integration with automatic built-in rule-based fallback grounded in user's real bill calculations.
              </p>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "4px" }}>
                <Shield size={16} color="#059669" />
                <span>User Data Privacy</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Every database query is strictly isolated to your authenticated account ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
