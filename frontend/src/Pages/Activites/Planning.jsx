import React, { useMemo, useState } from "react";
import "../../Styles/planning.css";

const INITIAL_SCHEDULE = {
  1: [
    {
      id: 1,
      title: "Travail",
      start: "08:30",
      end: "12:00",
      type: "work",
      location: "Bureau principal",
    },
    {
      id: 2,
      title: "Pause déjeuner",
      start: "12:00",
      end: "13:00",
      type: "break",
      location: "Pause",
    },
    {
      id: 3,
      title: "Travail",
      start: "13:00",
      end: "17:00",
      type: "work",
      location: "Bureau principal",
    },
  ],
  2: [
    {
      id: 4,
      title: "Travail",
      start: "08:30",
      end: "12:00",
      type: "work",
      location: "Bureau principal",
    },
    {
      id: 5,
      title: "Réunion d'équipe",
      start: "10:00",
      end: "11:00",
      type: "meeting",
      location: "Salle Horizon",
    },
    {
      id: 6,
      title: "Travail",
      start: "13:00",
      end: "17:00",
      type: "work",
      location: "Télétravail",
    },
  ],
  3: [
    {
      id: 7,
      title: "Télétravail",
      start: "08:30",
      end: "12:00",
      type: "remote",
      location: "À distance",
    },
    {
      id: 8,
      title: "Pause déjeuner",
      start: "12:00",
      end: "13:00",
      type: "break",
      location: "Pause",
    },
    {
      id: 9,
      title: "Télétravail",
      start: "13:00",
      end: "17:00",
      type: "remote",
      location: "À distance",
    },
  ],
  4: [
    {
      id: 10,
      title: "Travail",
      start: "08:30",
      end: "12:00",
      type: "work",
      location: "Bureau principal",
    },
    {
      id: 11,
      title: "Formation",
      start: "14:00",
      end: "16:00",
      type: "training",
      location: "Salle Atlas",
    },
  ],
  5: [
    {
      id: 12,
      title: "Travail",
      start: "08:30",
      end: "12:00",
      type: "work",
      location: "Bureau principal",
    },
    {
      id: 13,
      title: "Travail",
      start: "13:00",
      end: "16:30",
      type: "work",
      location: "Bureau principal",
    },
  ],
  6: [],
  0: [],
};

const DAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function getMonday(date) {
  const selectedDate = new Date(date);
  const day = selectedDate.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  selectedDate.setDate(selectedDate.getDate() + difference);
  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate;
}

