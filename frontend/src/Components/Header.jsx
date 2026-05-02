import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Settings, Bell, Search } from "lucide-react";
import logo from "../assets/logo.png";
import API from "../Services/api";
import "../index.css";

export default function Header({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const ref = useRef();

  // LOAD NOTIFS
  useEffect(() => {
    API.get("/api/notifications/")
      .then(res => setNotifications(res.data))
      .catch(() => {});
  }, []);

  // CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">

      {/* LEFT */}
      <div className="header-left">
        <img src={logo} alt="logo" className="header-logo" />
        <h2 className="app-name">StaffHub</h2>
      </div>

      {/* SEARCH */}
      <div className="search-bar">
        <Search size={16} />
        <input placeholder="Rechercher..." />
      </div>

      {/* RIGHT */}
      <div className="header-right" ref={ref}>

        {/* NOTIFICATIONS */}
        <div
          className="icon-btn"
          onClick={() => setShowNotif(!showNotif)}
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <span className="notif-badge">
              {notifications.length}
            </span>
          )}
        </div>

        {showNotif && (
          <div className="dropdown notif-menu">
            {notifications.length === 0 ? (
              <p className="empty">Aucune notification</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="dropdown-item">
                  {n.message}
                </div>
              ))
            )}
          </div>
        )}

        {/* PROFILE */}
        <div
          className="profile stripe"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          <div className="avatar">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>

          <div className="profile-info">
            <span className="name">
              {user?.prenom} {user?.nom}
            </span>
            <span className="role">
              {user?.role || "Utilisateur"}
            </span>
          </div>
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="dropdown stripe-menu">

            <div className="user-card">
              <div className="avatar big">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </div>

              <div>
                <p className="name">
                  {user?.prenom} {user?.nom}
                </p>
                <span className="email">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="divider"></div>

            <div className="dropdown-item" onClick={() => navigate("/profile")}>
              <User size={16} /> Profil
            </div>

            <div className="dropdown-item" onClick={() => navigate("/account")}>
              <Settings size={16} /> Paramètres
            </div>

            <div className="divider"></div>

            <div className="dropdown-item logout" onClick={onLogout}>
              <LogOut size={16} /> Se déconnecter
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
