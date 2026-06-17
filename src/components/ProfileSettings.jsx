import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CreditCard, Download, ShieldCheck, Sun, Moon, QrCode, ToggleLeft, ToggleRight, X } from "lucide-react";

const ProfileSettings = () => {
  const {
    activePlan,
    theme,
    toggleTheme,
    isAutoPayEnabled,
    toggleAutoPay,
    showToast,
    ajoCredentials,
    saveAjoCredentials,
    isAjoLoading,
    assuranceSessionId,
    clearAssuranceSession,
    assuranceSessionPin,
    connectAssuranceSession,
  } = useApp();

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [formCreds, setFormCreds] = useState({ ...ajoCredentials });
  const [assuranceInput, setAssuranceInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [isAssuranceScannerOpen, setIsAssuranceScannerOpen] = useState(false);

  // Camera integration logic
  const videoRef = React.useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const handleOpenScanner = async () => {
    setIsAssuranceScannerOpen(true);
    setCameraError(null);
    setCameraStream(null);

    // Call getUserMedia synchronously inside the user gesture callback for iOS PWA/Safari compliance
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

  // Bind video stream once the video element is mounted and stream is active
  React.useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Ensure camera tracks are closed if the component unmounts
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

  const downloadInvoice = (invoiceNum) => {
    showToast(`Invoice AET-${invoiceNum}.pdf downloaded successfully!`);
  };

  const invoices = [
    { num: "INV-94218", date: "May 30, 2026", amount: 45.00 },
    { num: "INV-92842", date: "Apr 30, 2026", amount: 45.00 }
  ];

  return (
    <div className="fade-in" style={{ padding: "24px 20px" }}>
      {/* Account Profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: "var(--accent-color)",
            color: "var(--accent-contrast)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            fontWeight: "700",
            boxShadow: "0 0 12px var(--accent-glow)",
          }}
        >
          JD
        </div>
        <div>
          <h2 style={{ fontSize: "1.2rem", margin: 0, color: "var(--text-primary)" }}>John Doe</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--accent-color)", fontWeight: "600", letterSpacing: "0.02em" }}>
            AETHER VIP PRIORITY MEMBER
          </span>
        </div>
      </div>

      {/* Main Settings section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>
          Settings & Preferences
        </h3>

        {/* eSIM profile check */}
        <div
          onClick={() => setIsQrOpen(true)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--bg-secondary)",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid var(--border-color-light)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <QrCode size={18} color="var(--accent-color)" />
            <div>
              <span style={{ fontSize: "0.88rem", fontWeight: "600", display: "block" }}>eSIM Profiles</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>View QR Code configuration details</span>
            </div>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>View</span>
        </div>

        {/* Auto pay toggle */}
        <div
          onClick={toggleAutoPay}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--bg-secondary)",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid var(--border-color-light)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <CreditCard size={18} color="var(--success-color)" />
            <div>
              <span style={{ fontSize: "0.88rem", fontWeight: "600", display: "block" }}>Auto-Pay Invoice billing</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Visa ending in 1234</span>
            </div>
          </div>
          {isAutoPayEnabled ? (
            <ToggleRight size={28} color="var(--success-color)" />
          ) : (
            <ToggleLeft size={28} color="var(--text-muted)" />
          )}
        </div>

        {/* Light / Dark Mode Toggle */}
        <div
          onClick={toggleTheme}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--bg-secondary)",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid var(--border-color-light)",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {theme === "light" ? <Sun size={18} color="#FFD600" /> : <Moon size={18} color="var(--accent-color)" />}
            <div>
              <span style={{ fontSize: "0.88rem", fontWeight: "600", display: "block" }}>Interface Theme</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>Currently {theme} mode</span>
            </div>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
            {theme}
          </span>
        </div>
      </div>

      {/* Adobe Journey Optimizer (AJO) Settings Form */}
      <div style={{ marginBottom: "32px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
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
            <input
              type="text"
              name="datastreamId"
              value={formCreds.datastreamId}
              onChange={handleCredChange}
              placeholder="e.g. 1a2b3c4d-..."
              className="form-input"
              style={{ padding: "10px 12px", fontSize: "0.85rem" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>IMS Org ID</label>
            <input
              type="text"
              name="orgId"
              value={formCreds.orgId}
              onChange={handleCredChange}
              placeholder="e.g. 123456789@AdobeOrg"
              className="form-input"
              style={{ padding: "10px 12px", fontSize: "0.85rem" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Popup Surface URI</label>
              <input
                type="text"
                name="popupSurface"
                value={formCreds.popupSurface}
                onChange={handleCredChange}
                placeholder="mobileapp://aether-connect/popup"
                className="form-input"
                style={{ padding: "10px 12px", fontSize: "0.85rem" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Dashboard Surface URI</label>
              <input
                type="text"
                name="dashboardSurface"
                value={formCreds.dashboardSurface}
                onChange={handleCredChange}
                placeholder="mobileapp://aether-connect/dashboard"
                className="form-input"
                style={{ padding: "10px 12px", fontSize: "0.85rem" }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isAjoLoading}
            className="btn-primary"
            style={{ padding: "12px", fontSize: "0.8rem", marginTop: "6px" }}
          >
            {isAjoLoading ? "Fetching propositions..." : "Save & Sync Offers"}
          </button>
        </form>
      </div>

      {/* AEP Assurance Tracing Setup */}
      <div style={{ marginBottom: "32px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
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
              <input
                type="text"
                value={assuranceInput}
                onChange={(e) => setAssuranceInput(e.target.value)}
                placeholder="Paste Assurance link here..."
                className="form-input"
                style={{ padding: "10px 12px", fontSize: "0.85rem" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Session PIN (Optional)</label>
              <input
                type="text"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="e.g. 1234"
                className="form-input"
                style={{ padding: "10px 12px", fontSize: "0.85rem" }}
              />
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

      {/* Invoice download widgets */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "4px" }}>
          Statement History
        </h3>

        {invoices.map((inv) => (
          <div
            key={inv.num}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "var(--bg-secondary)",
              padding: "14px 18px",
              borderRadius: "14px",
              border: "1px solid var(--border-color-light)",
            }}
          >
            <div>
              <span style={{ fontSize: "0.86rem", fontWeight: "600", display: "block" }}>{inv.date}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Invoice AET-{inv.num}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "0.92rem", fontWeight: "700" }}>${inv.amount.toFixed(2)}</span>
              <button
                onClick={() => downloadInvoice(inv.num)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Download Invoice PDF"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* eSIM Profile QR Code Sheet Overlay */}
      {isQrOpen && (
        <>
          <div className="sheet-backdrop open" onClick={() => setIsQrOpen(false)} />
          <div className="bottom-sheet open">
            <div className="bottom-sheet-drag-handle" />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 24px", alignItems: "center" }}>
              <span className="pill-tag">Profile eSIM</span>
              <button
                onClick={() => setIsQrOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-primary)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="bottom-sheet-content" style={{ textAlign: "center", paddingBottom: "40px" }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "6px" }}>
                Scan eSIM Profile
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "260px", margin: "0 auto 24px" }}>
                Scan this QR code in your device settings to automatically configure your active <strong>{activePlan.name}</strong>.
              </p>

              {/* Vector Mock QR Code */}
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "16px",
                  margin: "0 auto 24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.05)",
                }}
              >
                {/* Simulated QR blocks drawing */}
                <div style={{ display: "flex", height: "30%" }}>
                  <div style={{ width: "30%", backgroundColor: "#111", border: "2px solid #fff" }} />
                  <div style={{ width: "40%" }} />
                  <div style={{ width: "30%", backgroundColor: "#111", border: "2px solid #fff" }} />
                </div>
                <div style={{ display: "flex", height: "30%" }} />
                <div style={{ display: "flex", height: "30%" }}>
                  <div style={{ width: "30%", backgroundColor: "#111", border: "2px solid #fff" }} />
                  <div style={{ width: "40%" }} />
                  <div style={{ width: "30%", backgroundColor: "#111" }} />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px dashed var(--border-color)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  width: "fit-content",
                  margin: "0 auto",
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <ShieldCheck size={14} color="var(--success-color)" />
                <span>PROFILE ID: AET-5G-PROFILE-9042</span>
              </div>
            </div>
          </div>
        </>
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
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  width: "240px",
                  height: "160px",
                  backgroundColor: "#000",
                  borderRadius: "16px",
                  border: "2px solid var(--accent-color)",
                  position: "relative",
                  margin: "0 auto 24px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px var(--accent-glow)",
                }}
              >
                {/* Real video webcam stream tag */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: cameraError || !cameraStream ? "none" : "block",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                  }}
                />

                {/* Horizontal Pulsing Laser Sweeper Line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "3px",
                    backgroundColor: "var(--accent-color)",
                    boxShadow: "0 0 10px var(--accent-color)",
                    animation: "scanner-laser 2s infinite ease-in-out",
                    zIndex: 3,
                  }}
                />

                {/* Corner grid guides */}
                <div style={{ position: "absolute", top: 12, left: 12, width: 16, height: 16, borderTop: "2px solid #fff", borderLeft: "2px solid #fff", zIndex: 4 }} />
                <div style={{ position: "absolute", top: 12, right: 12, width: 16, height: 16, borderTop: "2px solid #fff", borderRight: "2px solid #fff", zIndex: 4 }} />
                <div style={{ position: "absolute", bottom: 12, left: 12, width: 16, height: 16, borderBottom: "2px solid #fff", borderLeft: "2px solid #fff", zIndex: 4 }} />
                <div style={{ position: "absolute", bottom: 12, right: 12, width: 16, height: 16, borderBottom: "2px solid #fff", borderRight: "2px solid #fff", zIndex: 4 }} />

                {/* Loader status, displayed if camera stream loading or errored */}
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
                <button
                  onClick={handleCloseScanner}
                  className="btn-secondary"
                  style={{ padding: "12px", fontSize: "0.85rem" }}
                >
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

export default ProfileSettings;
