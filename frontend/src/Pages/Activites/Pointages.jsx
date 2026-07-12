import React, { useEffect, useMemo, useState } from "react";
import "../../Styles/pointages.css";

const INITIAL_HISTORY = [
  {
    id: 1,
    date: "11 juillet 2026",
    arrival: "08:31",
    breakStart: "12:03",
    breakEnd: "13:01",
    departure: "17:08",
    duration: "7h 39",
    status: "validated",
  },
  {
    id: 2,
    date: "10 juillet 2026",
    arrival: "08:27",
    breakStart: "12:00",
    breakEnd: "13:02",
    departure: "17:01",
    duration: "7h 32",
    status: "validated",
  },
  {
    id: 3,
    date: "9 juillet 2026",
    arrival: "08:42",
    breakStart: "12:05",
    breakEnd: "13:00",
    departure: "17:15",
    duration: "7h 38",
    status: "pending",
  },
  {
    id: 4,
    date: "8 juillet 2026",
    arrival: "08:30",
    breakStart: "12:01",
    breakEnd: "13:00",
    departure: "17:03",
    duration: "7h 34",
    status: "validated",
  },
  {
    id: 5,
    date: "7 juillet 2026",
    arrival: "08:35",
    breakStart: "12:02",
    breakEnd: "13:04",
    departure: "17:10",
    duration: "7h 33",
    status: "validated",
  },
];

