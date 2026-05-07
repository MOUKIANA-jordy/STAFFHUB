import React from "react";
import "../../../Styles/form.css";

const defaultData = {
  type: "",
  justificatif: "",
  numero: "",
  bisTer: "",
  typeVoie: "",
  voie: "",
  complement: "",
  codePostal: "",
  commune: "",
  pays: "",
  telMobile: "",
  telPerso: "",
  mailPersonnel: "",
  mailProfessionnel: ""
};

export default function Adresse({ data = defaultData, setData }) {

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="form-page">

      <h2>Adresse</h2>

      <div className="form-box">
        <div className="form-grid">

          <div className="form-field">
            <label>Type</label>
            <input name="type" value={data.type} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Justificatif</label>
            <input name="justificatif" value={data.justificatif} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Numéro</label>
            <input name="numero" value={data.numero} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Bis / Ter</label>
            <input name="bisTer" value={data.bisTer} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Type voie</label>
            <input name="typeVoie" value={data.typeVoie} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Voie</label>
            <input name="voie" value={data.voie} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Complément</label>
            <input name="complement" value={data.complement} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Code postal</label>
            <input name="codePostal" value={data.codePostal} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Commune</label>
            <input name="commune" value={data.commune} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Pays</label>
            <input name="pays" value={data.pays} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Téléphone mobile</label>
            <input name="telMobile" value={data.telMobile} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Téléphone personnel</label>
            <input name="telPerso" value={data.telPerso} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Email personnel</label>
            <input name="mailPersonnel" value={data.mailPersonnel} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Email professionnel</label>
            <input name="mailProfessionnel" value={data.mailProfessionnel} onChange={handleChange}/>
          </div>

        </div>
      </div>

    </div>
  );
}

