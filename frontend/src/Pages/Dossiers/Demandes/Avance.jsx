import React, { useState } from "react";
import "../../../Styles/form.css";

export default function Avances() {

  const [form, setForm] = useState({
    dateDebutContrat: "",
    dateFinContrat: "",
    legende: "",
    debutRemboursement: "",
    finRemboursement: "",
    montantTotal: "",
    nombreMensualite: "",
    echeanceMensuelle: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Avance enregistrée :", form);
  };

  return (
    <div className="page">

      <h2>Avances</h2>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="grid">

          <div className="field">
            <label>Date début contrat</label>
            <input type="date" name="dateDebutContrat" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Date fin contrat</label>
            <input type="date" name="dateFinContrat" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Légende</label>
            <input type="text" name="legende" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Début remboursement</label>
            <input type="date" name="debutRemboursement" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Fin remboursement</label>
            <input type="date" name="finRemboursement" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Montant total</label>
            <input type="number" name="montantTotal" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Nombre mensualités</label>
            <input type="number" name="nombreMensualite" onChange={handleChange} />
          </div>

          <div className="field">
            <label>Échéance mensuelle</label>
            <input type="number" name="echeanceMensuelle" onChange={handleChange} />
          </div>

          <button className="btn-save">Enregistrer</button>

        </form>
      </div>

    </div>
  );
}
