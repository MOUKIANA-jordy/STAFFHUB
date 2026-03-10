import React from "react";
import "../Styles/header.css";

export default function Header({ user }) {
  return (

    <header className="header">

      <div className="logo">
        <h2>StaffHub</h2>
      </div>

      <nav className="menu">
        <button>Dossier</button>
        <button>Activités</button>
      </nav>

      <div className="user">
        {user ? (
          <span>Bonjour {user.prenom} {user.nom}</span>
        ) : (
          <span>Bonjour</span>
        )}
      </div>

    </header>

  );
}
