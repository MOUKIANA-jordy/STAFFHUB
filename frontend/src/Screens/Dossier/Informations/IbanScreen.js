import React, { useState } from "react";
import "./bank.css";

export default function BankInfo() {

  const [data, setData] = useState({
    numeroRib: "",
    ribDefaut: "",
    natureVersement: "",
    modePaiement: "",
    devise: "",
    dateDebut: "",
    paysIban: "",
    clefIban: "",
    iban: "",
    bic: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value
    });
  };

  const handleSave = () => {
    console.log(data);
  };

  return (
    <div className="container">

      <h1>Informations bancaires</h1>

      {/* RIB */}
      <div className="card">

        <h2>RIB</h2>

        <div className="row">
          <label>Numéro RIB</label>
          <input
            name="numeroRib"
            value={data.numeroRib}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>RIB par défaut</label>
          <input
            name="ribDefaut"
            value={data.ribDefaut}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>Nature du versement</label>
          <input
            name="natureVersement"
            value={data.natureVersement}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>Mode de paiement</label>
          <input
            name="modePaiement"
            value={data.modePaiement}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>Devise</label>
          <input
            name="devise"
            value={data.devise}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>Date de début</label>
          <input
            type="date"
            name="dateDebut"
            value={data.dateDebut}
            onChange={handleChange}
          />
        </div>

      </div>

      {/* Identification */}
      <div className="card">

        <h2>Identification</h2>

        <div className="row">
          <label>Pays IBAN</label>
          <input
            name="paysIban"
            value={data.paysIban}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>Clef IBAN</label>
          <input
            name="clefIban"
            value={data.clefIban}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>IBAN complet</label>
          <input
            name="iban"
            value={data.iban}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <label>BIC complet</label>
          <input
            name="bic"
            value={data.bic}
            onChange={handleChange}
          />
        </div>

      </div>

      <button className="saveBtn" onClick={handleSave}>
        Enregistrer
      </button>

    </div>
  );
} 
