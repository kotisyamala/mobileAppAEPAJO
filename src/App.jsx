import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navigation from "./components/Navigation";
import UsageDashboard from "./components/UsageDashboard";
import PlansCatalog from "./components/PlansCatalog";
import ChatSupport from "./components/ChatSupport";
import ProfileSettings from "./components/ProfileSettings";
import AddonModal from "./components/AddonModal";
import Toast from "./components/Toast";
import { Sun, Moon, AlertTriangle } from "lucide-react";

// Nested InnerApp component to access Context
const InnerApp = () => {
  const { activeTab, theme, toggleTheme, showToast, ajoOffers, ajoError, assuranceSessionId, clearAssuranceSession } = useApp();
  const [isPromoOpen, setIsPromoOpen] = React.useState(false);

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
                  AJO Connection Error
                </span>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <AlertTriangle size={48} color="#FF1744" />
                </div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "8px" }}>
                  Decision Fetch Failed
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.5" }}>
                  {ajoError}
                </p>
                <button
                  onClick={() => setIsPromoOpen(false)}
                  className="btn-secondary"
                  style={{ padding: "12px", border: "1px solid var(--border-color)" }}
                >
                  Dismiss
                </button>
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
