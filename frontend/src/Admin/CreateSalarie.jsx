import React, { useState } from "react";
import API from "../Services/api";
import "../Styles/form.css";

import EtatCivil from "../Pages/Dossiers/Informations/EtatCivil";
import Adresse from "../Pages/Dossiers/Informations/Adresse";
import Famille from "../Pages/Dossiers/Informations/Famille";
import Iban from "../Pages/Dossiers/Informations/Iban";
import Documents from "../Pages/Dossiers/Informations/Documents";

export default function CreateSalarie() {

  // ========================
  //  STATE GLOBAL
  // ========================
  const [data, setData] = useState({
    // SALARIE
    nom: "",
    prenom: "",
    role: "SALARIE",
    matricule: "",
    telephone: "",
    poste: "",
    etablissement: "",

    // ETAT CIVIL
    numeroSecu: "",
    civilite: "",
    nomUsuel: "",
    nomPatronymique: "",
    prenom: "",
    sexe: "",
    situationFamiliale: "",
    nationalite: "",
    dateNaissance: "",

    // ADRESSE
    numero: "",
    voie: "",
    codePostal: "",
    commune: "",
    pays: "",

    // IBAN
    ibanComplet: "",
    bicComplet: "",
    nomBeneficiaire: "",

    // FAMILLE
    lienParente: "",
    telephonePortable: "",

    // DOCUMENT
    typeDocument: "",
    numeroDocument: ""
  });

  // ========================
  //  HANDLE CHANGE
  // ========================
  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  // ========================
  // SUBMIT GLOBAL
  // ========================
  const handleSubmit = async () => {

    try {
      await API.post("/api/salaries/", data);

      alert("Salarié créé");
    } catch (err) {
      console.error(err);
      alert("Erreur création");
    }
  };

  // ========================
  // UI
  // ========================
  return (
    <div className="form-page">

      <h1> Création  salarié (RH)</h1>

      {/* INFOS SALARIE */}
      <div className="form-box">
        <h3>Informations générales</h3>

        <div className="form-grid">

          <input name="nom" placeholder="Nom" onChange={handleChange}/>
          <input name="prenom" placeholder="Prénom" onChange={handleChange}/>
          <input name="matricule" placeholder="Matricule" onChange={handleChange}/>
          <input name="telephone" placeholder="Téléphone" onChange={handleChange}/>
          <input name="poste" placeholder="Poste" onChange={handleChange}/>
          <input name="etablissement" placeholder="Établissement" onChange={handleChange}/>

          <select name="role" onChange={handleChange}>
            <option value="SALARIE">Salarié</option>
            <option value="RH">RH</option>
            <option value="ADMIN">Admin</option>
          </select>

        </div>
      </div>

      {/* FORMULAIRES */}
      <EtatCivil data={data} setData={setData} />
      <Adresse data={data} setData={setData} />
      <Famille data={data} setData={setData} />
      <Iban data={data} setData={setData} />
      <Documents data={data} setData={setData} />

      {/* SUBMIT */}
      <button className="btn-primary" onClick={handleSubmit}>
         Créer le salarié complet
      </button>

    </div>
  );
}
