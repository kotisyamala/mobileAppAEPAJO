import React from "react";
import { useApp } from "../context/AppContext";
import { Heart, Star } from "lucide-react";

const ProductCard = ({ product }) => {
  const { wishlist, toggleWishlist, setSelectedProduct } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="product-card fade-in"
      onClick={() => setSelectedProduct(product)}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid var(--border-color-light)",
        cursor: "pointer",
        position: "relative",
        transition: "var(--transition-smooth)",
      }}
    >
      {/* Wishlist Button overlay */}
      <button
        onClick={handleWishlistClick}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 5,
          width: 34,
          height: 34,
          borderRadius: "50%",
          backgroundColor: "var(--glass-bg)",
          backdropFilter: "blur(4px)",
          border: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isWishlisted ? "#D23F3F" : "var(--text-primary)",
          transition: "var(--transition-smooth)",
        }}
      >
        <Heart size={16} fill={isWishlisted ? "#D23F3F" : "none"} />
      </button>

      {/* Image container */}
      <div
        className="product-card-img-container"
        style={{
          width: "100%",
          paddingBottom: "115%", /* Tall aesthetic crop */
          position: "relative",
          backgroundColor: "var(--bg-tertiary)",
          overflow: "hidden",
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="product-image"
        />
      </div>

      {/* Product Details Panel */}
      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "4px",
          }}
        >
          {product.category}
        </span>
        <h3
          style={{
            fontSize: "0.95rem",
            color: "var(--text-primary)",
            margin: "0 0 6px 0",
            fontFamily: "var(--font-sans)",
            fontWeight: "500",
            lineHeight: "1.3",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            height: "2.6em",
          }}
        >
          {product.name}
        </h3>

        {/* Rating and Price */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <span style={{ fontSize: "1.05rem", fontWeight: "600", color: "var(--text-primary)" }}>
            ${product.price.toFixed(2)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Star size={12} fill="#D7A15C" stroke="none" />
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "500" }}>
              {product.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
