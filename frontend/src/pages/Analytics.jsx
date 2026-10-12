import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, ArrowUpRight, ArrowDownRight, Award } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard";

const CATEGORY_COLORS = {
  Electricity: "#2563eb",
  Water: "#0ea5e9",
  Gas: "#f97316",
  Internet: "#8b5cf6",
  Mobile: "#0d9488"
};

export default function Analytics() {
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [billList, setBillList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const [trendsRes, catRes, billsRes] = await Promise.all([
        api.get("/analytics/trends"),
        api.get("/analytics/categories"),
        api.get("/bills")
      ]);
      setSpendingTrends(trendsRes.data);
      setCategoryBreakdown(catRes.data);
      setBillList(billsRes.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading analytics...</div>;
  }

  if (billList.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">No spending data yet</h2>
        <p className="empty-state-desc">Upload bills to generate interactive spending graphs and category comparisons.</p>
        <Link to="/upload-bill" className="btn btn-teal" style={{ marginTop: "12px" }}>Upload First Bill</Link>
      </div>
    );
  }

  const sortedBills = [...billList].sort((a, b) => b.amount - a.amount);
  const highestBill = sortedBills[0];
  const lowestBill = sortedBills[sortedBills.length - 1];
  const totalAllTime = billList.reduce((sum, b) => sum + (b.amount || 0), 0);
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Spending Analytics</h1>
          <p className="page-subtitle">Monthly trends, category distribution, and historical expense comparisons</p>
        </div>
      </div>

      {/* Summary Highlight Metrics */}
      <div className="stat-grid" style={{ marginBottom: "24px" }}>
        <StatCard title="Total Spent (All-Time)" value={`₹${totalAllTime.toFixed(2)}`} subtitle={`Across ${billList.length} recorded bills`} icon={Wallet} />
        <StatCard title="Highest Bill Ever" value={`₹${highestBill?.amount?.toFixed(2)}`} subtitle={`${highestBill?.provider} (${highestBill?.category})`} icon={ArrowUpRight} iconBg="#fef2f2" iconColor="#ef4444" />
        <StatCard title="Lowest Bill Ever" value={`₹${lowestBill?.amount?.toFixed(2)}`} subtitle={`${lowestBill?.provider} (${lowestBill?.category})`} icon={ArrowDownRight} iconBg="#ecfdf5" iconColor="#10b981" />
        <StatCard title="Top Expense Category" value={topCategory?.category || "N/A"} subtitle={`₹${topCategory?.totalAmount?.toFixed(2)} (${topCategory?.percentage}%)`} icon={Award} iconBg="#f0fdfa" iconColor="#0d9488" />
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: "24px" }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Total Spending</h2>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Trend over time</span>
          </div>
          <div style={{ height: "260px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(val) => [`₹${Number(val).toFixed(2)}`, "Total Spend"]} />
                <Area type="monotone" dataKey="totalAmount" stroke="#0d9488" fill="#f0fdfa" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Utility Expense Distribution</h2>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Category share</span>
          </div>
          <div style={{ height: "260px", width: "100%" }}>
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

      {/* Category Deep-Dive Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Category Breakdown & Averages</h2>
        </div>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Spent</th>
                <th>Percentage</th>
                <th>Bill Count</th>
                <th>Average Bill</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map((item) => (
                <tr key={item.category}>
                  <td style={{ fontWeight: "700" }}>{item.category}</td>
                  <td style={{ fontWeight: "800" }}>₹{item.totalAmount?.toFixed(2)}</td>
                  <td>{item.percentage}%</td>
                  <td>{item.count} bill(s)</td>
                  <td style={{ fontWeight: "600" }}>₹{item.avgAmount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
