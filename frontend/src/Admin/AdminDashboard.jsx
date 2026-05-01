import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Services/api";
import "../Styles/admin.css";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [absences, setAbsences] = useState([]);
  const [planning, setPlanning] = useState([]);
  const [requests, setRequests] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/admin/stats/").then(res => setStats(res.data));
    API.get("/api/admin/absences/").then(res => setAbsences(res.data));
    API.get("/api/planning/").then(res => setPlanning(res.data));
    API.get("/api/demandes/").then(res => setRequests(res.data));
  }, []);

  // 🔥 calcul dynamique %
  const total = stats.demandes || 0;

  const percentEncours = total ? (stats.en_cours / total) * 100 : 0;
  const percentAcceptees = total ? (stats.acceptees / total) * 100 : 0;
  const percentRefusees = total
    ? ((total - stats.acceptees - stats.en_cours) / total) * 100
    : 0;

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">Dashboard RH</h1>

      {/* ===== KPI ===== */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <h3>Salariés</h3>
          <p>{stats.salaries || 0}</p>
        </div>

        <div className="stat-card green">
          <h3>Demandes</h3>
          <p>{stats.demandes || 0}</p>
        </div>

        <div className="stat-card purple">
          <h3>En cours</h3>
          <p>{stats.en_cours || 0}</p>
        </div>

        <div className="stat-card dark">
          <h3>Acceptées</h3>
          <p>{stats.acceptees || 0}</p>
        </div>

      </div>

      {/* ===== CHART + OVERVIEW ===== */}
      <div className="charts-grid">

        {/* 📊 GRAPH */}
        <div className="chart-card">
          <h2>📊 Absences mensuelles</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={absences}>
              <XAxis dataKey="month" stroke="#ccc" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔥 OVERVIEW */}
        <div className="overview-item">
  <span>En cours</span>

  <div className="bar">
    <div
      className="bar-fill blue"
      style={{ width: `${percentEncours}%` }}
    ></div>
  </div>
</div>

<div className="overview-item">
  <span>Acceptées</span>

  <div className="bar">
    <div
      className="bar-fill green"
      style={{ width: `${percentAcceptees}%` }}
    ></div>
  </div>
</div>

<div className="overview-item">
  <span>Refusées</span>

  <div className="bar">
    <div
      className="bar-fill purple"
      style={{ width: `${percentRefusees}%` }}
    ></div>
  </div>
</div>
        </div>

      </div>

      {/* ===== PLANNING ===== */}
      <div className="chart-card">
        <h2>📅 Planning</h2>

        <ul>
          {planning.slice(0, 6).map((p, i) => (
            <li key={i}>
              {p.date} → {p.type}
            </li>
          ))}
        </ul>
      </div>

      {/* ===== DEMANDES ===== */}
      <div className="table-container">

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>📁 Dernières demandes</h2>

          <button
            className="btn-primary"
            onClick={() => navigate("/admin/requests")}
          >
            Voir tout →
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Salarié</th>
              <th>Type</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {requests.slice(0, 5).map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/admin/requests/${r.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{r.salarie_nom}</td>
                <td>{r.type}</td>
                <td>
                  <span className={`status ${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}
