import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, AlertTriangle, Sparkles, Lightbulb, CheckCircle2, Bot } from "lucide-react";
import api from "../services/api";

export default function Insights() {
  const [predictions, setPredictions] = useState(null);
  const [unusualBills, setUnusualBills] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    try {
      setIsLoading(true);
      const [predRes, unusualRes, insightsRes] = await Promise.all([
        api.get("/predictions"),
        api.get("/analysis/unusual"),
        api.get("/ai/insights")
      ]);
      setPredictions(predRes.data);
      setUnusualBills(unusualRes.data);
      setAiInsights(insightsRes.data);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>Loading predictions and insights...</div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Predictions & Insights</h1>
          <p className="page-subtitle">Future spending forecasts, anomaly detection, and AI recommendations</p>
        </div>
        <Link to="/ask-ai" className="btn btn-teal btn-sm">
          <Bot size={16} /><span>Ask BillWiseAI</span>
        </Link>
      </div>

      {/* Prediction Forecast Card */}
      <div className="card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)", border: "1px solid #ccfbf1" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={20} color="var(--primary-teal)" />
            <h2 className="card-title">Next Month's Spending Forecast</h2>
          </div>
          <span className={`badge ${predictions?.sufficientData ? "badge-paid" : "badge-warning"}`}>
            Confidence: {predictions?.confidenceLevel}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "14px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Total</span>
            <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text-navy)" }}>
              ₹{predictions?.estimatedNextMonthTotal?.toFixed(2)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Estimated Range</span>
            <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "var(--text-navy)", marginTop: "4px" }}>
              ₹{predictions?.rangeMin?.toFixed(2)} – ₹{predictions?.rangeMax?.toFixed(2)}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Data Points</span>
            <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "var(--text-navy)", marginTop: "4px" }}>
              {predictions?.historicalBillCount} bills analyzed
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.8)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <strong>Note:</strong> {predictions?.explanation}
        </div>
      </div>

      {/* Anomaly Detection Section */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={20} color="#d97706" />
            <h2 className="card-title">Unusual Bill Spike Detection</h2>
          </div>
          <span className="badge badge-warning">{unusualBills.length} Bill(s) Flagged</span>
        </div>

        {unusualBills.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
            <CheckCircle2 size={32} color="#059669" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontWeight: "700", color: "var(--text-navy)" }}>No Abnormal Spikes Detected</div>
            <p style={{ fontSize: "0.85rem", marginTop: "2px" }}>All recorded bills match your standard category spending ranges.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {unusualBills.map((item, idx) => (
              <div key={idx} className="alert-banner alert-warning" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{item.bill?.category} ({item.bill?.provider}): ₹{item.currentAmount?.toFixed(2)} </strong>
                  <span className="badge badge-warning" style={{ background: "white", marginLeft: "6px" }}>+{item.percentageDifference}%</span>
                  <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>{item.explanation}</div>
                </div>
                <Link to={`/bills/${item.bill?.id}`} className="btn btn-outline btn-sm" style={{ background: "white" }}>Inspect</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Insights & Recommendations */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="var(--primary-blue)" />
              <h2 className="card-title">Personalized AI Insights</h2>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {aiInsights?.insights?.map((insight, idx) => (
              <div key={idx} style={{ padding: "12px", background: "#eff6ff", borderRadius: "8px", color: "#1e40af", fontSize: "0.88rem" }}>
                {insight}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Lightbulb size={18} color="var(--primary-teal)" />
              <h2 className="card-title">Cost-Saving Recommendations</h2>
            </div>
          </div>
          <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.88rem", color: "var(--text-navy)" }}>
            {aiInsights?.recommendations?.map((rec, idx) => <li key={idx}>{rec}</li>)}
            {aiInsights?.generalTips?.map((tip, idx) => <li key={`t-${idx}`} style={{ color: "var(--text-muted)" }}>{tip}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
