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
    path: "/home/messagerie",
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

  const role = user?.role?.toLowerCase();

  const isAdmin =
    user?.is_staff ||
    user?.is_superuser ||
    role === "admin" ||
    role === "administrateur";

  const navClassName = ({ isActive }) =>
    `sidebar-link${isActive ? " sidebar-link-active" : ""}`;

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Erreur pendant la déconnexion :", error);

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      navigate("/", { replace: true });
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
        <span className="sidebar-icon-wrapper">
          <Icon
            className="sidebar-link-icon"
            size={20}
            strokeWidth={1.8}
          />
        </span>

        <span className="sidebar-link-label">
          {link.label}
        </span>

        {link.hasArrow && (
          <ChevronRight
            className="sidebar-link-arrow"
            size={17}
            strokeWidth={1.8}
          />
        )}
      </NavLink>
    );
  };

  return (
    <aside className="sidebar">

      {/* ================= HEADER ================= */}

      <header className="sidebar-header">

        <div className="sidebar-brand">

          <div className="sidebar-logo-container">
            <img
              src="/images/rh-logo.png"
              alt="RH Manager"
              className="sidebar-logo-image"
            />
          </div>

          <div className="sidebar-brand-text">
            <strong>
              <span className="brand-rh">RH</span>
              <span className="brand-manager">Manager</span>
            </strong>

            <span>Ressources humaines</span>
          </div>

        </div>

        <button
          type="button"
          className="sidebar-menu-button"
          aria-label="Réduire le menu"
        >
          <Menu size={21} />
        </button>

      </header>

      {/* ================= NAVIGATION ================= */}

      <nav
        className="sidebar-nav"
        aria-label="Navigation principale"
      >

        <p className="sidebar-section-title">
          Espace personnel
        </p>

        <div className="sidebar-section">
          {userLinks.map(renderLink)}
        </div>

        {/* ================= ADMIN ================= */}

        {isAdmin && (
          <div className="sidebar-admin-section">

            <p className="sidebar-section-title">
              Administration
            </p>

            <div className="sidebar-section">
              {adminLinks.map(renderLink)}
            </div>

          </div>
        )}

      </nav>

      {/* ================= FOOTER ================= */}

      <footer className="sidebar-footer">

        <div className="sidebar-user-mini">

          <div className="sidebar-user-avatar">
            {user?.first_name?.charAt(0)?.toUpperCase() ||
              user?.username?.charAt(0)?.toUpperCase() ||
              "U"}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : user?.username || "Utilisateur"}
            </strong>

            <span>
              {isAdmin
                ? "Administrateur"
                : user?.role || "Salarié"}
            </span>
          </div>

        </div>

        <button
          type="button"
          className="sidebar-logout-button"
          onClick={handleLogout}
          title="Déconnexion"
        >
          <LogOut size={19} strokeWidth={1.8} />
        </button>

      </footer>

    </aside>
  );
}
