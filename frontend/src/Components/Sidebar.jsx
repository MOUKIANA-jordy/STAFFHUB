import React, { useState } from "react";

export default function Sidebar({ menu, setMenu }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* TOP */}
      <div className="sidebar-top">
        <h2 className="logo">{collapsed ? "S" : "StaffHub"}</h2>

        <button
          className="toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          ☰
        </button>
      </div>

      {/* NAV */}
      <nav className="nav">

        <div
          className={`nav-item ${menu === "dossier" ? "active" : ""}`}
          onClick={() => setMenu("dossier")}
        >
          📁 {!collapsed && <span>Dossiers</span>}
        </div>

        <div
          className={`nav-item ${menu === "activites" ? "active" : ""}`}
          onClick={() => setMenu("activites")}
        >
          📊 {!collapsed && <span>Activités</span>}
        </div>

        <div
          className={`nav-item ${menu === "settings" ? "active" : ""}`}
          onClick={() => setMenu("settings")}
        >
          ⚙️ {!collapsed && <span>Settings</span>}
        </div>

      </nav>

    </div>
  );
}
