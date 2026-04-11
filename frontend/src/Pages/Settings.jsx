import React, { useState } from "react";
import "../Styles/settings.css";

export default function Settings() {

  const [tab, setTab] = useState("profil");

  return (
    <div className="settings">

      <h2 className="title">Paramètres</h2>

      {/* 🔥 TABS */}
      <div className="settings-tabs">
        <button className={tab === "profil" ? "active" : ""} onClick={() => setTab("profil")}>
          Profil
        </button>
        <button className={tab === "securite" ? "active" : ""} onClick={() => setTab("securite")}>
          Sécurité
        </button>
        <button className={tab === "notifications" ? "active" : ""} onClick={() => setTab("notifications")}>
          Notifications
        </button>
      </div>

      {/* 🔥 PROFIL */}
      {tab === "profil" && (
        <div className="card">

          <div className="profile-header">
            <div className="avatar">👤</div>
            <div>
              <h3>Votre profil</h3>
              <p>Modifier vos informations personnelles</p>
            </div>
          </div>

          <div className="form-group">
            <label>Nom complet</label>
            <input type="text" placeholder="John Doe" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="john@email.com" />
          </div>

          <button className="save-btn">Enregistrer</button>

        </div>
      )}

      {/* 🔥 SECURITE */}
      {tab === "securite" && (
        <div className="card">

          <h3>Sécurité</h3>

          <div className="form-group">
            <label>Mot de passe actuel</label>
            <input type="password" />
          </div>

          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input type="password" />
          </div>

          <button className="save-btn">Changer mot de passe</button>

        </div>
      )}

      {/* 🔥 NOTIFICATIONS */}
      {tab === "notifications" && (
        <div className="card">

          <h3>Notifications</h3>

          <label className="checkbox">
            <input type="checkbox" />
            Recevoir les notifications email
          </label>

          <label className="checkbox">
            <input type="checkbox" />
            Alertes RH
          </label>

          <button className="save-btn">Sauvegarder</button>

        </div>
      )}

    </div>
  );
}
