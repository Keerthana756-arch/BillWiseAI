import { useState } from "react";
import { Bot, Send, User, Sparkles } from "lucide-react";
import api from "../services/api";

export default function AskAI() {
  const [inputMessage, setInputMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your BillWiseAI assistant. Ask me questions about your utility bills, cost spikes, or ways to save money."
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  const sampleQuestions = [
    "Which utility costs me the most?",
    "How much did I spend this month?",
    "Why did my electricity bill increase?",
    "How can I reduce my utility expenses?",
    "Compare my last three bills"
  ];

  const handleSendMessage = async (textToSend) => {
    const question = (textToSend || inputMessage).trim();
    if (!question || isSending) return;

    // Append user message immediately
    const updatedMessages = [...chatMessages, { role: "user", text: question }];
    setChatMessages(updatedMessages);
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await api.post("/ai/chat", { message: question });
      setChatMessages([...updatedMessages, { role: "assistant", text: response.data.reply }]);
    } catch (error) {
      setChatMessages([
        ...updatedMessages,
        {
          role: "assistant",
          text: "I couldn't reach the AI service right now. Please ensure the backend is running and try again."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ask BillWiseAI</h1>
          <p className="page-subtitle">Chat with AI to analyze spending trends and discover bill-saving opportunities</p>
        </div>
      </div>

      <div className="chat-window">
        {/* Messages Stream */}
        <div className="chat-messages-area">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "0.78rem", opacity: 0.8 }}>
                {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
                <span>{msg.role === "user" ? "You" : "BillWiseAI Assistant"}</span>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
            </div>
          ))}

          {isSending && (
            <div className="chat-bubble chat-bubble-ai">
              <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                BillWiseAI is analyzing your bills...
              </span>
            </div>
          )}
        </div>

        {/* Suggested Question Chips */}
        <div className="chat-chips-row">
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center", whiteSpace: "nowrap" }}>
            Suggested:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="chat-chip"
              onClick={() => handleSendMessage(q)}
              disabled={isSending}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input-row">
          <input
            type="text"
            className="form-control"
            placeholder="Ask a question about your bills..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
          />
          <button type="submit" className="btn btn-teal" disabled={isSending || !inputMessage.trim()}>
            <Send size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}