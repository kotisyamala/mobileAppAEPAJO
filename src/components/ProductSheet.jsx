import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { X, Heart, ShoppingBag, Star, Minus, Plus } from "lucide-react";

const ProductSheet = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    wishlist,
    toggleWishlist,
  } = useApp();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Reset local state when product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes[0] || "");
      setSelectedColor(selectedProduct.colors ? selectedProduct.colors[0] : null);
      setQuantity(1);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isWishlisted = wishlist.includes(selectedProduct.id);

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity, selectedSize, selectedColor);
    setSelectedProduct(null); // Close sheet
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`bottom-sheet-backdrop ${selectedProduct ? "open" : ""}`}
        onClick={() => setSelectedProduct(null)}
      />

      {/* Bottom Sheet */}
      <div className={`bottom-sheet ${selectedProduct ? "open" : ""}`}>
        <div className="bottom-sheet-drag-handle" />
        
        {/* Header toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 24px",
          }}
        >
          <span className="pill-tag">{selectedProduct.category}</span>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => toggleWishlist(selectedProduct.id)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                color: isWishlisted ? "#D23F3F" : "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-color)",
              }}
            >
              <Heart size={18} fill={isWishlisted ? "#D23F3F" : "none"} />
            </button>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-color)",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic content area */}
        <div className="bottom-sheet-content">
          {/* Main Info */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px", marginTop: "10px" }}>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{
                width: "90px",
                height: "110px",
                objectFit: "cover",
                borderRadius: "12px",
                backgroundColor: "var(--bg-tertiary)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h2 style={{ fontSize: "1.25rem", margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                {selectedProduct.name}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)" }}>
                  ${selectedProduct.price.toFixed(2)}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <Star size={12} fill="#D7A15C" stroke="none" />
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                    {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "20px", lineHeight: "1.6" }}>
            {selectedProduct.description}
          </p>

          {/* Color swatches */}
          {selectedProduct.colors && selectedProduct.colors.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Color: {selectedColor ? selectedColor.name : ""}
              </span>
              <div style={{ display: "flex", gap: "12px" }}>
                {selectedProduct.colors.map((color) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: color.hex,
                        border: isSelected
                          ? "2px solid var(--text-primary)"
                          : "1px solid var(--border-color)",
                        boxShadow: isSelected ? "0 0 0 2px var(--bg-primary)" : "none",
                        transition: "var(--transition-smooth)",
                      }}
                      title={color.name}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selection */}
          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                Select Size: {selectedSize}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {selectedProduct.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        backgroundColor: isSelected ? "var(--text-primary)" : "var(--bg-secondary)",
                        color: isSelected ? "var(--bg-primary)" : "var(--text-primary)",
                        border: isSelected ? "1px solid var(--text-primary)" : "1px solid var(--border-color-light)",
                        minWidth: "48px",
                        textAlign: "center",
                        transition: "var(--transition-smooth)",
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity selector and Add-to-cart */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                padding: "4px",
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-primary)",
                }}
              >
                <Minus size={16} />
              </button>
              <span style={{ width: 32, textAlign: "center", fontWeight: "600", fontSize: "0.95rem" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-primary)",
                }}
              >
                <Plus size={16} />
              </button>
            </div>

            <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1 }}>
              <ShoppingBag size={18} />
              Add to Bag • ${(selectedProduct.price * quantity).toFixed(2)}
            </button>
          </div>

          {/* Core details checklist */}
          {selectedProduct.details && (
            <div style={{ marginTop: "32px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Product Specifications
              </h4>
              <ul style={{ paddingLeft: "16px", color: "var(--text-secondary)", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                {selectedProduct.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductSheet;
