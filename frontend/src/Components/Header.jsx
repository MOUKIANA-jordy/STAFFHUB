import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/header.css";

export default function Header({ user }){

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/");

  };

  return(

    <div className="header">

      <div className="logo">
        StaffHub
      </div>

      <div className="menu">

        <Link to="/home">Accueil</Link>
        <Link to="/dossiers">Dossiers</Link>
        <Link to="/activites">Activités</Link>

      </div>

      <div className="user">

        Bonjour {user?.prenom} {user?.nom}

        <button className="logout-btn" onClick={logout}>
          Déconnexion
        </button>

      </div>

    </div>

  );

}
