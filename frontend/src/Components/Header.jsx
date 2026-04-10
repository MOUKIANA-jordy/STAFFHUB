import React, { useState } from "react";
import "../Styles/header.css";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header({ user, onLogout }) {

  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // 🔎 pages disponibles
  const pages = [
    { name: "Dashboard", path: "/" },
    { name: "Acompte", path: "/Dossiers/Demandes/acompte" },
    { name: "Avances", path: "/Dossiers/Demandes/avance" },
    { name: "Calendrier", path: "/Dossiers/Demandes/calendrier" },
    { name: "Fiches", path: "/Dossiers/Demandes/fiches" },
    { name: "Paiement_Cet", path: "/Dossiers/Demandes/paiement_cet" },
    { name: "H_Sup", path: "/Dossiers/Demandes/h_sup" },
    { name: "Etat_Civil", path: "/Dossiers/Informations/etat_civil" },
    { name: "Adresse", path: "/Dossiers/Informations/adresse" },
    { name: "Famille", path: "/Dossiers/Informations/famille" },
    { name: "IBAN", path: "/Dossiers/Informations/iban" },
    { name: "Documents", path: "/Dossiers/Informations/documents" },
    { name: "Absences", path: "/Activites/absences" },
    { name: "Planning", path: "/Activites/planning" },
    { name: "Pointage", path: "/Activites/pointages" },
  ];

  const results = pages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="header">

      {/* LEFT */}
      <div className="header-left">
        <div className="logo">MyEntreprise</div>

        {/* SEARCH */}
        <div className="search-box">

          <input
            className="search"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <div className="search-dropdown">
              {results.map((item, index) => (
                <p
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setSearch("");
                  }}
                >
                  {item.name}
                </p>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT */}
      <div className="header-right">

        {/* NOTIF */}
        <div className="notif">
          <button onClick={() => setOpenNotif(!openNotif)}>
            <Bell size={18} />
            <span className="notif-badge">3</span>
          </button>

          {openNotif && (
            <div className="notif-dropdown">
              <p>Nouvelle demande</p>
              <p>Absence validée</p>
              <p>Mise à jour RH</p>
            </div>
          )}
        </div>

        {/* USER */}
        <div className="user-menu">
          <button onClick={() => setOpenUser(!openUser)} className="user-btn">
            👤 {user?.prenom}
          </button>

          {openUser && (
            <div className="user-dropdown">
              <p>Mon profil</p>
              <p>Paramètres</p>
              <p onClick={onLogout}>Déconnexion</p>
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
        </button>

      </div>

    </header>
  );
}
