import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/home.css";

export default function Home({ user }) {

  const [menu, setMenu] = useState("");

  return (

    <div className="home">

      {/* HEADER */}
      <div className="header">

        <div className="header-left">

          <div className="logo">
            StaffHub
          </div>

          <div className="top-menu">

            <button
              className={menu === "dossier" ? "tab active" : "tab"}
              onClick={() => setMenu("dossier")}
            >
              Dossier
            </button>

            <button
              className={menu === "activites" ? "tab active" : "tab"}
              onClick={() => setMenu("activites")}
            >
              Activités
            </button>

          </div>

        </div>


        {/* USER + ICONES */}
        <div className="header-right">

          <div className="user-box">

            <input
              className="user-input"
              value={user?.nom}
              readOnly
            />

            <input
              className="user-input"
              value={user?.prenom}
              readOnly
            />

          </div>

          <div className="icons">

            <button title="Workflow">📁</button>
            <button title="Favoris">⭐</button>
            <button title="Plein écran">⛶</button>

          </div>

        </div>

      </div>


      {/* MENU DOSSIER */}
      {menu === "dossier" && (

        <div className="submenu">

          <div className="submenu-section">

            <h3>Demandes</h3>

            <div className="links">

              <Link to="/dossiers/demandes/acompte">Acompte</Link>
              <Link to="/dossiers/demandes/avance">Avance</Link>
              <Link to="/dossiers/demandes/calendrier">Calendrier</Link>
              <Link to="/dossiers/demandes/fiches">Fiches</Link>
              <Link to="/dossiers/demandes/paiement-cet">Paiement CET</Link>
              <Link to="/dossiers/demandes/paiement-hsup">Paiement H Sup</Link>

            </div>

          </div>

          <div className="submenu-section">

            <h3>Informations</h3>

            <div className="links">

              <Link to="/dossiers/informations/etat-civil">Etat Civil</Link>
              <Link to="/dossiers/informations/adresse">Adresse</Link>
              <Link to="/dossiers/informations/famille">Famille</Link>
              <Link to="/dossiers/informations/iban">IBAN</Link>
              <Link to="/dossiers/informations/documents">Documents</Link>

            </div>

          </div>

        </div>

      )}


      {/* MENU ACTIVITES */}
      {menu === "activites" && (

        <div className="submenu">

          <div className="submenu-section">

            <div className="links">

              <Link to="/activites/planning">Planning</Link>
              <Link to="/activites/absences">Absences</Link>
              <Link to="/activites/pointages">Pointages</Link>

            </div>

          </div>

        </div>

      )}


      {/* CONTENU */}
      <div className="content">

        <h2>Bienvenue sur StaffHub</h2>

      </div>

    </div>

  );

}
