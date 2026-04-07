import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import "../Styles/home.css";

export default function Home() {

  const { menu } = useOutletContext();
  const [subMenu, setSubMenu] = useState("");

  return (
    <div className="home">

      {/* ================= DOSSIER ================= */}
      {menu === "dossier" && (
        <div className="submenu">

          {/* NIVEAU 1 */}
          {!subMenu && (
            <div className="submenu-buttons">
              <button
                className={subMenu === "demandes" ? "active-btn" : ""}
                onClick={() => setSubMenu("demandes")}
              >
                Demandes
              </button>

              <button
                className={subMenu === "informations" ? "active-btn" : ""}
                onClick={() => setSubMenu("informations")}
              >
                Informations
              </button>
            </div>
          )}

          {/* ================= DEMANDES ================= */}
          {subMenu === "demandes" && (
            <div>

              <button
                className="back-btn"
                onClick={() => setSubMenu("")}
              >
                ← Retour
              </button>

              <h2 className="section-title">Demandes</h2>

              <div className="links horizontal">
                <Link to="/dossiers/demandes/acompte">Acompte</Link>
                <Link to="/dossiers/demandes/avance">Avance</Link>
                <Link to="/dossiers/demandes/calendrier">Calendrier</Link>
                <Link to="/dossiers/demandes/fiches">Fiches</Link>
                <Link to="/dossiers/demandes/paiement-cet">Paiement CET</Link>
                <Link to="/dossiers/demandes/paiement-hsup">Paiement H Sup</Link>
              </div>

            </div>
          )}

          {/* ================= INFORMATIONS ================= */}
          {subMenu === "informations" && (
            <div>

              <button
                className="back-btn"
                onClick={() => setSubMenu("")}
              >
                ← Retour
              </button>

              <h2 className="section-title">Informations</h2>

              <div className="links horizontal">
                <Link to="/dossiers/informations/etat-civil">Etat Civil</Link>
                <Link to="/dossiers/informations/adresse">Adresse</Link>
                <Link to="/dossiers/informations/famille">Famille</Link>
                <Link to="/dossiers/informations/iban">IBAN</Link>
                <Link to="/dossiers/informations/documents">Documents</Link>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ================= ACTIVITES ================= */}
      {menu === "activites" && (
        <div className="submenu">
          <h2 className="section-title">Activités</h2>

          <div className="links horizontal">
            <Link to="/activites/planning">Planning</Link>
            <Link to="/activites/absences">Absences</Link>
            <Link to="/activites/pointages">Pointages</Link>
          </div>
        </div>
      )}

    </div>
  );
}
