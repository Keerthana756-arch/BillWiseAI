import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Receipt, 
  Search, 
  Plus, 
  UploadCloud, 
  Trash2, 
  Edit, 
  Eye 
} from "lucide-react";
import api from "../services/api";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";
import BillEditModal from "../components/BillEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function Bills() {
  const [billList, setBillList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  // Modal states
  const [billToEdit, setBillToEdit] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, [categoryFilter, statusFilter, searchQuery]);

  const fetchBills = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (categoryFilter !== "All") params.category = categoryFilter;
      if (statusFilter !== "All") params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await api.get("/bills", { params });
      setBillList(response.data);
    } catch (error) {
      console.error("Failed to load bills:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePaymentStatus = async (bill) => {
    const nextStatus = bill.status === "Paid" ? "Unpaid" : "Paid";
    try {
      const response = await api.patch(`/bills/${bill.id}/status`, { status: nextStatus });
      setBillList((prev) => prev.map((b) => (b.id === bill.id ? response.data : b)));
    } catch (error) {
      alert("Failed to toggle status");
    }
  };

  const handleSaveBillEdit = async (updatedBill) => {
    try {
      setIsActionLoading(true);
      const response = await api.put(`/bills/${updatedBill.id}`, updatedBill);
      setBillList((prev) => prev.map((b) => (b.id === updatedBill.id ? response.data : b)));
      setBillToEdit(null);
    } catch (error) {
      alert("Failed to save changes");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteBill = async () => {
    if (!billToDelete) return;
    try {
      setIsActionLoading(true);
      await api.delete(`/bills/${billToDelete.id}`);
      setBillList((prev) => prev.filter((b) => b.id !== billToDelete.id));
      setBillToDelete(null);
    } catch (error) {
      alert("Failed to delete bill");
    } finally {
      setIsActionLoading(false);
    }
  };

  const sortedBills = [...billList].sort((a, b) => {
    if (sortBy === "date-desc") return (b.billDate || "").localeCompare(a.billDate || "");
    if (sortBy === "date-asc") return (a.billDate || "").localeCompare(b.billDate || "");
    if (sortBy === "amount-desc") return (b.amount || 0) - (a.amount || 0);
    if (sortBy === "amount-asc") return (a.amount || 0) - (b.amount || 0);
    return 0;
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Utility Bills</h1>
          <p className="page-subtitle">View, search, edit, and track all your utility bills</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to="/upload-bill" className="btn btn-teal btn-sm">
            <UploadCloud size={16} />
            <span>Upload Document</span>
          </Link>
          <Link to="/upload-bill?tab=manual" className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Manually</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search provider, category, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
            <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }} />
          </div>

          <select className="form-select" style={{ width: "auto" }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Electricity">Electricity</option>
            <option value="Water">Water</option>
            <option value="Gas">Gas</option>
            <option value="Internet">Internet</option>
            <option value="Mobile">Mobile</option>
          </select>

          <select className="form-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <select className="form-select" style={{ width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading bills...</div>
      ) : sortedBills.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Receipt size={32} /></div>
          <h2 className="empty-state-title">No bills found</h2>
          <p className="empty-state-desc">Try resetting your search or category filter, or upload your first statement.</p>
          <Link to="/upload-bill" className="btn btn-teal"><UploadCloud size={16} /><span>Upload Bill</span></Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Utility & Provider</th>
                  <th>Amount</th>
                  <th>Bill Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <CategoryBadge category={bill.category} />
                      <div style={{ fontWeight: "700", marginTop: "2px" }}>{bill.provider}</div>
                    </td>
                    <td style={{ fontWeight: "800", fontSize: "1rem" }}>₹{bill.amount?.toFixed(2)}</td>
                    <td style={{ color: "var(--text-muted)" }}>{bill.billDate}</td>
                    <td style={{ color: "var(--text-muted)" }}>{bill.dueDate || "—"}</td>
                    <td>
                      <StatusBadge status={bill.status} onToggle={() => handleTogglePaymentStatus(bill)} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Link to={`/bills/${bill.id}`} className="btn btn-outline btn-sm" title="View Details" style={{ padding: "6px 8px" }}>
                          <Eye size={14} />
                        </Link>
                        <button type="button" onClick={() => setBillToEdit(bill)} className="btn btn-outline btn-sm" title="Edit Bill" style={{ padding: "6px 8px" }}>
                          <Edit size={14} />
                        </button>
                        <button type="button" onClick={() => setBillToDelete(bill)} className="btn btn-danger btn-sm" title="Delete Bill" style={{ padding: "6px 8px" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reusable Modals */}
      <BillEditModal bill={billToEdit} isSaving={isActionLoading} onSave={handleSaveBillEdit} onClose={() => setBillToEdit(null)} />
      <DeleteConfirmModal bill={billToDelete} isDeleting={isActionLoading} onConfirm={handleDeleteBill} onCancel={() => setBillToDelete(null)} />
    </div>
  );
}
