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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/api/salaries/${id}/`)
      .then(res => setSalarie(res.data))
      .catch(err => {
        console.error(err);
        alert("Erreur chargement salarié");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Chargement...</p>;

  if (!salarie) return <p style={{ padding: 20 }}>Salarié introuvable</p>;

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="dashboard-title">
          👤 {salarie.prenom} {salarie.nom}
        </h1>

        <p style={{ opacity: 0.7 }}>
          {salarie.poste} — {salarie.etablissement}
        </p>
      </div>

      {/* MENU ONGLET */}
      <div className="card" style={{ marginBottom: 20 }}>

        <div style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap"
        }}>

          <button
            className={tab === "etat" ? "btn-primary" : ""}
            onClick={() => setTab("etat")}
          >
            🧾 Etat civil
          </button>

          <button
            className={tab === "adresse" ? "btn-primary" : ""}
            onClick={() => setTab("adresse")}
          >
            📍 Adresse
          </button>

          <button
            className={tab === "iban" ? "btn-primary" : ""}
            onClick={() => setTab("iban")}
          >
            💳 IBAN
          </button>

          <button
            className={tab === "famille" ? "btn-primary" : ""}
            onClick={() => setTab("famille")}
          >
            👨‍👩‍👧 Famille
          </button>

          <button
            className={tab === "docs" ? "btn-primary" : ""}
            onClick={() => setTab("docs")}
          >
            📁 Documents
          </button>

        </div>

      </div>

      {/* CONTENU */}
      <div className="card">

        {tab === "etat" && <EtatCivil salarieId={id} />}
        {tab === "adresse" && <Adresse salarieId={id} />}
        {tab === "iban" && <Iban salarieId={id} />}
        {tab === "famille" && <FamilleContact salarieId={id} />}
        {tab === "docs" && <DocumentsOfficiels salarieId={id} />}

      </div>

    </div>
  );
}
