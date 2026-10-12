import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  UploadCloud, 
  LineChart, 
  TrendingUp, 
  Bot, 
  Bell, 
  Settings, 
  Zap, 
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/bills", label: "My Bills", icon: Receipt },
    { to: "/upload-bill", label: "Upload Bill", icon: UploadCloud },
    { to: "/analytics", label: "Analytics", icon: LineChart },
    { to: "/insights", label: "Predictions & Insights", icon: TrendingUp },
    { to: "/ask-ai", label: "Ask BillWiseAI", icon: Bot },
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            zIndex: 45
          }}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="brand-logo" onClick={onClose}>
            <div className="logo-icon-box">
              <Zap size={20} />
            </div>
            <span className="brand-text">
              BillWise<span>AI</span>
            </span>
          </NavLink>
          {isOpen && (
            <button 
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div 
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary-blue), var(--primary-teal))",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                fontSize: "0.85rem"
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-navy)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {user?.name || "User"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {user?.email || ""}
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="btn btn-outline btn-sm"
            style={{ width: "100%", justifyContent: "center", color: "#dc2626", borderColor: "#fecaca" }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}