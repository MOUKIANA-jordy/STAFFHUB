import React, { useState } from "react";
import "../../../Styles/form.css";

export default function EtatCivil() {

  const [data, setData] = useState({
    numeroSecu: "",
    civilite: "",
    nomUsuel: "",
    nomPatronymique: "",
    nomMarital: "",
    prenom: "",
    prenom2: "",
    prenom3: "",
    sexe: "",
    situationFamiliale: "",
    matricule: "",
    nationalite: "",
    naturalisation: "",
    dateNaissance: "",
    paysNaissance: "",
    departementNaissance: "",
    lieuNaissance: "",
    codeINSEE: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("DATA :", data);
  };

  return (
    <div className="form-page">

      <h2>État civil</h2>

      <form className="form-box" onSubmit={handleSubmit}>

        <div className="form-grid">

          <div className="form-field">
            <label>Numéro sécurité sociale</label>
            <input
              name="numeroSecu"
              value={data.numeroSecu}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Civilité</label>
            <select
              name="civilite"
              value={data.civilite}
              onChange={handleChange}
            >
              <option value="">-- Choisir --</option>
              <option value="Monsieur">Monsieur</option>
              <option value="Madame">Madame</option>
            </select>
          </div>

          <div className="form-field">
            <label>Nom usuel</label>
            <input name="nomUsuel" value={data.nomUsuel} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Nom patronymique</label>
            <input name="nomPatronymique" value={data.nomPatronymique} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Nom marital</label>
            <input name="nomMarital" value={data.nomMarital} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Prénom</label>
            <input name="prenom" value={data.prenom} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label>2ème prénom</label>
            <input name="prenom2" value={data.prenom2} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>3ème prénom</label>
            <input name="prenom3" value={data.prenom3} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Sexe</label>
            <select name="sexe" value={data.sexe} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option value="Masculin">Masculin</option>
              <option value="Féminin">Féminin</option>
            </select>
          </div>

          <div className="form-field">
            <label>Situation familiale</label>
            <select
              name="situationFamiliale"
              value={data.situationFamiliale}
              onChange={handleChange}
            >
              <option value="">-- Choisir --</option>
              <option value="Célibataire">Célibataire</option>
              <option value="Marié">Marié</option>
              <option value="Divorcé">Divorcé</option>
            </select>
          </div>

          <div className="form-field">
            <label>Matricule</label>
            <input name="matricule" value={data.matricule} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Nationalité</label>
            <input name="nationalite" value={data.nationalite} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Naturalisation française</label>
            <select name="naturalisation" value={data.naturalisation} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option value="Non">Non</option>
              <option value="Oui">Oui</option>
            </select>
          </div>

          <div className="form-field">
            <label>Date de naissance</label>
            <input
              type="date"
              name="dateNaissance"
              value={data.dateNaissance}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>Pays naissance</label>
            <input name="paysNaissance" value={data.paysNaissance} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Département naissance</label>
            <input name="departementNaissance" value={data.departementNaissance} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Lieu naissance</label>
            <input name="lieuNaissance" value={data.lieuNaissance} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Code INSEE</label>
            <input name="codeINSEE" value={data.codeINSEE} onChange={handleChange} />
          </div>

        </div>

        <button className="btn-primary" type="submit">
          Enregistrer
        </button>

      </form>
    </div>
  );
}

