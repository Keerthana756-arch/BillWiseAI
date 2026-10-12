import { useState } from "react";
import { X } from "lucide-react";

/**
 * BillEditModal provides an editable form to update an existing bill.
 */
export default function BillEditModal({ bill, isSaving, onSave, onClose }) {
  const [formData, setFormData] = useState({ ...bill });

  if (!bill) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Edit Bill Details</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  required
                >
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                  <option value="Internet">Internet</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Provider</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.provider}
                  onChange={(e) => handleChange("provider", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Bill Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.billDate}
                  onChange={(e) => handleChange("billDate", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dueDate || ""}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
