import React from "react";
import "../Styles/button.css";

export default function Button({ title, onClick, type = "button" }) {
  return (
    <button className="btn" type={type} onClick={onClick}>
      {title}
    </button>
  );
}
