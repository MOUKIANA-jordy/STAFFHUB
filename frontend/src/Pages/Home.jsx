import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Home() {
  const location = useLocation();
  const [subMenu, setSubMenu] = useState("");

  const isDossiers = location.pathname.includes("dossiers");
  const isActivites = location.pathname.includes("activites");

  return (
    <div className="home">

      <h1>Dashboard</h1>

      {/* ===== DOSSIERS ===== */}
      {isDossiers && (
        <div>

          {!subMenu && (
            <>
              <button onClick={() => setSubMenu("demandes")}>
                Demandes
              </button>

              <button onClick={() => setSubMenu("infos")}>
                Informations
              </button>
            </>
          )}

          {subMenu === "demandes" && (
            <div>
              <Link to="/dossiers/demandes/acompte">Acompte</Link>
              <Link to="/dossiers/demandes/avance">Avance</Link>
              <Link to="/dossiers/demandes/calendrier">Calendrier</Link>
              <Link to="/dossiers/demandes/fiches">Fiches</Link>
              <Link to="/dossiers/demandes/paiement-cet">Paiement CET</Link>
              <Link to="/dossiers/demandes/paiement-hsup">H Sup</Link>
            </div>
          )}

          {subMenu === "infos" && (
            <div>
              <Link to="/dossiers/informations/etat-civil">Etat Civil</Link>
              <Link to="/dossiers/informations/adresse">Adresse</Link>
              <Link to="/dossiers/informations/famille">Famille</Link>
              <Link to="/dossiers/informations/iban">IBAN</Link>
              <Link to="/dossiers/informations/documents">Documents</Link>
            </div>
          )}

        </div>
      )}

      {/* ===== ACTIVITES ===== */}
      {isActivites && (
        <div>
          <Link to="/activites/absences">Absences</Link>
          <Link to="/activites/planning">Planning</Link>
          <Link to="/activites/pointages">Pointages</Link>
        </div>
      )}

    </div>
  );
}
