import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Components/Header";
import Sidebar from "../Components/Sidebar";

export default function MainLayout({ user }) {

  const [menu, setMenu] = useState("dashboard");

  const handleLogout = () => {
    console.log("Déconnexion...");
    // localStorage.clear();
    // navigate("/");
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar menu={menu} setMenu={setMenu} />

      {/* CONTENU PRINCIPAL */}
      <div className="main-area">

        {/* HEADER */}
        <Header
          user={user}
          menu={menu}
          setMenu={setMenu}
          onLogout={handleLogout}
        />

        {/* PAGES */}
        <div className="main-content">
          <Outlet context={{ menu }} />
        </div>

      </div>

    </div>
  );
}
