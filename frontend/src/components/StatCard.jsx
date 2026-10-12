/**
 * StatCard component displays a summary metric with a title, amount, and icon.
 * Used across Dashboard and Analytics pages.
 */
export default function StatCard({ title, value, subtitle, icon: Icon, iconBg = "#eff6ff", iconColor = "#2563eb", trend }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtext">
        {trend && (
          <span className={trend.startsWith("▲") ? "stat-trend-up" : "stat-trend-down"}>
            {trend}{" "}
          </span>
        )}
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
