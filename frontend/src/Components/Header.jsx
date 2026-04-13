import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="header">

      {/* TITRE */}
      <h3>Dashboard</h3>

      {/* RIGHT SIDE */}
      <div className="header-right">

        {/* PROFILE CLICK */}
        <div
          className="profile"
          onClick={() => setOpen(!open)}
        >
          <div className="avatar">
            {user?.prenom?.charAt(0)}
          </div>

          <span>{user?.prenom}</span>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="dropdown">

            <div
              className="dropdown-item"
              onClick={() => {
                navigate("/profile");
                setOpen(false); // ferme le menu
              }}
            >
              Profil
            </div>

            <div
              className="dropdown-item"
              onClick={() => {
                navigate("/account");
                setOpen(false);
              }}
            >
              Mon compte
            </div>

            <div
              className="dropdown-item logout"
              onClick={() => {
                onLogout();
                setOpen(false);
              }}
            >
              Logout
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
