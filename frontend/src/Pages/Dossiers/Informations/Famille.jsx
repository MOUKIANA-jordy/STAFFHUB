import React, { useState } from "react";
import API from "../../../Services/api";
import "../../../Styles/form.css";

export default function FamilleContact() {

  const [form,setForm] = useState({

    nom:"",
    prenom:"",
    lienParente:"",
    dateNaissance:"",
    sexe:"",
    arriveeFoyer:"",
    departFoyer:"",
    dateDeces:"",
    aCharge:"",
    beneficiaireMutuelle:"",
    finEffet:"",
    personnePrevenir:"",
    telephonePortable:"",
    telephoneFixe:"",
    mail:"",
    justificatif:""

  });

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = async () => {
    try {
      await API.post("/api/famille/", form);
      alert("Famille enregistrée");
    } catch (err) {
      console.error(err);
      alert("Erreur");
    }
  };

  return(

    <div className="form-page">

      <h2>Famille / Contact</h2>

      <div className="form-box">

        <div className="form-grid">

          <div className="form-field">
            <label>Nom</label>
            <input name="nom" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Prénom</label>
            <input name="prenom" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Lien de parenté</label>
            <input name="lienParente" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date naissance</label>
            <input type="date" name="dateNaissance" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Sexe</label>
            <select name="sexe" onChange={handleChange}>
              <option>Masculin</option>
              <option>Féminin</option>
            </select>
          </div>

          <div className="form-field">
            <label>Arrivée au foyer</label>
            <input type="date" name="arriveeFoyer" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Départ du foyer</label>
            <input type="date" name="departFoyer" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date décès</label>
            <input type="date" name="dateDeces" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>A charge</label>
            <select name="aCharge" onChange={handleChange}>
              <option>OUI</option>
              <option>NON</option>
            </select>
          </div>

          <div className="form-field">
            <label>Bénéf. Mutuelle</label>
            <select name="beneficiaireMutuelle" onChange={handleChange}>
              <option>OUI</option>
              <option>NON</option>
            </select>
          </div>

          <div className="form-field">
            <label>Fin effet</label>
            <input type="date" name="finEffet" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Personne à prévenir</label>
            <select name="personnePrevenir" onChange={handleChange}>
              <option>OUI</option>
              <option>NON</option>
            </select>
          </div>

          <div className="form-field">
            <label>Téléphone portable</label>
            <input name="telephonePortable" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Téléphone fixe</label>
            <input name="telephoneFixe" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Mail</label>
            <input type="email" name="mail" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Justificatif</label>
            <input name="justificatif" onChange={handleChange}/>
          </div>
	  <button onClick={handleSubmit}>💾 Enregistrer</button>

        </div>

      </div>

    </div>

  );

}
