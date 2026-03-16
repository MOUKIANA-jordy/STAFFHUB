import React from "react";
import { Link } from "react-router-dom";
import "../Styles/tabs.css";

export default function Tabs(){

  return(

    <div className="tabs">

      <Link to="/dossiers/informations/etat-civil">Etat civil</Link>
      <Link to="/dossiers/informations/adresse">Adresses</Link>
      <Link to="/dossiers/informations/famille">Famille</Link>
      <Link to="/dossiers/informations/documents">Documents officiels</Link>
      <Link to="/dossiers/informations/iban">IBAN</Link>

    </div>

  );

}
