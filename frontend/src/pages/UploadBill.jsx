import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  ArrowRight 
} from "lucide-react";
import api from "../services/api";

export default function UploadBill() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "manual" ? "manual" : "upload");

  const [selectedFile, setSelectedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMessage, setExtractionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // Form fields
  const [formData, setFormData] = useState({
    category: "Electricity",
    provider: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    amount: "",
    consumption: "",
    consumptionUnit: "kWh",
    status: "Unpaid",
    notes: "",
    fileName: "",
    extractedText: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Keep default unit synced with category
  useEffect(() => {
    const units = { Electricity: "kWh", Water: "Gallons", Gas: "Therms", Internet: "GB", Mobile: "GB" };
    setFormData((prev) => ({ ...prev, consumptionUnit: units[prev.category] || "" }));
  }, [formData.category]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setErrorMessage("");
    setExtractionMessage("");
    setIsExtracting(true);

    try {
      const uploadPayload = new FormData();
      uploadPayload.append("file", file);

      const response = await api.post("/bills/extract", uploadPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const extracted = response.data;
      setFormData((prev) => ({
        ...prev,
        category: extracted.category || prev.category,
        provider: extracted.provider || prev.provider,
        billDate: extracted.billDate || prev.billDate,
        dueDate: extracted.dueDate || prev.dueDate,
        amount: extracted.amount != null ? extracted.amount : prev.amount,
        consumption: extracted.consumption != null ? extracted.consumption : prev.consumption,
        consumptionUnit: extracted.consumptionUnit || prev.consumptionUnit,
        fileName: extracted.fileName || "",
        extractedText: extracted.extractedText || ""
      }));

      setExtractionMessage(extracted.confidenceNotes || "Document successfully parsed! Please review the details below.");
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Text extraction failed. You can enter details manually below.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid bill amount.");
      return;
    }
    if (!formData.provider.trim()) {
      alert("Please enter a provider name.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        consumption: formData.consumption ? parseFloat(formData.consumption) : null
      };

      const response = await api.post("/bills", payload);
      navigate(`/bills/${response.data.id}`);
    } catch (error) {
      alert("Failed to save bill: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Utility Bill</h1>
          <p className="page-subtitle">Upload a statement for automated OCR parsing or enter details manually</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button type="button" onClick={() => setActiveTab("upload")} className={`btn btn-sm ${activeTab === "upload" ? "btn-teal" : "btn-outline"}`}>
          <UploadCloud size={16} /><span>Upload Document (PDF / Image)</span>
        </button>
        <button type="button" onClick={() => setActiveTab("manual")} className={`btn btn-sm ${activeTab === "manual" ? "btn-primary" : "btn-outline"}`}>
          <Plus size={16} /><span>Manual Entry</span>
        </button>
      </div>

      <div className="grid-2">
        {/* Upload dropzone (when in upload tab) */}
        {activeTab === "upload" && (
          <div className="card" style={{ height: "fit-content" }}>
            <div className="card-header">
              <h2 className="card-title">Document Extraction</h2>
              <span className="badge badge-info">PDF, JPG, PNG</span>
            </div>

            <div
              className="upload-dropzone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
              <UploadCloud size={32} color="var(--primary-teal)" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontWeight: "700", color: "var(--text-navy)" }}>
                {isExtracting ? "Extracting bill information..." : selectedFile ? selectedFile.name : "Click or drag your bill statement here"}
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Extracts provider, amount, billing date, and consumption units
              </p>
            </div>

            {isExtracting && (
              <div className="alert-banner alert-info" style={{ marginTop: "16px" }}>
                <Sparkles size={16} /><span>Analyzing document with PDFBox text extractor...</span>
              </div>
            )}

            {extractionMessage && (
              <div className="alert-banner alert-success" style={{ marginTop: "16px" }}>
                <CheckCircle2 size={16} /><span>{extractionMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="alert-banner alert-danger" style={{ marginTop: "16px" }}>
                <AlertCircle size={16} /><span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Bill Form */}
        <div className="card" style={{ gridColumn: activeTab === "manual" ? "span 2" : undefined }}>
          <div className="card-header">
            <h2 className="card-title">{activeTab === "upload" ? "Review & Confirm Details" : "Manual Bill Details"}</h2>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Verify before saving</span>
          </div>

          <form onSubmit={handleSaveBill}>
            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={formData.category} onChange={(e) => handleFieldChange("category", e.target.value)} required>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                  <option value="Internet">Internet</option>
                  <option value="Mobile">Mobile</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Provider Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Duke Energy, PG&E, Comcast"
                  value={formData.provider}
                  onChange={(e) => handleFieldChange("provider", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Total Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleFieldChange("amount", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select className="form-select" value={formData.status} onChange={(e) => handleFieldChange("status", e.target.value)}>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Bill Date *</label>
                <input type="date" className="form-control" value={formData.billDate} onChange={(e) => handleFieldChange("billDate", e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={formData.dueDate} onChange={(e) => handleFieldChange("dueDate", e.target.value)} />
              </div>
            </div>

            <div className="grid-2" style={{ gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Consumption (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="Units used"
                  value={formData.consumption}
                  onChange={(e) => handleFieldChange("consumption", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <input type="text" className="form-control" value={formData.consumptionUnit} onChange={(e) => handleFieldChange("consumptionUnit", e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-control" rows="2" value={formData.notes} onChange={(e) => handleFieldChange("notes", e.target.value)} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button type="button" onClick={() => navigate("/bills")} className="btn btn-outline btn-sm">Cancel</button>
              <button type="submit" className="btn btn-teal" disabled={isSaving}>
                <span>{isSaving ? "Saving..." : "Save Bill to Database"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
