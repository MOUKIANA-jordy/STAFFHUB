import React from "react";
import "../Styles/input.css";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  readOnly = false,
  error = "",
  help = "",
  icon = null,
  autoComplete,
  min,
  max,
  step,
}) {
  return (
    <div
      className={`app-input-group ${
        error
          ? "app-input-group-error"
          : ""
      }`}
    >
      {label && (
        <label htmlFor={name}>
          {label}

          {required && (
            <span className="app-input-required">
              *
            </span>
          )}
        </label>
      )}

      <div className="app-input-wrapper">
        {icon && (
          <span className="app-input-icon">
            {icon}
          </span>
        )}

        <input
          id={name}
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          min={min}
          max={max}
          step={step}
          className={
            icon
              ? "app-input-with-icon"
              : ""
          }
        />
      </div>

      {error ? (
        <small className="app-input-error">
          {error}
        </small>
      ) : (
        help && (
          <small className="app-input-help">
            {help}
          </small>
        )
      )}
    </div>
  );
}
