import React from "react";
import "../../../Styles/form.css";

export default function Adresse({ data, setData }) {

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-page">

      <h2>Adresse</h2>

      <div className="form-box">
        <div className="form-grid">

          <input name="type" placeholder="Type" value={data.type || ""} onChange={handleChange}/>
          <input name="justificatif" placeholder="Justificatif" value={data.justificatif || ""} onChange={handleChange}/>
          <input name="numero" placeholder="N°" value={data.numero || ""} onChange={handleChange}/>
          <input name="bisTer" placeholder="Bis/Ter" value={data.bisTer || ""} onChange={handleChange}/>
          <input name="typeVoie" placeholder="Type voie" value={data.typeVoie || ""} onChange={handleChange}/>
          <input name="voie" placeholder="Voie" value={data.voie || ""} onChange={handleChange}/>
          <input name="complement" placeholder="Complément" value={data.complement || ""} onChange={handleChange}/>
          <input name="codePostal" placeholder="Code postal" value={data.codePostal || ""} onChange={handleChange}/>
          <input name="commune" placeholder="Commune" value={data.commune || ""} onChange={handleChange}/>
          <input name="pays" placeholder="Pays" value={data.pays || ""} onChange={handleChange}/>

          <input name="telMobile" placeholder="Tel mobile" value={data.telMobile || ""} onChange={handleChange}/>
          <input name="telPerso" placeholder="Tel perso" value={data.telPerso || ""} onChange={handleChange}/>
          <input name="mailPersonnel" placeholder="Mail personnel" value={data.mailPersonnel || ""} onChange={handleChange}/>
          <input name="mailProfessionnel" placeholder="Mail pro" value={data.mailProfessionnel || ""} onChange={handleChange}/>

        </div>
      </div>

    </div>
  );
}
