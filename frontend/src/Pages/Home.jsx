import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import "../Styles/home.css";

export default function Home() {
  const { menu } = useOutletContext();
  const [subMenu, setSubMenu] = useState("");

  return (
    <div className="home">

      {/* HERO / HEADER */}
      <div className="hero">
        <h1>Gestion d’entreprise</h1>
        <p>Centralisez vos demandes, informations et activités</p>
      </div>

      {/* DOSSIER */}
      {menu === "dossier" && (
        <div className="panel">

          {!subMenu && (
            <div className="card-grid">

              <div
                className="card"
                onClick={() => setSubMenu("demandes")}
              >
                <h3>Demandes</h3>
                <p>Gérez toutes vos requêtes administratives</p>
              </div>

              <div
                className="card"
                onClick={() => setSubMenu("informations")}
              >
                <h3>Informations</h3>
                <p>Accédez et modifiez vos données personnelles</p>
              </div>

            </div>
          )}

          {subMenu === "demandes" && (
            <div className="sub-content">
              <button className="back-btn" onClick={() => setSubMenu("")}>
                ← Retour
              </button>

              <div className="card-grid small">
                <Link to="/dossiers/demandes/acompte" className="mini-card">Acompte</Link>
                <Link to="/dossiers/demandes/avance" className="mini-card">Avance</Link>
                <Link to="/dossiers/demandes/calendrier" className="mini-card">Calendrier</Link>
                <Link to="/dossiers/demandes/fiches" className="mini-card">Fiches</Link>
                <Link to="/dossiers/demandes/paiement-cet" className="mini-card">Paiement CET</Link>
                <Link to="/dossiers/demandes/paiement-hsup" className="mini-card">H Sup</Link>
              </div>
            </div>
          )}

          {subMenu === "informations" && (
            <div className="sub-content">
              <button className="back-btn" onClick={() => setSubMenu("")}>
                ← Retour
              </button>

              <div className="card-grid small">
                <Link to="/dossiers/informations/etat-civil" className="mini-card">Etat Civil</Link>
                <Link to="/dossiers/informations/adresse" className="mini-card">Adresse</Link>
                <Link to="/dossiers/informations/famille" className="mini-card">Famille</Link>
                <Link to="/dossiers/informations/iban" className="mini-card">IBAN</Link>
                <Link to="/dossiers/informations/documents" className="mini-card">Documents</Link>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ACTIVITES */}
      {menu === "activites" && (
        <div className="panel">
          <div className="card-grid small">
            <Link to="/activites/planning" className="mini-card">Planning</Link>
            <Link to="/activites/absences" className="mini-card">Absences</Link>
            <Link to="/activites/pointages" className="mini-card">Pointages</Link>
          </div>
        </div>
      )}

    </div>
  );
}
