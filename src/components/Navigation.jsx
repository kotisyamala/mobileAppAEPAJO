import React from "react";
import { useApp } from "../context/AppContext";
import { Activity, Smartphone, MessageSquare, User } from "lucide-react";

const Navigation = () => {
  const { activeTab, setActiveTab, chatMessages } = useApp();

  // Get unread bot messages count (not read, but since it's mock, let's show a badge if the last message is from bot and activeTab is not support)
  const lastMessage = chatMessages[chatMessages.length - 1];
  const showChatBadge = lastMessage && lastMessage.sender === "bot" && activeTab !== "support";

  const tabs = [
    { id: "usage", label: "Usage", icon: Activity },
    { id: "plans", label: "Plans", icon: Smartphone },
    { id: "support", label: "Support", icon: MessageSquare, badge: showChatBadge ? "•" : null },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="bottom-navigation-bar">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`nav-tab-item ${isActive ? "active" : ""}`}
            aria-label={tab.label}
          >
            <div style={{ position: "relative" }}>
              <IconComponent
                size={22}
                className="nav-tab-icon"
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {tab.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    background: "var(--accent-color)",
                    color: "var(--accent-contrast)",
                    fontSize: "1.2rem",
                    lineHeight: "0.2",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 6px var(--accent-color)",
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="nav-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
