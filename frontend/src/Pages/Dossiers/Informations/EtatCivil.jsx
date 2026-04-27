import React, { useState } from "react";
import API from "../../../Services/api";
import "../../../Styles/form.css";

export default function EtatCivil() {

  const [form,setForm] = useState({

    numeroSecu:"",
    civilite:"",
    nomUsuel:"",
    nomPatronymique:"",
    nomMarital:"",
    prenom:"",
    prenom2:"",
    prenom3:"",
    sexe:"",
    situationFamiliale:"",
    matricule:"",
    nationalite:"",
    naturalisation:"",
    dateNaissance:"",
    paysNaissance:"",
    departementNaissance:"",
    lieuNaissance:"",
    codeINSEE:""

  });

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = async () => {
    try {
      await API.post("/api/etatcivil/", form);
      alert("Etat civil enregistré");
    } catch (err) {
      console.error(err);
      alert("Erreur");
    }
  };

  return (

    <div className="form-page">

      <h2>Etat civil</h2>

      <div className="form-box">

        <div className="form-grid">

          <div className="form-field">
            <label>Numéro sécurité sociale</label>
            <input name="numeroSecu" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Civilité</label>
            <select name="civilite" onChange={handleChange}>
              <option>Monsieur</option>
              <option>Madame</option>
            </select>
          </div>

          <div className="form-field">
            <label>Nom usuel</label>
            <input name="nomUsuel" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Nom patronymique</label>
            <input name="nomPatronymique" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Nom marital</label>
            <input name="nomMarital" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Prénom</label>
            <input name="prenom" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>2ème prénom</label>
            <input name="prenom2" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>3ème prénom</label>
            <input name="prenom3" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Sexe</label>
            <select name="sexe" onChange={handleChange}>
              <option>Masculin</option>
              <option>Féminin</option>
            </select>
          </div>

          <div className="form-field">
            <label>Situation familiale</label>
            <select name="situationFamiliale" onChange={handleChange}>
              <option>Célibataire</option>
              <option>Marié</option>
              <option>Divorcé</option>
            </select>
          </div>

          <div className="form-field">
            <label>Matricule</label>
            <input name="matricule" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Nationalité</label>
            <input name="nationalite" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Naturalisation française</label>
            <select name="naturalisation" onChange={handleChange}>
              <option>Non</option>
              <option>Oui</option>
            </select>
          </div>

          <div className="form-field">
            <label>Date naissance</label>
            <input type="date" name="dateNaissance" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Pays naissance</label>
            <input name="paysNaissance" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Département naissance</label>
            <input name="departementNaissance" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Lieu naissance</label>
            <input name="lieuNaissance" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Code INSEE</label>
            <input name="codeINSEE" onChange={handleChange}/>
          </div>
	  <button onClick={handleSubmit}>💾 Enregistrer</button>

        </div>

      </div>

    </div>

  );

}
