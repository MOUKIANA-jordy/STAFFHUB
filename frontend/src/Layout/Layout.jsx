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
    navigate("/");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="main-area">

        <Header user={user} onLogout={handleLogout} />

        <div className="main-content">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
