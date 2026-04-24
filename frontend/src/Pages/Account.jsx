import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/settings.css";

export default function Account() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <div className="settings-page">

      {/* SIDEBAR */}
      <div className="settings-sidebar">
        <h3>👤 Compte</h3>

        <div
          className={isActive("/profile")}
          onClick={() => navigate("/profile")}
        >
          Profil
        </div>

        <div
          className={isActive("/account")}
          onClick={() => navigate("/account")}
        >
          Mon compte
        </div>
      </div>

      {/* MAIN */}
      <div className="settings-main">

        <h2 className="settings-title">Mon Compte</h2>

        <div className="settings-card">

          <h3>Changer email</h3>
          <input type="email" placeholder="Nouvel email" />

          <h3>Mot de passe</h3>
          <input type="password" placeholder="Ancien mot de passe" />
          <input type="password" placeholder="Nouveau mot de passe" />

          <h3>Préférences</h3>
          <select>
            <option>Français</option>
            <option>English</option>
          </select>

          <select>
            <option>Activées</option>
            <option>Désactivées</option>
          </select>

          <button className="save-btn">Sauvegarder</button>

        </div>

      </div>

    </div>
  );
}
