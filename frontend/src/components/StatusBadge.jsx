import { CheckCircle2, XCircle } from "lucide-react";

/**
 * StatusBadge displays whether a bill is Paid or Unpaid.
 * Can be clicked to toggle status when onToggle is provided.
 */
export default function StatusBadge({ status, onToggle }) {
  const isPaid = status === "Paid";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`badge ${isPaid ? "badge-paid" : "badge-unpaid"}`}
      style={{
        border: "none",
        cursor: onToggle ? "pointer" : "default",
        padding: "4px 10px",
      }}
      title={onToggle ? "Click to toggle payment status" : undefined}
    >
      {isPaid ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      <span>{status}</span>
    </button>
  );
}
