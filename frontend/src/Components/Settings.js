import React, { useState } from "react";
import "../index.css";

export default function Settings() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="settings-container">

      {/* SIDEBAR */}
      <div className="settings-sidebar">
        <h3>⚙️ Paramètres de Compte</h3>

        <button onClick={() => setTab("profile")} className={tab === "profile" ? "active" : ""}>
          👤 Profil
        </button>

        <button onClick={() => setTab("security")} className={tab === "security" ? "active" : ""}>
          🔐 Sécurité
        </button>

        <button onClick={() => setTab("notifications")} className={tab === "notifications" ? "active" : ""}>
          🔔 Notifications
        </button>

        <button onClick={() => setTab("preferences")} className={tab === "preferences" ? "active" : ""}>
          🎨 Préférences
        </button>

        <button onClick={() => setTab("company")} className={tab === "company" ? "active" : ""}>
          🏢 Entreprise
        </button>
      </div>

      {/* MAIN */}
      <div className="settings-main">

        <h2>Paramètres du compte</h2>

        <div className="settings-card">

          {tab === "profile" && (
            <>
              <h3>Profil</h3>
              <input placeholder="Prénom" />
              <input placeholder="Nom" />
              <input placeholder="Email" />
              <button className="save-btn">Sauvegarder</button>
            </>
          )}

          {tab === "security" && (
            <>
              <h3>Sécurité</h3>
              <input type="password" placeholder="Ancien mot de passe" />
              <input type="password" placeholder="Nouveau mot de passe" />
              <button className="save-btn">Changer mot de passe</button>
            </>
          )}

          {tab === "notifications" && (
            <>
              <h3>Notifications</h3>
              <label><input type="checkbox" /> Email</label>
              <label><input type="checkbox" /> Système</label>
            </>
          )}

          {tab === "preferences" && (
            <>
              <h3>Préférences</h3>
              <select>
                <option>Français</option>
                <option>English</option>
              </select>
            </>
          )}

          {tab === "company" && (
            <>
              <h3>Entreprise</h3>
              <input placeholder="Nom entreprise" />
              <input placeholder="SIRET" />
            </>
          )}

        </div>

      </div>
    </div>
  );
}
