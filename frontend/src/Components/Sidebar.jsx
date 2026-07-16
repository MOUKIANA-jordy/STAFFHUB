import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  CalendarDays,
  FileText,
  Mail,
  ClipboardList,
  Users,
  CreditCard,
  Settings,
  Clock3,
  LogOut,
  Menu,
  ChevronRight,
  House,
} from "lucide-react";

import useAuth from "../Hooks/useAuth";
import "../Styles/sidebar.css";

const userLinks = [
  {
    label: "Accueil",
    icon: House,
    path: "/home",
  },
  {
    label: "Dossiers",
    icon: Folder,
    path: "/home/dossiers",
    hasArrow: true,
  },
  {
    label: "Activités",
    icon: CalendarDays,
    path: "/home/activites",
    hasArrow: true,
  },
  {
    label: "Documents",
    icon: FileText,
    path: "/dossiers/informations/documents",
  },
  {
    label: "Messagerie",
    icon: Mail,
    path: "/messagerie",
  },
  {
    label: "Planning",
    icon: CalendarDays,
    path: "/activites/planning",
  },
  {
    label: "Pointages",
    icon: Clock3,
    path: "/activites/pointages",
  },
];

const adminLinks = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    label: "Utilisateurs",
    icon: Users,
    path: "/admin/users",
  },
  {
    label: "Demandes",
    icon: ClipboardList,
    path: "/admin/demandes",
  },
  {
    label: "Paie",
    icon: CreditCard,
    path: "/admin/paie",
  },
  {
    label: "Paramètres",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin =
    user?.is_staff ||
    user?.is_superuser ||
    user?.role?.toLowerCase() === "admin" ||
    user?.role?.toLowerCase() === "administrateur";

  const navClassName = ({ isActive }) =>
    `sidebar-link${isActive ? " sidebar-link-active" : ""}`;

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erreur pendant la déconnexion :", error);
    }
  };

  const renderLink = (link) => {
    const Icon = link.icon;

    return (
      <NavLink
        key={link.path}
        to={link.path}
        className={navClassName}
        end={link.path === "/home" || link.path === "/admin"}
      >
        <Icon className="sidebar-link-icon" size={21} strokeWidth={1.8} />

        <span className="sidebar-link-label">{link.label}</span>

        {link.hasArrow && (
          <ChevronRight
            className="sidebar-link-arrow"
            size={18}
            strokeWidth={1.8}
          />
        )}
      </NavLink>
    );
  };

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <button
          type="button"
          className="sidebar-menu-button"
          aria-label="Réduire le menu"
        >
          <Menu size={24} />
        </button>

        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">
            G
          </div>

          <div className="sidebar-brand-text">
            <strong>GestioPro</strong>
            <span>Gestion d’entreprise</span>
          </div>
        </div>
      </header>

      <nav className="sidebar-nav" aria-label="Navigation principale">
        <div className="sidebar-section">
          {userLinks.map(renderLink)}
        </div>

        {isAdmin && (
          <div className="sidebar-section sidebar-admin-section">
            <p className="sidebar-section-title">Administration</p>

            {adminLinks.map(renderLink)}
          </div>
        )}
      </nav>

      <footer className="sidebar-footer">
        <button
          type="button"
          className="sidebar-logout-button"
          onClick={handleLogout}
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span>Déconnexion</span>
        </button>
      </footer>
    </aside>
  );
}
