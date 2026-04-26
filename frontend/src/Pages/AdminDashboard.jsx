import React, { useEffect, useState } from "react";
import AbsencesChart from "../Components/AbsencesChart";
import "../Styles/admin.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("access");

      const res = await fetch("http://127.0.0.1:8000/api/admin/stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  if (!stats) return <p>Chargement...</p>;

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">Dashboard RH</h1>

      {/* ===== STATS ===== */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <p>Salariés</p>
          <h2>{stats.salaries}</h2>
        </div>

        <div className="stat-card purple">
          <p>Demandes</p>
          <h2>{stats.demandes}</h2>
        </div>

        <div className="stat-card green">
          <p>Fiches de paie</p>
          <h2>{stats.fiches}</h2>
        </div>

        <div className="stat-card pink">
          <p>Plannings</p>
          <h2>{stats.plannings}</h2>
        </div>

      </div>

      {/* ===== SECTION BAS ===== */}
      <div className="charts-grid">

        {/* CALENDRIER */}
        <div className="chart-card">
          <h3>📅 Calendrier de paie</h3>

          <ul className="calendar">
            <li>Janvier → 31/01</li>
            <li>Février → 28/02</li>
            <li>Mars → 31/03</li>
            <li>Avril → 30/04</li>
            <li>Mai → 31/05</li>
            <li>Juin → 30/06</li>
          </ul>
        </div>

        {/* FICHES */}
        <div className="chart-card small">
          <h3>📄 Fiches de paie</h3>

          <div className="fake-bar">
            Total : {stats.fiches}
          </div>
        </div>

      </div>

    </div>
  );
}
