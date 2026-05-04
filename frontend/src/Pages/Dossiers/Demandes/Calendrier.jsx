import { useState } from "react";
import "../../../Styles/form.css";

export default function Calendrier() {
  const [events] = useState([
    { date: "31/01", label: "Paie Janvier" },
    { date: "28/02", label: "Paie Février" },
    { date: "31/03", label: "Paie Mars" },
  ]);

  return (
    <div className="page">
      <h1>📅 Calendrier de paie</h1>

      <div className="calendar-grid">
        {events.map((e, i) => (
          <div key={i} className="calendar-card">
            <h3>{e.date}</h3>
            <p>{e.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
