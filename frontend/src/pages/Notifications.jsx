import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Clock, AlertTriangle, UploadCloud, Sparkles } from "lucide-react";
import api from "../services/api";

export default function Notifications() {
  const [notificationList, setNotificationList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/notifications");
      setNotificationList(response.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotificationList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotificationList((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "UPCOMING_DUE": return <Clock size={18} color="#e11d48" />;
      case "UNUSUAL_BILL": return <AlertTriangle size={18} color="#d97706" />;
      case "BILL_UPLOADED": return <UploadCloud size={18} color="#059669" />;
      default: return <Sparkles size={18} color="#2563eb" />;
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading notifications...</div>;
  }

  const unreadCount = notificationList.filter((n) => !n.read).length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Due date alerts, anomaly warnings, and system updates</p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={handleMarkAllAsRead} className="btn btn-outline btn-sm">
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notificationList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell size={32} /></div>
          <h2 className="empty-state-title">No notifications yet</h2>
          <p className="empty-state-desc">You're all caught up! Due date reminders and anomaly alerts will appear here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: "8px 0" }}>
          {notificationList.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                background: item.read ? "transparent" : "#f8fafc",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ marginTop: "2px" }}>{getNotificationIcon(item.type)}</div>
                <div>
                  <div style={{ fontWeight: item.read ? "600" : "700", color: "var(--text-navy)", fontSize: "0.95rem" }}>
                    {item.title}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "2px" }}>
                    {item.message}
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!item.read && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(item.id)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: "0.78rem", padding: "4px 8px", flexShrink: 0 }}
                  title="Mark as read"
                >
                  <Check size={12} />
                  <span>Read</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
