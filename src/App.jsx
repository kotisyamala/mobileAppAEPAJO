import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navigation from "./components/Navigation";
import UsageDashboard from "./components/UsageDashboard";
import PlansCatalog from "./components/PlansCatalog";
import ChatSupport from "./components/ChatSupport";
import ProfileSettings from "./components/ProfileSettings";
import AddonModal from "./components/AddonModal";
import Toast from "./components/Toast";
import { Sun, Moon, AlertTriangle, RotateCw } from "lucide-react";

// Nested InnerApp component to access Context
const InnerApp = () => {
  const { 
    activeTab, 
    theme, 
    toggleTheme, 
    showToast, 
    ajoOffers, 
    ajoError, 
    isAjoLoading, 
    refetchOffers, 
    assuranceSessionId, 
    clearAssuranceSession 
  } = useApp();
  const [isPromoOpen, setIsPromoOpen] = React.useState(false);
  const [activeHelpTab, setActiveHelpTab] = React.useState("safari");

  React.useEffect(() => {
    // Show welcome promo popup 1.2 seconds after reload
    const timer = setTimeout(() => {
      setIsPromoOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const popupOffer = ajoOffers?.popupOffer;

  return (
    <div className="mobile-app-container">
      {/* Toast notifications */}
      <Toast />

      {/* Welcome Promo Modal */}
      {isPromoOpen && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 80,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.3s ease-out forwards",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "24px",
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 10px 30px var(--accent-glow)",
              maxWidth: "320px",
              animation: "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
            }}
          >
            {ajoError ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    backgroundColor: "rgba(255, 23, 68, 0.15)",
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    color: "#FF1744",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "16px",
                    border: "1px solid rgba(255, 23, 68, 0.25)",
                  }}
                >
                  {isAjoLoading ? "Refetching..." : "AJO Connection Blocked"}
                </span>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  {isAjoLoading ? (
                    <RotateCw size={48} color="var(--accent-color)" style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <AlertTriangle size={48} color="#FF1744" />
                  )}
                </div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "8px" }}>
                  {isAjoLoading ? "Retrying Connection..." : "Decision Fetch Failed"}
                </h3>
                <p style={{ fontSize: "0.76rem", color: "#FF8A80", backgroundColor: "rgba(255, 23, 68, 0.05)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255, 23, 68, 0.15)", marginBottom: "20px", fontFamily: "var(--font-mono)", wordBreak: "break-all", textAlign: "left", lineHeight: "1.4" }}>
                  {ajoError}
                </p>

                {/* Glassmorphic Tabs for Troubleshooting */}
                <div
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color-light)",
                    borderRadius: "14px",
                    padding: "12px",
                    marginBottom: "20px",
                    textAlign: "left"
                  }}
                >
                  <div style={{ display: "flex", gap: "6px", marginBottom: "10px", borderBottom: "1px solid var(--border-color-light)", paddingBottom: "8px" }}>
                    <button
                      onClick={() => setActiveHelpTab("safari")}
                      style={{
                        flex: 1,
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        padding: "6px 4px",
                        borderRadius: "8px",
                        backgroundColor: activeHelpTab === "safari" ? "var(--bg-secondary)" : "transparent",
                        color: activeHelpTab === "safari" ? "var(--accent-color)" : "var(--text-secondary)",
                        border: activeHelpTab === "safari" ? "1px solid var(--border-color)" : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Safari ITP Guide
                    </button>
                    <button
                      onClick={() => setActiveHelpTab("proxy")}
                      style={{
                        flex: 1,
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        padding: "6px 4px",
                        borderRadius: "8px",
                        backgroundColor: activeHelpTab === "proxy" ? "var(--bg-secondary)" : "transparent",
                        color: activeHelpTab === "proxy" ? "var(--accent-color)" : "var(--text-secondary)",
                        border: activeHelpTab === "proxy" ? "1px solid var(--border-color)" : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Local Proxy Guide
                    </button>
                  </div>

                  {activeHelpTab === "safari" ? (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      <span style={{ fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>⚠️ iOS Tracking Blockers</span>
                      Mobile Safari's Advanced Tracking Protection blocks requests to `edge.adobedc.net` by default.
                      <ol style={{ paddingLeft: "16px", margin: "6px 0 0 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <li>Open iOS <strong>Settings</strong> app</li>
                        <li>Navigate to <strong>Safari &gt; Advanced &gt; Advanced Tracking and Fingerprinting Protection</strong></li>
                        <li>Toggle setting to <strong>Off</strong> or <strong>Private Browsing Only</strong></li>
                      </ol>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      <span style={{ fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>🔌 LAN Wi-Fi Proxy Route</span>
                      Route Edge network requests through your Mac's CORS-enabled dev proxy.
                      <ol style={{ paddingLeft: "16px", margin: "6px 0 0 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <li>Ensure phone and Mac are on the same Wi-Fi</li>
                        <li>In the app's Profile settings tab, set the <strong>Edge Host / Gateway</strong> field to:
                          <code style={{ display: "block", margin: "4px 0", padding: "6px", backgroundColor: "var(--bg-secondary)", borderRadius: "6px", fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--accent-color)", wordBreak: "break-all" }}>
                            {(() => {
                              if (typeof window !== "undefined" && window.location) {
                                const hostname = window.location.hostname;
                                const isLocal = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(hostname);
                                if (isLocal) {
                                  return `http://${window.location.host}/api/ajo-edge`;
                                }
                              }
                              return "http://<your-mac-ip>:5173/api/ajo-edge";
                            })()}
                          </code>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={refetchOffers}
                    disabled={isAjoLoading}
                    className="btn-primary"
                    style={{ flex: 1, padding: "12px", fontSize: "0.8rem" }}
                  >
                    {isAjoLoading ? "Retrying..." : "Retry"}
                  </button>
                  <button
                    onClick={() => setIsPromoOpen(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: "12px", fontSize: "0.8rem", border: "1px solid var(--border-color)" }}
                  >
                    Dismiss
                  </button>
                </div>
              </>
            ) : !popupOffer ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    backgroundColor: "var(--bg-tertiary)",
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "16px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  AJO Personalization
                </span>
                <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "8px" }}>
                  No Eligible Offers
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>
                  The AJO Experience Decisioning engine returned no active decisions for this device's profile.
                </p>
                <button
                  onClick={() => setIsPromoOpen(false)}
                  className="btn-secondary"
                  style={{ padding: "12px" }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    backgroundColor: "var(--accent-glow)",
                    fontSize: "0.72rem",
                    fontWeight: "600",
                    color: "var(--accent-color)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "16px",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                  }}
                >
                  {popupOffer.badge}
                </span>
                <h3 style={{ fontSize: "1.3rem", color: "var(--text-primary)", marginBottom: "8px" }}>
                  {popupOffer.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.5" }}>
                  {popupOffer.description}
                </p>

                {popupOffer.code && (
                  <div
                    style={{
                      margin: "0 auto 20px",
                      padding: "8px 16px",
                      backgroundColor: "var(--bg-tertiary)",
                      border: "1px dashed var(--accent-color)",
                      borderRadius: "10px",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent-color)",
                      width: "fit-content",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      boxShadow: "0 0 10px var(--accent-glow)",
                    }}
                  >
                    {popupOffer.code}
                  </div>
                )}
                
                <button
                  onClick={() => {
                    if (popupOffer.code) {
                      navigator.clipboard.writeText(popupOffer.code);
                      showToast(`Promo ${popupOffer.code} copied to clipboard!`, "success");
                    } else {
                      showToast("Offer claimed!", "success");
                    }
                    setIsPromoOpen(false);
                  }}
                  className="btn-primary"
                  style={{ padding: "12px", marginBottom: "12px" }}
                >
                  Redeem Offer
                </button>
                <button
                  onClick={() => setIsPromoOpen(false)}
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    fontWeight: "600",
                  }}
                >
                  Maybe Later
                </button>
              </>
            )}

            {ajoOffers?.rawResponse && (
              <details
                style={{
                  marginTop: "18px",
                  textAlign: "left",
                  fontSize: "0.75rem",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "14px",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: "600", outline: "none", color: "var(--accent-color)" }}>
                  View Raw AJO Payload
                </summary>
                <pre
                  style={{
                    marginTop: "8px",
                    padding: "10px",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "10px",
                    overflow: "auto",
                    maxHeight: "150px",
                    fontSize: "0.68rem",
                    fontFamily: "var(--font-mono)",
                    border: "1px solid var(--border-color-light)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    color: "var(--text-secondary)"
                  }}
                >
                  {JSON.stringify(ajoOffers.rawResponse, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Sticky top header bar */}
      <header className="header-glass">
        <div className="brand-logo">
          <div className="logo-dot" />
          <span>Aether Connect</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {assuranceSessionId && (
            <div 
              className="assurance-badge"
              onClick={clearAssuranceSession}
              title="Click to disconnect from Assurance session"
            >
              <span className="assurance-dot" />
              <span>Assurance Active</span>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="header-action-btn"
            aria-label="Toggle interface theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Scrollable Viewport */}
      <main className="app-screen-content">
        {activeTab === "usage" && <UsageDashboard />}
        {activeTab === "plans" && <PlansCatalog />}
        {activeTab === "support" && <ChatSupport />}
        {activeTab === "profile" && <ProfileSettings />}
      </main>

      {/* Floating Speed Booster Drawer */}
      <AddonModal />

      {/* Persistent Bottom navigation tab bar */}
      <Navigation />
    </div>
  );
};

// Main App wrapper providing the central AppProvider
function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}

export default App;
