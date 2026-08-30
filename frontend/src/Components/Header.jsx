import React from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  Bell,
  Mail,
  Search,
  ChevronDown,
} from "lucide-react";

import "../Styles/header.css";


export default function Header({
  user,
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

        <Search
          size={18}
          strokeWidth={1.8}
        />

        <input
          type="search"
          placeholder="Rechercher dans RH Manager..."
          aria-label="Rechercher"
        />

      </div>


      {/* ===================================================
          DROITE
      =================================================== */}

      <div className="header-right">

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <NavLink
          to="/home/notifications"
          className={({ isActive }) =>
            `header-icon ${
              isActive
                ? "header-icon-active"
                : ""
            }`
          }
          aria-label="Notifications"
          title="Notifications"
        >

          <Bell
            size={21}
            strokeWidth={1.8}
          />

        </NavLink>


        {/* =================================================
            MESSAGERIE
        ================================================= */}

        <NavLink
          to="/home/messagerie"
          className={({ isActive }) =>
            `header-icon ${
              isActive
                ? "header-icon-active"
                : ""
            }`
          }
          aria-label="Messagerie"
          title="Messagerie"
        >

          <Mail
            size={21}
            strokeWidth={1.8}
          />

        </NavLink>


        {/* =================================================
            PROFIL
        ================================================= */}

        <NavLink
          to="/home/profile"
          className={({ isActive }) =>
            `header-profile ${
              isActive
                ? "header-profile-active"
                : ""
            }`
          }
          aria-label="Ouvrir mon profil"
        >

          {/* AVATAR */}

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


          {/* INFORMATIONS UTILISATEUR */}

          <div className="header-profile-text">

            <strong>
              {fullName}
            </strong>

            <span>
              {role}
            </span>

          </div>


          {/* CHEVRON */}

          <ChevronDown
            size={17}
            strokeWidth={1.8}
            className="header-profile-chevron"
          />

        </NavLink>

      </div>

    </header>
  );
}
