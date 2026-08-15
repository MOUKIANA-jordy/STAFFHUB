import React from "react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  WalletCards,
} from "lucide-react";

import useAuth from "../Hooks/useAuth";

import Header from "../Components/Header";

import "../Styles/sidebar.css";
import "../Styles/header.css";
import "../Styles/admin.css";


export default function AdminLayout() {

  const navigate = useNavigate();

  const {
    user,
  } = useAuth();


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "access"
    );

    localStorage.removeItem(
      "refresh"
    );

    navigate(
      "/",
      {
        replace: true,
      }
    );

  };


  // =========================================================
  // CHARGEMENT
  // =========================================================

  if (!user) {

    return (
      <div className="app-loading">
        Chargement...
      </div>
    );

  }


  // =========================================================
  // LIENS ADMIN
  // =========================================================

  const adminLinks = [

    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },

    {
      label: "Salariés",
      path: "/admin/users",
      icon: Users,
    },

    {
      label: "Demandes",
      path: "/admin/requests",
      icon: FileText,
    },

    {
      label: "Planning",
      path: "/admin/calendar",
      icon: CalendarDays,
    },

    {
      label: "Paie",
      path: "/admin/paie",
      icon: WalletCards,
    },

    {
      label: "Paramètres",
      path: "/admin/settings",
      icon: Settings,
    },

  ];


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app-layout">


      {/* ===================================================
          SIDEBAR ADMIN
      =================================================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <strong>
            StaffHub
          </strong>

          <span>
            Administration RH
          </span>

        </div>


        <nav className="sidebar-nav">

          {adminLinks.map(
            ({
              label,
              path,
              icon: Icon,
              end,
            }) => (

              <NavLink
                key={path}
                to={path}
                end={end}
                className={({
                  isActive,
                }) =>
                  `nav-item ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >

                <Icon size={20} />

                <span>
                  {label}
                </span>

              </NavLink>

            )
          )}

        </nav>


        {/* RETOUR ESPACE SALARIÉ */}

        <div
          style={{
            marginTop: "auto",
            padding: "16px",
          }}
        >

          <NavLink
            to="/home"
            className="nav-item"
          >
            ← Espace salarié
          </NavLink>

        </div>

      </aside>


      {/* ===================================================
          CONTENU ADMIN
      =================================================== */}

      <div className="main-area">

        <Header
          user={user}
          onLogout={handleLogout}
        />


        <main className="main-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}
