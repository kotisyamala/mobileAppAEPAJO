import React from "react";
import { useApp } from "../context/AppContext";
import { boosters } from "../data/plans";
import { X, Zap, Globe, Share2 } from "lucide-react";

const AddonModal = () => {
  const { isAddonOpen, setIsAddonOpen, buyBooster } = useApp();

  if (!isAddonOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="sheet-backdrop open" onClick={() => setIsAddonOpen(false)} />

      {/* Slidable Sheet */}
      <div className="bottom-sheet open">
        <div className="bottom-sheet-drag-handle" />

        {/* Toolbar Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 24px",
            alignItems: "center",
          }}
        >
          <span className="pill-tag">Speeds Boosters</span>
          <button
            onClick={() => setIsAddonOpen(false)}
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

        {/* Content catalog */}
        <div className="bottom-sheet-content">
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "4px" }}>
            Buy Speed Boosters
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Add speed allocations or roaming features instantly to your current eSIM configuration.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {boosters.map((booster) => {
              let Icon = Zap;
              let iconColor = "var(--accent-color)";

              if (booster.type === "roaming") {
                Icon = Globe;
                iconColor = "var(--success-color)";
              } else if (booster.type === "hotspot") {
                Icon = Share2;
                iconColor = "var(--warning-color)";
              }

              return (
                <div
                  key={booster.id}
                  onClick={() => buyBooster(booster)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    padding: "16px 18px",
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                  }}
                  className="booster-row"
                >
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: "var(--bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: iconColor,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)", display: "block" }}>
                        {booster.name}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", maxWidth: "200px" }}>
                        {booster.description}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", display: "block" }}>
                      +${booster.price.toFixed(0)}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>One-time charge</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddonModal;
