import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Components/Header";

export default function MainLayout({ user }) {

  const [menu, setMenu] = useState("");

  const handleLogout = () => {
    console.log("Déconnexion...");
    // 👉 ici tu peux ajouter :
    // localStorage.clear();
    // sessionStorage.clear();
    // navigate("/");
  };

  return (
    <div className="app-layout">

      {/* HEADER GLOBAL */}
      <Header
        user={user}
        menu={menu}
        setMenu={setMenu}
        onLogout={handleLogout}
      />

      {/* CONTENU DES PAGES */}
      <div className="main-content">
        <Outlet context={{ menu }} />
      </div>

    </div>
  );
}
