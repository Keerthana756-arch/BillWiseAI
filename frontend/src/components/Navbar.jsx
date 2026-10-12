import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, UploadCloud, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications");
        const count = res.data.filter(n => !n.read).length;
        setUnreadCount(count);
      } catch (err) {
        // Silently catch
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-outline btn-sm"
          style={{ display: "inline-flex" }}
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: "none", alignItems: "center", gap: "8px" }} className="desktop-welcome">
          <span style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
            Welcome back, <strong style={{ color: "var(--text-navy)" }}>{user?.name || "User"}</strong>
          </span>
        </div>
      </div>

      <div className="navbar-actions">
        <Link to="/upload-bill" className="btn btn-teal btn-sm">
          <UploadCloud size={16} />
          <span>Upload Bill</span>
        </Link>

        <Link 
          to="/notifications" 
          className="btn btn-outline btn-sm"
          style={{ position: "relative", padding: "8px 10px" }}
          title="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span 
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "#e11d48",
                color: "white",
                fontSize: "0.68rem",
                fontWeight: "700",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white"
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <Link 
          to="/settings"
          style={{ textDecoration: "none" }}
          title="Account Settings"
        >
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
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </Link>
      </div>
    </header>
  );
}