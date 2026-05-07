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

  const [stats, setStats] = useState({
    salaries: 0,
    demandes: 0,
    en_cours: 0,
    acceptees: 0
  });

  const [absences, setAbsences] = useState([]);
  const [planning, setPlanning] = useState([]);
  const [requests, setRequests] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {

    const fetchData = async () => {

      try {
        const statsRes = await API.get("/api/admin/stats/");
        setStats(statsRes.data);
      } catch (err) {
        console.error("STATS ERROR", err);
      }

      try {
        const absRes = await API.get("/api/admin/absences/");
        setAbsences(absRes.data);
      } catch (err) {
        console.error("ABSENCES ERROR", err);
      }

      try {
        const planningRes = await API.get("/api/planning/");
        setPlanning(planningRes.data);
      } catch (err) {
        console.error("PLANNING ERROR", err);
      }

      try {
        const reqRes = await API.get("/api/demandes/");
        setRequests(reqRes.data);
      } catch (err) {
        console.error("DEMANDES ERROR", err);
      }
    };

    fetchData();

  }, []);

  const total = stats.demandes || 0;

  const percentEncours =
    total > 0 ? (stats.en_cours / total) * 100 : 0;

  const percentAcceptees =
    total > 0 ? (stats.acceptees / total) * 100 : 0;

  const percentRefusees =
    total > 0
      ? ((total - stats.acceptees - stats.en_cours) / total) * 100
      : 0;

  return (
    <div className="admin-dashboard">

      <h1 className="dashboard-title">
        Dashboard RH
      </h1>

      {/* ===== KPI ===== */}

      <div className="stats-grid">

  {/* SALARIES */}

  <div className="stat-card stat-purple">
    <h3>Salariés</h3>
    <p>{stats.salaries}</p>
  </div>

  {/* DEMANDES */}

  <div className="stat-card stat-blue">
    <h3>Demandes</h3>
    <p>{stats.demandes}</p>
  </div>

  {/* EN COURS */}

  <div className="stat-card stat-yellow">
    <h3>En cours</h3>
    <p>{stats.en_cours}</p>
  </div>

  {/* ACCEPTEES */}

  <div className="stat-card stat-green">
    <h3>Acceptées</h3>
    <p>{stats.acceptees}</p>
  </div>

</div>

      {/* ===== CHARTS ===== */}

      <div className="charts-grid">

        {/* GRAPH */}

        <div className="chart-card">

          <h2>Absences mensuelles</h2>

          <ResponsiveContainer width="100%" height={250}>

            <LineChart data={absences}>

              <XAxis
                dataKey="month"
                stroke="#ccc"
              />

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

        {/* OVERVIEW */}

        <div className="overview-card">

          <h3>Répartition des demandes</h3>

          <div className="overview-item">

            <span>En cours</span>

            <div className="bar">
              <div
                className="bar-fill bar-fill-yellow"
                style={{
                  width: `${percentEncours}%`
                }}
              ></div>
            </div>

          </div>

          <div className="overview-item">

            <span>Acceptées</span>

            <div className="bar">
              <div
                className="bar-fill bar-fill-green"
                style={{
                  width: `${percentAcceptees}%`
                }}
              ></div>
            </div>

          </div>

          <div className="overview-item">

            <span>Refusées</span>

            <div className="bar">
              <div
                className="bar-fill bar-fill-red"
                style={{
                  width: `${percentRefusees}%`
                }}
              ></div>
            </div>

          </div>

        </div>

      </div>

      {/* ===== PLANNING ===== */}

      <div className="chart-card">

        <h2>Planning</h2>

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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >

          <h2>Dernières demandes</h2>

          <button
            className="btn-primary"
            onClick={() =>
              navigate("/admin/requests")
            }
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
                onClick={() =>
                  navigate(`/admin/requests/${r.id}`)
                }
                style={{ cursor: "pointer" }}
              >

                <td>
                  {r.salarie?.nom || "—"}
                </td>

                <td>
                  {r.type_demande}
                </td>

                <td>

                  {{
                    EN_ATTENTE: "🕐 En attente",
                    APPROUVE: "✅ Approuvé",
                    REFUSE: "❌ Refusé"
                  }[r.statut]}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
