import React, { useState } from "react";
import API from "../../../Services/api";
import "../../../Styles/form.css";

export default function Adresse(){

  const [form,setForm] = useState({
    type:"",
    justificatif:"",
    numero:"",
    bisTer:"",
    typeVoie:"",
    voie:"",
    complement:"",
    codePostal:"",
    communeInsee:"",
    codeInsee:"",
    commune:"",
    pays:"",
    telMobile:"",
    telPerso:"",
    telBureau:"",
    telMobilePro:"",
    mailPersonnel:"",
    mailProfessionnel:""
  });

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      await API.post("/api/adresses/", form);
      alert("Adresse enregistrée");
    } catch (err) {
      console.error(err);
      alert("Erreur");
    }
  };

  return(

    <div className="form-page">

      <h2>Adresse</h2>

      <div className="form-box">

        <div className="form-grid">

          <div className="form-field">
            <label>Type</label>
            <input name="type" value={form.type} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Justificatif</label>
            <input name="justificatif" value={form.justificatif} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>N°</label>
            <input name="numero" value={form.numero} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Bis/Ter</label>
            <input name="bisTer" value={form.bisTer} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Type Voie</label>
            <input name="typeVoie" value={form.typeVoie} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Voie</label>
            <input name="voie" value={form.voie} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Complément</label>
            <input name="complement" value={form.complement} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Code Postal</label>
            <input name="codePostal" value={form.codePostal} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Commune Insee</label>
            <input name="communeInsee" value={form.communeInsee} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Code Insee</label>
            <input name="codeInsee" value={form.codeInsee} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Commune</label>
            <input name="commune" value={form.commune} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Pays</label>
            <input name="pays" value={form.pays} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Tél mobile</label>
            <input name="telMobile" value={form.telMobile} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Tél perso</label>
            <input name="telPerso" value={form.telPerso} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Tél bureau</label>
            <input name="telBureau" value={form.telBureau} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Tél mobile pro</label>
            <input name="telMobilePro" value={form.telMobilePro} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Mail personnel</label>
            <input name="mailPersonnel" value={form.mailPersonnel} onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Mail professionnel</label>
            <input name="mailProfessionnel" value={form.mailProfessionnel} onChange={handleChange}/>
          </div>

        <button onClick={handleSubmit}>💾 Enregistrer</button>

        </div>

      </div>

    </div>

  );

}
