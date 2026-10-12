import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Sparkles,
  Calendar,
  Clock,
  Gauge
} from "lucide-react";
import api from "../services/api";
import CategoryBadge from "../components/CategoryBadge";
import StatusBadge from "../components/StatusBadge";
import BillEditModal from "../components/BillEditModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function BillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [billAnalysis, setBillAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchBillAndAnalysis();
  }, [id]);

  const fetchBillAndAnalysis = async () => {
    try {
      setIsLoading(true);
      const [billResponse, analysisResponse] = await Promise.all([
        api.get(`/bills/${id}`),
        api.get(`/analysis/compare/${id}`)
      ]);
      setBill(billResponse.data);
      setBillAnalysis(analysisResponse.data);
    } catch (error) {
      console.error("Failed to load bill details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = bill.status === "Paid" ? "Unpaid" : "Paid";
    try {
      const response = await api.patch(`/bills/${bill.id}/status`, { status: nextStatus });
      setBill(response.data);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleSaveEdit = async (updatedBill) => {
    try {
      setIsActionLoading(true);
      const response = await api.put(`/bills/${id}`, updatedBill);
      setBill(response.data);
      setShowEditModal(false);
      // Reload comparison
      const analysisRes = await api.get(`/analysis/compare/${id}`);
      setBillAnalysis(analysisRes.data);
    } catch (error) {
      alert("Failed to update bill");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsActionLoading(true);
      await api.delete(`/bills/${id}`);
      navigate("/bills");
    } catch (error) {
      alert("Failed to delete bill");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading bill details...</div>;
  }

  if (!bill) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Bill Not Found</h2>
        <Link to="/bills" className="btn btn-primary" style={{ marginTop: "12px" }}>Back to Bills</Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <Link to="/bills" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Bills</span>
        </Link>
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="button" onClick={() => setShowEditModal(true)} className="btn btn-outline btn-sm">
            <Edit size={14} /><span>Edit</span>
          </button>
          <button type="button" onClick={() => setShowDeleteModal(true)} className="btn btn-danger btn-sm">
            <Trash2 size={14} /><span>Delete</span>
          </button>
        </div>
      </div>

      {billAnalysis?.isUnusual && (
        <div className="alert-banner alert-warning">
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Unusual Bill Detected: </strong>
            This bill is {billAnalysis.percentageDifference}% higher than the previous bill for {bill.category}.
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Bill Overview */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <CategoryBadge category={bill.category} />
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-navy)", marginTop: "4px" }}>{bill.provider}</h2>
            </div>
            <StatusBadge status={bill.status} onToggle={handleToggleStatus} />
          </div>

          <div style={{ padding: "16px 0", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Bill Amount</span>
            <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text-navy)" }}>₹{bill.amount?.toFixed(2)}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.9rem" }}>
            <div>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}>
                <Calendar size={14} /> Bill Date
              </span>
              <strong>{bill.billDate}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}>
                <Clock size={14} /> Due Date
              </span>
              <strong>{bill.dueDate || "Not specified"}</strong>
            </div>
            {bill.consumption && (
              <div>
                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}>
                  <Gauge size={14} /> Consumption
                </span>
                <strong>{bill.consumption} {bill.consumptionUnit || ""}</strong>
              </div>
            )}
          </div>

          {bill.notes && (
            <div style={{ marginTop: "16px", padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "0.85rem" }}>
              <strong>Notes:</strong> {bill.notes}
            </div>
          )}
        </div>

        {/* AI Comparison Analysis */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="var(--primary-teal)" />
              <h2 className="card-title">Bill Comparison & Insights</h2>
            </div>
          </div>

          <div style={{ padding: "14px", background: "#f0fdfa", border: "1px solid #ccfbf1", borderRadius: "8px", color: "#0f766e", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "16px" }}>
            {billAnalysis?.trendExplanation}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Month-over-Month Change</span>
              <div style={{ fontSize: "1.3rem", fontWeight: "800", color: (billAnalysis?.amountDifference || 0) > 0 ? "#e11d48" : "#059669" }}>
                {(billAnalysis?.amountDifference || 0) > 0 ? `+₹${billAnalysis?.amountDifference?.toFixed(2)}` : (billAnalysis?.amountDifference || 0) < 0 ? `-₹${Math.abs(billAnalysis?.amountDifference)?.toFixed(2)}` : `₹0.00`}
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{billAnalysis?.percentageDifference || 0}% change</span>
            </div>

            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Category Average</span>
              <div style={{ fontSize: "1.3rem", fontWeight: "800" }}>₹{billAnalysis?.averageCategoryAmount?.toFixed(2)}</div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>All {bill.category} bills</span>
            </div>
          </div>
        </div>
      </div>

      <BillEditModal bill={showEditModal ? bill : null} isSaving={isActionLoading} onSave={handleSaveEdit} onClose={() => setShowEditModal(false)} />
      <DeleteConfirmModal bill={showDeleteModal ? bill : null} isDeleting={isActionLoading} onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} />
    </div>
  );
}
