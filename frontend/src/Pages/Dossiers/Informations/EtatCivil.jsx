import React, { useState } from "react";

export default function EtatCivil() {

  const [form,setForm] = useState({
    numeroSecu:"",
    civilite:"",
    nom:"",
    prenom:"",
    sexe:"",
    matricule:"",
    dateNaissance:"",
    nationalite:"",
    paysNaissance:"",
    departementNaissance:""
  });

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  return (

    <div className="page">

      <h2>Etat civil</h2>

      <div className="grid">

        <div className="field">
          <label>Numéro sécurité sociale</label>
          <input name="numeroSecu" onChange={handleChange}/>
        </div>

        <div className="field">
          <label>Civilité</label>
          <select name="civilite" onChange={handleChange}>
            <option>Monsieur</option>
            <option>Madame</option>
          </select>
        </div>

        <div className="field">
          <label>Nom</label>
          <input name="nom" onChange={handleChange}/>
        </div>

        <div className="field">
          <label>Prénom</label>
          <input name="prenom" onChange={handleChange}/>
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
          <input name="matricule" onChange={handleChange}/>
        </div>

        <div className="field">
          <label>Date naissance</label>
          <input type="date" name="dateNaissance" onChange={handleChange}/>
        </div>

        <div className="field">
          <label>Nationalité</label>
          <input name="nationalite" onChange={handleChange}/>
        </div>

      </div>

    </div>

  );
}
