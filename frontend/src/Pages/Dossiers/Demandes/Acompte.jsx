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

  const getStatusColor = (statut) => {

    if (statut === "accepte") return "green";
    if (statut === "refuse") return "red";

    return "orange";

  };

  return (

    <div className="page">

      <h2>Acompte</h2>

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

        <div className="field">
          <label>Statut de la demande</label>

          <select name="statut" value={form.statut} onChange={handleChange}>

            <option value="demande">Demandé</option>
            <option value="accepte">Accepté</option>
            <option value="refuse">Refusé</option>

          </select>

        </div>

        <button className="btn-save">Enregistrer</button>

      </form>


      {/* LEGENDE */}

      <div className="legende">

        <span className="yellow"></span> Demandé  
        <span className="green"></span> Accepté  
        <span className="red"></span> Refusé

      </div>


      {/* TABLEAU */}

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

              <td style={{color:getStatusColor(item.statut)}}>
                {item.statut}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}
