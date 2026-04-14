import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [menu, setMenu] = useState("dossier");

  const handleLogout = () => {
    localStorage.removeItem("access");
    navigate("/");
  };

  console.log("USER FRONT:", user); // 🔥 debug

  if (!user) return <div>Loading...</div>;

  return (
    <div className="app-layout">

      <Sidebar menu={menu} setMenu={setMenu} />

      <div className="main-area">

        <Header user={user} onLogout={handleLogout} />

        <div className="main-content">
          <h1>Bonjour {user.prenom}</h1>
          <Outlet context={{ menu, user, setMenu }} />
        </div>

      </div>
    </div>
  );
}
