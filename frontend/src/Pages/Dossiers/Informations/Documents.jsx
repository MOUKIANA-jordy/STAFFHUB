import React, { useState } from "react";
import API from "../../../Services/api";
import "../../../Styles/form.css";

export default function DocumentsOfficiels() {

  const [form,setForm] = useState({

    typeDocument:"",
    numeroDocument:"",
    typeCarteTransport:"",
    periodicite:"",
    zonesCarte:"",
    montantCarte:"",
    forfaitMobilite:"",
    organisme:"",
    numeroCarte:"",
    dateDelivrance:"",
    dateValidite:"",
    dateExpiration:"",
    dateReception:"",
    statut:"",
    justificatif:"",
    commentaires:""

  });

  const handleChange = (e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = async () => {
    try {
      await API.post("/api/documents/", form);
      alert("Document enregistré");
    } catch (err) {
      console.error(err);
      alert("Erreur");
    }
  };

  return (

    <div className="form-page">

      <h2>Documents officiels</h2>

      <div className="form-box">

        <div className="form-grid">

          <div className="form-field">
            <label>Type document</label>
            <select name="typeDocument" onChange={handleChange}>
              <option>Carte de séjour temporaire</option>
              <option>Passeport</option>
              <option>Carte identité</option>
            </select>
          </div>

          <div className="form-field">
            <label>N° du document</label>
            <input name="numeroDocument" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Type carte transport</label>
            <input name="typeCarteTransport" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Périodicité</label>
            <input name="periodicite" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Zones carte</label>
            <input name="zonesCarte" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Montant carte</label>
            <input name="montantCarte" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Montant forfait mobilité annuel</label>
            <input name="forfaitMobilite" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Organisme</label>
            <input name="organisme" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>N° de carte</label>
            <input name="numeroCarte" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date délivrance</label>
            <input type="date" name="dateDelivrance" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date validité</label>
            <input type="date" name="dateValidite" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date expiration</label>
            <input type="date" name="dateExpiration" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Reçu le</label>
            <input type="date" name="dateReception" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Statut document</label>
            <select name="statut" onChange={handleChange}>
              <option>Actif</option>
              <option>Expiré</option>
            </select>
          </div>

          <div className="form-field">
            <label>Justificatif</label>
            <input name="justificatif" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Commentaires</label>
            <input name="commentaires" onChange={handleChange}/>
          </div>
	  <button onClick={handleSubmit}>💾 Enregistrer</button>

        </div>

      </div>

    </div>

  );

}
