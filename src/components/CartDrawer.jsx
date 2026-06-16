import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    setIsCheckoutOpen,
  } = useApp();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState("");

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "WELCOME10") {
      setDiscountPercent(10);
      setPromoApplied("WELCOME10 (10% Off)");
      setPromoCode("");
    } else {
      alert("Invalid promo code. Try: WELCOME10");
    }
  };

  const handleRemovePromo = () => {
    setDiscountPercent(0);
    setPromoApplied("");
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12.00;
  const total = subtotal - discountAmount + shipping;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cart-drawer-backdrop ${isCartOpen ? "open" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Cart Panel */}
      <div className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShoppingBag size={20} />
            <h2 style={{ fontSize: "1.2rem", margin: 0, fontWeight: "600" }}>Your Bag</h2>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                background: "var(--bg-secondary)",
                padding: "2px 8px",
                borderRadius: "20px",
                fontWeight: "600",
              }}
            >
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "var(--bg-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-primary)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {cart.length === 0 ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: "16px" }} />
              <p style={{ fontSize: "1rem", fontWeight: "500", marginBottom: "6px", color: "var(--text-primary)" }}>
                Your bag is empty
              </p>
              <p style={{ fontSize: "0.85rem", maxWidth: "220px" }}>
                Add items from our curated collections to get started.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary"
                style={{ marginTop: "24px", padding: "12px 20px", fontSize: "0.82rem" }}
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                    borderBottom: "1px solid var(--border-color-light)",
                    paddingBottom: "16px",
                  }}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: "65px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      backgroundColor: "var(--bg-tertiary)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "0.88rem",
                        fontFamily: "var(--font-sans)",
                        fontWeight: "500",
                        margin: "0 0 4px 0",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.product.name}
                    </h3>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                      Size: {item.size} {item.color ? `• Color: ${item.color.name}` : ""}
                    </p>
                    
                    {/* Quantity controls */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "var(--bg-secondary)",
                          borderRadius: "8px",
                          border: "1px solid var(--border-color)",
                          padding: "2px",
                        }}
                      >
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ width: 24, textAlign: "center", fontSize: "0.82rem", fontWeight: "600" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ color: "var(--text-muted)", padding: "4px" }}
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions and summaries */}
        {cart.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--border-color)",
              padding: "20px 24px",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {/* Promo Code Code input */}
            {!promoApplied ? (
              <form
                onSubmit={handleApplyPromo}
                style={{ display: "flex", gap: "8px", marginBottom: "16px" }}
              >
                <input
                  type="text"
                  placeholder="Promo code (e.g. WELCOME10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.82rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: "var(--text-primary)",
                    color: "var(--bg-primary)",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                  }}
                >
                  Apply
                </button>
              </form>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "var(--bg-primary)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px dashed var(--accent-light)",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "0.82rem", color: "var(--accent-color)", fontWeight: "600" }}>
                  {promoApplied}
                </span>
                <button onClick={handleRemovePromo} style={{ color: "#D23F3F" }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--accent-color)" }}>
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "10px",
                  marginTop: "4px",
                }}
              >
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary">
              Checkout
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
