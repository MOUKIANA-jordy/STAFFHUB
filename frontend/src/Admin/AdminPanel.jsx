import React, { useState, useEffect } from "react";
import "../Styles/adminpanel.css";

export default function AdminPanel() {
  const [tab, setTab] = useState("stats");
  const [users, setUsers] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [stats, setStats] = useState(null);

  //  STATS
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/admin/stats/")
      .then(res => res.json())
      .then(setStats);
  }, []);

  // 👥 USERS
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/salaries/")
      .then(res => res.json())
      .then(setUsers);
  }, []);

  //  DEMANDES
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/demandes/")
      .then(res => res.json())
      .then(setDemandes);
  }, []);

  // ACTION DEMANDE
  const updateDemande = (id, statut) => {
    fetch(`http://127.0.0.1:8000/api/demandes/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ statut }),
    }).then(() => {
      setDemandes(prev =>
        prev.map(d => (d.id === id ? { ...d, statut } : d))
      );
    });
  };

  return (
    <div className="admin-panel">

      <h2>Admin Panel</h2>

      <div className="admin-container">

        {/* ===== MENU ===== */}
        <div className="admin-menu">
          <div onClick={() => setTab("stats")} className={tab==="stats"?"active":""}>📊 Dashboard</div>
          <div onClick={() => setTab("users")} className={tab==="users"?"active":""}>👥 Salariés</div>
          <div onClick={() => setTab("demandes")} className={tab==="demandes"?"active":""}>📁 Demandes</div>
          <div onClick={() => setTab("paie")} className={tab==="paie"?"active":""}>📄 Paie</div>
          <div onClick={() => setTab("docs")} className={tab==="docs"?"active":""}>📑 Documents</div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="admin-content">

          {/* DASHBOARD */}
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

          {/* SALARIÉS */}
          {tab === "users" && (
            <>
              <h3>Gestion des salariés</h3>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Établissement</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.prenom} {u.nom}</td>
                      <td>{u.poste}</td>
                      <td>{u.etablissement}</td>
                      <td>
                        <button>✏️</button>
                        <button style={{color:"red"}}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* DEMANDES */}
          {tab === "demandes" && (
            <>
              <h3>Gestion des demandes</h3>

              {demandes.map(d => (
                <div key={d.id} className="card">
                  <p><b>{d.type}</b></p>
                  <p>{d.statut}</p>

                  <button onClick={() => updateDemande(d.id, "VALIDE")}>✔️</button>
                  <button onClick={() => updateDemande(d.id, "REFUSE")}>❌</button>
                </div>
              ))}
            </>
          )}

          {/* PAIE */}
          {tab === "paie" && (
            <h3>Gestion fiches de paie (PDF)</h3>
          )}

          {/*  DOCUMENTS */}
          {tab === "docs" && (
            <h3>Contrats & documents RH</h3>
          )}

        </div>
      </div>
    </div>
  );
}
