import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../Styles/settings.css";

export default function Profile() {
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

        <h2 className="settings-title">Mon Profil</h2>

        <div className="settings-card">

          <h3>Informations personnelles</h3>

          <input type="text" placeholder="Prénom" />
          <input type="text" placeholder="Nom" />
          <input type="email" placeholder="Email" />
          <input type="text" placeholder="Téléphone" />

          <h3>Informations professionnelles</h3>

          <select>
            <option>Salarié</option>
            <option>Stagiaire</option>
            <option>Alternant(e)</option>
            <option>Vacataire</option>
          </select>

          <input type="text" placeholder="Poste" />
          <input type="text" placeholder="Service" />
          <input type="date" />

          <button className="save-btn">Enregistrer</button>

        </div>

      </div>

    </div>
  );
}
