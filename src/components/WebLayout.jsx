import React from "react";
import { useApp } from "../context/AppContext";
import UsageDashboard from "./UsageDashboard";
import PlansCatalog from "./PlansCatalog";
import ChatSupport from "./ChatSupport";
import ProfileSettings from "./ProfileSettings";
import GeneralSettings from "./GeneralSettings";
import CartPage from "./CartPage";
import AddonModal from "./AddonModal";
import Toast from "./Toast";
import { Activity, Smartphone, MessageSquare, User, ShoppingCart, Bell, Sun, Moon, Trash2, Monitor, Smartphone as PhoneIcon } from "lucide-react";

// Adobe "A" triangle logo
const AdobeLogo = ({ size = 20, isActive }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
    <path
      d="M9.5 3H3v18l6.5-18zM14.5 3H21v18l-6.5-18zM12 8.5L16 21h-3l-1.2-3.4H8.5L12 8.5z"
      fill={isActive ? "var(--accent-color)" : "currentColor"}
    />
  </svg>
);

const WebLayout = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    toggleTheme,
    toggleViewMode,
    cart,
    notificationLogs,
    clearNotificationLogs,
    assuranceSessionId,
    clearAssuranceSession,
    chatMessages,
    activeProfile,
    showToast
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  const lastMessage = chatMessages[chatMessages.length - 1];
  const showChatBadge = lastMessage && lastMessage.sender === "bot" && activeTab !== "support";

  const navItems = [
    { id: "usage", label: "Dashboard", icon: Activity },
    { id: "plans", label: "Plans & Shop", icon: Smartphone },
    { id: "support", label: "Support Chat", icon: MessageSquare, badge: showChatBadge },
    { id: "general", label: "Adobe AEP/AJO", icon: "adobe" },
    { id: "cart", label: "Shopping Cart", icon: ShoppingCart, count: cart?.reduce((s, i) => s + i.quantity, 0) || 0 },
    { id: "profile", label: "My Account", icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "usage": return <UsageDashboard />;
      case "plans": return <PlansCatalog />;
      case "support": return <ChatSupport />;
      case "general": return <GeneralSettings />;
      case "cart": return <CartPage />;
      case "profile": return <ProfileSettings />;
      default: return <UsageDashboard />;
    }
  };

  return (
    <div className="web-layout">
      <Toast />

      {/* ─── Top Navigation Bar ─── */}
      <header className="web-topbar">
        <div className="web-topbar-left">
          <div className="web-brand" onClick={() => setActiveTab("usage")}>
            <div className="logo-dot" />
            <span>Aether Connect</span>
          </div>
          <span className="web-brand-subtitle">Telecom Management Portal</span>
        </div>

        <div className="web-topbar-right">
          {assuranceSessionId && (
            <div
              className="web-assurance-badge"
              onClick={clearAssuranceSession}
              title="Click to disconnect"
            >
              <span className="assurance-dot" />
              <span>Assurance Active</span>
            </div>
          )}

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="web-topbar-btn"
              style={{ color: isNotifOpen ? "var(--accent-color)" : undefined }}
            >
              <Bell size={18} />
              {notificationLogs?.length > 0 && (
                <span className="web-badge-dot" />
              )}
            </button>
            {isNotifOpen && (
              <>
                <div className="web-dropdown-backdrop" onClick={() => setIsNotifOpen(false)} />
                <div className="web-notif-dropdown">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-color-light)", paddingBottom: "8px" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700" }}>Notifications</span>
                    {notificationLogs?.length > 0 && (
                      <button onClick={clearNotificationLogs} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "0.68rem", color: "#FF1744", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Trash2 size={12} /> Clear
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                    {!notificationLogs?.length ? (
                      <div style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.78rem" }}>
                        <Bell size={20} color="var(--text-muted)" style={{ marginBottom: "6px", display: "inline-block", opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No notifications yet.</p>
                      </div>
                    ) : (
                      notificationLogs.map(log => (
                        <div key={log.id} style={{ backgroundColor: "var(--bg-tertiary)", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border-color-light)", fontSize: "0.76rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                            <span style={{ fontWeight: "700", color: "var(--accent-color)" }}>{log.title}</span>
                            <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{log.timestamp}</span>
                          </div>
                          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.3" }}>{log.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="web-topbar-btn" title="Toggle theme">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Switch to PWA view */}
          <button
            onClick={toggleViewMode}
            className="web-topbar-btn web-view-toggle"
            title="Switch to Mobile PWA view"
          >
            <PhoneIcon size={16} />
            <span>PWA</span>
          </button>

          {/* User avatar */}
          <div className="web-avatar" onClick={() => setActiveTab("profile")}>
            {activeProfile.firstName?.[0]}{activeProfile.lastName?.[0]}
          </div>
        </div>
      </header>

      <div className="web-body">
        {/* ─── Sidebar Navigation ─── */}
        <aside className="web-sidebar">
          <nav className="web-sidebar-nav">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`web-sidebar-item ${isActive ? "active" : ""}`}
                >
                  <div className="web-sidebar-icon">
                    {item.icon === "adobe" ? (
                      <AdobeLogo size={20} isActive={isActive} />
                    ) : (() => {
                      const IconComp = item.icon;
                      return <IconComp size={20} />;
                    })()}
                  </div>
                  <span className="web-sidebar-label">{item.label}</span>
                  {item.badge && (
                    <span className="web-sidebar-badge-dot" />
                  )}
                  {item.count > 0 && (
                    <span className="web-sidebar-count">{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="web-sidebar-footer">
            <div className="web-sidebar-user">
              <div className="web-sidebar-user-avatar">
                {activeProfile.firstName?.[0]}{activeProfile.lastName?.[0]}
              </div>
              <div>
                <span className="web-sidebar-user-name">{activeProfile.firstName} {activeProfile.lastName}</span>
                <span className="web-sidebar-user-email">{activeProfile.email}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <main className="web-content">
          <div className="web-content-inner">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Floating Speed Booster Drawer (shared with PWA) */}
      <AddonModal />
    </div>
  );
};

export default WebLayout;