function getCurrentTime() {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function getShortTime() {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export default function Pointages() {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [status, setStatus] = useState("not-started");

  const [todayRecord, setTodayRecord] = useState({
    arrival: "",
    breakStart: "",
    breakEnd: "",
    departure: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const statusLabel = useMemo(() => {
    if (status === "working") return "En cours de travail";
    if (status === "break") return "En pause";
    if (status === "finished") return "Journée terminée";

    return "Journée non commencée";
  }, [status]);

  const handleClockIn = () => {
    const time = getShortTime();

    setTodayRecord((currentRecord) => ({
      ...currentRecord,
      arrival: time,
    }));

    setStatus("working");
    setMessage(`Arrivée enregistrée à ${time}.`);
  };

  const handleStartBreak = () => {
    const time = getShortTime();

    setTodayRecord((currentRecord) => ({
      ...currentRecord,
      breakStart: time,
    }));

    setStatus("break");
    setMessage(`Début de pause enregistré à ${time}.`);
  };

  const handleEndBreak = () => {
    const time = getShortTime();

    setTodayRecord((currentRecord) => ({
      ...currentRecord,
      breakEnd: time,
    }));

    setStatus("working");
    setMessage(`Fin de pause enregistrée à ${time}.`);
  };

  const handleClockOut = () => {
    const time = getShortTime();

    setTodayRecord((currentRecord) => ({
      ...currentRecord,
      departure: time,
    }));

    setStatus("finished");
    setMessage(`Départ enregistré à ${time}.`);
  };

  return (
    <div className="pointages-page">
      <section className="pointages-heading">
        <div>
          <h1>Mes pointages</h1>
          <p>
            Enregistrez vos horaires et consultez votre historique.
          </p>
        </div>

        <button
          type="button"
          className="pointages-export-button"
        >
          Exporter mes pointages
        </button>
      </section>

      {message && (
        <div className="pointages-message">
          <span>✓</span>
          {message}
        </div>
      )}

      <section className="pointages-top-grid">
        <article className="pointages-clock-card">
          <div className="pointages-clock-heading">
            <div>
              <span className="pointages-live-dot" />
              Pointage du jour
            </div>

            <span
              className={`pointages-status pointages-status-${status}`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="pointages-clock">
            <strong>{currentTime}</strong>

            <span>
              {new Intl.DateTimeFormat("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </span>
          </div>

          <div className="pointages-actions">
            {status === "not-started" && (
              <button
                type="button"
                className="pointages-action-button pointages-action-primary"
                onClick={handleClockIn}
              >
                <span>▶</span>
                Commencer la journée
              </button>
            )}

            {status === "working" &&
              !todayRecord.breakStart && (
                <button
                  type="button"
                  className="pointages-action-button pointages-action-warning"
                  onClick={handleStartBreak}
                >
                  <span>Ⅱ</span>
                  Commencer la pause
                </button>
              )}

            {status === "break" && (
              <button
                type="button"
                className="pointages-action-button pointages-action-primary"
                onClick={handleEndBreak}
              >
                <span>▶</span>
                Reprendre le travail
              </button>
            )}

            {status === "working" &&
              todayRecord.arrival && (
                <button
                  type="button"
                  className="pointages-action-button pointages-action-danger"
                  onClick={handleClockOut}
                >
                  <span>■</span>
                  Terminer la journée
                </button>
              )}

            {status === "finished" && (
              <div className="pointages-day-complete">
                <span>✓</span>
                Votre journée est terminée.
              </div>
            )}
          </div>
        </article>

        <article className="pointages-today-card">
          <div className="pointages-card-heading">
            <div>
              <h2>Aujourd’hui</h2>
              <p>Résumé de vos horaires</p>
            </div>

            <span className="pointages-card-icon">◷</span>
          </div>

          <div className="pointages-today-list">
            <PointageValue
              label="Arrivée"
              value={todayRecord.arrival}
              type="blue"
            />

            <PointageValue
              label="Début de pause"
              value={todayRecord.breakStart}
              type="orange"
            />

            <PointageValue
              label="Fin de pause"
              value={todayRecord.breakEnd}
              type="purple"
            />

            <PointageValue
              label="Départ"
              value={todayRecord.departure}
              type="green"
            />
          </div>
        </article>
      </section>

      <section className="pointages-summary-grid">
        <SummaryCard
          icon="◷"
          value="35h 42"
          label="Cette semaine"
          detail="+42 min"
          type="blue"
        />

        <SummaryCard
          icon="▣"
          value="148h"
          label="Ce mois-ci"
          detail="Objectif : 151h"
          type="purple"
        />

        <SummaryCard
          icon="✓"
          value="4"
          label="Jours validés"
          detail="1 en attente"
          type="green"
        />

        <SummaryCard
          icon="△"
          value="12 min"
          label="Retard cumulé"
          detail="Ce mois-ci"
          type="orange"
        />
      </section>

      <section className="pointages-history-card">
        <div className="pointages-card-heading">
          <div>
            <h2>Historique des pointages</h2>
            <p>Vos derniers horaires enregistrés</p>
          </div>

          <div className="pointages-filters">
            <select defaultValue="month">
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>
        </div>

        <div className="pointages-table-wrapper">
          <table className="pointages-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Arrivée</th>
                <th>Début pause</th>
                <th>Fin pause</th>
                <th>Départ</th>
                <th>Durée</th>
                <th>Statut</th>
              </tr>
            </thead>

            <tbody>
              {INITIAL_HISTORY.map((record) => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.arrival}</td>
                  <td>{record.breakStart}</td>
                  <td>{record.breakEnd}</td>
                  <td>{record.departure}</td>
                  <td>
                    <strong>{record.duration}</strong>
                  </td>
                  <td>
                    <span
                      className={`pointages-table-status pointages-table-status-${record.status}`}
                    >
                      {record.status === "validated"
                        ? "Validé"
                        : "En attente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PointageValue({ label, value, type }) {
  return (
    <div className="pointages-value">
      <span
        className={`pointages-value-dot pointages-value-dot-${type}`}
      />

      <div>
        <p>{label}</p>
        <strong>{value || "--:--"}</strong>
      </div>
    </div>
  );
}

function SummaryCard({ icon, value, label, detail, type }) {
  return (
    <article className="pointages-summary-card">
      <span
        className={`pointages-summary-icon pointages-summary-icon-${type}`}
      >
        {icon}
      </span>

      <div>
        <strong>{value}</strong>
        <p>{label}</p>
        <small>{detail}</small>
      </div>
    </article>
  );
}
