import React, { useState } from "react";
import "../Styles/etatcivil.css";

export default function EtatCivil() {

  const [form, setForm] = useState({
    numeroSecu: "",
    civilite: "",
    nom: "",
    prenom: "",
    deuxiemePrenom: "",
    sexe: "",
    matricule: "",
    situation: "",
    dateNaissance: "",
    paysNaissance: "",
    departementNaissance: "",
    nationalite: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container">

      <h2>État civil</h2>

      <div className="grid">

        <div className="field">
          <label>Numéro sécurité sociale</label>
          <input
            name="numeroSecu"
            value={form.numeroSecu}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Civilité</label>
          <select name="civilite" onChange={handleChange}>
            <option>Choisir</option>
            <option>Monsieur</option>
            <option>Madame</option>
          </select>
        </div>

        <div className="field">
          <label>Nom</label>
          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Prénom</label>
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Deuxième prénom</label>
          <input
            name="deuxiemePrenom"
            value={form.deuxiemePrenom}
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
          <label>Matricule</label>
          <input
            name="matricule"
            value={form.matricule}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Situation</label>
          <input
            name="situation"
            value={form.situation}
            onChange={handleChange}
          />
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
          <label>Pays naissance</label>
          <input
            name="paysNaissance"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Département naissance</label>
          <input
            name="departementNaissance"
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Nationalité</label>
          <input
            name="nationalite"
            onChange={handleChange}
          />
        </div>

      </div>

    </div>
  );
}
