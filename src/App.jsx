import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navigation from "./components/Navigation";
import UsageDashboard from "./components/UsageDashboard";
import PlansCatalog from "./components/PlansCatalog";
import ChatSupport from "./components/ChatSupport";
import ProfileSettings from "./components/ProfileSettings";
import GeneralSettings from "./components/GeneralSettings";
import CartPage from "./components/CartPage";
import AddonModal from "./components/AddonModal";
import Toast from "./components/Toast";
import WebLayout from "./components/WebLayout";
import { Sun, Moon, AlertTriangle, RotateCw, Terminal, Bell, Trash2, Play, X, ShoppingCart, Monitor } from "lucide-react";
import { AjoService } from "./services/AjoService";

// Nested InnerApp component to access Context

const InnerApp = () => {
  const { 
    activeTab, 
    setActiveTab,
    theme, 
    toggleTheme, 
    showToast, 
    ajoOffers, 
    ajoError, 
    isAjoLoading, 
    refetchOffers, 
    assuranceSessionId, 
    clearAssuranceSession,
    xdmEventLogs,
    clearXdmEventLogs,
    notificationLogs,
    addNotificationLog,
    clearNotificationLogs,
    activeProfile,
    ajoCredentials,
    cart,
    ajoSimulationSettings,
    activeBanner,
    setActiveBanner,
    triggerNotification,
    alloyLogs,
    clearAlloyLogs,
    sdkMode,
    launchEmbedUrl,
    sdkVersion,
    sdkScriptStatus,
    launchScriptStatus,
    viewMode,
    toggleViewMode
  } = useApp();
  const [isPromoOpen, setIsPromoOpen] = React.useState(false);
  const [activeHelpTab, setActiveHelpTab] = React.useState("safari");

  const [isNotifHistoryOpen, setIsNotifHistoryOpen] = React.useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = React.useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = React.useState("xdm");
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  
  // Simulated Notification Fields
  const [mockPushTitle, setMockPushTitle] = React.useState(ajoSimulationSettings?.mockPush?.title || "Limited Special eSIM Plan Offer!");
  const [mockPushBody, setMockPushBody] = React.useState(ajoSimulationSettings?.mockPush?.body || "Redeem 50% off first 3 months with code AETHER50. Tap to apply.");

  React.useEffect(() => {
    if (ajoSimulationSettings?.mockPush) {
      setMockPushTitle(ajoSimulationSettings.mockPush.title);
      setMockPushBody(ajoSimulationSettings.mockPush.body);
    }
  }, [ajoSimulationSettings]);

  const [dispatcherTemplate, setDispatcherTemplate] = React.useState("pageView");
  const [xdmPayloadText, setXdmPayloadText] = React.useState("");

  const loadDispatcherTemplate = (templateName) => {
    let payload = {};
    switch (templateName) {
      case "pageView":
        payload = {
          web: {
            webPageDetails: {
              name: `Tab: ${activeTab}`,
              URL: window.location.href
            }
          }
        };
        break;
      case "identityLogin":
        payload = {
          identityMap: {
            Email: [{ id: activeProfile.email, authenticatedState: "authenticated" }],
            Phone: [{ id: activeProfile.phone, authenticatedState: "authenticated" }],
            CRM: [{ id: activeProfile.crmId, authenticatedState: "authenticated" }]
          }
        };
        break;
      case "commercePurchase":
        payload = {
          commerce: {
            order: {
              priceTotal: cart.length > 0 ? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 45.0,
              currencyCode: "USD"
            },
            purchases: {
              value: 1
            }
          },
          productListItems: cart.length > 0 ? cart.map(item => ({
            SKU: item.id,
            name: item.name,
            priceTotal: item.price * item.quantity,
            quantity: item.quantity
          })) : [
            {
              SKU: "plan-5g-pro-unlimited",
              name: "5G Pro Unlimited",
              priceTotal: 45.0,
              quantity: 1
            }
          ]
        };
        break;
      case "customAction":
      default:
        payload = {
          customAction: {
            actionName: "TriggerSimulation",
            actionValue: "SandboxCustomButtonClick",
            timestamp: new Date().toISOString()
          }
        };
        break;
    }
    setXdmPayloadText(JSON.stringify(payload, null, 2));
  };

  React.useEffect(() => {
    loadDispatcherTemplate(dispatcherTemplate);
  }, [dispatcherTemplate, activeProfile, cart, activeTab]);

  const handleSendDispatcherEvent = async () => {
    try {
      if (!ajoCredentials.datastreamId || !ajoCredentials.orgId) {
        showToast("Configure Datastream and Org ID in Profile tab first!", "error");
        return;
      }
      
      const parsedPayload = JSON.parse(xdmPayloadText);
      
      let eventType = "web.webpagedetails.pageViews";
      if (dispatcherTemplate === "identityLogin") eventType = "user.login";
      else if (dispatcherTemplate === "commercePurchase") eventType = "commerce.purchases";
      else if (dispatcherTemplate === "customAction") eventType = "custom.action";

      const identityMap = parsedPayload.identityMap || null;
      if (parsedPayload.identityMap) {
        delete parsedPayload.identityMap;
      }

      showToast("Sending event to Adobe Edge Network...", "info");
      
      await AjoService.sendXdmEvent(
        ajoCredentials,
        eventType,
        parsedPayload,
        identityMap,
        addXdmEventLog
      );

      showToast("XDM Event dispatched successfully!", "success");
      refetchOffers();
    } catch (err) {
      console.error("XDM dispatcher failed:", err);
      showToast(`Dispatch failed: ${err.message}`, "error");
    }
  };

  React.useEffect(() => {
    if (activeBanner) {
      const timer = setTimeout(() => {
        setActiveBanner(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeBanner]);

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
        <div className="brand-logo" onClick={() => setActiveTab("usage")} style={{ cursor: "pointer" }}>
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

          {/* Cart Icon Button with Dynamic Badge */}
          <button
            onClick={() => {
              setActiveTab("cart");
              setIsNotifHistoryOpen(false);
            }}
            className="header-action-btn"
            style={{
              position: "relative",
              color: activeTab === "cart" ? "var(--accent-color)" : "var(--text-primary)"
            }}
            aria-label="View Shopping Cart"
          >
            <ShoppingCart size={18} />
            {cart && cart.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  backgroundColor: "var(--accent-color)",
                  color: "#000",
                  fontSize: "0.58rem",
                  fontWeight: "900",
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 5px var(--accent-glow)"
                }}
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Notification Bell Button with Badge */}
          <button
            onClick={() => setIsNotifHistoryOpen(!isNotifHistoryOpen)}
            className="header-action-btn"
            style={{
              position: "relative",
              color: isNotifHistoryOpen ? "var(--accent-color)" : "var(--text-primary)"
            }}
            aria-label="Toggle Notification History"
          >
            <Bell size={18} />
            {notificationLogs && notificationLogs.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  backgroundColor: "#FF1744",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  boxShadow: "0 0 5px rgba(255, 23, 68, 0.6)"
                }}
              />
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="header-action-btn"
            aria-label="Toggle interface theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Switch to Web view */}
          <button
            onClick={toggleViewMode}
            className="header-action-btn"
            style={{ display: "flex", alignItems: "center", gap: "4px", width: "auto", padding: "0 10px", fontSize: "0.62rem", fontWeight: "700", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}
            aria-label="Switch to Web view"
            title="Switch to Desktop Web view"
          >
            <Monitor size={14} />
            <span>WEB</span>
          </button>
        </div>
      </header>

      {/* Slide-Down Notification History Dropdown */}
      {isNotifHistoryOpen && (
        <>
          <div 
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 85,
              backgroundColor: "rgba(0,0,0,0.2)"
            }}
            onClick={() => setIsNotifHistoryOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "56px",
              left: "12px",
              right: "12px",
              zIndex: 88,
              backgroundColor: "rgba(10, 25, 47, 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--border-color)",
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-color-light)", paddingBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#FFF" }}>Notification Center</span>
              {notificationLogs && notificationLogs.length > 0 && (
                <button
                  onClick={clearNotificationLogs}
                  style={{ border: "none", background: "none", cursor: "pointer", fontSize: "0.68rem", color: "#FF1744", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Trash2 size={12} />
                  Clear All
                </button>
              )}
            </div>

            <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {notificationLogs && notificationLogs.length === 0 ? (
                <div style={{ padding: "30px 10px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.76rem" }}>
                  <Bell size={24} color="var(--text-muted)" style={{ marginBottom: "8px", opacity: 0.6, display: "inline-block" }} />
                  <p style={{ margin: 0 }}>No recent alerts or notifications.</p>
                </div>
              ) : (
                notificationLogs && notificationLogs.map((log) => (
                  <div 
                    key={log.id} 
                    style={{ 
                      backgroundColor: "var(--bg-secondary)", 
                      padding: "10px 12px", 
                      borderRadius: "10px", 
                      border: "1px solid var(--border-color-light)",
                      fontSize: "0.74rem",
                      textAlign: "left"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
                      <span style={{ fontWeight: "700", color: "var(--accent-color)" }}>{log.title}</span>
                      <span style={{ fontSize: "0.58rem", color: "var(--text-muted)" }}>{log.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.3" }}>{log.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Scrollable Viewport */}
      <main className="app-screen-content">
        {activeTab === "usage" && <UsageDashboard />}
        {activeTab === "plans" && <PlansCatalog />}
        {activeTab === "support" && <ChatSupport />}
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "cart" && <CartPage />}
      </main>

      {/* Floating Speed Booster Drawer */}
      <AddonModal />

      {/* Persistent Bottom navigation tab bar */}
      <Navigation />

      {/* Slide-Down iOS Simulated Push Notification Banner */}
      {activeBanner && (
        <div
          onClick={() => {
            showToast("Simulated push banner clicked!", "info");
            setActiveBanner(null);
          }}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            right: "12px",
            zIndex: 100,
            backgroundColor: "rgba(10, 25, 47, 0.95)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "12px 16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            cursor: "pointer",
            animation: "slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
          }}
        >
          {/* Mock app icon */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "var(--accent-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 10px var(--accent-glow)",
              color: "#000",
              fontWeight: "800",
              fontSize: "0.75rem"
            }}
          >
            AE
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2px" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#FFF" }}>Aether Connect</span>
              <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>now</span>
            </div>
            <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "600", color: "var(--accent-color)", marginBottom: "1px" }}>
              {activeBanner.title}
            </span>
            <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.3" }}>
              {activeBanner.body}
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button for Event Inspector Toggle */}
      <button
        onClick={() => setIsConsoleOpen(true)}
        style={{
          position: "absolute",
          bottom: "76px",
          left: "20px",
          zIndex: 50,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          backgroundColor: "rgba(10, 25, 47, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-color)",
          color: "var(--accent-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: xdmEventLogs && xdmEventLogs.some(l => l.status === "failed") 
            ? "0 0 15px rgba(255, 23, 68, 0.4)" 
            : "0 0 15px var(--accent-glow)",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
        title="Open AEP Event Inspector Console"
      >
        <Terminal size={18} />
      </button>

      {/* Event Inspector Side Drawer */}
      {isConsoleOpen && (
        <>
          <div 
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 90,
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)"
            }}
            onClick={() => setIsConsoleOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "290px",
              zIndex: 95,
              backgroundColor: "rgba(10, 25, 47, 0.95)",
              backdropFilter: "blur(16px)",
              borderRight: "1px solid var(--border-color)",
              boxShadow: "5px 0 25px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            {/* Console Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 14px", borderBottom: "1px solid var(--border-color-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Terminal size={16} color="var(--accent-color)" />
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#FFF", letterSpacing: "0.02em" }}>AEP / AJO Event Inspector</span>
              </div>
              <button
                onClick={() => setIsConsoleOpen(false)}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  border: "none"
                }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Console Tabs navigation */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-color-light)", padding: "4px" }}>
              {["xdm", "identity", "send", "debugger", "push"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveConsoleTab(tab)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    fontSize: "0.68rem",
                    fontWeight: "700",
                    borderRadius: "6px",
                    backgroundColor: activeConsoleTab === tab ? "rgba(0, 229, 255, 0.08)" : "transparent",
                    color: activeConsoleTab === tab ? "var(--accent-color)" : "var(--text-secondary)",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.2s"
                  }}
                >
                  {tab === "push" ? "Push Sim" : tab === "send" ? "Send" : tab === "debugger" ? "SDK" : tab}
                </button>
              ))}
            </div>

            {/* Console Scrollable Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
              {activeConsoleTab === "xdm" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>XDM Payload stream</span>
                    <button 
                      onClick={clearXdmEventLogs}
                      style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: "#FF1744" }}
                    >
                      <Trash2 size={10} />
                      Clear
                    </button>
                  </div>

                  {xdmEventLogs && xdmEventLogs.length === 0 ? (
                    <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.74rem" }}>
                      No XDM events captured yet.<br/>Perform actions like changing tabs, logging in, or checking out.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {xdmEventLogs && xdmEventLogs.map(log => {
                        const isSelected = selectedEvent?.id === log.id;
                        const statusColor = log.status === "success" ? "var(--success-color)" : log.status === "failed" ? "#FF1744" : "var(--warning-color)";
                        
                        return (
                          <div 
                            key={log.id} 
                            style={{ 
                              backgroundColor: "var(--bg-secondary)", 
                              border: isSelected ? "1px solid var(--accent-color)" : "1px solid var(--border-color-light)", 
                              borderRadius: "10px", 
                              padding: "10px",
                              cursor: "pointer"
                            }}
                            onClick={() => setSelectedEvent(isSelected ? null : log)}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                              <span style={{ fontSize: "0.7rem", fontWeight: "700", color: "#FFF", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                                {log.eventType.split('.').pop()}
                              </span>
                              <span style={{ fontSize: "0.58rem", color: "var(--text-muted)" }}>{log.timestamp}</span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "150px" }}>
                                configId: {log.endpoint.split('configId=')[1]?.substr(0,8)}...
                              </span>
                              <span style={{ fontSize: "0.58rem", fontWeight: "700", color: statusColor, textTransform: "uppercase" }}>
                                {log.status}
                              </span>
                            </div>

                            {isSelected && (
                              <div style={{ marginTop: "10px", borderTop: "1px solid var(--border-color-light)", paddingTop: "8px" }}>
                                <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>HTTP Endpoint:</span>
                                <code style={{ display: "block", fontSize: "0.56rem", color: "var(--text-secondary)", wordBreak: "break-all", marginBottom: "6px" }}>{log.endpoint}</code>
                                
                                <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>XDM Payload:</span>
                                <pre style={{ margin: 0, padding: "6px", backgroundColor: "var(--bg-tertiary)", borderRadius: "6px", overflowX: "auto", fontSize: "0.55rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "pre" }}>
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>

                                {log.response && (
                                  <>
                                    <span style={{ fontSize: "0.58rem", color: "var(--text-muted)", display: "block", margin: "6px 0 4px" }}>Edge Response:</span>
                                    <pre style={{ margin: 0, padding: "6px", backgroundColor: "var(--bg-tertiary)", borderRadius: "6px", overflowX: "auto", fontSize: "0.55rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", whiteSpace: "pre" }}>
                                      {JSON.stringify(log.response, null, 2)}
                                    </pre>
                                  </>
                                )}

                                {log.error && (
                                  <div style={{ marginTop: "6px", fontSize: "0.58rem", color: "#FF1744" }}>
                                    Error: {log.error}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeConsoleTab === "identity" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "#FFF" }}>Stitched Identity Graph</h4>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    AEP stitches multiple namespaces into a single Profile. These are the active namespaces in this session:
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                    <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "10px", padding: "10px" }}>
                      <span style={{ display: "block", fontSize: "0.6rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: "600", marginBottom: "2px" }}>ECID (Experience Cloud ID)</span>
                      <code style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)", wordBreak: "break-all" }}>
                        {localStorage.getItem("aether_ecid") || "Generating..."}
                      </code>
                    </div>
                    
                    <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "10px", padding: "10px" }}>
                      <span style={{ display: "block", fontSize: "0.6rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: "600", marginBottom: "2px" }}>CRM ID (Customer ID)</span>
                      <code style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)", wordBreak: "break-all" }}>
                        {activeProfile.crmId}
                      </code>
                    </div>

                    <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "10px", padding: "10px" }}>
                      <span style={{ display: "block", fontSize: "0.6rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: "600", marginBottom: "2px" }}>Email Namespace</span>
                      <code style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)", wordBreak: "break-all" }}>
                        {activeProfile.email}
                      </code>
                    </div>

                    <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "10px", padding: "10px" }}>
                      <span style={{ display: "block", fontSize: "0.6rem", textTransform: "uppercase", color: "var(--accent-color)", fontWeight: "600", marginBottom: "2px" }}>Phone Namespace</span>
                      <code style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)", wordBreak: "break-all" }}>
                        {activeProfile.phone}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              {activeConsoleTab === "send" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "#FFF" }}>Interactive XDM Dispatcher</h4>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      Construct and dispatch live Experience Events to your AEP Datastream from this client window.
                    </p>
                  </div>

                  {/* Template Picker */}
                  <div>
                    <label style={{ fontSize: "0.66rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Event Template</label>
                    <select
                      value={dispatcherTemplate}
                      onChange={(e) => setDispatcherTemplate(e.target.value)}
                      className="form-input"
                      style={{ padding: "8px 10px", fontSize: "0.8rem", width: "100%", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", color: "var(--text-primary)" }}
                    >
                      <option value="pageView">Page View Event (webpagedetails)</option>
                      <option value="identityLogin">Identity Login Event (user.login)</option>
                      <option value="commercePurchase">Commerce Purchase Event (purchases)</option>
                      <option value="customAction">Custom Action Event (decisioning)</option>
                    </select>
                  </div>

                  {/* Live JSON Editor */}
                  <div>
                    <label style={{ fontSize: "0.66rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>XDM Payload Content</label>
                    <textarea
                      value={xdmPayloadText}
                      onChange={(e) => setXdmPayloadText(e.target.value)}
                      className="form-input"
                      style={{
                        padding: "8px 10px",
                        fontSize: "0.68rem",
                        fontFamily: "var(--font-mono)",
                        height: "180px",
                        resize: "vertical",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color-light)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendDispatcherEvent}
                    className="btn-primary"
                    style={{
                      padding: "10px",
                      fontSize: "0.78rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Play size={12} />
                    <span>Send Event to Edge</span>
                  </button>

                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: "1.4", borderTop: "1px solid var(--border-color-light)", paddingTop: "10px" }}>
                    💡 Configured credentials in settings will be used. Successfully sent events appear immediately inside the <strong>XDM</strong> log tab of this console.
                  </div>
                </div>
              )}

              {activeConsoleTab === "debugger" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "#FFF" }}>Web SDK & Launch Inspector</h4>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      Inspect the active Adobe Client Data Layer state and Alloy Web SDK command queues.
                    </p>
                  </div>

                  {/* 1. Diagnostics Checklist */}
                  <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h5 style={{ margin: 0, fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)" }}>Assurance & Debugger Diagnostics</h5>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.68rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>1. ECID Status:</span>
                        <span style={{ fontWeight: "700", color: localStorage.getItem("aether_ecid") ? "var(--success-color)" : "var(--warning-color)" }}>
                          {localStorage.getItem("aether_ecid") ? "✓ Generated" : "✗ Missing"}
                        </span>
                      </div>
                      
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>2. Datastream Credentials:</span>
                        <span style={{ fontWeight: "700", color: ajoCredentials.datastreamId ? "var(--success-color)" : "var(--warning-color)" }}>
                          {ajoCredentials.datastreamId ? "✓ Configured" : "✗ Incomplete"}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>3. SDK Mode:</span>
                        <span style={{ fontWeight: "700", color: "var(--accent-color)", textTransform: "uppercase" }}>
                          {sdkMode === "real_sdk" ? "Real Web SDK" : sdkMode === "adobe_launch" ? "Adobe Launch" : "Emulated"}
                        </span>
                      </div>

                      {sdkMode === "real_sdk" && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "var(--text-secondary)" }}>- Script Status (alloy.js):</span>
                          <span style={{ fontWeight: "700", color: sdkScriptStatus === "ready" ? "var(--success-color)" : sdkScriptStatus === "loading" ? "var(--warning-color)" : "#FF1744" }}>
                            {sdkScriptStatus === "ready" ? "✓ Loaded" : sdkScriptStatus === "loading" ? "● Loading" : "✗ Failed"}
                          </span>
                        </div>
                      )}

                      {sdkMode === "adobe_launch" && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "var(--text-secondary)" }}>- Script (Launch):</span>
                          <span style={{ fontWeight: "700", color: launchScriptStatus === "ready" ? "var(--success-color)" : launchScriptStatus === "loading" ? "var(--warning-color)" : "#FF1744" }}>
                            {launchScriptStatus === "ready" ? "✓ Loaded" : launchScriptStatus === "loading" ? "● Loading" : "✗ Failed"}
                          </span>
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>4. window.alloy Presence:</span>
                        <span style={{ fontWeight: "700", color: (typeof window !== "undefined" && window.alloy) ? "var(--success-color)" : "#FF1744" }}>
                          {(typeof window !== "undefined" && window.alloy) ? "✓ Initialized" : "✗ Offline"}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>5. Client Data Layer:</span>
                        <span style={{ fontWeight: "700", color: (typeof window !== "undefined" && window.adobeDataLayer) ? "var(--success-color)" : "#FF1744" }}>
                          {(typeof window !== "undefined" && window.adobeDataLayer) ? `✓ Active (${window.adobeDataLayer.length} events)` : "✗ Missing"}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "var(--text-secondary)" }}>5. Assurance Session:</span>
                        <span style={{ fontWeight: "700", color: assuranceSessionId ? "var(--success-color)" : "var(--text-muted)" }}>
                          {assuranceSessionId ? "✓ Connected" : "No Session"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Emulated Alloy Command Logs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>window.alloy call logs</span>
                      {alloyLogs && alloyLogs.length > 0 && (
                        <button 
                          onClick={clearAlloyLogs}
                          style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: "#FF1744" }}
                        >
                          <Trash2 size={10} />
                          Clear
                        </button>
                      )}
                    </div>

                    {alloyLogs && alloyLogs.length === 0 ? (
                      <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.7rem", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px dashed var(--border-color-light)" }}>
                        No Alloy Web SDK commands captured. Swap tabs or checkout items to trigger.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                        {alloyLogs.map((log) => (
                          <div key={log.id} style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "8px", padding: "8px", fontSize: "0.66rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                              <span style={{ fontWeight: "700", color: "var(--accent-color)" }}>alloy("{log.command}")</span>
                              <span style={{ fontSize: "0.58rem", color: "var(--text-muted)" }}>{log.timestamp}</span>
                            </div>
                            <pre style={{ margin: 0, fontSize: "0.58rem", fontFamily: "var(--font-mono)", overflowX: "auto", color: "var(--text-secondary)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                              {JSON.stringify(log.args, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Live Client Data Layer Array */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>window.adobeDataLayer (Raw Array)</span>
                    <pre
                      style={{
                        margin: 0,
                        padding: "8px 10px",
                        fontSize: "0.64rem",
                        fontFamily: "var(--font-mono)",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color-light)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        maxHeight: "180px",
                        overflow: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all"
                      }}
                    >
                      {typeof window !== "undefined" && window.adobeDataLayer 
                        ? JSON.stringify(window.adobeDataLayer, null, 2)
                        : "[]"
                      }
                    </pre>
                  </div>

                  {/* 4. Chrome Extension Guide */}
                  <div
                    style={{
                      backgroundColor: "rgba(0, 229, 255, 0.03)",
                      border: "1px dashed rgba(0, 229, 255, 0.25)",
                      borderRadius: "12px",
                      padding: "12px",
                      marginTop: "4px"
                    }}
                  >
                    <span style={{ display: "block", fontSize: "0.74rem", fontWeight: "700", color: "var(--accent-color)", marginBottom: "6px" }}>
                      🔌 Chrome Debugger Setup
                    </span>
                    <ol style={{ fontSize: "0.68rem", color: "var(--text-secondary)", margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px", lineHeight: "1.4" }}>
                      <li>Install the <strong>Adobe Experience Platform Debugger</strong> extension in Chrome.</li>
                      <li>Open the extension and navigate to <strong>Adobe Client Data Layer</strong> to see events in real-time.</li>
                      <li>Navigate to <strong>Experience Platform Web SDK</strong> to trace active datastreams and event payloads.</li>
                      <li>In Settings, paste your own Launch container URL to test tags/rules end-to-end.</li>
                    </ol>
                  </div>
                </div>
              )}

              {activeConsoleTab === "push" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "#FFF" }}>Push Notification Simulator</h4>
                    <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      Simulate a push notification campaign triggered by AJO to test visual rendering.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-color-light)" }}>
                    <div>
                      <label style={{ fontSize: "0.66rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Banner Title</label>
                      <input
                        type="text"
                        value={mockPushTitle}
                        onChange={(e) => setMockPushTitle(e.target.value)}
                        className="form-input"
                        style={{ padding: "6px 8px", fontSize: "0.74rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.66rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Banner Body Message</label>
                      <textarea
                        value={mockPushBody}
                        onChange={(e) => setMockPushBody(e.target.value)}
                        className="form-input"
                        style={{ padding: "6px 8px", fontSize: "0.72rem", resize: "none", height: "50px" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerNotification(mockPushTitle, mockPushBody)}
                      className="btn-primary"
                      style={{ padding: "8px", fontSize: "0.74rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      <Play size={10} />
                      <span>Deliver Mock Push</span>
                    </button>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-color-light)", paddingTop: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "600" }}>Notification History</span>
                      <button 
                        onClick={clearNotificationLogs}
                        style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65rem", color: "#FF1744" }}
                      >
                        <Trash2 size={10} />
                        Clear
                      </button>
                    </div>

                    {notificationLogs && notificationLogs.length === 0 ? (
                      <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}>
                        No history logs.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {notificationLogs && notificationLogs.map(log => (
                          <div key={log.id} style={{ backgroundColor: "var(--bg-tertiary)", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-color-light)", fontSize: "0.7rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                              <span style={{ fontWeight: "700", color: "#FFF" }}>{log.title}</span>
                              <span style={{ fontSize: "0.58rem", color: "var(--text-muted)" }}>{log.timestamp}</span>
                            </div>
                            <span style={{ color: "var(--text-secondary)" }}>{log.body}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-120%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

// Main App wrapper providing the central AppProvider
function App() {
  return (
    <AppProvider>
      <AppViewRouter />
    </AppProvider>
  );
}

// Decides which view to render based on viewMode
const AppViewRouter = () => {
  const { viewMode } = useApp();
  return viewMode === "web" ? <WebLayout /> : <InnerApp />;
};

export default App;
