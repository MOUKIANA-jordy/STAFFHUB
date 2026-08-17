import React from "react";
import "../Styles/button.css";

export default function Button({
  title,
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon = null,
  fullWidth = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        "app-button",
        `app-button-${variant}`,
        `app-button-${size}`,
        fullWidth ? "app-button-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <span className="app-button-spinner" />
      ) : (
        icon
      )}

      <span>
        {children || title}
      </span>
    </button>
  );
}
