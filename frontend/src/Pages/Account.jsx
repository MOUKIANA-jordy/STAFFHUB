import React from "react";
import "../Styles/profile.css";

export default function Account() {
  return (
    <div className="card">

      <h2>Mon Compte</h2>

      {/* EMAIL */}
      <h3>Changer email</h3>

      <div className="form-group">
        <label>Nouvel email</label>
        <input type="email" />
      </div>

      {/* MOT DE PASSE */}
      <h3>Mot de passe</h3>

      <div className="form-group">
        <label>Ancien mot de passe</label>
        <input type="password" />
      </div>

      <div className="form-group">
        <label>Nouveau mot de passe</label>
        <input type="password" />
      </div>

      {/* PRÉFÉRENCES */}
      <h3>Préférences</h3>

      <div className="form-group">
        <label>Langue</label>
        <select>
          <option>Français</option>
          <option>English</option>
        </select>
      </div>

      <div className="form-group">
        <label>Notifications</label>
        <select>
          <option>Activées</option>
          <option>Désactivées</option>
        </select>
      </div>

      <button className="btn-primary">
        Sauvegarder
      </button>

    </div>
  );
}
