import React from "react";
import "../Styles/home.css";

export default function Home({ user }) {

  return (
    <div className="home">

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          <h2>StaffHub</h2>
        </div>

        <nav className="menu">
          <button>Dossier</button>
          <button>Activités</button>
        </nav>

        <div className="user-info">
          {user ? (
            <span>Bonjour {user.prenom} {user.nom}</span>
          ) : (
            <span>Bonjour</span>
          )}
        </div>

      </header>

      {/* SOUS MENU */}
      <div className="submenu">

        <button>Mes demandes</button>
        <button>Informations</button>
        <button>Médical</button>

      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="content">

        <h2>Bienvenue sur StaffHub</h2>

      </div>

    </div>
  );
}
