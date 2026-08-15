import React from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  Bell,
  Mail,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";

import "../Styles/header.css";


export default function Header({
  user,
  onLogout,
}) {

  // =========================================================
  // NOM
  // =========================================================

  const firstName =
    user?.prenom
    || user?.first_name
    || "";

  const lastName =
    user?.nom
    || user?.last_name
    || "";

  const fullName =
    `${firstName} ${lastName}`.trim()
    || user?.username
    || "Utilisateur";


  // =========================================================
  // RÔLE
  // =========================================================

  const roleLabels = {
    SALARIE: "Salarié",
    RH: "Ressources humaines",
    ADMIN: "Administrateur",
  };

  const role =
    roleLabels[user?.role]
    || user?.role
    || "Salarié";


  // =========================================================
  // AVATAR
  // =========================================================

  const avatar =
    user?.photo
    || user?.profile_image
    || user?.avatar
    || null;


  const initials =
    (
      `${firstName.charAt(0)}`
      + `${lastName.charAt(0)}`
    )
      .toUpperCase()
      || user?.username
        ?.charAt(0)
        ?.toUpperCase()
      || "U";


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <header className="header">


      {/* ===================================================
          RECHERCHE
      =================================================== */}

      <div className="header-search">

        <Search size={18} />

        <input
          type="search"
          placeholder="Rechercher..."
          aria-label="Rechercher"
        />

      </div>


      {/* ===================================================
          DROITE
      =================================================== */}

      <div className="header-right">


        {/* NOTIFICATIONS */}

        <NavLink
          to="/home/notifications"
          className="header-icon"
          aria-label="Notifications"
        >

          <Bell size={22} />

        </NavLink>


        {/* MESSAGERIE */}

        <NavLink
          to="/home/messagerie"
          className="header-icon"
          aria-label="Messagerie"
        >

          <Mail size={22} />

        </NavLink>


        {/* PROFIL */}

        <NavLink
          to="/home/profile"
          className="header-profile"
          aria-label="Ouvrir mon profil"
        >

          {avatar ? (

            <img
              src={avatar}
              alt={`Profil de ${fullName}`}
            />

          ) : (

            <span
              className="header-avatar-fallback"
              aria-hidden="true"
            >
              {initials}
            </span>

          )}


          <div className="header-profile-text">

            <strong>
              {fullName}
            </strong>

            <span>
              {role}
            </span>

          </div>


          <ChevronDown size={18} />

        </NavLink>


        {/* DÉCONNEXION */}

        <button
          type="button"
          className="header-logout"
          onClick={onLogout}
          aria-label="Se déconnecter"
        >

          <LogOut size={20} />

        </button>


      </div>

    </header>
  );
}
