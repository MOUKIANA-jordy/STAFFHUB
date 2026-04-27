import React, { useState, useEffect } from "react";
import API from "../Services/api";
import "../Styles/adminpanel.css";

export default function AdminPanel() {
  const [tab, setTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // 🔥 STATS
  useEffect(() => {
    API.get("/api/admin/stats/")
      .then(res => setStats(res.data))
      .catch(err => console.log(err));
  }, []);

  // 🔥 USERS
  useEffect(() => {
    API.get("/api/salaries/")
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce salarié ?")) return;

    try {
      await API.delete(`/api/salaries/${id}/`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  // 🔥 FILTER + SEARCH
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.nom.toLowerCase().includes(search.toLowerCase()) ||
      u.prenom.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "ALL" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

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
            👥 Salariés
          </div>

          <div onClick={() => setTab("requests")} className={tab === "requests" ? "active" : ""}>
            📁 Demandes
          </div>
        </div>

        {/* CONTENU */}
        <div className="admin-content">

          {/* 📊 STATS */}
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

              <div className="users-header">
                <h3>Gestion des salariés</h3>

                <div className="users-actions">
                  <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="ALL">Tous</option>
                    <option value="ADMIN">Admin</option>
                    <option value="RH">RH</option>
                    <option value="SALARIE">Salarié</option>
                  </select>
                </div>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Poste</th>
                    <th>Établissement</th>
                    <th>Rôle</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>{u.prenom} {u.nom}</td>
                      <td>{u.user?.email || "-"}</td>
                      <td>{u.poste}</td>
                      <td>{u.etablissement}</td>

                      <td>
                        <span className={`badge ${u.role.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>

                      <td>
                        <button className="edit-btn">✏️</button>
                        <button className="delete-btn" onClick={() => handleDelete(u.id)}>🗑</button>
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
              <h3>Gestion des demandes</h3>
              <p>👉 Prochaine étape : validation RH</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
