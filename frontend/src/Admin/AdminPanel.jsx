import React, { useState, useEffect } from "react";
import "../Styles/adminpanel.css";
import API from "../Services/api"; // 🔥 IMPORTANT

export default function AdminPanel() {
  const [tab, setTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState(null);

  // 🔥 STATS
  useEffect(() => {
    API.get("/api/admin/stats/")
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  // 🔥 USERS
  useEffect(() => {
    API.get("/api/salaries/")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  // 🔥 DEMANDES
  useEffect(() => {
    API.get("/api/demandes/")
      .then(res => setDemandes(res.data))
      .catch(err => console.error(err));
  }, []);

  // 🔥 UPDATE DEMANDE
  const updateDemande = (id, statut) => {
    API.patch(`/api/demandes/${id}/`, { statut })
      .then(() => {
        setDemandes(prev =>
          prev.map(d => (d.id === id ? { ...d, statut } : d))
        );
      });
  };

  return (
    <div className="admin-panel">

      <h2>Admin Panel</h2>

      <div className="admin-container">

        {/* MENU */}
        <div className="admin-menu">
          <div onClick={() => setTab("stats")} className={tab==="stats"?"active":""}>📊 Dashboard</div>
          <div onClick={() => setTab("users")} className={tab==="users"?"active":""}>👥 Salariés</div>
          <div onClick={() => setTab("demandes")} className={tab==="demandes"?"active":""}>📁 Demandes</div>
        </div>

        {/* CONTENT */}
        <div className="admin-content">

          {/* STATS */}
          {tab === "stats" && (
            <>
              <h3>Statistiques</h3>
              {stats ? (
                <div className="stats-grid">
                  <div className="stat-card">👥 {stats.salaries}</div>
                  <div className="stat-card">📁 {stats.demandes}</div>
                  <div className="stat-card">📄 {stats.fiches}</div>
                  <div className="stat-card">📅 {stats.plannings}</div>
                </div>
              ) : <p>Chargement...</p>}
            </>
          )}

          {/* USERS */}
          {tab === "users" && (
            <>
              <h3>Salariés</h3>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Établissement</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.prenom} {u.nom}</td>
                      <td>{u.poste}</td>
                      <td>{u.etablissement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* DEMANDES */}
          {tab === "demandes" && (
            <>
              <h3>Demandes</h3>

              {demandes.map(d => (
                <div key={d.id} className="card">
                  <p><b>{d.type_demande}</b></p>

                  <p>
                    {{
                      EN_ATTENTE: "🕐 En attente",
                      APPROUVE: "✅ Approuvé",
                      REFUSE: "❌ Refusé"
                    }[d.statut]}
                  </p>

                  <button onClick={() => updateDemande(d.id, "APPROUVE")}>
                    ✔️
                  </button>

                  <button onClick={() => updateDemande(d.id, "REFUSE")}>
                    ❌
                  </button>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
