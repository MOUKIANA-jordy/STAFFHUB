import React from "react";

import {
  Outlet,
} from "react-router-dom";

import useAuth from "../Hooks/useAuth";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import "../Styles/layout.css";


export default function Layout() {

  // =========================================================
  // UTILISATEUR CONNECTÉ
  // =========================================================

  const {
    user,
  } = useAuth();


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
  // RENDER
  // =========================================================

  return (
    <div className="app-layout">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar />


      {/* ===================================================
          CONTENU PRINCIPAL
      =================================================== */}

      <div className="main-area">

        <Header
          user={user}
        />


        <main className="main-content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}
