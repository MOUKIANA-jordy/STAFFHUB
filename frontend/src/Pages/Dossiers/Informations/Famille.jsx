import React from "react";
import "../../../Styles/form.css";

export default function FamilleContact({ data, setData }) {

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="form-page">

      <h2>Famille / Contact</h2>

      <div className="form-box">

        <div className="form-grid">

          <div className="form-field">
            <label>Nom</label>
            <input name="nom" value={data.nom || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Prénom</label>
            <input name="prenom" value={data.prenom || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Lien de parenté</label>
            <input name="lienParente" value={data.lienParente || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date naissance</label>
            <input type="date" name="dateNaissance" value={data.dateNaissance || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Sexe</label>
            <select name="sexe" value={data.sexe || ""} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option>Masculin</option>
              <option>Féminin</option>
            </select>
          </div>

          <div className="form-field">
            <label>Arrivée au foyer</label>
            <input type="date" name="arriveeFoyer" value={data.arriveeFoyer || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Départ du foyer</label>
            <input type="date" name="departFoyer" value={data.departFoyer || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date décès</label>
            <input type="date" name="dateDeces" value={data.dateDeces || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>A charge</label>
            <select name="aCharge" value={data.aCharge || ""} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option>OUI</option>
              <option>NON</option>
            </select>
          </div>

          <div className="form-field">
            <label>Bénéf. Mutuelle</label>
            <select name="beneficiaireMutuelle" value={data.beneficiaireMutuelle || ""} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option>OUI</option>
              <option>NON</option>
            </select>
          </div>

          <div className="form-field">
            <label>Fin effet</label>
            <input type="date" name="finEffet" value={data.finEffet || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Personne à prévenir</label>
            <select name="personnePrevenir" value={data.personnePrevenir || ""} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option>OUI</option>
              <option>NON</option>
            </select>
          </div>

          <div className="form-field">
            <label>Téléphone portable</label>
            <input name="telephonePortable" value={data.telephonePortable || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Téléphone fixe</label>
            <input name="telephoneFixe" value={data.telephoneFixe || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Mail</label>
            <input type="email" name="mail" value={data.mail || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Justificatif</label>
            <input name="justificatif" value={data.justificatif || ""} onChange={handleChange}/>
          </div>

        </div>

      </div>

    </div>

  );
}
