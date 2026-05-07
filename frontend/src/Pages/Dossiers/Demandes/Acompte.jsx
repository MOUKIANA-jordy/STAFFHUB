import React, { useState } from "react";
import "../../../Styles/form.css";

export default function Acompte() {

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    periode: "",
    dateDemande: "",
    montant: "",
    statut: "demande"
  });

  const [acompteList, setAcompteList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setAcompteList([...acompteList, form]);

    setForm({
      nom: "",
      prenom: "",
      matricule: "",
      periode: "",
      dateDemande: "",
      montant: "",
      statut: "demande"
    });
  };

  return (
    <div className="page">

      <h2>Acompte</h2>

      {/* FORM CARD */}
      <div className="form-card">
        <form onSubmit={handleSubmit} className="grid">

          <div className="field">
            <label>Nom</label>
            <input name="nom" value={form.nom} onChange={handleChange}/>
          </div>

          <div className="field">
            <label>Prénom</label>
            <input name="prenom" value={form.prenom} onChange={handleChange}/>
          </div>

          <div className="field">
            <label>Matricule</label>
            <input name="matricule" value={form.matricule} onChange={handleChange}/>
          </div>

          <div className="field">
            <label>Période</label>
            <input name="periode" value={form.periode} onChange={handleChange}/>
          </div>

          <div className="field">
            <label>Date de demande</label>
            <input type="date" name="dateDemande" value={form.dateDemande} onChange={handleChange}/>
          </div>

          <div className="field">
            <label>Montant</label>
            <input type="number" name="montant" value={form.montant} onChange={handleChange}/>
          </div>

          <button className="btn-save">Enregistrer</button>

        </form>
      </div>

      {/* TABLE */}
      <h3>Récapitulatif</h3>

      <table className="table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Matricule</th>
            <th>Période</th>
            <th>Date</th>
            <th>Montant</th>
            <th>Statut</th>
          </tr>
        </thead>

        <tbody>
          {acompteList.map((item, index) => (
            <tr key={index}>
              <td>{item.nom}</td>
              <td>{item.prenom}</td>
              <td>{item.matricule}</td>
              <td>{item.periode}</td>
              <td>{item.dateDemande}</td>
              <td>{item.montant}</td>

              <td>
                <span className={`badge ${item.statut}`}>
                  {item.statut}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
