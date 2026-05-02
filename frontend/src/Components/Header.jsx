import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../index.css";

export default function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">

      {/* LEFT (LOGO + TITLE) */}
      <div className="header-left">
        <img src={logo} alt="logo" className="header-logo" />
        <h2 className="app-name">StaffHub</h2>
      </div>

      {/* RIGHT (USER) */}
      <div className="header-right" ref={ref}>

        <div
          className="profile"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <div className="avatar">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>

          <div>
            <span className="user-name">
              {user?.prenom} {user?.nom}
            </span>
          </div>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="dropdown">

            <div
              className="dropdown-item"
              onClick={() => {
                navigate("/profile");
                setOpen(false);
              }}
            >
              👤 Profil
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                navigate("/account");
                setOpen(false);
              }}
            >
              ⚙️ Mon compte
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                navigate("/settings");
                setOpen(false);
              }}
            >
              🔧 Paramètres
            </div>

            <div
              className="dropdown-item logout"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
            >
              🚪 Déconnexion
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
