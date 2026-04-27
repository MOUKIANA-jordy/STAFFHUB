import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../Services/api";

import EtatCivil from "../Pages/Dossiers/Informations/EtatCivil";
import Adresse from "../Pages/Dossiers/Informations/Adresse";
import Iban from "../Pages/Dossiers/Informations/Iban";
import FamilleContact from "../Pages/Dossiers/Informations/FamilleContact";
import DocumentsOfficiels from "../Pages/Dossiers/Informations/DocumentsOfficiels";

export default function SalarieDetail() {

  const { id } = useParams();
  const [salarie, setSalarie] = useState(null);
  const [tab, setTab] = useState("etat");

  useEffect(() => {
    API.get(`/api/salaries/${id}/`)
      .then(res => setSalarie(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!salarie) return <p>Chargement...</p>;

  return (
    <div className="admin-panel">

      <h2>{salarie.prenom} {salarie.nom}</h2>

      {/* MENU */}
      <div className="admin-menu">
        <div onClick={() => setTab("etat")} className={tab==="etat"?"active":""}>Etat civil</div>
        <div onClick={() => setTab("adresse")} className={tab==="adresse"?"active":""}>Adresse</div>
        <div onClick={() => setTab("iban")} className={tab==="iban"?"active":""}>IBAN</div>
        <div onClick={() => setTab("famille")} className={tab==="famille"?"active":""}>Famille</div>
        <div onClick={() => setTab("docs")} className={tab==="docs"?"active":""}>Documents</div>
      </div>

      {/* CONTENU */}
      <div className="admin-content">
        {tab === "etat" && <EtatCivil />}
        {tab === "adresse" && <Adresse />}
        {tab === "iban" && <Iban />}
        {tab === "famille" && <FamilleContact />}
        {tab === "docs" && <DocumentsOfficiels />}
      </div>

    </div>
  );
}
