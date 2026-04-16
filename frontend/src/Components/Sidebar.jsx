import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">

      <h2 className="logo">StaffHub</h2>

      <div className="nav-item" onClick={() => navigate("/home/dossiers")}>
        📁 Dossiers
      </div>

      <div className="nav-item" onClick={() => navigate("/home/activites")}>
        📊 Activités
      </div>

    </div>
  );
}
