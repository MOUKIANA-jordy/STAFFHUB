import React from "react";
import { useOutletContext } from "react-router-dom";
import { LineChart, Line, XAxis, Tooltip, YAxis, ResponsiveContainer } from "recharts";
import "../../Styles/dashboard.css";

export default function Dashboard() {

  const { user } = useOutletContext();

  const data = [
    { name: "Lun", heures: 7 },
    { name: "Mar", heures: 8 },
    { name: "Mer", heures: 6 },
    { name: "Jeu", heures: 7 },
    { name: "Ven", heures: 5 },
  ];

  return (
    <div className="dashboard">

      <h1>Bonjour {user.prenom} 👋</h1>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card">
          <p>Heures semaine</p>
          <h2>33h</h2>
        </div>

        <div className="stat-card">
          <p>Absences</p>
          <h2>2 jours</h2>
        </div>

      </div>

      {/* GRAPH */}
      <div className="chart-card">

        <h3>Heures travaillées</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="heures" />
          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}
