import React from "react";
import "../Styles/profile.css";

export default function Profile() {
  return (
    <div className="card">

      <h2>Mon Profil</h2>

      {/* INFOS PERSONNELLES */}
      <h3>Informations personnelles</h3>

      <div className="form-group">
        <label>Prénom</label>
        <input type="text" placeholder="John" />
      </div>

      <div className="form-group">
        <label>Nom</label>
        <input type="text" placeholder="Doe" />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="email" placeholder="john@email.com" />
      </div>

      <div className="form-group">
        <label>Téléphone</label>
        <input type="text" placeholder="0600000000" />
      </div>

      {/* INFOS PROFESSIONNELLES */}
      <h3>Informations professionnelles</h3>

      <div className="form-group">
        <label>Statut</label>
        <select>
          <option>Vacataire</option>
          <option>Stagiaire</option>
          <option>Agent</option>
        </select>
      </div>

      <div className="form-group">
        <label>Poste</label>
        <input type="text" placeholder="Développeur" />
      </div>

      <div className="form-group">
        <label>Service</label>
        <input type="text" placeholder="Informatique" />
      </div>

      <div className="form-group">
        <label>Date d'embauche</label>
        <input type="date" />
      </div>

      <button className="btn-primary">
        Enregistrer
      </button>

    </div>
  );
}
