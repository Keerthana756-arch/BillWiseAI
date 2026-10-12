import { Zap, Droplets, Flame, Wifi, Smartphone, Receipt } from "lucide-react";

/**
 * CategoryBadge displays a utility category with its corresponding icon.
 */
export default function CategoryBadge({ category }) {
  const getIcon = () => {
    switch (category?.toLowerCase()) {
      case "electricity":
        return <Zap size={15} color="#2563eb" />;
      case "water":
        return <Droplets size={15} color="#0ea5e9" />;
      case "gas":
        return <Flame size={15} color="#f97316" />;
      case "internet":
        return <Wifi size={15} color="#8b5cf6" />;
      case "mobile":
        return <Smartphone size={15} color="#0d9488" />;
      default:
        return <Receipt size={15} />;
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      {getIcon()}
      <span>{category}</span>
    </div>
  );
}
