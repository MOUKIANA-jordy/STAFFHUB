import React, { useState } from "react";
import "../styles/form.css";

export default function FamilleContact() {

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    lienParente: "",
    dateNaissance: "",
    sexe: "",
    telephone: "",
    mail: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="page">

      <h2>Famille / Contact</h2>

      <div className="grid">

        <div className="field">
          <label>Nom</label>
          <input name="nom" onChange={handleChange}/>
        </div>

        <div className="field">
          <label>Prénom</label>
          <input name="prenom" onChange={handleChange}/>
        </div>

        <div className="field">
          <label>Lien de parenté</label>
          <select name="lienParente" onChange={handleChange}>
            <option>Conjoint</option>
            <option>Enfant</option>
            <option>Père</option>
            <option>Mère</option>
            <option>Autre</option>
          </select>
        </div>

        <div className="field">
          <label>Date de naissance</label>
          <input
            type="date"
            name="dateNaissance"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Sexe</label>
          <select name="sexe" onChange={handleChange}>
            <option>Masculin</option>
            <option>Féminin</option>
          </select>
        </div>

        <div className="field">
          <label>Téléphone</label>
          <input
            name="telephone"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Mail</label>
          <input
            type="email"
            name="mail"
            onChange={handleChange}
          />
        </div>

      </div>

    </div>

  );
}
