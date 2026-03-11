import React, { useState } from "react";
import "../../Styles/form.css";

export default function Pointage() {

  const [form, setForm] = useState({
    dateDebut: "",
    dateFin: "",
    heurePointage: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="page">

      <h2>Pointage Virtuel</h2>

      <div className="grid">

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
          <label>Heures de pointage</label>
          <input
            type="time"
            name="heurePointage"
            onChange={handleChange}
          />
        </div>

      </div>

    </div>
  );
}
