import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

const Toast = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = "#8CA78A";

        if (toast.type === "error") {
          Icon = AlertTriangle;
          iconColor = "#D23F3F";
        } else if (toast.type === "info") {
          Icon = Info;
          iconColor = "#5C5B56";
        }

        return (
          <div
            key={toast.id}
            className="toast-message"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Icon size={16} color={iconColor} />
            <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
