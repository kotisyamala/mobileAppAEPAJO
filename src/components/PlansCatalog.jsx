import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { plans } from "../data/plans";
import { Check, ShieldCheck, Rss, Smartphone, Cpu } from "lucide-react";

const PlansCatalog = () => {
  const { activePlan, changePlan, showToast } = useApp();
  
  // eSIM activation states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStep, setProvisionStep] = useState(0); // 0: Connect, 1: Provisioning, 2: Done

  const startProvisioning = (plan) => {
    setSelectedPlan(plan);
    setIsProvisioning(true);
    setProvisionStep(0);

    // Step 0 -> Step 1
    setTimeout(() => {
      setProvisionStep(1);
      // Step 1 -> Step 2
      setTimeout(() => {
        setProvisionStep(2);
      }, 1500);
    }, 1200);
  };

  const completeProvisioning = () => {
    changePlan(selectedPlan);
    setIsProvisioning(false);
    setSelectedPlan(null);
    setProvisionStep(0);
  };

  return (
    <div className="fade-in" style={{ padding: "20px" }}>
      <h2 style={{ fontSize: "1.4rem", marginBottom: "6px", color: "var(--text-primary)" }}>Data Plans</h2>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Select a network subscription profile. All plans support instant eSIM installation.
      </p>

      {/* Plans list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {plans.map((plan) => {
          const isActive = activePlan.id === plan.id;
          
          return (
            <div
              key={plan.id}
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "20px",
                border: isActive ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                padding: "24px 20px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                boxShadow: isActive ? "0 4px 20px var(--accent-glow)" : "var(--shadow-sm)",
                transition: "var(--transition-smooth)",
              }}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 20,
                    backgroundColor: "var(--accent-color)",
                    color: "var(--accent-contrast)",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    boxShadow: "0 0 10px var(--accent-color)",
                  }}
                >
                  Recommended
                </span>
              )}

              {/* Title, limit & pricing */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "4px" }}>
                    {plan.name}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    High-speed 5G connectivity
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", display: "block" }}>
                    ${plan.price.toFixed(0)}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>/ month</span>
                </div>
              </div>

              {/* Specs list */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {plan.details.map((detail, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <Check size={14} color="var(--accent-color)" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Action buttons */}
              {isActive ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    padding: "14px",
                    borderRadius: "14px",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <ShieldCheck size={16} color="var(--success-color)" />
                  Active Subscription
                </div>
              ) : (
                <button onClick={() => startProvisioning(plan)} className="btn-primary">
                  Subscribe & Install eSIM
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Provisioning overlay modal */}
      {isProvisioning && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 60,
            backgroundColor: "var(--bg-primary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            animation: "fadeIn 0.3s ease-out forwards",
          }}
        >
          {provisionStep < 2 ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
              {/* Spinner animation */}
              <div style={{ position: "relative", width: "80px", height: "80px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    border: "4px solid var(--border-color)",
                    borderTopColor: "var(--accent-color)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    boxShadow: "0 0 10px var(--accent-glow)",
                  }}
                />
                <Cpu
                  size={28}
                  style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    color: "var(--accent-color)",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              </div>

              <div>
                <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "8px" }}>
                  {provisionStep === 0 ? "Connecting to Carrier..." : "Provisioning eSIM profile..."}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "260px" }}>
                  {provisionStep === 0
                    ? "Establishing secure connection with Aether profile distribution node."
                    : "Writing cryptographic network credentials to device secure enclave."}
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "24px",
                animation: "scaleIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "var(--success-color)",
                  color: "var(--accent-contrast)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px var(--success-glow)",
                }}
              >
                <Check size={36} strokeWidth={3} />
              </div>

              <div>
                <h3 style={{ fontSize: "1.35rem", color: "var(--text-primary)", marginBottom: "8px" }}>
                  eSIM Ready
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "240px" }}>
                  Your subscription for <strong>{selectedPlan?.name}</strong> has been successfully configured on this device.
                </p>
              </div>

              <button onClick={completeProvisioning} className="btn-primary" style={{ minWidth: "180px", marginTop: "16px" }}>
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansCatalog;
