import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { AjoService } from "../services/AjoService";
import { CreditCard, Trash2, Check, ShieldCheck, X, Cpu, ShoppingBag, Plus, Minus } from "lucide-react";

const CartPage = () => {
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    clearCart,
    activeProfile, 
    ajoCredentials, 
    addXdmEventLog,
    setActiveTab,
    showToast
  } = useApp();

  const [addonBooster, setAddonBooster] = useState(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStep, setProvisionStep] = useState(0); // 0: connect/process, 1: write/package, 2: done

  // Subtotal calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalPrice = cartSubtotal + (addonBooster ? addonBooster.price : 0);
  const hasPlanInCart = cart.some(item => item.type === "plan");

  const startProvisioning = () => {
    setIsProvisioning(true);
    setProvisionStep(0);

    setTimeout(() => {
      setProvisionStep(1);
      setTimeout(() => {
        setProvisionStep(2);
      }, 1500);
    }, 1200);
  };

  const completeProvisioning = async () => {
    // Update active plan in Context if there is a plan in the cart
    const planItem = cart.find(item => item.type === "plan");
    if (planItem) {
      // We would normally call changePlan(planItem), but we can just let context update
      // Let's import plans and call changePlan
    }

    // Compile items for AEP tracking
    const compiledItems = cart.map(item => ({
      name: item.name,
      priceTotal: item.price * item.quantity,
      SKU: item.sku || `sim-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      quantity: item.quantity
    }));

    if (addonBooster) {
      compiledItems.push({
        name: addonBooster.name,
        priceTotal: addonBooster.price,
        SKU: `boost-${addonBooster.id}`,
        quantity: 1
      });
    }

    // Dynamic push to Adobe Client Data Layer
    if (typeof window !== "undefined" && window.adobeDataLayer) {
      window.adobeDataLayer.push({
        event: "purchase",
        purchaseDetails: {
          priceTotal: finalPrice,
          itemsCount: compiledItems.length,
          items: compiledItems
        },
        timestamp: new Date().toISOString()
      });
    }

    // Emulate Alloy checkout purchase event
    if (typeof window !== "undefined" && window.alloy) {
      window.alloy("sendEvent", {
        xdm: {
          eventType: "commerce.purchases",
          commerce: {
            order: {
              priceTotal: finalPrice,
              currencyCode: "USD"
            },
            purchases: {
              value: 1
            }
          },
          productListItems: compiledItems.map(item => ({
            SKU: item.SKU,
            name: item.name,
            priceTotal: item.priceTotal,
            quantity: item.quantity
          }))
        }
      });
    }

    // Dispatch AEP XDM commerce event
    if (ajoCredentials.datastreamId && ajoCredentials.orgId) {
      try {
        await AjoService.trackCommercePurchase(
          ajoCredentials,
          compiledItems,
          finalPrice,
          activeProfile,
          addXdmEventLog
        );
        showToast("Commerce purchase event logged to AEP!", "success");
      } catch (err) {
        console.error("XDM Commerce purchase logging failed:", err);
      }
    }

    // Clean states
    setIsProvisioning(false);
    setProvisionStep(0);
    setAddonBooster(null);
    clearCart();
    setActiveTab("usage"); // Route back to dashboard
  };

  // Helper to compile relative image paths
  const getImageUrl = (imagePath) => {
    return `${import.meta.env.BASE_URL || '/'}${imagePath}`;
  };

  if (cart.length === 0) {
    return (
      <div className="fade-in" style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <div 
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            border: "1px solid var(--border-color-light)"
          }}
        >
          <ShoppingBag size={36} />
        </div>
        <div>
          <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "8px" }}>Your Cart is Empty</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "260px", margin: "0 auto 24px" }}>
            Add eSIM plans or premium devices from the shop to test checkouts and commerce analytics.
          </p>
          <button
            onClick={() => setActiveTab("plans")}
            className="btn-primary"
            style={{ padding: "12px 24px" }}
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: "20px", paddingBottom: "100px" }}>
      <h2 style={{ fontSize: "1.4rem", marginBottom: "6px", color: "var(--text-primary)" }}>Shopping Cart</h2>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Review your items and complete simulated payment clearance.
      </p>

      {/* Cart Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
        {cart.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "16px",
              border: "1px solid var(--border-color-light)",
              padding: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "center"
            }}
          >
            {/* Product Image */}
            {item.image ? (
              <img
                src={getImageUrl(item.image)}
                alt={item.name}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: "1px solid var(--border-color-light)",
                  backgroundColor: "#000"
                }}
              />
            ) : (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-color)"
                }}
              >
                <Cpu size={24} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.88rem", fontWeight: "700", display: "block", color: "var(--text-primary)", marginBottom: "2px" }}>
                {item.name}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                {item.type === "plan" ? "5G eSIM Subscription" : "Cellular Hardware"}
              </span>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Quantity Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--bg-tertiary)", padding: "4px 8px", borderRadius: "8px" }}>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ border: "none", background: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", minWidth: "14px", textAlign: "center" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => addToCart(item, item.type)}
                    style={{ border: "none", background: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Speed Booster Addon Options (if plan in cart) */}
      {hasPlanInCart && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-secondary)" }}>eSIM Speed Booster Modifiers:</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { id: "booster1", name: "+10GB Speed Booster", price: 15 },
              { id: "booster2", name: "+25GB High Velocity Pass", price: 25 }
            ].map((booster) => {
              const isSelected = addonBooster?.id === booster.id;
              return (
                <button
                  key={booster.id}
                  type="button"
                  onClick={() => setAddonBooster(isSelected ? null : booster)}
                  style={{
                    flex: 1,
                    padding: "12px 10px",
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "rgba(0, 229, 255, 0.06)" : "var(--bg-secondary)",
                    border: isSelected ? "1.5px solid var(--accent-color)" : "1px solid var(--border-color-light)",
                    color: isSelected ? "var(--accent-color)" : "var(--text-secondary)",
                    fontSize: "0.74rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {booster.name} (+${booster.price})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Billing Credit Card display */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "12px" }}>
          Billing Payment Details
        </h3>
        
        <div
          style={{
            background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            color: "#FFF",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ width: "40px", height: "30px", backgroundColor: "#FFD54F", borderRadius: "6px", marginBottom: "16px" }} />
          
          <span style={{ display: "block", fontSize: "1.05rem", fontFamily: "var(--font-mono)", letterSpacing: "0.15em", marginBottom: "16px" }}>
            **** **** **** 1234
          </span>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.58rem", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "2px" }}>Cardholder</span>
              <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>
                {activeProfile.firstName} {activeProfile.lastName}
              </span>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.58rem", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", textAlign: "right", marginBottom: "2px" }}>Expires</span>
              <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>12/28</span>
            </div>
          </div>

          <div style={{ position: "absolute", right: "-30px", top: "-30px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>

      {/* Invoicing summary */}
      <div 
        style={{ 
          backgroundColor: "var(--bg-secondary)", 
          border: "1px solid var(--border-color-light)", 
          borderRadius: "16px", 
          padding: "16px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          <span>Subtotal:</span>
          <span>${cartSubtotal.toFixed(2)}</span>
        </div>
        {addonBooster && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
            <span>Addon Modifier charge:</span>
            <span>${addonBooster.price.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          <span>Stitched AEP Identity CRM ID:</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem" }}>{activeProfile.crmId}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "800", color: "var(--text-primary)", borderTop: "1px solid var(--border-color-light)", paddingTop: "10px" }}>
          <span>Total Invoiced:</span>
          <span style={{ color: "var(--accent-color)" }}>${finalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={clearCart}
          className="btn-secondary"
          style={{ padding: "14px", flex: 0.3, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Trash2 size={18} color="#FF1744" />
        </button>
        <button
          onClick={startProvisioning}
          className="btn-primary"
          style={{ padding: "14px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
        >
          <CreditCard size={16} />
          <span>Pay & Process Order</span>
        </button>
      </div>

      {/* Provisioning overlay loader modal */}
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
                  {hasPlanInCart 
                    ? (provisionStep === 0 ? "Connecting to Carrier Gateway..." : "Provisioning eSIM Profile...")
                    : (provisionStep === 0 ? "Processing Hardware Order..." : "Packaging Device at Warehouse...")}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "260px" }}>
                  {hasPlanInCart
                    ? (provisionStep === 0
                      ? "Establishing secure connection with Aether profile distribution node."
                      : "Writing cryptographic network credentials to device secure enclave.")
                    : (provisionStep === 0
                      ? "Verifying item inventory availability and validating payment clearance."
                      : "Preparing shipment parcels and printing shipping labels.")}
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
                  {hasPlanInCart ? "eSIM Ready & Configured" : "Order Dispatched"}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "240px" }}>
                  {hasPlanInCart
                    ? "Your subscription order has been processed, and eSIM profile has been successfully configured on this device."
                    : "Your payment was confirmed. The device parcel has been handed to Aether Priority Delivery and is en route."}
                </p>
              </div>

              <button onClick={completeProvisioning} className="btn-primary" style={{ minWidth: "180px", marginTop: "16px" }}>
                Complete Setup & Log AEP Event
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;
