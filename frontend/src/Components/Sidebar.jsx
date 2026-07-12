import React from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import "../Styles/sidebar.css";

const userLinks = [
  { label: "Accueil", icon: "⌂", path: "/home" },
  { label: "Dossiers", icon: "▣", path: "/home/dossiers" },
  { label: "Activités", icon: "◫", path: "/home/activites" },
  {
    label: "Documents",
    icon: "▤",
    path: "/dossiers/informations/documents",
  },
  { label: "Planning", icon: "▦", path: "/activites/planning" },
  { label: "Pointages", icon: "◷", path: "/activites/pointages" },
];

const adminLinks = [
  { label: "Tableau de bord", icon: "◉", path: "/admin" },
  { label: "Utilisateurs", icon: "♟", path: "/admin/users" },
  { label: "Demandes", icon: "▤", path: "/admin/demandes" },
  { label: "Calendrier", icon: "▦", path: "/admin/calendar" },
  { label: "Paie", icon: "€", path: "/admin/paie" },
  { label: "Paramètres", icon: "⚙", path: "/admin/settings" },
];

export default function Sidebar() {
  const { user } = useAuth();

  const isAdmin =
    user?.is_staff ||
    user?.is_superuser ||
    user?.role === "admin" ||
    user?.role === "administrateur";

  const navClassName = ({ isActive }) =>
    `sidebar-link${isActive ? " sidebar-link-active" : ""}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">G</div>

        <div className="sidebar-brand-text">
          <strong>GestioPro</strong>
          <span>Gestion d’entreprise</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        <div className="sidebar-section">
          {userLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={navClassName}
              end={link.path === "/home"}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span className="sidebar-link-label">{link.label}</span>
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <div className="sidebar-section sidebar-admin-section">
            <p className="sidebar-section-title">Administration</p>

            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={navClassName}
                end={link.path === "/admin"}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-label">{link.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" className={navClassName}>
          <span className="sidebar-avatar">
            {user?.first_name?.charAt(0)?.toUpperCase() ||
              user?.username?.charAt(0)?.toUpperCase() ||
              "U"}
          </span>

          <span className="sidebar-user">
            <strong>
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username || "Utilisateur"}
            </strong>

            <small>{isAdmin ? "Administrateur" : "Salarié"}</small>
          </span>
        </NavLink>
      </div>
    </aside>
  );
}
