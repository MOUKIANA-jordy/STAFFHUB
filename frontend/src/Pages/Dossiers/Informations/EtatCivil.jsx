import React, { useState } from "react";
import "../../../Styles/form.css";

export default function Documents() {

  const [form,setForm] = useState({
    typeDocument:"",
    numeroDocument:"",
    organisme:"",
    dateDelivrance:"",
    dateExpiration:"",
    statut:""
  });

  const handleChange = (e)=>{
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  };

  return (

    <div className="form-page">

      <div className="form-box">

        <div className="form-grid">

          <div className="form-field">
            <label>Type document</label>
            <select name="typeDocument" onChange={handleChange}>
              <option>Carte de séjour</option>
              <option>Passeport</option>
            </select>
          </div>

          <div className="form-field">
            <label>N° du document</label>
            <input name="numeroDocument" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Organisme</label>
            <input name="organisme" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date délivrance</label>
            <input type="date" name="dateDelivrance" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Date expiration</label>
            <input type="date" name="dateExpiration" onChange={handleChange}/>
          </div>

          <div className="form-field">
            <label>Statut document</label>
            <select name="statut" onChange={handleChange}>
              <option>Actif</option>
              <option>Expiré</option>
            </select>
          </div>

        </div>

      </div>

      {/* TABLEAU BAS */}
      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Type document</th>
              <th>N° document</th>
              <th>Organisme</th>
              <th>Date délivrance</th>
              <th>Date expiration</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Carte séjour</td>
              <td>9926029750</td>
              <td>Préfecture</td>
              <td>19/01/2026</td>
              <td>18/04/2026</td>
            </tr>
          </tbody>

        </table>

      </div>

    </div>

  );

}
