import React, { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import "../Styles/home.css";

export default function Home() {
  const context = useOutletContext() || {};
  const menu = context.menu || "dossier";

  const [subMenu, setSubMenu] = useState("");

  return (
    <div className="home">

      <div className="hero">
        <h1>Gestion d’entreprise</h1>
        <p>Centralisez vos demandes, informations et activités</p>
      </div>

      {menu === "dossier" && (
        <div className="panel">
          <h2>Dossiers</h2>
        </div>
      )}

      {menu === "activites" && (
        <div className="panel">
          <h2>Activités</h2>
        </div>
      )}

    </div>
  );
}
