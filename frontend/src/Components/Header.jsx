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
    { name: "Acompte", path: "/dossiers/demandes/acompte" },
    { name: "Avance", path: "/dossiers/demandes/avance" },
    { name: "Calendrier", path: "/dossiers/demandes/calendrier" },
    { name: "Fiches", path: "/dossiers/demandes/fiches" },
    { name: "Paiement CET", path: "/dossiers/demandes/paiement-cet" },
    { name: "Heures Sup", path: "/dossiers/demandes/paiement-hsup" },
    { name: "Etat Civil", path: "/dossiers/informations/etat-civil" },
    { name: "Adresse", path: "/dossiers/informations/adresse" },
    { name: "Famille", path: "/dossiers/informations/famille" },
    { name: "IBAN", path: "/dossiers/informations/iban" },
    { name: "Documents", path: "/dossiers/informations/documents" },
    { name: "Absences", path: "/activites/absences" },
    { name: "Planning", path: "/activites/planning" },
    { name: "Pointages", path: "/activites/pointages" },
  ];

  const results = pages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <header className="header">

      {/* LEFT */}
      <div className="header-left">

        <div className="logo">StaffHub</div>

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

        {/* 🔔 NOTIFICATIONS */}
        <div className="notif">
          <button onClick={() => setOpenNotif(!openNotif)}>
            <Bell size={18} />
            <span className="notif-badge">3</span>
          </button>

          {openNotif && (
            <div className="notif-dropdown">

              {/* Nouvelle demande */}
              <p className="notif-title">Nouvelle demande</p>

              <p onClick={() => navigate("/dossiers/demandes/acompte")}>
                → Acompte
              </p>

              <p onClick={() => navigate("/dossiers/demandes/avance")}>
                → Avance
              </p>

              <p onClick={() => navigate("/dossiers/demandes/paiement-cet")}>
                → Paiement CET
              </p>

              <p onClick={() => navigate("/dossiers/demandes/paiement-hsup")}>
                → Heures Sup
              </p>

              <hr />

              <p onClick={() => navigate("/activites/absences")}>
                Absence validée
              </p>

              <p onClick={() => navigate("/home")}>
                Mise à jour RH
              </p>

            </div>
          )}
        </div>

        {/* 👤 USER */}
        <div className="user-menu">
          <button onClick={() => setOpenUser(!openUser)} className="user-btn">
            👤 {user?.prenom}
          </button>

          {openUser && (
            <div className="user-dropdown">
              <p onClick={() => navigate("/profile")}>
                Mon profil
              </p>

              <p onClick={() => navigate("/settings")}>
                Paramètres
              </p>

              <p onClick={onLogout}>
                Déconnexion
              </p>
            </div>
          )}
        </div>

        {/* 🚪 LOGOUT */}
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
        </button>

      </div>

    </header>
  );
}
