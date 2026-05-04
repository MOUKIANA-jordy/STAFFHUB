import React from "react";
import "../../../Styles/form.css";

export default function DocumentsOfficiels({ data, setData }) {

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  return (

    <div className="form-page">

      <h2>Documents officiels</h2>

      <div className="form-box">

        <div className="form-grid">

          <div className="form-field">
            <label>Type document</label>
            <select name="typeDocument" value={data.typeDocument || ""} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option>Carte de séjour temporaire</option>
              <option>Passeport</option>
              <option>Carte identité</option>
            </select>
          </div>

          <div className="form-field">
            <label>N° du document</label>
            <input name="numeroDocument" value={data.numeroDocument || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Type carte transport</label>
            <input name="typeCarteTransport" value={data.typeCarteTransport || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Périodicité</label>
            <input name="periodicite" value={data.periodicite || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Zones carte</label>
            <input name="zonesCarte" value={data.zonesCarte || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Montant carte</label>
            <input name="montantCarte" value={data.montantCarte || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Montant forfait mobilité annuel</label>
            <input name="forfaitMobilite" value={data.forfaitMobilite || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Organisme</label>
            <input name="organisme" value={data.organisme || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>N° de carte</label>
            <input name="numeroCarte" value={data.numeroCarte || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date délivrance</label>
            <input type="date" name="dateDelivrance" value={data.dateDelivrance || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date validité</label>
            <input type="date" name="dateValidite" value={data.dateValidite || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date expiration</label>
            <input type="date" name="dateExpiration" value={data.dateExpiration || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Reçu le</label>
            <input type="date" name="dateReception" value={data.dateReception || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Statut document</label>
            <select name="statut" value={data.statut || ""} onChange={handleChange}>
              <option value="">-- Choisir --</option>
              <option>Actif</option>
              <option>Expiré</option>
            </select>
          </div>

          <div className="form-field">
            <label>Justificatif</label>
            <input name="justificatif" value={data.justificatif || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Commentaires</label>
            <input name="commentaires" value={data.commentaires || ""} onChange={handleChange}/>
          </div>

        </div>

      </div>

    </div>

  );
}
