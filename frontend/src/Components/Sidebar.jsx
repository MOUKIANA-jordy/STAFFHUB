import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">

      <h2 className="logo">StaffHub</h2>

      {/* DASHBOARD */}
      <div className="nav-item" onClick={() => navigate("/admin-dashboard")}>
        🏠 Dashboard
      </div>

      {/* DOSSIERS */}
      <div className="nav-item" onClick={() => navigate("/home/dossiers")}>
        📁 Dossiers
      </div>

      {/* ACTIVITÉS */}
      <div className="nav-item" onClick={() => navigate("/home/activites")}>
        📊 Activités
      </div>

      {/* PARAMÈTRES */}
      <div className="nav-item" onClick={() => navigate("/settings")}>
        ⚙️ Paramètres
      </div>

    </div>
  );
}
