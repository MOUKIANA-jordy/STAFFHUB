import React, { useState, useEffect } from "react";
import "../Styles/adminpanel.css";

export default function AdminPanel() {
  const [tab, setTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  // 🔥 Charger stats
  useEffect(() => {
    fetch("/api/admin/stats/")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.log(err));
  }, []);

  // 🔥 Charger users
  useEffect(() => {
    fetch("/api/admin/users/")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="admin-panel">

      <h2>Admin Panel</h2>

      <div className="admin-container">

        {/* MENU */}
        <div className="admin-menu">
          <div onClick={() => setTab("stats")} className={tab === "stats" ? "active" : ""}>
            📊 Statistiques
          </div>
          <div onClick={() => setTab("users")} className={tab === "users" ? "active" : ""}>
            👥 Utilisateurs
          </div>
          <div onClick={() => setTab("requests")} className={tab === "requests" ? "active" : ""}>
            📁 Demandes
          </div>
        </div>

        {/* CONTENU */}
        <div className="admin-content">

          {/* STATS */}
          {tab === "stats" && (
            <div>
              <h3>Statistiques globales</h3>

              {stats ? (
                <div className="stats-grid">
                  <div className="stat-card">👥 Utilisateurs : {stats.users}</div>
                  <div className="stat-card">📁 Demandes : {stats.requests}</div>
                  <div className="stat-card">📊 Activités : {stats.activities}</div>
                </div>
              ) : (
                <p>Chargement...</p>
              )}
            </div>
          )}

          {/* 👥 USERS */}
          {tab === "users" && (
            <div>
              <h3>Gestion des utilisateurs</h3>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.prenom} {u.nom}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <button>Modifier</button>
                        <button style={{color:"red"}}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

          {/* 📁 DEMANDES */}
          {tab === "requests" && (
            <div>
              <h3>Toutes les demandes</h3>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
