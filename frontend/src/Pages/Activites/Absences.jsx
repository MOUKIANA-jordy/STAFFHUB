import React, { useMemo, useState } from "react";
import "../../Styles/absences.css";

const INITIAL_REQUESTS = [
  {
    id: 1,
    type: "Congés payés",
    startDate: "18 juillet 2026",
    endDate: "22 juillet 2026",
    duration: "5 jours",
    status: "approved",
    reason: "Congés d'été",
  },
  {
    id: 2,
    type: "RTT",
    startDate: "4 août 2026",
    endDate: "4 août 2026",
    duration: "1 jour",
    status: "pending",
    reason: "Démarche personnelle",
  },
  {
    id: 3,
    type: "Maladie",
    startDate: "12 juin 2026",
    endDate: "13 juin 2026",
    duration: "2 jours",
    status: "approved",
    reason: "Arrêt maladie",
  },
  {
    id: 4,
    type: "Congé sans solde",
    startDate: "2 septembre 2026",
    endDate: "3 septembre 2026",
    duration: "2 jours",
    status: "rejected",
    reason: "Projet personnel",
  },
];

const ABSENCE_TYPES = [
  "Congés payés",
  "RTT",
  "Maladie",
  "Congé sans solde",
  "Événement familial",
  "Autre",
];

function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return "";

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) return "";

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const numberOfDays =
    Math.floor((end - start) / millisecondsPerDay) + 1;

  return `${numberOfDays} jour${numberOfDays > 1 ? "s" : ""}`;
}

function formatInputDate(dateValue) {
  if (!dateValue) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateValue));
}

