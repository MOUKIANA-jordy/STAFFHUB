import React from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

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
  ChevronRight,
  House,
  ShieldCheck,
} from "lucide-react";

import useAuth from "../Hooks/useAuth";

import "../Styles/sidebar.css";


/* =========================================================
   NAVIGATION SALARIÉ
========================================================= */

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


/* =========================================================
   NAVIGATION ADMIN
========================================================= */

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
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();


  /* =======================================================
     PERMISSIONS
  ======================================================= */

  const role =
    user?.role
      ?.toLowerCase();


  const isAdmin =
    user?.is_staff
    || user?.is_superuser
    || role === "admin"
    || role === "administrateur";


  /* =======================================================
     CLASS NAVIGATION
  ======================================================= */

  const navClassName =
    ({
      isActive,
    }) =>
      (
        `sidebar-link${
          isActive
            ? " sidebar-link-active"
            : ""
        }`
      );


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout =
    async () => {
      try {
        if (logout) {
          await logout();
        }

        navigate(
          "/",
          {
            replace: true,
          }
        );

      } catch (error) {
        console.error(
          "Erreur pendant la déconnexion :",
          error
        );

        localStorage.removeItem(
          "access"
        );

        localStorage.removeItem(
          "refresh"
        );

        sessionStorage.removeItem(
          "access"
        );

        sessionStorage.removeItem(
          "refresh"
        );

        navigate(
          "/",
          {
            replace: true,
          }
        );
      }
    };


  /* =======================================================
     LIEN
  ======================================================= */

  const renderLink =
    (link) => {
      const Icon =
        link.icon;


      return (
        <NavLink
          key={link.path}
          to={link.path}
          className={
            navClassName
          }
          end={
            link.path === "/home"
            || link.path === "/admin"
          }
          title={link.label}
        >

          <span className="sidebar-icon-wrapper">

            <Icon
              className="sidebar-link-icon"
              size={19}
              strokeWidth={1.8}
            />

          </span>


          <span className="sidebar-link-label">
            {link.label}
          </span>


          {
            link.hasArrow
            && (
              <ChevronRight
                className="sidebar-link-arrow"
                size={16}
                strokeWidth={1.8}
              />
            )
          }

        </NavLink>
      );
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <aside className="sidebar">

      {/* ===================================================
          LOGO
      =================================================== */}

      <header className="sidebar-header">

        <NavLink
          to="/home"
          className="sidebar-brand"
          aria-label="Accueil RH Manager"
        >

          <div className="sidebar-logo-container">

            <img
              src="/images/rh-logo.png"
              alt="RH Manager"
              className="sidebar-logo-image"
            />

          </div>


          <div className="sidebar-brand-text">

            <strong>

              <span className="brand-rh">
                RH
              </span>

              <span className="brand-manager">
                Manager
              </span>

            </strong>


            <span>
              Ressources humaines
            </span>

          </div>

        </NavLink>

      </header>


      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <nav
        className="sidebar-nav"
        aria-label="Navigation principale"
      >

        <div className="sidebar-navigation-block">

          <p className="sidebar-section-title">
            Espace personnel
          </p>


          <div className="sidebar-section">

            {
              userLinks.map(
                renderLink
              )
            }

          </div>

        </div>


        {/* =================================================
            ADMINISTRATION
        ================================================= */}

        {
          isAdmin
          && (
            <div className="sidebar-admin-section">

              <p className="sidebar-section-title">
                Administration
              </p>


              <div className="sidebar-section">

                {
                  adminLinks.map(
                    renderLink
                  )
                }

              </div>

            </div>
          )
        }

      </nav>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="sidebar-footer">

        <div className="sidebar-footer-content">

          <div className="sidebar-security">

            <span className="sidebar-security-icon">

              <ShieldCheck
                size={17}
                strokeWidth={1.8}
              />

            </span>


            <div className="sidebar-security-text">

              <strong>
                StaffHub
              </strong>

              <span>
                Espace sécurisé
              </span>

            </div>

          </div>


          <button
            type="button"
            className="sidebar-logout-button"
            onClick={
              handleLogout
            }
            title="Déconnexion"
            aria-label="Se déconnecter"
          >

            <LogOut
              size={18}
              strokeWidth={1.8}
            />

          </button>

        </div>

      </footer>

    </aside>
  );
}
