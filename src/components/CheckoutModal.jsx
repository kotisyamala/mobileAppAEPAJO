import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X, ArrowLeft, ArrowRight, CreditCard, CheckCircle, Shield, ShoppingBag } from "lucide-react";

const CheckoutModal = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    showToast,
  } = useApp();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [shippingForm, setShippingForm] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    address: "124 Forest Avenue",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
  });
  
  const [paymentForm, setPaymentForm] = useState({
    cardNum: "4111 •••• •••• 1234",
    expiry: "12/28",
    cvv: "•••",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  // Subtotal details
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 12.00;
  const total = subtotal + shipping;

  const handleInputChange = (e, form, setter) => {
    const { name, value } = e.target;
    setter({ ...form, [name]: value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!shippingForm.name || !shippingForm.address || !shippingForm.zip) {
        showToast("Please fill all shipping details", "error");
        return;
      }
      setStep(2);
    }
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    // Simulate transaction delay
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      clearCart();
      showToast("Order placed successfully!");
    }, 1800);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.3s ease-out forwards",
      }}
    >
      {/* Header Toolbar (Steps 1 & 2 only) */}
      {step < 3 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          {step === 2 ? (
            <button onClick={() => setStep(1)} style={{ color: "var(--text-primary)" }}>
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button onClick={handleClose} style={{ color: "var(--text-primary)" }}>
              <X size={20} />
            </button>
          )}
          
          <h2 style={{ fontSize: "1.1rem", margin: "0 auto", fontWeight: "600" }}>
            {step === 1 ? "Shipping Details" : "Secure Payment"}
          </h2>
          
          {/* Progress Indicators */}
          <div style={{ display: "flex", gap: "6px" }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "var(--accent-color)",
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: step === 2 ? "var(--accent-color)" : "var(--border-color)",
              }}
            />
          </div>
        </div>
      )}

      {/* Main Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
        
        {/* STEP 1: Shipping Form */}
        {step === 1 && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={shippingForm.name}
                onChange={(e) => handleInputChange(e, shippingForm, setShippingForm)}
                className="form-input"
              />
            </div>
            
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={shippingForm.email}
                onChange={(e) => handleInputChange(e, shippingForm, setShippingForm)}
                className="form-input"
              />
            </div>
            
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={shippingForm.address}
                onChange={(e) => handleInputChange(e, shippingForm, setShippingForm)}
                className="form-input"
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingForm.city}
                  onChange={(e) => handleInputChange(e, shippingForm, setShippingForm)}
                  className="form-input"
                />
              </div>
              <div style={{ width: "80px" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Zip
                </label>
                <input
                  type="text"
                  name="zip"
                  value={shippingForm.zip}
                  onChange={(e) => handleInputChange(e, shippingForm, setShippingForm)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Cart summary preview */}
            <div
              style={{
                marginTop: "20px",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "20px",
              }}
            >
              <h4 style={{ fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Order Summary
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
                <span style={{ fontWeight: "600" }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Payment Form */}
        {step === 2 && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Express Pay options */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              style={{
                width: "100%",
                backgroundColor: "#000000",
                color: "#FFFFFF",
                padding: "16px",
                borderRadius: "12px",
                fontSize: "0.95rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "var(--transition-smooth)",
              }}
            >
              <CreditCard size={18} />
              Pay with Apple Pay
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", margin: "4px 0" }}>
              <hr style={{ flex: 1, borderColor: "var(--border-color-light)" }} />
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                Or card details
              </span>
              <hr style={{ flex: 1, borderColor: "var(--border-color-light)" }} />
            </div>

            {/* Card form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                  Card Number
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    name="cardNum"
                    value={paymentForm.cardNum}
                    onChange={(e) => handleInputChange(e, paymentForm, setPaymentForm)}
                    className="form-input"
                    style={{ paddingRight: "40px" }}
                  />
                  <CreditCard
                    size={18}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={paymentForm.expiry}
                    onChange={(e) => handleInputChange(e, paymentForm, setPaymentForm)}
                    placeholder="MM/YY"
                    className="form-input"
                  />
                </div>
                <div style={{ width: "90px" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    value={paymentForm.cvv}
                    onChange={(e) => handleInputChange(e, paymentForm, setPaymentForm)}
                    placeholder="•••"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                backgroundColor: "var(--bg-secondary)",
                padding: "12px",
                borderRadius: "10px",
                alignItems: "center",
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                lineHeight: "1.4",
              }}
            >
              <Shield size={18} style={{ color: "var(--accent-color)", flexShrink: 0 }} />
              <span>
                Your transaction is secure. Card information is encrypted using industry standard protocols.
              </span>
            </div>

            {/* Review totals */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", marginTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: "700", borderTop: "1px dashed var(--border-color)", paddingTop: "10px" }}>
                <span>Total Charge</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 3 && (
          <div
            className="fade-in"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <CheckCircle size={64} style={{ color: "var(--accent-color)", marginBottom: "20px" }} />
            <h2 style={{ fontSize: "1.75rem", marginBottom: "10px" }}>Order Confirmed</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "260px", marginBottom: "32px", lineHeight: "1.5" }}>
              Thank you for shopping with Aether. Your order #AET-{(100000 + Math.floor(Math.random() * 900000))} has been placed successfully.
            </p>
            
            <div
              style={{
                width: "100%",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "left",
                marginBottom: "32px",
                border: "1px solid var(--border-color-light)",
              }}
            >
              <h4 style={{ fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Delivery Address
              </h4>
              <p style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>{shippingForm.name}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{shippingForm.address}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{shippingForm.city}, {shippingForm.state} {shippingForm.zip}</p>
            </div>

            <button onClick={handleClose} className="btn-primary">
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* Action Footer Buttons (Steps 1 & 2 only) */}
      {step < 3 && (
        <div
          style={{
            padding: "20px",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-primary)",
          }}
        >
          {step === 1 ? (
            <button onClick={handleNextStep} className="btn-primary">
              Continue to Payment
              <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handlePlaceOrder} disabled={isProcessing} className="btn-primary">
              {isProcessing ? (
                <>Processing Transaction...</>
              ) : (
                <>Authorize Payment • ${total.toFixed(2)}</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckoutModal;
