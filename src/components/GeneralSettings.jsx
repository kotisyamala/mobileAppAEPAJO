import React, { useState } from "react";
import jsQR from "jsqr";
import { useApp } from "../context/AppContext";
import { Download, Upload, ShieldCheck, QrCode, ToggleLeft, ToggleRight, X, LogIn, UserCheck, Bell, Sparkles, Layers, Tv, CreditCard, Settings } from "lucide-react";
import { AjoService } from "../services/AjoService";

const GeneralSettings = () => {
  const {
    showToast,
    ajoCredentials,
    saveAjoCredentials,
    isAjoLoading,
    assuranceSessionId,
    clearAssuranceSession,
    assuranceSessionPin,
    connectAssuranceSession,
    activeProfile,
    saveProfile,
    exportSettingsToJson,
    importSettingsFromJson,
    addXdmEventLog,
    ajoSimulationSettings,
    saveAjoSimulationSettings,
    triggerNotification,
    pushListenerTopic,
    savePushListenerTopic,
    pushListenerEnabled,
    savePushListenerEnabled,
    sdkMode,
    launchEmbedUrl,
    sdkVersion,
    sdkScriptStatus,
    launchScriptStatus,
    saveSdkSettings
  } = useApp();

  const [simForm, setSimForm] = useState({ ...ajoSimulationSettings });
  const [topicInput, setTopicInput] = useState(pushListenerTopic);

  React.useEffect(() => {
    setTopicInput(pushListenerTopic);
  }, [pushListenerTopic]);

  React.useEffect(() => {
    setSimForm({ ...ajoSimulationSettings });
  }, [ajoSimulationSettings]);

  const [localSdkMode, setLocalSdkMode] = useState(sdkMode);
  const [localLaunchUrl, setLocalLaunchUrl] = useState(launchEmbedUrl);
  const [localSdkVersion, setLocalSdkVersion] = useState(sdkVersion);

  React.useEffect(() => {
    setLocalSdkMode(sdkMode);
    setLocalLaunchUrl(launchEmbedUrl);
    setLocalSdkVersion(sdkVersion);
  }, [sdkMode, launchEmbedUrl, sdkVersion]);

  const [generalSubTab, setGeneralSubTab] = useState("aep"); // "aep" | "simulation" | "usecases"

  // AEP Test profile state
  const [profileType, setProfileType] = useState("john");
  const [customProfileForm, setCustomProfileForm] = useState({
    crmId: activeProfile.crmId || "crm-custom-9042",
    email: activeProfile.email || "custom.tester@sandbox.com",
    firstName: activeProfile.firstName || "Custom",
    lastName: activeProfile.lastName || "Tester",
    phone: activeProfile.phone || "+15558880099"
  });

  const handleCustomProfileChange = (e) => {
    const { name, value } = e.target;
    setCustomProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const selectJohn = () => {
    setProfileType("john");
    saveProfile({
      crmId: "crm-john-doe-12345",
      email: "john.doe@aethertelecom.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+15550199283"
    });
  };

  const selectJane = () => {
    setProfileType("jane");
    saveProfile({
      crmId: "crm-jane-smith-98765",
      email: "jane.smith@enterprise.com",
      firstName: "Jane",
      lastName: "Smith",
      phone: "+15550148810"
    });
  };

  const saveCustomProfileSubmit = (e) => {
    e.preventDefault();
    setProfileType("custom");
    saveProfile(customProfileForm);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importSettingsFromJson(event.target.result);
    };
    reader.readAsText(file);
  };

  const [formCreds, setFormCreds] = useState({ ...ajoCredentials });
  const [assuranceInput, setAssuranceInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [isAssuranceScannerOpen, setIsAssuranceScannerOpen] = useState(false);

  // Camera integration logic
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const handleOpenScanner = async () => {
    setIsAssuranceScannerOpen(true);
    setCameraError(null);
    setCameraStream(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setCameraStream(stream);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(err.message || "Camera blocked or unavailable");
    }
  };

  const handleCloseScanner = () => {
    setIsAssuranceScannerOpen(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraError(null);
  };

  React.useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  React.useEffect(() => {
    let active = true;
    let animationFrameId = null;

    const scan = () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
          if (code && code.data) {
            console.log("AEP Assurance: Scanned QR data:", code.data);
            const connected = connectAssuranceSession(code.data);
            if (connected) {
              handleCloseScanner();
              active = false;
              return;
            }
          }
        }
      }
      if (active && isAssuranceScannerOpen && cameraStream) {
        animationFrameId = requestAnimationFrame(scan);
      }
    };

    if (isAssuranceScannerOpen && cameraStream) {
      animationFrameId = requestAnimationFrame(scan);
    }

    return () => {
      active = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAssuranceScannerOpen, cameraStream]);

  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleCredChange = (e) => {
    const { name, value } = e.target;
    setFormCreds((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveCreds = (e) => {
    e.preventDefault();
    saveAjoCredentials(formCreds);
  };

  const handleSimChange = (section, field, value) => {
    setSimForm(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleSaveSimSettings = (e) => {
    e.preventDefault();
    saveAjoSimulationSettings(simForm);
  };

  /* ─── Usecase Library Data ─── */
  const [selectedUsecase, setSelectedUsecase] = useState(null);

  const usecases = [
    {
      id: "personalization",
      title: "1. AJO Experience Decisioning (Home Banner)",
      summary: "Deliver customized campaign card offers directly to the main Usage Dashboard tab.",
      image: "ajo-flow-demo.webp",
      overview: "Experience Decisioning (ExD) resolves dynamic rules-based propositions directly from Adobe Experience Platform's Edge Network to targeted client surface interfaces.",
      aepSteps: [
        "Create content items, placements, and decision rules in the Adobe Experience Platform interface.",
        "Under Journey Optimizer > Experience Decisioning, configure a new Decision using your content.",
        "Set the target Surface URI to: mobileapp://aether-connect/dashboard-banner.",
        "Include layout content nodes: title, description, actionText, and type."
      ],
      appSteps: [
        "Go to the General tab > AEP Gateway and configure your Org ID and Datastream ID.",
        "Ensure AJO Simulation Mode is turned off to make live network requests.",
        "Verify your Dashboard Surface URI matches the value configured in AJO (default: mobileapp://aether-connect/dashboard-banner)."
      ],
      validationSteps: [
        "Navigate to the Usage Dashboard (Usage tab).",
        "The dashboard banner will automatically send a personalization request to the Adobe Edge gateway.",
        "A customized promotion card will load, matching the dynamic propositions returned by your AJO decision rule.",
        "Open the AEP Console drawer (FAB bottom-left) and select the XDM tab. Click the first event to view the full POST request payload and response handle array."
      ]
    },
    {
      id: "popup",
      title: "2. Personalised Reload Promo Popup",
      summary: "Display modal overlays automatically triggered upon device session startup.",
      image: "exd-flow-demo.webp",
      overview: "Startups or profile updates stitch tracking namespaces together and pull eligible welcome proposition modals for the user profile.",
      aepSteps: [
        "Set up content items and decision rules inside Journey Optimizer Decisioning.",
        "Register the target Surface URI for welcome modals: mobileapp://aether-connect/reload-popup.",
        "Configure the content payload keys: badge, title, description, and code (e.g. coupon promotion key)."
      ],
      appSteps: [
        "Confirm your popup surface URI input in General > AEP Gateway matches mobileapp://aether-connect/reload-popup.",
        "To test without active AEP sandboxes, toggle Simulation Mode 'On' and edit the mock popup details inside the Simulation & Demo panel."
      ],
      validationSteps: [
        "Reload the app or click Apply settings.",
        "After a 1.2-second wait delay, the glassmorphic modal overlay will animate onto the screen.",
        "Click the 'View Raw AJO Payload' details accordion at the bottom of the modal to verify the JSON data block returned directly from the Edge network."
      ]
    },
    {
      id: "checkout",
      title: "3. E-Commerce Checkout Tracking (Web SDK)",
      summary: "Validate e-commerce purchases, cart modifications, and product items.",
      image: "debugger-flow-demo.webp",
      overview: "Standard commerce events stitch product SKU specifications, counts, order values, and identities (email, phone, CRM ID) onto AEP datasets.",
      aepSteps: [
        "Define an XDM Schema in AEP Schema Registry with the Commerce Mixin enabled (commerce.purchases and productListItems).",
        "Set up a Datastream configured with the AEP Analytics or Customer Journey Analytics service routing."
      ],
      appSteps: [
        "Set the SDK mode to 'Real Web SDK (Direct alloy.js)' inside the AEP Gateway section to inject the official alloy script tag.",
        "Configure your Datastream ID and Org ID parameters in the Gateway settings form."
      ],
      validationSteps: [
        "Navigate to the Shop tab and click 'Subscribe' on any eSIM plan or 'Add to Cart' on a premium hardware product.",
        "Open the Shopping Cart page by clicking the cart icon in the header.",
        "Complete the order checkout by clicking 'Pay & Process Order'. Once the transaction animation finishes, click 'Complete Setup & Log AEP Event'.",
        "Open the AEP Console drawer -> debugger tab. Verify that alloy('sendEvent', ...) command entries are recorded containing the detailed productListItems array.",
        "Open the Adobe Experience Platform Debugger Chrome extension and click on the 'Experience Platform Web SDK' tab. Verify that the purchase events are captured successfully and map details (priceTotal, currencyCode) match."
      ]
    },
    {
      id: "webhook",
      title: "4. Journey Webhook Push Simulator",
      summary: "Test real-time webhook push alerts from AJO triggers back to the client interface.",
      image: "proxy-test-demo.webp",
      overview: "AJO Journeys react to inbound user signals, triggering outbound HTTP webhooks to deliver push message payloads to active listener devices.",
      aepSteps: [
        "In Adobe Journey Optimizer, build a multi-step Journey map.",
        "Set the entrance Trigger Event to a custom profile login or purchase event.",
        `Add a Custom Action webhook node pointing to the target URL: https://ntfy.sh/${pushListenerTopic}`,
        "Define the webhook POST payload containing: title and message body text fields."
      ],
      appSteps: [
        "Go to General tab > Simulation & Demo, locate the AJO Webhook Notification Listener section, and toggle it 'Enabled'.",
        "Copy your unique listening Topic name (which dynamically stitches your ECID) or copy the complete curl command to test alerts locally."
      ],
      validationSteps: [
        "Trigger the entrance event inside the app (e.g. by logging in a new profile or checking out a cart).",
        "AJO will process the journey and execute the webhook call.",
        "The app will play an electronic double chime, slide down the iOS simulated push banner, and push the record into the top header Notification Center dropdown log history."
      ]
    }
  ];

  return (
    <div className="fade-in" style={{ padding: "24px 20px" }}>
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(0, 229, 255, 0.04))",
            border: "1px solid rgba(0, 229, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px var(--accent-glow)",
          }}
        >
          <Settings size={24} color="var(--accent-color)" />
        </div>
        <div>
          <h2 style={{ fontSize: "1.15rem", margin: 0, color: "var(--text-primary)" }}>Aether Connect</h2>
          <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>
            AEP / AJO Sandbox Configuration
          </span>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div
        style={{
          display: "flex",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "14px",
          padding: "4px",
          border: "1px solid var(--border-color-light)",
          marginBottom: "24px",
          gap: "4px"
        }}
      >
        {[
          { id: "aep", label: "⚡ AEP Gateway" },
          { id: "simulation", label: "✨ Simulation & Demo" },
          { id: "usecases", label: "📖 Usecase Library" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setGeneralSubTab(tab.id);
              if (tab.id !== "usecases") setSelectedUsecase(null);
            }}
            style={{
              flex: 1,
              padding: "10px 6px",
              fontSize: "0.72rem",
              fontWeight: "700",
              borderRadius: "10px",
              backgroundColor: generalSubTab === tab.id ? "rgba(0, 229, 255, 0.08)" : "transparent",
              color: generalSubTab === tab.id ? "var(--accent-color)" : "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── AEP Gateway Tab ─── */}
      {generalSubTab === "aep" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* AEP Identity / Profile Login */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                AEP Identity / Profile Login
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  color: "var(--accent-color)",
                  backgroundColor: "var(--accent-glow)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  border: "1px solid rgba(0, 229, 255, 0.15)"
                }}
              >
                Active: {activeProfile.firstName}
              </span>
            </div>

            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Select a test profile to simulate identity stitching in your AEP Datastream. Changing profiles fires an XDM user login payload to resolve CRM/Email namespaces.
            </p>

            {/* Profile Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={selectJohn}
                className="btn-secondary"
                style={{
                  flex: 1,
                  padding: "10px 6px",
                  fontSize: "0.74rem",
                  fontWeight: "700",
                  backgroundColor: activeProfile.crmId === "crm-john-doe-12345" ? "var(--bg-secondary)" : "transparent",
                  color: activeProfile.crmId === "crm-john-doe-12345" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderColor: activeProfile.crmId === "crm-john-doe-12345" ? "var(--accent-color)" : "var(--border-color-light)",
                  cursor: "pointer"
                }}
              >
                John Doe (VIP)
              </button>
              <button
                type="button"
                onClick={selectJane}
                className="btn-secondary"
                style={{
                  flex: 1,
                  padding: "10px 6px",
                  fontSize: "0.74rem",
                  fontWeight: "700",
                  backgroundColor: activeProfile.crmId === "crm-jane-smith-98765" ? "var(--bg-secondary)" : "transparent",
                  color: activeProfile.crmId === "crm-jane-smith-98765" ? "var(--accent-color)" : "var(--text-secondary)",
                  borderColor: activeProfile.crmId === "crm-jane-smith-98765" ? "var(--accent-color)" : "var(--border-color-light)",
                  cursor: "pointer"
                }}
              >
                Jane Smith (Biz)
              </button>
              <button
                type="button"
                onClick={() => setProfileType("custom")}
                className="btn-secondary"
                style={{
                  flex: 1,
                  padding: "10px 6px",
                  fontSize: "0.74rem",
                  fontWeight: "700",
                  backgroundColor: (activeProfile.crmId !== "crm-john-doe-12345" && activeProfile.crmId !== "crm-jane-smith-98765") ? "var(--bg-secondary)" : "transparent",
                  color: (activeProfile.crmId !== "crm-john-doe-12345" && activeProfile.crmId !== "crm-jane-smith-98765") ? "var(--accent-color)" : "var(--text-secondary)",
                  borderColor: (activeProfile.crmId !== "crm-john-doe-12345" && activeProfile.crmId !== "crm-jane-smith-98765") ? "var(--accent-color)" : "var(--border-color-light)",
                  cursor: "pointer"
                }}
              >
                Custom Profile
              </button>
            </div>

            {/* Custom profile editor form */}
            {(profileType === "custom" || (activeProfile.crmId !== "crm-john-doe-12345" && activeProfile.crmId !== "crm-jane-smith-98765")) && (
              <form onSubmit={saveCustomProfileSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "var(--bg-secondary)", padding: "14px", borderRadius: "14px", border: "1px solid var(--border-color-light)" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>First Name</label>
                    <input type="text" name="firstName" value={customProfileForm.firstName} onChange={handleCustomProfileChange} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Last Name</label>
                    <input type="text" name="lastName" value={customProfileForm.lastName} onChange={handleCustomProfileChange} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} required />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>CRM ID (AEP Customer Identifier)</label>
                  <input type="text" name="crmId" value={customProfileForm.crmId} onChange={handleCustomProfileChange} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} required />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Email Address</label>
                  <input type="email" name="email" value={customProfileForm.email} onChange={handleCustomProfileChange} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} required />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Phone Number</label>
                  <input type="text" name="phone" value={customProfileForm.phone} onChange={handleCustomProfileChange} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} required />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: "10px", fontSize: "0.78rem", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <LogIn size={14} />
                  <span>Login & Stitch Profile</span>
                </button>
              </form>
            )}
          </div>

          {/* Adobe Edge / AJO Decisions */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                Adobe Edge / AJO Decisions
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  color: ajoCredentials.datastreamId ? "var(--success-color)" : "var(--warning-color)",
                  backgroundColor: ajoCredentials.datastreamId ? "var(--success-glow)" : "rgba(255, 214, 0, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  border: "1px solid"
                }}
              >
                {ajoCredentials.datastreamId ? "Edge Connected" : "Local Mode"}
              </span>
            </div>

            <form onSubmit={handleSaveCreds} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Datastream ID</label>
                <input type="text" name="datastreamId" value={formCreds.datastreamId} onChange={handleCredChange} placeholder="e.g. 1a2b3c4d-..." className="form-input" style={{ padding: "10px 12px", fontSize: "0.85rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>IMS Org ID</label>
                <input type="text" name="orgId" value={formCreds.orgId} onChange={handleCredChange} placeholder="e.g. 123456789@AdobeOrg" className="form-input" style={{ padding: "10px 12px", fontSize: "0.85rem" }} />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Popup Surface URI</label>
                  <input type="text" name="popupSurface" value={formCreds.popupSurface} onChange={handleCredChange} placeholder="mobileapp://aether-connect/popup" className="form-input" style={{ padding: "10px 12px", fontSize: "0.85rem" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Dashboard Surface URI</label>
                  <input type="text" name="dashboardSurface" value={formCreds.dashboardSurface} onChange={handleCredChange} placeholder="mobileapp://aether-connect/dashboard" className="form-input" style={{ padding: "10px 12px", fontSize: "0.85rem" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Edge Host / Gateway (optional)</label>
                <input type="text" name="edgeHost" value={formCreds.edgeHost || ""} onChange={handleCredChange} placeholder="Default: https://edge.adobedc.net" className="form-input" style={{ padding: "10px 12px", fontSize: "0.85rem" }} />
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px", lineHeight: "1.4" }}>
                  💡 If defaulting to <code>https://edge.adobedc.net</code> fails on mobile Safari due to tracking blockers, use your Mac's dev proxy URL (e.g. <code>http://&lt;your-mac-ip&gt;:5173/api/ajo-edge</code>) while connected to the same Wi-Fi.
                </span>
                {(() => {
                  if (typeof window === "undefined" || !window.location) return null;
                  const hostname = window.location.hostname;
                  const isLocal = /localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\./i.test(hostname);
                  
                  const handleAutopopulate = () => {
                    if (isLocal) {
                      setFormCreds(prev => ({ ...prev, edgeHost: `http://${window.location.host}/api/ajo-edge` }));
                      showToast("Edge Host set to local network proxy!", "success");
                    } else {
                      const ip = prompt("Enter your Mac's local network IP address (e.g. 192.168.1.50 or localhost):", "192.168.1.50");
                      if (ip && ip.trim()) {
                        let sanitizedIp = ip.trim();
                        sanitizedIp = sanitizedIp.replace(/^https?:\/\//i, '');
                        while (sanitizedIp.endsWith("/")) {
                          sanitizedIp = sanitizedIp.slice(0, -1);
                        }
                        sanitizedIp = sanitizedIp.split('/')[0];
                        const targetHost = sanitizedIp.includes(":") ? sanitizedIp : `${sanitizedIp}:5173`;
                        setFormCreds(prev => ({ ...prev, edgeHost: `http://${targetHost}/api/ajo-edge` }));
                        showToast(`Edge Host set to http://${targetHost}/api/ajo-edge`, "success");
                      }
                    }
                  };

                  return (
                    <button
                      type="button"
                      onClick={handleAutopopulate}
                      style={{
                        marginTop: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 10px",
                        fontSize: "0.68rem",
                        fontWeight: "600",
                        color: "var(--accent-color)",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {isLocal ? "Autopopulate Local Proxy" : "Autopopulate Local Proxy IP..."}
                    </button>
                  );
                })()}
              </div>
              <button type="submit" disabled={isAjoLoading} className="btn-primary" style={{ padding: "12px", fontSize: "0.8rem", marginTop: "6px" }}>
                {isAjoLoading ? "Fetching propositions..." : "Save & Sync Offers"}
              </button>
            </form>

            {/* Sandbox Backup/Restore Config Settings */}
            <div style={{ display: "flex", gap: "10px", marginTop: "14px", borderTop: "1px solid var(--border-color-light)", paddingTop: "14px" }}>
              <button onClick={exportSettingsToJson} className="btn-secondary" style={{ flex: 1, padding: "10px 8px", fontSize: "0.74rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer", fontWeight: "600" }}>
                <Download size={14} />
                <span>Export Configuration</span>
              </button>
              <label className="btn-secondary" style={{ flex: 1, padding: "10px 8px", fontSize: "0.74rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer", margin: 0, boxSizing: "border-box", fontWeight: "600" }}>
                <Upload size={14} />
                <span>Import Configuration</span>
                <input type="file" accept=".json" onChange={handleImportFile} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {/* AEP Assurance Tracing Setup */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
                AEP Assurance Tracing
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  color: assuranceSessionId ? "var(--success-color)" : "var(--text-muted)",
                  backgroundColor: assuranceSessionId ? "var(--success-glow)" : "rgba(100, 100, 100, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  border: "1px solid"
                }}
              >
                {assuranceSessionId ? "Assurance Connected" : "No Active Session"}
              </span>
            </div>

            {assuranceSessionId ? (
              <div
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  padding: "16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(0, 230, 118, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Currently tracing Edge Network events to session:
                  <code
                    style={{
                      display: "block",
                      margin: "6px 0",
                      padding: "8px",
                      backgroundColor: "var(--bg-tertiary)",
                      borderRadius: "8px",
                      fontSize: "0.72rem",
                      fontFamily: "var(--font-mono)",
                      wordBreak: "break-all",
                      color: "var(--accent-color)",
                    }}
                  >
                    {assuranceSessionId}
                  </code>
                  {assuranceSessionPin && (
                    <span style={{ fontSize: "0.75rem", display: "block" }}>
                      Session PIN: <strong>{assuranceSessionPin}</strong>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAssuranceSession}
                  className="btn-secondary"
                  style={{
                    padding: "10px",
                    fontSize: "0.8rem",
                    color: "#FF1744",
                    borderColor: "rgba(255, 23, 68, 0.25)"
                  }}
                >
                  Disconnect Assurance Session
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0 }}>
                  To validate offers, paste your Assurance Session Link (generated in the Adobe Assurance console) or scan the console QR code below.
                </p>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Assurance Link or Session ID</label>
                  <input type="text" value={assuranceInput} onChange={(e) => setAssuranceInput(e.target.value)} placeholder="Paste Assurance link here..." className="form-input" style={{ padding: "10px 12px", fontSize: "0.85rem" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Session PIN (Optional)</label>
                  <input type="text" maxLength={4} value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="e.g. 1234" className="form-input" style={{ padding: "10px 12px", fontSize: "0.85rem" }} />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    onClick={() => {
                      const success = connectAssuranceSession(assuranceInput, pinInput);
                      if (success) {
                        setAssuranceInput("");
                        setPinInput("");
                      }
                    }}
                    className="btn-primary"
                    style={{ flex: 1, padding: "10px", fontSize: "0.8rem" }}
                  >
                    Connect Session
                  </button>
                  <button
                    onClick={handleOpenScanner}
                    className="btn-secondary"
                    style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", gap: "6px", padding: "10px", fontSize: "0.8rem" }}
                  >
                    <QrCode size={14} />
                    <span>Scan QR</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AEP Web SDK & Tag Container Configuration */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "12px" }}>
              AEP Web SDK & Tags Container
            </h3>

            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid var(--border-color-light)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
                Select how Web SDK / Tags scripts are run on this page to test integrations with the <strong>AEP Chrome Debugger</strong>.
              </p>

              {/* Selector buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { id: "emulated", label: "Emulated Web SDK", desc: "Routes tracking locally via AjoService (Offline friendly)" },
                  { id: "real_sdk", label: "Real Web SDK (Direct alloy.js)", desc: "Loads official SDK from Adobe CDN and routes calls dynamically" },
                  { id: "adobe_launch", label: "Adobe Launch (Tags) Embed", desc: "Injects Launch container. Uses Adobe Client Data Layer events" }
                ].map((mode) => (
                  <label
                    key={mode.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "12px",
                      borderRadius: "12px",
                      border: localSdkMode === mode.id ? "1.5px solid var(--accent-color)" : "1px solid var(--border-color-light)",
                      backgroundColor: localSdkMode === mode.id ? "rgba(0, 229, 255, 0.04)" : "var(--bg-tertiary)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <input
                      type="radio"
                      name="sdk_mode_general"
                      checked={localSdkMode === mode.id}
                      onChange={() => setLocalSdkMode(mode.id)}
                      style={{ marginTop: "3px", accentColor: "var(--accent-color)" }}
                    />
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: "700", display: "block", color: "var(--text-primary)" }}>
                        {mode.label}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                        {mode.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Conditional inputs */}
              {localSdkMode === "real_sdk" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", backgroundColor: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-color-light)", animation: "fadeIn 0.3s ease-out" }}>
                  <div>
                    <label style={{ fontSize: "0.74rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                      Alloy Web SDK Version (CDN)
                    </label>
                    <select
                      value={localSdkVersion}
                      onChange={(e) => setLocalSdkVersion(e.target.value)}
                      className="form-input"
                      style={{ padding: "8px 10px", fontSize: "0.8rem", width: "100%", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", color: "var(--text-primary)" }}
                    >
                      <option value="2.19.0">2.19.0 (Recommended)</option>
                      <option value="2.18.0">2.18.0</option>
                      <option value="2.17.0">2.17.0</option>
                      <option value="2.16.0">2.16.0</option>
                      <option value="2.15.0">2.15.0</option>
                    </select>
                  </div>
                  
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                    Status: {" "}
                    <span style={{
                      fontWeight: "700",
                      color: sdkScriptStatus === "ready" ? "var(--success-color)" : sdkScriptStatus === "loading" ? "var(--warning-color)" : sdkScriptStatus === "error" ? "#FF1744" : "var(--text-muted)"
                    }}>
                      {sdkScriptStatus === "ready" ? "● Active (Library Loaded)" : sdkScriptStatus === "loading" ? "● Loading Script..." : sdkScriptStatus === "error" ? "● Script Error (CDN blocked)" : "● Standby"}
                    </span>
                  </div>
                </div>
              )}

              {localSdkMode === "adobe_launch" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "12px", backgroundColor: "var(--bg-tertiary)", borderRadius: "12px", border: "1px solid var(--border-color-light)", animation: "fadeIn 0.3s ease-out" }}>
                  <div>
                    <label style={{ fontSize: "0.74rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                      Adobe Launch Embed Script URL
                    </label>
                    <input
                      type="url"
                      value={localLaunchUrl}
                      onChange={(e) => setLocalLaunchUrl(e.target.value)}
                      placeholder="https://assets.adobedtm.com/.../launch-*.min.js"
                      className="form-input"
                      style={{ padding: "8px 10px", fontSize: "0.8rem" }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const devUrl = "https://assets.adobedtm.com/b95d0bf0a1e0/50cf2a4a7cf5/launch-4b8c9d2c2069-development.min.js";
                        setLocalLaunchUrl(devUrl);
                        showToast("Loaded demo Tags URL", "info");
                      }}
                      className="btn-secondary"
                      style={{ padding: "6px 10px", fontSize: "0.68rem", width: "auto" }}
                    >
                      Load Demo Tag URL
                    </button>
                  </div>
                  
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                    Status: {" "}
                    <span style={{
                      fontWeight: "700",
                      color: launchScriptStatus === "ready" ? "var(--success-color)" : launchScriptStatus === "loading" ? "var(--warning-color)" : launchScriptStatus === "error" ? "#FF1744" : "var(--text-muted)"
                    }}>
                      {launchScriptStatus === "ready" ? "● Active (Container Loaded)" : launchScriptStatus === "loading" ? "● Loading Script..." : launchScriptStatus === "error" ? "● Script Error (Network blocked)" : "● Standby"}
                    </span>
                  </div>
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => saveSdkSettings(localSdkMode, localLaunchUrl, localSdkVersion)}
                className="btn-primary"
                style={{ padding: "10px", fontSize: "0.8rem", marginTop: "4px" }}
              >
                Apply & Inject Container
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Simulation & Demo Tab ─── */}
      {generalSubTab === "simulation" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* AJO Demo & Simulation Configurations */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={16} color="var(--accent-color)" />
                <span>AJO Demo & Simulation</span>
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  color: simForm.useSimulation ? "var(--accent-color)" : "var(--text-muted)",
                  backgroundColor: simForm.useSimulation ? "var(--accent-glow)" : "rgba(100, 100, 100, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  border: "1px solid"
                }}
              >
                {simForm.useSimulation ? "Simulation Active" : "Edge Query Mode"}
              </span>
            </div>

            <form onSubmit={handleSaveSimSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Toggle simulation mode */}
              <div
                onClick={() => handleSimChange(null, "useSimulation", !simForm.useSimulation)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--bg-secondary)",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color-light)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <Layers size={16} color="var(--accent-color)" />
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", display: "block" }}>Enable AJO Simulation</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Bypass real Edge queries and use custom offers below</span>
                  </div>
                </div>
                {simForm.useSimulation ? (
                  <ToggleRight size={28} color="var(--accent-color)" />
                ) : (
                  <ToggleLeft size={28} color="var(--text-muted)" />
                )}
              </div>

              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0", lineHeight: "1.4" }}>
                💡 In Simulation Mode, welcome dialogs and usage dashboard banners are dynamically populated using the configurations below without hitting the Edge Network.
              </p>

              {/* Popup Offer Editor */}
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "14px", borderRadius: "14px", border: "1px solid var(--border-color-light)" }}>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Tv size={14} color="var(--accent-color)" />
                  <span>Welcome Popup Offer</span>
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Badge Text</label>
                      <input type="text" value={simForm.popupOffer?.badge || ""} onChange={(e) => handleSimChange("popupOffer", "badge", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Promo Code</label>
                      <input type="text" value={simForm.popupOffer?.code || ""} onChange={(e) => handleSimChange("popupOffer", "code", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Offer Title</label>
                    <input type="text" value={simForm.popupOffer?.title || ""} onChange={(e) => handleSimChange("popupOffer", "title", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Offer Description</label>
                    <textarea value={simForm.popupOffer?.description || ""} onChange={(e) => handleSimChange("popupOffer", "description", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem", minHeight: "60px", resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                </div>
              </div>

              {/* Dashboard Offer Editor */}
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "14px", borderRadius: "14px", border: "1px solid var(--border-color-light)" }}>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={14} color="var(--accent-color)" />
                  <span>Dashboard Promo Card</span>
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Card Type / Icon</label>
                      <select value={simForm.dashboardOffer?.type || "referral"} onChange={(e) => handleSimChange("dashboardOffer", "type", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }}>
                        <option value="referral">Referral Program</option>
                        <option value="speed">Speed Booster</option>
                        <option value="data">Data Addon</option>
                        <option value="roaming">International Pass</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Button Action Label</label>
                      <input type="text" value={simForm.dashboardOffer?.actionText || ""} onChange={(e) => handleSimChange("dashboardOffer", "actionText", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Card Title</label>
                    <input type="text" value={simForm.dashboardOffer?.title || ""} onChange={(e) => handleSimChange("dashboardOffer", "title", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Card Description</label>
                    <textarea value={simForm.dashboardOffer?.description || ""} onChange={(e) => handleSimChange("dashboardOffer", "description", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem", minHeight: "60px", resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                </div>
              </div>

              {/* Integrated Push Simulator */}
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "14px", borderRadius: "14px", border: "1px solid var(--border-color-light)" }}>
                <h4 style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-primary)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Bell size={14} color="var(--warning-color)" />
                  <span>Simulated Push Campaign</span>
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Push Notification Title</label>
                    <input type="text" value={simForm.mockPush?.title || ""} onChange={(e) => handleSimChange("mockPush", "title", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Push Notification Body</label>
                    <textarea value={simForm.mockPush?.body || ""} onChange={(e) => handleSimChange("mockPush", "body", e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem", minHeight: "50px", resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      triggerNotification(simForm.mockPush?.title, simForm.mockPush?.body);
                      showToast("Mock push notification triggered!", "success");
                    }}
                    className="btn-secondary"
                    style={{
                      padding: "10px",
                      fontSize: "0.78rem",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      borderColor: "var(--warning-color)",
                      color: "var(--warning-color)",
                      backgroundColor: "rgba(255, 214, 0, 0.04)"
                    }}
                  >
                    <Bell size={14} />
                    <span>Deliver Mock Push Notification</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: "12px", fontSize: "0.8rem", marginTop: "6px" }}>
                Save Simulation Settings
              </button>
            </form>
          </div>

          {/* AJO to App Webhook Push Listener Setup */}
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Bell size={16} color="var(--accent-color)" />
                <span>AJO-to-App Push Webhook</span>
              </h3>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  color: pushListenerEnabled ? "var(--success-color)" : "var(--text-muted)",
                  backgroundColor: pushListenerEnabled ? "var(--success-glow)" : "rgba(100, 100, 100, 0.08)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  border: "1px solid"
                }}
              >
                {pushListenerEnabled ? "Listener Active" : "Disabled"}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
                Configure real-time AJO Campaign triggers targeting the app directly. By sending HTTP POST webhooks, AJO journeys can push message payloads directly to this browser instance.
              </p>

              {/* Toggle background listener */}
              <div
                onClick={() => savePushListenerEnabled(!pushListenerEnabled)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--bg-secondary)",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-color-light)",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <Bell size={16} color="var(--accent-color)" />
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", display: "block" }}>Webhook Push Listener</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>Listen for inbound Adobe Journey Optimizer webhook posts</span>
                  </div>
                </div>
                {pushListenerEnabled ? (
                  <ToggleRight size={28} color="var(--success-color)" />
                ) : (
                  <ToggleLeft size={28} color="var(--text-muted)" />
                )}
              </div>

              {/* Channel / Topic Editor */}
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "14px", borderRadius: "14px", border: "1px solid var(--border-color-light)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Notification Channel Topic</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input type="text" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} className="form-input" style={{ padding: "8px 10px", fontSize: "0.8rem", flex: 1 }} />
                    <button
                      type="button"
                      onClick={() => {
                        savePushListenerTopic(topicInput);
                        showToast("Webhook channel topic saved!", "success");
                      }}
                      className="btn-primary"
                      style={{ padding: "8px 14px", fontSize: "0.76rem", width: "auto" }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Webhook Endpoint Guide */}
              <div style={{ backgroundColor: "var(--bg-tertiary)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border-color-light)", fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                <span style={{ fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>🔗 Webhook Setup Instructions</span>
                To trigger alerts from AJO, configure a Webhook / Custom Action in your journey targeting the endpoint:
                <code style={{ display: "block", margin: "6px 0", padding: "8px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--accent-color)", wordBreak: "break-all" }}>
                  https://ntfy.sh/{pushListenerTopic}
                </code>
                Specify parameters in your request:
                <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <li><strong>HTTP Method:</strong> <code>POST</code></li>
                  <li><strong>Header <code>Title</code>:</strong> Campaign notification title</li>
                  <li><strong>Body (Raw/Text):</strong> Campaign body description message</li>
                </ul>
              </div>

              {/* Quick-Test cURL trigger */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>Quick Terminal Test (cURL)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <code style={{ flex: 1, padding: "8px 10px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color-light)", borderRadius: "8px", fontSize: "0.66rem", fontFamily: "var(--font-mono)", overflowX: "auto", whiteSpace: "nowrap", display: "flex", alignItems: "center", color: "var(--text-muted)" }}>
                    curl -d "Hello from AJO Sandbox!" -H "Title: eSIM Upgrade" https://ntfy.sh/{pushListenerTopic}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      const cmd = `curl -d "Hello from AJO Sandbox!" -H "Title: eSIM Upgrade" https://ntfy.sh/${pushListenerTopic}`;
                      navigator.clipboard.writeText(cmd);
                      showToast("cURL command copied to clipboard!", "success");
                    }}
                    className="btn-secondary"
                    style={{ padding: "8px 12px", fontSize: "0.72rem", width: "auto", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Usecase Library Tab ─── */}
      {generalSubTab === "usecases" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "40px" }}>
          {selectedUsecase === null ? (
            <>
              <div>
                <h3 style={{ fontSize: "1rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                  AEP / AJO Integration Test Suite
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
                  Learn how to configure Adobe workspaces and use Aether Connect to run realistic end-to-end personalization and analytics use cases.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {usecases.map((usecase) => {
                  let Icon = Sparkles;
                  if (usecase.id === "popup") Icon = Layers;
                  else if (usecase.id === "checkout") Icon = CreditCard;
                  else if (usecase.id === "webhook") Icon = Bell;

                  return (
                    <div
                      key={usecase.id}
                      onClick={() => setSelectedUsecase(usecase)}
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-color-light)",
                        borderRadius: "16px",
                        padding: "18px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        transition: "all 0.2s ease-in-out",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "var(--accent-color)";
                        e.currentTarget.style.boxShadow = "0 4px 12px var(--accent-glow)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "var(--border-color-light)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          backgroundColor: "rgba(0, 229, 255, 0.08)",
                          color: "var(--accent-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <Icon size={22} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "0.86rem", fontWeight: "700", display: "block", color: "var(--text-primary)", marginBottom: "4px" }}>
                          {usecase.title}
                        </span>
                        <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: "1.3", display: "block" }}>
                          {usecase.summary}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <button
                onClick={() => setSelectedUsecase(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "none",
                  background: "none",
                  color: "var(--accent-color)",
                  fontSize: "0.8rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  padding: 0,
                  width: "fit-content"
                }}
              >
                <span>← Back to Library</span>
              </button>

              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
                  {selectedUsecase.title}
                </h3>
              </div>

              {/* Looping Demo Animation */}
              <div
                style={{
                  position: "relative",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "#000",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                  aspectRatio: "1.5 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL || '/'}${selectedUsecase.image ? 'images/' + selectedUsecase.image : ''}`}
                  alt={selectedUsecase.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "0.58rem", fontWeight: "700", padding: "4px 8px", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Looping Demo
                </div>
              </div>

              {/* Goal / Overview */}
              <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color-light)", padding: "18px" }}>
                <h4 style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent-color)", margin: "0 0 8px 0" }}>
                  Goal & Usecase Overview
                </h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>
                  {selectedUsecase.overview}
                </p>
              </div>

              {/* Step 1: AEP Portal */}
              <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color-light)", padding: "18px" }}>
                <h4 style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color-light)", paddingBottom: "6px" }}>
                  1. Configure Adobe AEP / AJO Console
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedUsecase.aepSteps.map((step, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1.5px solid var(--border-color)",
                        color: "var(--text-secondary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.68rem", fontWeight: "700", flexShrink: 0, marginTop: "1px"
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        {step.replace("{pushListenerTopic}", pushListenerTopic)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: App Setup */}
              <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color-light)", padding: "18px" }}>
                <h4 style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-primary)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color-light)", paddingBottom: "6px" }}>
                  2. Configure App Settings
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedUsecase.appSteps.map((step, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        border: "1.5px solid var(--border-color)",
                        color: "var(--text-secondary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.68rem", fontWeight: "700", flexShrink: 0, marginTop: "1px"
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Run & Verify */}
              <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color-light)", padding: "18px" }}>
                <h4 style={{ fontSize: "0.78rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--success-color)", margin: "0 0 12px 0", borderBottom: "1px solid var(--border-color-light)", paddingBottom: "6px" }}>
                  3. Run & Verify Test
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedUsecase.validationSteps.map((step, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: "rgba(0, 230, 118, 0.08)",
                        border: "1.5px solid var(--success-color)",
                        color: "var(--success-color)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.68rem", fontWeight: "700", flexShrink: 0, marginTop: "1px"
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick-Action Settings link */}
              <button
                type="button"
                onClick={() => {
                  setGeneralSubTab("aep");
                  setSelectedUsecase(null);
                }}
                className="btn-primary"
                style={{ padding: "12px", fontSize: "0.8rem", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <span>Go to AEP Gateway Settings</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* AEP Assurance QR Code Scanner Sheet Overlay */}
      {isAssuranceScannerOpen && (
        <>
          <div className="sheet-backdrop open" onClick={handleCloseScanner} />
          <div className="bottom-sheet open" style={{ minHeight: "440px" }}>
            <div className="bottom-sheet-drag-handle" />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 24px", alignItems: "center" }}>
              <span className="pill-tag" style={{ background: "var(--accent-glow)", color: "var(--accent-color)" }}>Assurance Scanner</span>
              <button
                onClick={handleCloseScanner}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-primary)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="bottom-sheet-content" style={{ textAlign: "center", paddingBottom: "40px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "6px" }}>
                Scan Assurance Session
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "280px", margin: "0 auto 20px" }}>
                Hold your phone camera up to the QR code inside the Adobe Experience Platform Assurance console to sync.
              </p>

              {/* Styled Viewport */}
              <div
                style={{
                  width: "240px", height: "160px",
                  backgroundColor: "#000", borderRadius: "16px",
                  border: "2px solid var(--accent-color)",
                  position: "relative", margin: "0 auto 24px", overflow: "hidden",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 20px var(--accent-glow)",
                }}
              >
                <video ref={videoRef} autoPlay playsInline muted
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    display: cameraError || !cameraStream ? "none" : "block",
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
                  }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div
                  style={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "3px",
                    backgroundColor: "var(--accent-color)", boxShadow: "0 0 10px var(--accent-color)",
                    animation: "scanner-laser 2s infinite ease-in-out", zIndex: 3,
                  }}
                />
                <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: "2px solid #fff", borderLeft: "2px solid #fff", zIndex: 4 }} />
                <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: "2px solid #fff", borderRight: "2px solid #fff", zIndex: 4 }} />
                <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: "2px solid #fff", borderLeft: "2px solid #fff", zIndex: 4 }} />
                <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: "2px solid #fff", borderRight: "2px solid #fff", zIndex: 4 }} />

                {(cameraError || !cameraStream) && (
                  <div style={{ zIndex: 2, padding: "0 16px", color: "var(--text-secondary)", fontSize: "0.74rem", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", letterSpacing: "0.05em", color: cameraError ? "#FF1744" : "var(--accent-color)", animation: cameraError ? "none" : "pulse 1.5s infinite" }}>
                      {cameraError ? "CAMERA ERROR" : "REQUESTING CAMERA..."}
                    </span>
                    <span style={{ fontSize: "0.62rem", textAlign: "center", color: "var(--text-muted)", lineHeight: "1.4" }}>
                      {cameraError ? cameraError : "Please allow device camera permission in the popup."}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Simulation handlers */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "0 16px" }}>
                <button
                  onClick={() => {
                    const mockUrl = "https://kotisyamala.github.io/mobileAppAEPAJO/?adb_validation_sessionid=mock-qr-session-9042";
                    connectAssuranceSession(mockUrl, "7890");
                    handleCloseScanner();
                  }}
                  className="btn-primary"
                  style={{ padding: "12px", fontSize: "0.85rem" }}
                >
                  Simulate QR Scan (Connects Trace)
                </button>
                <button onClick={handleCloseScanner} className="btn-secondary" style={{ padding: "12px", fontSize: "0.85rem" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GeneralSettings;
