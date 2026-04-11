import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import "../../Styles/form.css";

export default function Absences() {

  const { user } = useOutletContext();

  const [form, setForm] = useState({
    horizon: "",
    dateDebut: "",
    dateFin: "",
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

      <h2>Mes absences</h2>

      <div className="user-info">
        👤 {user.prenom} {user.nom}
      </div>

      <div className="form-card">

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
            <label>Date début</label>
            <input type="date" name="dateDebut" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Date fin</label>
            <input type="date" name="dateFin" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Motif</label>
            <select name="motif" onChange={handleChange}>
              <option>Congé</option>
              <option>Maladie</option>
              <option>Exceptionnel</option>
            </select>
          </div>

        </div>

        <button className="btn-save">Envoyer</button>

      </div>

    </div>
  );
}
