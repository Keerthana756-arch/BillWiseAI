import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import BillDetails from "./pages/BillDetails";
import UploadBill from "./pages/UploadBill";
import Analytics from "./pages/Analytics";
import Insights from "./pages/Insights";
import AskAI from "./pages/AskAI";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

/**
 * ProtectedLayout wraps authenticated pages with the sidebar and top navbar.
 * If user is not logged in, redirects immediately to /login.
 */
function ProtectedLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
        Checking user session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/bills/:id" element={<BillDetails />} />
            <Route path="/upload-bill" element={<UploadBill />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/ask-ai" element={<AskAI />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />

            {/* Backwards-compatible route redirects */}
            <Route path="/expenses" element={<Navigate to="/bills" replace />} />
            <Route path="/expenses/:id" element={<Navigate to="/bills" replace />} />
            <Route path="/anomalies" element={<Navigate to="/insights" replace />} />
            <Route path="/what-changed" element={<Navigate to="/insights" replace />} />
            <Route path="/recurring" element={<Navigate to="/bills" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}