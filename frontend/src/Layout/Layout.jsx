import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

export default function Layout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/", { replace: true });
  };

  if (!user) {
    return <div className="app-loading">Chargement...</div>;
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Header user={user} onLogout={handleLogout} />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
