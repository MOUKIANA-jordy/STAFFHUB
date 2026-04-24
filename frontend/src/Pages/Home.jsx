import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "../index.css";
import "./AdminDashboard";
import settings from "../Components/Settings";
import "./AdminPanel";

export default function Home() {
  const location = useLocation();
  const [subMenu, setSubMenu] = useState("");

  const isDossiers = location.pathname.includes("dossiers");
  const isActivites = location.pathname.includes("activites");

  return (
    <div className="home">

      {/* HERO */}
      <div className="hero">
        <h1>Gestion d’entreprise</h1>
        <p>Centralisez vos demandes, informations et activités</p>
      </div>

      {/* ===== DOSSIERS ===== */}
      {isDossiers && (
        <div className="panel">

          {!subMenu && (
            <div className="card-grid">

              <div className="card" onClick={() => setSubMenu("demandes")}>
                <h3>Demandes</h3>
                <p>Gérez vos demandes administratives</p>
              </div>

              <div className="card" onClick={() => setSubMenu("infos")}>
                <h3>Informations</h3>
                <p>Accédez à vos données personnelles</p>
              </div>

            </div>
          )}

          {subMenu === "demandes" && (
            <div>
              <button className="back-btn" onClick={() => setSubMenu("")}>
                ← Retour
              </button>

              <div className="card-grid">

                <Link to="/dossiers/demandes/acompte" className="mini-card">Acompte</Link>
                <Link to="/dossiers/demandes/avance" className="mini-card">Avance</Link>
                <Link to="/dossiers/demandes/calendrier" className="mini-card">Calendrier</Link>
                <Link to="/dossiers/demandes/fiches" className="mini-card">Fiches</Link>
                <Link to="/dossiers/demandes/paiement-cet" className="mini-card">Paiement CET</Link>
                <Link to="/dossiers/demandes/paiement-hsup" className="mini-card">H Sup</Link>

              </div>
            </div>
          )}

          {subMenu === "infos" && (
            <div>
              <button className="back-btn" onClick={() => setSubMenu("")}>
                ← Retour
              </button>

              <div className="card-grid">

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

      {/* ===== ACTIVITÉS ===== */}
      {isActivites && (
        <div className="panel">

          <div className="card-grid">

            <Link to="/activites/absences" className="mini-card">Absences</Link>
            <Link to="/activites/planning" className="mini-card">Planning</Link>
            <Link to="/activites/pointages" className="mini-card">Pointages</Link>

          </div>

        </div>
      )}

    </div>
  );
}
