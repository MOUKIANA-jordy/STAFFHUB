import React, { useEffect, useState } from "react";
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

  if (!stats) return <div>Loading stats...</div>;

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">Dashboard Admin</h1>

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Salariés</h3>
          <p>{stats.salaries}</p>
        </div>

        <div className="stat-card">
          <h3>Demandes</h3>
          <p>{stats.demandes}</p>
        </div>

        <div className="stat-card">
          <h3>Pointages</h3>
          <p>{stats.pointages}</p>
        </div>

      </div>

    </div>
  );
}