function addDays(date, numberOfDays) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numberOfDays);

  return newDate;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function Planning() {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getMonday(new Date())
  );

  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        addDays(currentWeekStart, index)
      ),
    [currentWeekStart]
  );

  const selectedEvents = INITIAL_SCHEDULE[selectedDay] || [];

  const goToPreviousWeek = () => {
    setCurrentWeekStart((currentDate) =>
      addDays(currentDate, -7)
    );
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((currentDate) =>
      addDays(currentDate, 7)
    );
  };

  const goToCurrentWeek = () => {
    const today = new Date();

    setCurrentWeekStart(getMonday(today));
    setSelectedDay(today.getDay());
  };

  return (
    <div className="planning-page">
      <section className="planning-heading">
        <div>
          <h1>Mon planning</h1>
          <p>
            Consultez vos horaires, réunions et événements de la semaine.
          </p>
        </div>

        <button
          type="button"
          className="planning-primary-button"
        >
          Télécharger le planning
        </button>
      </section>

      <section className="planning-summary-grid">
        <article className="planning-summary-card">
          <span className="planning-summary-icon planning-icon-blue">
            ◷
          </span>

          <div>
            <strong>35h</strong>
            <p>Heures prévues</p>
          </div>
        </article>

        <article className="planning-summary-card">
          <span className="planning-summary-icon planning-icon-green">
            ✓
          </span>

          <div>
            <strong>5</strong>
            <p>Jours travaillés</p>
          </div>
        </article>

        <article className="planning-summary-card">
          <span className="planning-summary-icon planning-icon-purple">
            ⌂
          </span>

          <div>
            <strong>1 jour</strong>
            <p>Télétravail</p>
          </div>
        </article>

        <article className="planning-summary-card">
          <span className="planning-summary-icon planning-icon-orange">
            ▣
          </span>

          <div>
            <strong>2</strong>
            <p>Événements</p>
          </div>
        </article>
      </section>

      <section className="planning-card">
        <div className="planning-toolbar">
          <div className="planning-navigation">
            <button
              type="button"
              onClick={goToPreviousWeek}
              aria-label="Semaine précédente"
            >
              ←
            </button>

            <button
              type="button"
              className="planning-today-button"
              onClick={goToCurrentWeek}
            >
              Aujourd’hui
            </button>

            <button
              type="button"
              onClick={goToNextWeek}
              aria-label="Semaine suivante"
            >
              →
            </button>
          </div>

          <h2>
            {formatLongDate(currentWeekStart)} —{" "}
            {formatLongDate(addDays(currentWeekStart, 6))}
          </h2>
        </div>

        <div className="planning-week">
          {weekDays.map((date) => {
            const dayNumber = date.getDay();
            const isSelected = selectedDay === dayNumber;
            const isToday =
              date.toDateString() === new Date().toDateString();

            return (
              <button
                type="button"
                key={date.toISOString()}
                className={`planning-day ${
                  isSelected ? "planning-day-active" : ""
                } ${isToday ? "planning-day-today" : ""}`}
                onClick={() => setSelectedDay(dayNumber)}
              >
                <span>{DAY_LABELS[dayNumber].slice(0, 3)}</span>
                <strong>{date.getDate()}</strong>
                <small>{formatDate(date)}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="planning-content-grid">
        <article className="planning-card planning-day-card">
          <div className="planning-card-heading">
            <div>
              <h2>{DAY_LABELS[selectedDay]}</h2>
              <p>Programme détaillé de la journée</p>
            </div>

            <span>{selectedEvents.length} événement(s)</span>
          </div>

          {selectedEvents.length > 0 ? (
            <div className="planning-timeline">
              {selectedEvents.map((event) => (
                <div
                  className="planning-event"
                  key={event.id}
                >
                  <div className="planning-event-time">
                    <strong>{event.start}</strong>
                    <span>{event.end}</span>
                  </div>

                  <div
                    className={`planning-event-line planning-event-${event.type}`}
                  />

                  <div className="planning-event-content">
                    <div className="planning-event-title">
                      <h3>{event.title}</h3>

                      <span
                        className={`planning-event-badge planning-badge-${event.type}`}
                      >
                        {event.type === "work" && "Présentiel"}
                        {event.type === "remote" && "Télétravail"}
                        {event.type === "meeting" && "Réunion"}
                        {event.type === "training" && "Formation"}
                        {event.type === "break" && "Pause"}
                      </span>
                    </div>

                    <p>{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="planning-empty">
              <span>☀</span>
              <h3>Aucun événement prévu</h3>
              <p>
                Vous n’avez aucun horaire planifié pour cette journée.
              </p>
            </div>
          )}
        </article>

        <aside className="planning-card planning-information-card">
          <div className="planning-card-heading">
            <div>
              <h2>Informations</h2>
              <p>Résumé de la semaine</p>
            </div>
          </div>

          <div className="planning-information-list">
            <div>
              <span className="planning-information-dot dot-blue" />

              <div>
                <strong>Horaires habituels</strong>
                <p>08:30 – 17:00</p>
              </div>
            </div>

            <div>
              <span className="planning-information-dot dot-green" />

              <div>
                <strong>Pause journalière</strong>
                <p>12:00 – 13:00</p>
              </div>
            </div>

            <div>
              <span className="planning-information-dot dot-purple" />

              <div>
                <strong>Télétravail</strong>
                <p>Mercredi</p>
              </div>
            </div>

            <div>
              <span className="planning-information-dot dot-orange" />

              <div>
                <strong>Prochain événement</strong>
                <p>Formation jeudi à 14:00</p>
              </div>
            </div>
          </div>

          <div className="planning-note">
            <strong>Besoin d’une modification ?</strong>
            <p>
              Contactez votre responsable ou le service des ressources
              humaines.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
