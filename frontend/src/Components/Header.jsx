import React, { useState } from "react";

export default function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="header">

      <h3>Dashboard</h3>

      <div className="header-right">

        <div className="profile" onClick={() => setOpen(!open)}>
          <div className="avatar">
            {user.prenom.charAt(0)}
          </div>

          <span>{user.prenom}</span>
        </div>

        {open && (
          <div className="dropdown">
            <div className="dropdown-item">Profil</div>
            <div className="dropdown-item">Settings</div>
            <div className="dropdown-item logout" onClick={onLogout}>
              Logout
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
