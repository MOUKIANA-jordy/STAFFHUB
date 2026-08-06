import React from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  Mail,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";

import "../Styles/header.css";

export default function Header({ user, onLogout }) {
  const fullName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || "Utilisateur";

  const role =
    user?.is_superuser || user?.is_staff
      ? "Administrateur"
      : user?.role || "Salarié";

  const avatar =
    user?.photo ||
    user?.profile_image ||
    user?.avatar ||
    "/images/default-avatar.png";

  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} />

        <input
          type="search"
          placeholder="Rechercher..."
          aria-label="Rechercher"
        />
      </div>

      <div className="header-right">
        <NavLink
          to="/home/notifications"
          className="header-icon"
          aria-label="Notifications"
        >
          <Bell size={22} />
          <span className="badge">2</span>
        </NavLink>

        <NavLink
          to="/home/messagerie"
          className="header-icon"
          aria-label="Messagerie"
        >
          <Mail size={22} />
          <span className="badge">3</span>
        </NavLink>

        <NavLink to="/home/profil" className="header-profile">
          <img src={avatar} alt={`Profil de ${fullName}`} />

          <div className="header-profile-text">
            <strong>{fullName}</strong>
            <span>{role}</span>
          </div>

          <ChevronDown size={18} />
        </NavLink>

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
