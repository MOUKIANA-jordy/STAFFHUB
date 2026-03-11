import React, { useState } from "react";
import "../../Styles/form.css";

export default function Planning() {

  const [form, setForm] = useState({
    horizon: "",
    dateDebut: "",
    dateFin: "",
    nom: "",
    prenom: "",
    emploi: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="page">

      <h2>Planning</h2>

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
          <label>Nom</label>
          <input
            name="nom"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Prénom</label>
          <input
            name="prenom"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Emploi</label>
          <input
            name="emploi"
            onChange={handleChange}
          />
        </div>

      </div>

    </div>

  );
}
