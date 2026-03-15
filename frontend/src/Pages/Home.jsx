import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/home.css";
import "../Components/Header.jsx";

export default function Home({ user }) {

  const [menu, setMenu] = useState("");

  return (
    <div className="home">

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          <h2>StaffHub</h2>
        </div>

        <nav className="menu">

          <button onClick={() => setMenu("dossiers")}>
            Dossiers
          </button>

          <button onClick={() => setMenu("activites")}>
            Activités
          </button>

        </nav>

        <div className="user-info">
          {user ? (
            <span>Bonjour {user.prenom} {user.nom}</span>
          ) : (
            <span>Bonjour</span>
          )}
        </div>

      </header>


      {/* SOUS MENU DOSSIERS */}
      {menu === "dossiers" && (
        <div className="submenu">

          <h3>Demandes</h3>

          <Link to="/dossiers/demandes/acompte">Acompte</Link>
          <Link to="/dossiers/demandes/avance">Avance</Link>
          <Link to="/dossiers/demandes/calendrier">Calendrier</Link>
          <Link to="/dossiers/demandes/fiches">Fiches</Link>
          <Link to="/dossiers/demandes/paiement-cet">Paiement CET</Link>
          <Link to="/dossiers/demandes/paiement-hsup">Paiement H Sup</Link>

          <h3>Informations</h3>

          <Link to="/dossiers/informations/etat-civil">Etat Civil</Link>
          <Link to="/dossiers/informations/adresse">Adresse</Link>
          <Link to="/dossiers/informations/famille">Famille</Link>
          <Link to="/dossiers/informations/iban">IBAN</Link>
          <Link to="/dossiers/informations/documents">Documents</Link>

        </div>
      )}


      {/* SOUS MENU ACTIVITES */}
      {menu === "activites" && (
        <div className="submenu">

          <Link to="/activites/planning">Planning</Link>
          <Link to="/activites/pointages">Pointages</Link>
          <Link to="/activites/absences">Absences</Link>

        </div>
      )}


      {/* CONTENU PRINCIPAL */}
      <div className="content">

        <h2>Bienvenue sur StaffHub</h2>

      </div>

    </div>
  );
}
