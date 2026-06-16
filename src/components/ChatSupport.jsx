import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Send, Cpu } from "lucide-react";

const ChatSupport = () => {
  const { chatMessages, sendChatMessage } = useApp();
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText);
    setInputText("");
    
    // Simulate bot typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 700);
  };

  const handleQuickQuestion = (questionText) => {
    sendChatMessage(questionText);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 700);
  };

  const quickQuestions = [
    { label: "Activate eSIM", query: "How do I activate eSIM?" },
    { label: "Check 5G Coverage", query: "Tell me about network coverage." },
    { label: "Invoice / Bills", query: "Where can I view my billing invoice?" },
    { label: "Slow Speeds", query: "Why is my speed slow?" }
  ];

  return (
    <div className="chat-container fade-in">
      {/* Messages area */}
      <div className="chat-messages-scroll">
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            <span style={{ fontSize: "0.92rem", wordBreak: "break-word" }}>{msg.text}</span>
            <span className="chat-timestamp">{msg.timestamp}</span>
          </div>
        ))}

        {/* Typing bubble */}
        {isTyping && (
          <div className="chat-bubble bot" style={{ display: "flex", gap: "5px", alignItems: "center", padding: "12px 16px" }}>
            <span style={{ width: "6px", height: "6px", backgroundColor: "var(--text-muted)", borderRadius: "50%", animation: "typing 1.4s infinite both" }} />
            <span style={{ width: "6px", height: "6px", backgroundColor: "var(--text-muted)", borderRadius: "50%", animation: "typing 1.4s infinite both 0.2s" }} />
            <span style={{ width: "6px", height: "6px", backgroundColor: "var(--text-muted)", borderRadius: "50%", animation: "typing 1.4s infinite both 0.4s" }} />
            {/* Custom keyframes injected via inline CSS or style resets */}
            <style>{`
              @keyframes typing {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                40% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick FAQs */}
      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
        }}
      >
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickQuestion(q.query)}
            disabled={isTyping}
            style={{
              padding: "8px 14px",
              borderRadius: "100px",
              fontSize: "0.78rem",
              fontWeight: "600",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              color: "var(--accent-color)",
              flexShrink: 0,
              transition: "var(--transition-smooth)",
            }}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Message input footer */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          placeholder={isTyping ? "Assistant is thinking..." : "Type message here..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "12px",
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            fontSize: "0.9rem",
            outline: "none",
            fontFamily: "var(--font-sans)",
          }}
        />
        <button
          type="submit"
          disabled={isTyping || !inputText.trim()}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: "var(--accent-color)",
            color: "var(--accent-contrast)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 8px var(--accent-glow)",
            transition: "var(--transition-smooth)",
            opacity: !inputText.trim() ? 0.6 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatSupport;
