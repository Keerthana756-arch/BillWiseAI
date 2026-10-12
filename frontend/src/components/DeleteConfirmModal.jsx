import { X } from "lucide-react";

/**
 * Simple confirmation dialog when deleting a bill.
 */
export default function DeleteConfirmModal({ bill, isDeleting, onConfirm, onCancel }) {
  if (!bill) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Confirm Delete</h3>
          <button type="button" onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Are you sure you want to delete the <strong>{bill.category}</strong> bill from <strong>{bill.provider}</strong> for <strong>₹{bill.amount?.toFixed(2)}</strong>?
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-danger btn-sm" disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}
