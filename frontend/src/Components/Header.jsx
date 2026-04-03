import React from "react";
import "../Styles/header.css";

export default function Header({ user, menu, setMenu, onLogout }) {
  return (
    <header className="header">

      {/* GAUCHE */}
      <div className="header-left">
        <button
          className={menu === "dossier" ? "nav-btn active" : "nav-btn"}
          onClick={() => setMenu("dossier")}
        >
          Dossier
        </button>

        <button
          className={menu === "activites" ? "nav-btn active" : "nav-btn"}
          onClick={() => setMenu("activites")}
        >
          Activité
        </button>
      </div>

      {/* DROITE */}
      <div className="header-right">
        <p className="user-text">
          Vous êtes connecté en tant que <strong>Agent</strong>
          {user && ` (${user.prenom} ${user.nom})`}
        </p>

        <button className="logout-btn" onClick={onLogout}>
          Déconnexion
        </button>
      </div>

    </header>
  );
}
