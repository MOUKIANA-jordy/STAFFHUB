import React, { useState } from "react";
import "../Styles/header.css";
import { Bell, LogOut } from "lucide-react";

export default function Header({ user, menu, setMenu, onLogout }) {

  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  return (
    <header className="header">

      {/* LEFT */}
      <div className="header-left">
        <div className="logo">MyEntreprise</div>
      </div>

      {/* RIGHT */}
      <div className="header-right">

        {/* NOTIFICATIONS */}
        <div className="notif">
          <button onClick={() => setOpenNotif(!openNotif)}>
            <Bell size={18} />
            <span className="notif-badge">3</span>
          </button>

          {openNotif && (
            <div className="notif-dropdown">
              <p>Nouvelle demande</p>
              <p>Absence validée</p>
              <p>Mise à jour RH</p>
            </div>
          )}
        </div>

        {/* USER MENU */}
        <div className="user-menu">
          <button onClick={() => setOpenUser(!openUser)} className="user-btn">
            👤 {user?.prenom}
          </button>

          {openUser && (
            <div className="user-dropdown">
              <p>Mon profil</p>
              <p>Paramètres</p>
              <p onClick={onLogout}>Déconnexion</p>
            </div>
          )}
        </div>

        {/* LOGOUT ICON */}
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
        </button>

      </div>

    </header>
  );
}
