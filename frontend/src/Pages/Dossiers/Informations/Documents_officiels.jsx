import React, { useState } from "react";
import "../styles/form.css";

export default function DocumentsOfficiels() {

  const [form, setForm] = useState({
    typeDocument: "",
    organisme: "",
    numeroCarte: "",
    dateDelivrance: "",
    dateExpiration: "",
    statut: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="page">

      <h2>Documents officiels</h2>

      <div className="grid">

        <div className="field">
          <label>Type de document</label>
          <select name="typeDocument" onChange={handleChange}>
            <option>Carte de séjour</option>
            <option>Passeport</option>
            <option>Carte identité</option>
          </select>
        </div>

        <div className="field">
          <label>Organisme</label>
          <input
            name="organisme"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Numéro de la carte</label>
          <input
            name="numeroCarte"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Date de délivrance</label>
          <input
            type="date"
            name="dateDelivrance"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Date d'expiration</label>
          <input
            type="date"
            name="dateExpiration"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Statut</label>
          <select name="statut" onChange={handleChange}>
            <option>Actif</option>
            <option>Expiré</option>
          </select>
        </div>

      </div>

    </div>
  );
}
