import React from "react";
import { Home, Folder, Calendar, Settings } from "lucide-react";
import "../Styles/sidebar.css";

export default function Sidebar({ menu, setMenu }) {
  return (
    <div className="sidebar">

      <div className="sidebar-logo">
         MyApp
      </div>

      <nav className="sidebar-nav">

        <button
          className={menu === "dashboard" ? "side-item active" : "side-item"}
          onClick={() => setMenu("dashboard")}
        >
          <Home size={18} />
          Dashboard
        </button>

        <button
          className={menu === "dossier" ? "side-item active" : "side-item"}
          onClick={() => setMenu("dossier")}
        >
          <Folder size={18} />
          Dossiers
        </button>

        <button
          className={menu === "activites" ? "side-item active" : "side-item"}
          onClick={() => setMenu("activites")}
        >
          <Calendar size={18} />
          Activités
        </button>

        <button className="side-item">
          <Settings size={18} />
          Paramètres
        </button>

      </nav>

    </div>
  );
}
