import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Wallet, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  UploadCloud, 
  Sparkles, 
  Bot, 
  Clock
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";

const CATEGORY_COLORS = {
  Electricity: "#2563eb",
  Water: "#0ea5e9",
  Gas: "#f97316",
  Internet: "#8b5cf6",
  Mobile: "#0d9488"
};

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [unusualBills, setUnusualBills] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, billsRes, trendsRes, catRes, unusualRes, insightsRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/bills"),
        api.get("/analytics/trends"),
        api.get("/analytics/categories"),
        api.get("/analysis/unusual"),
        api.get("/ai/insights")
      ]);

      setDashboardStats(statsRes.data);
      setRecentBills(billsRes.data.slice(0, 5));
      setSpendingTrends(trendsRes.data);
      setCategoryBreakdown(catRes.data);
      setUnusualBills(unusualRes.data);
      setAiInsights(insightsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
        Loading dashboard metrics...
      </div>
    );
  }

  // Empty state if new user has no bills
  if (!dashboardStats || dashboardStats.totalBillsCount === 0) {
    return (
      <div className="empty-state" style={{ maxWidth: "560px", margin: "40px auto" }}>
        <div className="empty-state-icon"><UploadCloud size={32} /></div>
        <h2 className="empty-state-title">Welcome to BillWiseAI!</h2>
        <p className="empty-state-desc">
          You don't have any utility bills recorded yet. Upload a statement or enter a bill to view statistics and charts.
        </p>
        <Link to="/upload-bill" className="btn btn-teal">
          <UploadCloud size={16} />
          <span>Upload First Bill</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Track, analyze, and optimize your recurring utility expenses</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/upload-bill" className="btn btn-teal btn-sm">
            <UploadCloud size={16} />
            <span>Upload Bill</span>
          </Link>
          <Link to="/ask-ai" className="btn btn-outline btn-sm">
            <Bot size={16} color="var(--primary-blue)" />
            <span>Ask AI</span>
          </Link>
        </div>
      </div>

      {/* Unusual Bill Alert Banner */}
      {unusualBills.length > 0 && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>Unusual Bill Spike Detected: </strong>
            {unusualBills[0].explanation}
          </div>
          <Link to="/insights" className="btn btn-outline btn-sm" style={{ background: "white" }}>
            View Details
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard
          title="This Month's Spending"
          value={`₹${dashboardStats.totalSpendingThisMonth.toFixed(2)}`}
          subtitle="vs previous month"
          trend={dashboardStats.monthOverMonthChangePct >= 0 ? `▲ ${dashboardStats.monthOverMonthChangePct}%` : `▼ ${Math.abs(dashboardStats.monthOverMonthChangePct)}%`}
          icon={Wallet}
        />
        <StatCard
          title="Previous Month"
          value={`₹${dashboardStats.prevMonthSpending.toFixed(2)}`}
          subtitle={`Average: ₹${dashboardStats.avgMonthlyBill.toFixed(2)}`}
          icon={Calendar}
          iconBg="#f1f5f9"
          iconColor="#475569"
        />
        <StatCard
          title="Outstanding Bills"
          value={`₹${dashboardStats.outstandingBillsAmount.toFixed(2)}`}
          subtitle={`${dashboardStats.outstandingBillsCount} unpaid bill(s)`}
          icon={Clock}
          iconBg="#fff1f2"
          iconColor="#e11d48"
        />
        <StatCard
          title="Estimated Next Month"
          value={`₹${dashboardStats.estimatedNextMonthSpending.toFixed(2)}`}
          subtitle="Statistical forecast"
          icon={TrendingUp}
          iconBg="#ecfdf5"
          iconColor="#059669"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: "24px" }}>
        {/* Trend Area Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Spending Trend</h2>
            <Link to="/analytics" style={{ fontSize: "0.85rem", color: "var(--primary-blue)", textDecoration: "none" }}>Details →</Link>
          </div>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Spending"]} />
                <Area type="monotone" dataKey="totalAmount" stroke="#2563eb" fill="#eff6ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Donut Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Spending by Category</h2>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>All-time distribution</span>
          </div>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="totalAmount" nameKey="category">
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`₹${Number(val).toFixed(2)}`, "Amount"]} />
                <Legend verticalAlign="bottom" height={30} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights and Recent Bills Row */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="var(--primary-teal)" />
              <h2 className="card-title">AI Insights & Saving Tips</h2>
            </div>
            <Link to="/insights" style={{ fontSize: "0.85rem", color: "var(--primary-teal)", textDecoration: "none" }}>All →</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {aiInsights?.insights?.slice(0, 2).map((text, idx) => (
              <div key={idx} style={{ padding: "10px 12px", background: "#f0fdfa", borderRadius: "8px", fontSize: "0.88rem", color: "#0f766e" }}>
                {text}
              </div>
            ))}
            <div style={{ fontSize: "0.85rem", fontWeight: "600", marginTop: "4px" }}>Recommended Saving Actions:</div>
            <ul style={{ paddingLeft: "18px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {aiInsights?.recommendations?.slice(0, 2).map((rec, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Bills</h2>
            <Link to="/bills" style={{ fontSize: "0.85rem", color: "var(--primary-blue)", textDecoration: "none" }}>View All →</Link>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Utility</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <CategoryBadge category={bill.category} />
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{bill.provider}</div>
                    </td>
                    <td style={{ fontWeight: "700" }}>₹{bill.amount?.toFixed(2)}</td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{bill.billDate}</td>
                    <td><StatusBadge status={bill.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}