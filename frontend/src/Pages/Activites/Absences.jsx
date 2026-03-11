import React, { useState } from "react";
import "../../Styles/form.css";

export default function Absences() {

  const [form, setForm] = useState({
    horizon: "",
    dateDebut: "",
    dateFin: "",
    legende: "",
    motif: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="page">

      <h2>Absences</h2>

      <div className="grid">

        <div className="field">
          <label>Horizon</label>
          <select name="horizon" onChange={handleChange}>
            <option>Mois</option>
            <option>Année</option>
            <option>Semaine</option>
          </select>
        </div>

        <div className="field">
          <label>Date de début</label>
          <input
            type="date"
            name="dateDebut"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Date de fin</label>
          <input
            type="date"
            name="dateFin"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Légende</label>
          <select name="legende" onChange={handleChange}>
            <option value="demande">Demandé 🟡</option>
            <option value="accepte">Accepté 🟢</option>
            <option value="refuse">Refusé 🔴</option>
          </select>
        </div>

        <div className="field">
          <label>Motif</label>
          <select name="motif" onChange={handleChange}>
            <option>Congé parental</option>
            <option>Congé décès</option>
            <option>Congé naissance</option>
            <option>Formation syndicale</option>
            <option>Congé paternité</option>
            <option>Congé maternité</option>
            <option>Congé CET</option>
            <option>Congé (CP)</option>
          </select>
        </div>

      </div>

    </div>
  );
}
