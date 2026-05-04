import React from "react";
import "../../../Styles/form.css";

export default function Iban({ data, setData }) {

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-page">

      <h2>Informations bancaires</h2>

      <div className="form-box">
        <div className="form-grid">

          <div className="form-field">
            <label>No RIB</label>
            <input name="numeroRib" value={data.numeroRib || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>RIB défaut</label>
            <select name="ribDefaut" value={data.ribDefaut || ""} onChange={handleChange}>
              <option>OUI</option>
              <option>NON</option>
            </select>
          </div>

          <div className="form-field">
            <label>Nature versement</label>
            <input name="natureVersement" value={data.natureVersement || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Mode paiement</label>
            <input name="modePaiement" value={data.modePaiement || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Devise</label>
            <input name="devise" value={data.devise || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date début</label>
            <input type="date" name="dateDebut" value={data.dateDebut || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date fin</label>
            <input type="date" name="dateFin" value={data.dateFin || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Pays IBAN</label>
            <input name="paysIban" value={data.paysIban || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Clef IBAN</label>
            <input name="clefIban" value={data.clefIban || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>BBAN IBAN</label>
            <input name="bbanIban" value={data.bbanIban || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>IBAN complet</label>
            <input name="ibanComplet" value={data.ibanComplet || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>BIC (1-4)</label>
            <input name="bic1" value={data.bic1 || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>BIC (5-6)</label>
            <input name="bic2" value={data.bic2 || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>BIC (7-8)</label>
            <input name="bic3" value={data.bic3 || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>BIC (9-11)</label>
            <input name="bic4" value={data.bic4 || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>BIC complet</label>
            <input name="bicComplet" value={data.bicComplet || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Domiciliation bancaire</label>
            <input name="domiciliation" value={data.domiciliation || ""} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Nom bénéficiaire</label>
            <input name="nomBeneficiaire" value={data.nomBeneficiaire || ""} onChange={handleChange}/>
          </div>

        </div>
      </div>

    </div>
  );
}