export default function Absences() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    type: "Congés payés",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const filteredRequests = useMemo(() => {
    if (filter === "all") return requests;

    return requests.filter((request) => request.status === filter);
  }, [filter, requests]);

  const duration = calculateDuration(
    formData.startDate,
    formData.endDate
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("");

    if (!formData.startDate || !formData.endDate) {
      setMessage("Veuillez renseigner les dates de début et de fin.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setMessage(
        "La date de fin doit être postérieure à la date de début."
      );
      return;
    }

    const newRequest = {
      id: Date.now(),
      type: formData.type,
      startDate: formatInputDate(formData.startDate),
      endDate: formatInputDate(formData.endDate),
      duration,
      status: "pending",
      reason: formData.reason || "Aucun motif renseigné",
    };

    setRequests((currentRequests) => [
      newRequest,
      ...currentRequests,
    ]);

    setFormData({
      type: "Congés payés",
      startDate: "",
      endDate: "",
      reason: "",
    });

    setMessage("Votre demande d’absence a bien été envoyée.");
    setIsFormOpen(false);
  };

  return (
    <div className="absences-page">
      <section className="absences-heading">
        <div>
          <h1>Mes absences</h1>
          <p>
            Consultez vos soldes et effectuez une nouvelle demande.
          </p>
        </div>

        <button
          type="button"
          className="absences-primary-button"
          onClick={() => {
            setMessage("");
            setIsFormOpen((currentValue) => !currentValue);
          }}
        >
          {isFormOpen ? "Fermer le formulaire" : "Nouvelle demande"}
        </button>
      </section>

      {message && (
        <div
          className={`absences-message ${
            message.includes("bien été envoyée")
              ? "absences-message-success"
              : "absences-message-error"
          }`}
        >
          {message}
        </div>
      )}

      <section className="absences-summary-grid">
        <SummaryCard
          value="18"
          label="Congés payés"
          detail="Jours restants"
          type="blue"
          icon="☀"
        />

        <SummaryCard
          value="6"
          label="RTT"
          detail="Jours restants"
          type="green"
          icon="✓"
        />

        <SummaryCard
          value="2"
          label="En attente"
          detail="Demandes en cours"
          type="orange"
          icon="◷"
        />

        <SummaryCard
          value="8"
          label="Absences prises"
          detail="Cette année"
          type="purple"
          icon="▣"
        />
      </section>

      {isFormOpen && (
        <section className="absences-form-card">
          <div className="absences-card-heading">
            <div>
              <h2>Nouvelle demande d’absence</h2>
              <p>
                Remplissez les informations ci-dessous avant l’envoi.
              </p>
            </div>

            <span className="absences-card-icon">＋</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="absences-form-grid">
              <div className="absences-field">
                <label htmlFor="type">Type d’absence</label>

                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  {ABSENCE_TYPES.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="absences-field">
                <label>Durée calculée</label>

                <div className="absences-duration">
                  {duration || "À définir"}
                </div>
              </div>

              <div className="absences-field">
                <label htmlFor="startDate">Date de début</label>

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="absences-field">
                <label htmlFor="endDate">Date de fin</label>

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="absences-field absences-field-full">
                <label htmlFor="reason">
                  Motif ou commentaire
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  rows="4"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Ajoutez une précision pour votre responsable..."
                />
              </div>
            </div>

            <div className="absences-form-actions">
              <button
                type="button"
                className="absences-secondary-button"
                onClick={() => setIsFormOpen(false)}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="absences-primary-button"
              >
                Envoyer la demande
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="absences-content-grid">
        <article className="absences-card">
          <div className="absences-card-heading">
            <div>
              <h2>Historique des demandes</h2>
              <p>Suivez l’état de vos demandes d’absence.</p>
            </div>

            <select
              className="absences-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">Toutes</option>
              <option value="approved">Validées</option>
              <option value="pending">En attente</option>
              <option value="rejected">Refusées</option>
            </select>
          </div>

          <div className="absences-table-wrapper">
            <table className="absences-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Durée</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.type}</strong>
                    </td>

                    <td>
                      <span>{request.startDate}</span>
                      <small>au {request.endDate}</small>
                    </td>

                    <td>{request.duration}</td>

                    <td>{request.reason}</td>

                    <td>
                      <StatusBadge status={request.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredRequests.length === 0 && (
              <div className="absences-empty">
                Aucune demande ne correspond à ce filtre.
              </div>
            )}
          </div>
        </article>

        <aside className="absences-card absences-calendar-card">
          <div className="absences-card-heading">
            <div>
              <h2>Prochaines absences</h2>
              <p>Vos périodes déjà planifiées.</p>
            </div>
          </div>

          <div className="absences-upcoming-list">
            <UpcomingAbsence
              day="18"
              month="Juil"
              title="Congés payés"
              period="18 au 22 juillet"
              type="blue"
            />

            <UpcomingAbsence
              day="04"
              month="Août"
              title="RTT"
              period="4 août"
              type="green"
            />

            <UpcomingAbsence
              day="02"
              month="Sept"
              title="Congé sans solde"
              period="2 au 3 septembre"
              type="purple"
            />
          </div>

          <div className="absences-information">
            <strong>Rappel</strong>
            <p>
              Toute demande doit être validée par votre responsable
              avant votre départ.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function SummaryCard({ value, label, detail, type, icon }) {
  return (
    <article className="absences-summary-card">
      <span
        className={`absences-summary-icon absences-summary-icon-${type}`}
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

function StatusBadge({ status }) {
  const labels = {
    approved: "Validée",
    pending: "En attente",
    rejected: "Refusée",
  };

  return (
    <span
      className={`absences-status absences-status-${status}`}
    >
      {labels[status]}
    </span>
  );
}

function UpcomingAbsence({
  day,
  month,
  title,
  period,
  type,
}) {
  return (
    <div className="absences-upcoming-item">
      <div
        className={`absences-upcoming-date absences-upcoming-date-${type}`}
      >
        <strong>{day}</strong>
        <span>{month}</span>
      </div>

      <div>
        <h3>{title}</h3>
        <p>{period}</p>
      </div>
    </div>
  );
}
