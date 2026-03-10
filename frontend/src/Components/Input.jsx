import React from "react";
import "../Styles/input.css";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder
}) {
  return (

    <div className="input-group">

      {label && <label>{label}</label>}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

    </div>

  );
}
