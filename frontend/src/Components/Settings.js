import React, { useState } from "react";
import "../Styles/settings.css";

export default function Settings() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="settings">

      <h2>⚙️ Paramètres</h2>

      <div className="settings-container">

        {/* MENU LATÉRAL */}
        <div className="settings-menu">
          <div onClick={() => setTab("profile")} className={tab === "profile" ? "active" : ""}>Profil</div>
          <div onClick={() => setTab("security")} className={tab === "security" ? "active" : ""}>Sécurité</div>
          <div onClick={() => setTab("notifications")} className={tab === "notifications" ? "active" : ""}>Notifications</div>
          <div onClick={() => setTab("preferences")} className={tab === "preferences" ? "active" : ""}>Préférences</div>
          <div onClick={() => setTab("company")} className={tab === "company" ? "active" : ""}>Entreprise</div>
        </div>

        {/* CONTENU */}
        <div className="settings-content">

          {/* PROFIL */}
          {tab === "profile" && (
            <div>
              <h3>👤 Profil</h3>

              <input type="text" placeholder="Prénom" />
              <input type="text" placeholder="Nom" />
              <input type="email" placeholder="Email" />

              <button className="save-btn">Sauvegarder</button>
            </div>
          )}

          {/* SÉCURITÉ */}
          {tab === "security" && (
            <div>
              <h3>🔐 Sécurité</h3>

              <input type="password" placeholder="Ancien mot de passe" />
              <input type="password" placeholder="Nouveau mot de passe" />
              <input type="password" placeholder="Confirmer mot de passe" />

              <button className="save-btn">Changer mot de passe</button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === "notifications" && (
            <div>
              <h3>🔔 Notifications</h3>

              <label>
                <input type="checkbox" /> Email notifications
              </label>

              <label>
                <input type="checkbox" /> Notifications système
              </label>

              <button className="save-btn">Sauvegarder</button>
            </div>
          )}

          {/* PRÉFÉRENCES */}
          {tab === "preferences" && (
            <div>
              <h3>🎨 Préférences</h3>

              <select>
                <option>Français</option>
                <option>English</option>
              </select>

              <select>
                <option>Mode clair</option>
                <option>Mode sombre</option>
              </select>

              <button className="save-btn">Sauvegarder</button>
            </div>
          )}

          {/* ENTREPRISE */}
          {tab === "company" && (
            <div>
              <h3>🏢 Entreprise</h3>

              <input type="text" placeholder="Nom entreprise" />
              <input type="text" placeholder="Adresse" />
              <input type="text" placeholder="SIRET" />

              <button className="save-btn">Sauvegarder</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
