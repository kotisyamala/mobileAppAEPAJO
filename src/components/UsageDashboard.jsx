import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Wifi, Plus, CreditCard, Activity, Cpu, Play, Gift, Sparkles, Smartphone, AlertTriangle } from "lucide-react";

// Reusable Circular SVG Progress Meter Component
const CircularProgress = ({ value, max, size = 90, strokeWidth = 8, color = "var(--accent-color)" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-flex", justifyContent: "center", alignItems: "center" }}>
      <svg width={size} height={size}>
        {/* Background track circle */}
        <circle
          className="progress-ring-circle"
          stroke="var(--border-color-light)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Glowing progress circle */}
        <circle
          className="progress-ring-circle"
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
          }}
        />
      </svg>
      {/* Center text overlay */}
      <div style={{ position: "absolute", textAlign: "center", display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: "700", fontFamily: "var(--font-sans)", color: "var(--text-primary)" }}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

const UsageDashboard = () => {
  const {
    activePlan,
    dataUsed,
    dataLimit,
    minsUsed,
    minsLimit,
    smsUsed,
    smsLimit,
    nextBillDate,
    nextBillAmount,
    boostersActive,
    setIsAddonOpen,
    showToast,
    ajoOffers,
    ajoError,
  } = useApp();

  // Speed test simulation state
  const [speedTestState, setSpeedTestState] = useState("idle"); // idle, running, complete
  const [speedData, setSpeedData] = useState({ ping: 0, download: 0, upload: 0 });

  const runSpeedTest = () => {
    if (speedTestState === "running") return;
    setSpeedTestState("running");
    
    // Simulate testing sequences
    setTimeout(() => {
      setSpeedData({ ping: 12, download: 180, upload: 24 });
      setSpeedTestState("complete");
      showToast("Speed diagnosis check complete!");
    }, 2000);
  };

  const isDataWarning = dataUsed / dataLimit > 0.8;

  const dashboardOffer = ajoOffers?.dashboardOffer;

  return (
    <div className="fade-in" style={{ padding: "20px" }}>
      {/* Network Status Header widget */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          padding: "12px 18px",
          borderRadius: "14px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Wifi size={18} color="var(--accent-color)" style={{ filter: "drop-shadow(0 0 4px var(--accent-color))" }} />
          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", display: "block" }}>Aether 5G Network</span>
            <span style={{ fontSize: "0.7rem", color: "var(--success-color)", fontWeight: "500" }}>● All Systems Operational</span>
          </div>
        </div>
        <span
          style={{
            fontSize: "0.68rem",
            fontFamily: "var(--font-mono)",
            background: "var(--bg-tertiary)",
            padding: "4px 8px",
            borderRadius: "6px",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color-light)",
          }}
        >
          eSIM ACTV
        </span>
      </div>

      {/* Usage meters dashboard */}
      <div className="glow-card" style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "16px", color: "var(--text-primary)" }}>Usage Summary</h3>
        
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
          {/* Data limit gauge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <CircularProgress value={dataUsed} max={dataLimit} color="var(--accent-color)" />
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block" }}>Mobile Data</span>
              <span style={{ fontSize: "0.82rem", fontWeight: "700" }}>{dataUsed.toFixed(1)} / {dataLimit} GB</span>
            </div>
          </div>

          {/* Voice minutes limit gauge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <CircularProgress value={minsUsed} max={minsLimit} color="var(--success-color)" />
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block" }}>Voice mins</span>
              <span style={{ fontSize: "0.82rem", fontWeight: "700" }}>{minsUsed} / {minsLimit} Mins</span>
            </div>
          </div>

          {/* SMS limit gauge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <CircularProgress value={smsUsed} max={smsLimit} color="var(--warning-color)" />
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block" }}>SMS Messages</span>
              <span style={{ fontSize: "0.82rem", fontWeight: "700" }}>{smsUsed} / {smsLimit}</span>
            </div>
          </div>
        </div>

        {/* High Data Warning */}
        {isDataWarning && (
          <div
            style={{
              backgroundColor: "rgba(255, 214, 0, 0.1)",
              border: "1px dashed var(--warning-color)",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "0.78rem",
              color: "var(--warning-color)",
              marginBottom: "16px",
            }}
          >
            Warning: You have used over 80% of your high-speed data. Buy a data booster to prevent network throttling.
          </div>
        )}

        <button onClick={() => setIsAddonOpen(true)} className="btn-primary" style={{ padding: "12px" }}>
          <Plus size={16} />
          Buy Speed Booster Addon
        </button>
      </div>

      {/* Active boosters list */}
      {boostersActive.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: "600", marginBottom: "8px", color: "var(--text-secondary)" }}>
            Active Add-on Passes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {boostersActive.map((b, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px dashed var(--border-color)",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                }}
              >
                <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{b.name}</span>
                <span style={{ color: "var(--accent-color)" }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bill summary widget */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          padding: "16px 20px",
          borderRadius: "18px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Next Invoice Due ({nextBillDate})
          </span>
          <span style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--text-primary)" }}>
            ${nextBillAmount.toFixed(2)}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--text-muted)", fontSize: "0.78rem" }}>
          <CreditCard size={14} />
          <span>AutoPay Active</span>
        </div>
      </div>

      {/* Exclusive Offers & Contextual Promo Sections */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", color: "var(--text-primary)" }}>
          Exclusive Offers
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 1. Contextual Dynamic Offer based on current data limit usage */}
          {isDataWarning ? (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(255, 214, 0, 0.1) 0%, rgba(255, 170, 0, 0.05) 100%)",
                border: "1px dashed var(--warning-color)",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <Sparkles size={20} color="var(--warning-color)" style={{ marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  Double Data Booster Promo
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "12px", lineHeight: "1.4" }}>
                  Low on speed? Get twice the value. Purchase a +10GB booster pass today for just $15.
                </span>
                <button
                  onClick={() => setIsAddonOpen(true)}
                  style={{
                    backgroundColor: "var(--text-primary)",
                    color: "var(--bg-primary)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                  }}
                >
                  Buy Boosters
                </button>
              </div>
            </div>
          ) : ajoError ? (
            <div
              style={{
                background: "rgba(255, 23, 68, 0.08)",
                border: "1px dashed #FF1744",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <AlertTriangle size={20} color="#FF1744" style={{ marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#FF1744", display: "block", marginBottom: "4px" }}>
                  AJO Decision Fetch Failed
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", lineHeight: "1.4" }}>
                  {ajoError}
                </span>
              </div>
            </div>
          ) : !dashboardOffer ? (
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px dashed var(--border-color)",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <AlertTriangle size={20} color="var(--text-muted)" style={{ marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  No Active Personalization Offers
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", lineHeight: "1.4" }}>
                  No personalization propositions are currently active for this device profile surface scope.
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(0, 102, 255, 0.03) 100%)",
                border: "1px dashed var(--accent-color)",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <Gift size={20} color="var(--accent-color)" style={{ marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                  {dashboardOffer.title}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "12px", lineHeight: "1.4" }}>
                  {dashboardOffer.description}
                </span>
                <button
                  onClick={() => showToast(dashboardOffer.type === "referral" ? "Referral link copied to clipboard!" : "AJO Promotion claimed!", "success")}
                  style={{
                    backgroundColor: "var(--text-primary)",
                    color: "var(--bg-primary)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    fontWeight: "700",
                  }}
                >
                  {dashboardOffer.actionText}
                </button>
              </div>
            </div>
          )}

          {/* 2. Static Host Smartwatch Promo Offer */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(0, 230, 118, 0.1) 0%, rgba(0, 166, 80, 0.03) 100%)",
              border: "1px dashed var(--success-color)",
              padding: "16px",
              borderRadius: "16px",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            <Smartphone size={20} color="var(--success-color)" style={{ marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "4px" }}>
                Add Smartwatch eSIM • $5/mo
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "12px", lineHeight: "1.4" }}>
                Extend cellular access directly to your smart watch. Sync numbers, notifications, and data pools instantly.
              </span>
              <button
                onClick={() => {
                  showToast("Scanning for watch profiles... smartwatch eSIM linked!", "success");
                }}
                style={{
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-primary)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                }}
              >
                Link Watch eSIM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Diagnostic Speed Test */}
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          padding: "18px 20px",
          borderRadius: "18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-primary)" }}>
              Network Speed Check
            </h4>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Diagnose actual 5G channel velocity
            </span>
          </div>
          <button
            onClick={runSpeedTest}
            disabled={speedTestState === "running"}
            className="header-action-btn"
            style={{ width: "36px", height: "36px", borderRadius: "8px" }}
          >
            <Play size={14} fill={speedTestState === "running" ? "none" : "currentColor"} />
          </button>
        </div>

        {speedTestState === "running" && (
          <div style={{ textAlign: "center", padding: "10px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                border: "2.5px solid var(--accent-glow)",
                borderTopColor: "var(--accent-color)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 8px",
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Connecting to server...</span>
          </div>
        )}

        {speedTestState === "complete" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              textAlign: "center",
              animation: "fadeIn 0.4s ease-out forwards",
            }}
          >
            <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "10px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>PING</span>
              <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--accent-color)", fontFamily: "var(--font-mono)" }}>
                {speedData.ping} ms
              </span>
            </div>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "10px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>DOWNLOAD</span>
              <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--success-color)", fontFamily: "var(--font-mono)" }}>
                {speedData.download} Mbps
              </span>
            </div>
            <div style={{ background: "var(--bg-tertiary)", padding: "10px", borderRadius: "10px" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block" }}>UPLOAD</span>
              <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                {speedData.upload} Mbps
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageDashboard;
