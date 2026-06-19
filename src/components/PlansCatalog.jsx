import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { plans, techProducts } from "../data/plans";
import { Check, ShieldCheck, ShoppingCart, ArrowRight, Cpu } from "lucide-react";

const PlansCatalog = () => {
  const { 
    activePlan, 
    cart, 
    addToCart, 
    setActiveTab
  } = useApp();
  
  const [catalogTab, setCatalogTab] = useState("plans"); // "plans" | "devices"

  // Calculate cart details
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Helper to compile relative image paths
  const getImageUrl = (imagePath) => {
    return `${import.meta.env.BASE_URL || '/'}${imagePath}`;
  };

  return (
    <div className="fade-in" style={{ padding: "20px", paddingBottom: "120px" }}>
      <h2 style={{ fontSize: "1.4rem", marginBottom: "6px", color: "var(--text-primary)" }}>Shop Catalog</h2>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Configure network data subscriptions or purchase premium cellular hardware components.
      </p>

      {/* Category selector toggle tab */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", padding: "4px", backgroundColor: "var(--bg-tertiary)", borderRadius: "14px", border: "1px solid var(--border-color-light)" }}>
        <button
          onClick={() => setCatalogTab("plans")}
          style={{
            flex: 1,
            padding: "10px 0",
            fontSize: "0.78rem",
            fontWeight: "700",
            borderRadius: "10px",
            backgroundColor: catalogTab === "plans" ? "var(--bg-secondary)" : "transparent",
            color: catalogTab === "plans" ? "var(--accent-color)" : "var(--text-secondary)",
            border: catalogTab === "plans" ? "1px solid var(--border-color)" : "1px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          eSIM Plans
        </button>
        <button
          onClick={() => setCatalogTab("devices")}
          style={{
            flex: 1,
            padding: "10px 0",
            fontSize: "0.78rem",
            fontWeight: "700",
            borderRadius: "10px",
            backgroundColor: catalogTab === "devices" ? "var(--bg-secondary)" : "transparent",
            color: catalogTab === "devices" ? "var(--accent-color)" : "var(--text-secondary)",
            border: catalogTab === "devices" ? "1px solid var(--border-color)" : "1px solid transparent",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          Tech Devices
        </button>
      </div>

      {/* eSIM Plans List */}
      {catalogTab === "plans" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {plans.map((plan) => {
            const isActive = activePlan.id === plan.id;
            const isInCart = cart.some(item => item.id === plan.id);
            
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
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px", padding: 0 }}>
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
                  <button 
                    onClick={() => addToCart(plan, "plan")} 
                    className="btn-primary"
                  >
                    {isInCart ? "In Cart 🛒" : "Add eSIM to Cart"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tech Devices List */}
      {catalogTab === "devices" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {techProducts.map((prod) => {
            const isInCart = cart.some(item => item.id === prod.id);
            
            return (
              <div
                key={prod.id}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "20px",
                  border: isInCart ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                  padding: "24px 20px",
                  display: "flex",
                  gap: "16px",
                  flexDirection: "column",
                  boxShadow: isInCart ? "0 4px 20px var(--accent-glow)" : "var(--shadow-sm)",
                  transition: "var(--transition-smooth)",
                }}
              >
                {/* Product Layout */}
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "12px" }}>
                  {prod.image ? (
                    <img 
                      src={getImageUrl(prod.image)} 
                      alt={prod.name} 
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        borderRadius: "12px", 
                        objectFit: "cover", 
                        border: "1px solid var(--border-color-light)",
                        backgroundColor: "#000"
                      }}
                    />
                  ) : (
                    <div style={{ width: "80px", height: "80px", borderRadius: "12px", backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-color)" }}>
                      <Cpu size={32} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", margin: 0 }}>
                        {prod.name}
                      </h3>
                      <span style={{ fontSize: "1.15rem", fontWeight: "750", color: "var(--text-primary)" }}>
                        ${prod.price.toFixed(0)}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0 }}>
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Specs list */}
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px", padding: 0 }}>
                  {prod.details.map((detail, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.76rem", color: "var(--text-muted)" }}>
                      <Check size={12} color="var(--accent-color)" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>

                {/* Add to Cart button */}
                <button
                  onClick={() => addToCart(prod, "device")}
                  className="btn-primary"
                >
                  {isInCart ? "In Cart 🛒" : "Add Device to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Shopping Cart Trigger (routes to CartPage tab) */}
      {cart.length > 0 && (
        <div
          onClick={() => setActiveTab("cart")}
          style={{
            position: "absolute",
            bottom: "76px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--bg-secondary)",
            border: "1.5px solid var(--accent-color)",
            borderRadius: "100px",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            boxShadow: "0 0 20px var(--accent-glow)",
            zIndex: 40,
            animation: "pulse 2s infinite",
            width: "80%",
            maxWidth: "340px",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingCart size={18} color="var(--accent-color)" />
            <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-primary)" }}>
              {cartItemCount} item{cartItemCount > 1 ? "s" : ""} in Cart
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--accent-color)" }}>
              ${cartSubtotal.toFixed(2)}
            </span>
            <ArrowRight size={14} color="var(--accent-color)" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansCatalog;
