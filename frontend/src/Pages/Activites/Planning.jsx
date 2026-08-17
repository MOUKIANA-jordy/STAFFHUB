import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Home,
  Loader2,
  MapPin,
  RefreshCw,
  Umbrella,
} from "lucide-react";

import API from "../../Services/api";

import "../../Styles/planning.css";


// =========================================================
// DRF
// =========================================================

const extractResults = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data
    && Array.isArray(data.results)
  ) {
    return data.results;
  }

  return [];
};


// =========================================================
// DATES
// =========================================================

function getMonday(date) {
  const result = new Date(date);

  const day =
    result.getDay();

  const difference =
    day === 0
      ? -6
      : 1 - day;

  result.setDate(
    result.getDate()
    + difference
  );

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
}


function addDays(
  date,
  numberOfDays
) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate()
    + numberOfDays
  );

  return result;
}


function toApiDate(
  date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `${year}-${month}-${day}`
  );
}


function formatLongDate(
  date
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    date
  );
}


function formatDayName(
  date
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday: "long",
    }
  ).format(
    date
  );
}


function formatShortDay(
  date
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday: "short",
    }
  ).format(
    date
  );
}


// =========================================================
// HEURES
// =========================================================

function timeToMinutes(
  value
) {
  if (!value) {
    return null;
  }

  const [
    hours,
    minutes,
  ] = String(
    value
  )
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(hours)
    || !Number.isFinite(minutes)
  ) {
    return null;
  }

  return (
    hours * 60
    + minutes
  );
}


function calculateHours(
  item
) {
  const start =
    timeToMinutes(
      item.heure_debut
    );

  const end =
    timeToMinutes(
      item.heure_fin
    );

  if (
    start === null
    || end === null
    || end <= start
  ) {
    return 0;
  }

  return (
    (end - start)
    / 60
  );
}


function formatHours(
  value
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "0h";
  }

  const hours =
    Math.floor(number);

  const minutes =
    Math.round(
      (number - hours)
      * 60
    );

  if (
    minutes === 0
  ) {
    return `${hours}h`;
  }

  return (
    `${hours}h${String(
      minutes
    ).padStart(
      2,
      "0"
    )}`
  );
}


function formatTime(
  value
) {
  if (!value) {
    return "—";
  }

  return String(
    value
  ).slice(
    0,
    5
  );
}


// =========================================================
// TYPE
// =========================================================

function normalizeType(
  value
) {
  return String(
    value || ""
  ).toUpperCase();
}


function getTypeClass(
  type
) {
  const value =
    normalizeType(type);

  if (
    value === "TELETRAVAIL"
  ) {
    return "remote";
  }

  if (
    value === "ABSENCE"
  ) {
    return "absence";
  }

  if (
    value === "CONGE"
    || value === "CONGES"
  ) {
    return "leave";
  }

  if (
    value === "FORMATION"
  ) {
    return "training";
  }

  return "work";
}


// =========================================================
// PAGE
// =========================================================

export default function Planning() {

  const [
    planning,
    setPlanning,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentWeekStart,
    setCurrentWeekStart,
  ] = useState(
    getMonday(
      new Date()
    )
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    toApiDate(
      new Date()
    )
  );


  // =========================================================
  // API
  // =========================================================

  const fetchPlanning = useCallback(
    async (
      refresh = false
    ) => {

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {

        const response =
          await API.get(
            "/api/planning/"
          );

        setPlanning(
          extractResults(
            response.data
          )
        );

      } catch (err) {

        console.error(
          "PLANNING ERROR",
          err
        );

        setError(
          err.response?.data?.detail
          || "Impossible de charger votre planning."
        );

        setPlanning([]);

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    []
  );


  useEffect(() => {
    fetchPlanning();
  }, [fetchPlanning]);


  // =========================================================
  // SEMAINE
  // =========================================================

  const weekDays = useMemo(
    () =>
      Array.from(
        {
          length: 7,
        },
        (
          _,
          index
        ) =>
          addDays(
            currentWeekStart,
            index
          )
      ),
    [currentWeekStart]
  );


  const weekStartApi = useMemo(
    () =>
      toApiDate(
        currentWeekStart
      ),
    [currentWeekStart]
  );


  const weekEndApi = useMemo(
    () =>
      toApiDate(
        addDays(
          currentWeekStart,
          6
        )
      ),
    [currentWeekStart]
  );


  const weekPlanning = useMemo(
    () =>
      planning.filter(
        (item) =>
          item.date
          >= weekStartApi
          &&
          item.date
          <= weekEndApi
      ),
    [
      planning,
      weekStartApi,
      weekEndApi,
    ]
  );


  // =========================================================
  // JOUR SÉLECTIONNÉ
  // =========================================================

  const selectedEvents = useMemo(
    () =>
      planning
        .filter(
          (item) =>
            item.date
            === selectedDate
        )
        .sort(
          (a, b) =>
            String(
              a.heure_debut
              || ""
            ).localeCompare(
              String(
                b.heure_debut
                || ""
              )
            )
        ),
    [
      planning,
      selectedDate,
    ]
  );


  const selectedDateObject = useMemo(
    () =>
      new Date(
        `${selectedDate}T12:00:00`
      ),
    [selectedDate]
  );


  // =========================================================
  // STATISTIQUES SEMAINE
  // =========================================================

  const totalHours = useMemo(
    () =>
      weekPlanning.reduce(
        (
          total,
          item
        ) =>
          total
          + calculateHours(
            item
          ),
        0
      ),
    [weekPlanning]
  );


  const workingDays = useMemo(
    () =>
      new Set(
        weekPlanning
          .filter(
            (item) =>
              normalizeType(
                item.type_journee
              )
              !== "ABSENCE"
          )
          .map(
            (item) =>
              item.date
          )
      ).size,
    [weekPlanning]
  );


  const remoteDays = useMemo(
    () =>
      new Set(
        weekPlanning
          .filter(
            (item) =>
              normalizeType(
                item.type_journee
              )
              === "TELETRAVAIL"
          )
          .map(
            (item) =>
              item.date
          )
      ).size,
    [weekPlanning]
  );


  const absenceDays = useMemo(
    () =>
      new Set(
        weekPlanning
          .filter(
            (item) =>
              normalizeType(
                item.type_journee
              )
              === "ABSENCE"
          )
          .map(
            (item) =>
              item.date
          )
      ).size,
    [weekPlanning]
  );


  // =========================================================
  // NAVIGATION
  // =========================================================

  const goToPreviousWeek = () => {

    const previous =
      addDays(
        currentWeekStart,
        -7
      );

    setCurrentWeekStart(
      previous
    );

    setSelectedDate(
      toApiDate(
        previous
      )
    );

  };


  const goToNextWeek = () => {

    const next =
      addDays(
        currentWeekStart,
        7
      );

    setCurrentWeekStart(
      next
    );

    setSelectedDate(
      toApiDate(
        next
      )
    );

  };


  const goToCurrentWeek = () => {

    const today =
      new Date();

    setCurrentWeekStart(
      getMonday(
        today
      )
    );

    setSelectedDate(
      toApiDate(
        today
      )
    );

  };


  // =========================================================
  // EXPORT CSV
  // =========================================================

  const exportPlanning = () => {

    if (
      weekPlanning.length
      === 0
    ) {
      return;
    }


    const headers = [
      "Date",
      "Type",
      "Début",
      "Fin",
      "Durée",
      "Commentaire",
    ];


    const rows =
      weekPlanning.map(
        (item) => [
          item.date || "",
          item.type_journee_display
          || item.type_journee
          || "",
          item.heure_debut || "",
          item.heure_fin || "",
          formatHours(
            calculateHours(
              item
            )
          ),
          (
            item.commentaire
            || ""
          ).replaceAll(
            '"',
            '""'
          ),
        ]
      );


    const csv = [
      headers,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${value}"`
            )
            .join(";")
      )
      .join("\n");


    const blob =
      new Blob(
        [
          "\uFEFF",
          csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href = url;

    link.download =
      `planning_${weekStartApi}_${weekEndApi}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="planning-page">

        <div className="planning-loading">

          <Loader2
            size={30}
            className="planning-spin"
          />

          <span>
            Chargement du planning...
          </span>

        </div>

      </div>
    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="planning-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="planning-heading">

        <div>

          <span className="planning-eyebrow">
            Activité
          </span>

          <h1>
            Mon planning
          </h1>

          <p>
            Consultez vos horaires
            et l'organisation de votre semaine.
          </p>

        </div>


        <div className="planning-heading-actions">

          <button
            type="button"
            className="planning-refresh-button"
            onClick={() =>
              fetchPlanning(
                true
              )
            }
            disabled={
              refreshing
            }
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "planning-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="planning-primary-button"
            onClick={
              exportPlanning
            }
            disabled={
              weekPlanning.length
              === 0
            }
          >

            <Download
              size={17}
            />

            Exporter

          </button>

        </div>

      </section>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="planning-error">
          {error}
        </div>

      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="planning-summary-grid">


        <SummaryCard
          icon={
            <Clock3
              size={22}
            />
          }
          value={
            formatHours(
              totalHours
            )
          }
          label="Heures prévues"
          type="blue"
        />


        <SummaryCard
          icon={
            <CalendarDays
              size={22}
            />
          }
          value={
            String(
              workingDays
            )
          }
          label="Jours planifiés"
          type="green"
        />


        <SummaryCard
          icon={
            <Home
              size={22}
            />
          }
          value={
            String(
              remoteDays
            )
          }
          label="Télétravail"
          type="purple"
        />


        <SummaryCard
          icon={
            <Umbrella
              size={22}
            />
          }
          value={
            String(
              absenceDays
            )
          }
          label="Absences"
          type="orange"
        />

      </section>


      {/* ===================================================
          SEMAINE
      =================================================== */}

      <section className="planning-card">


        <div className="planning-toolbar">


          <div className="planning-navigation">

            <button
              type="button"
              onClick={
                goToPreviousWeek
              }
              aria-label="Semaine précédente"
            >

              <ChevronLeft
                size={18}
              />

            </button>


            <button
              type="button"
              className="planning-today-button"
              onClick={
                goToCurrentWeek
              }
            >

              Aujourd'hui

            </button>


            <button
              type="button"
              onClick={
                goToNextWeek
              }
              aria-label="Semaine suivante"
            >

              <ChevronRight
                size={18}
              />

            </button>

          </div>


          <h2>

            {
              formatLongDate(
                currentWeekStart
              )
            }

            {" — "}

            {
              formatLongDate(
                addDays(
                  currentWeekStart,
                  6
                )
              )
            }

          </h2>

        </div>


        <div className="planning-week">

          {weekDays.map(
            (date) => {

              const apiDate =
                toApiDate(
                  date
                );

              const isSelected =
                selectedDate
                === apiDate;

              const isToday =
                apiDate
                === toApiDate(
                  new Date()
                );

              const dayEvents =
                planning.filter(
                  (item) =>
                    item.date
                    === apiDate
                );

              return (

                <button
                  type="button"
                  key={
                    apiDate
                  }
                  className={
                    `planning-day ${
                      isSelected
                        ? "planning-day-active"
                        : ""
                    } ${
                      isToday
                        ? "planning-day-today"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setSelectedDate(
                      apiDate
                    )
                  }
                >

                  <span>
                    {
                      formatShortDay(
                        date
                      )
                    }
                  </span>

                  <strong>
                    {
                      date.getDate()
                    }
                  </strong>

                  <small>
                    {
                      dayEvents.length > 0
                        ? `${dayEvents.length} élément${
                            dayEvents.length > 1
                              ? "s"
                              : ""
                          }`
                        : "Libre"
                    }
                  </small>

                  {dayEvents.length > 0 && (

                    <div className="planning-day-indicators">

                      {dayEvents
                        .slice(
                          0,
                          3
                        )
                        .map(
                          (event) => (

                            <i
                              key={
                                event.id
                              }
                              className={
                                `planning-day-dot planning-day-dot-${getTypeClass(
                                  event.type_journee
                                )}`
                              }
                            />

                          )
                        )}

                    </div>

                  )}

                </button>

              );

            }
          )}

        </div>

      </section>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="planning-content-grid">


        {/* =================================================
            JOUR
        ================================================= */}

        <article className="planning-card planning-day-card">


          <div className="planning-card-heading">

            <div>

              <h2>
                {
                  capitalize(
                    formatDayName(
                      selectedDateObject
                    )
                  )
                }
              </h2>

              <p>
                {
                  formatLongDate(
                    selectedDateObject
                  )
                }
              </p>

            </div>


            <span>
              {
                selectedEvents.length
              } élément
              {
                selectedEvents.length
                > 1
                  ? "s"
                  : ""
              }
            </span>

          </div>


          {selectedEvents.length > 0 ? (

            <div className="planning-timeline">

              {selectedEvents.map(
                (event) => {

                  const typeClass =
                    getTypeClass(
                      event.type_journee
                    );

                  return (

                    <div
                      className="planning-event"
                      key={
                        event.id
                      }
                    >


                      <div className="planning-event-time">

                        <strong>
                          {
                            formatTime(
                              event
                                .heure_debut
                            )
                          }
                        </strong>

                        <span>
                          {
                            formatTime(
                              event
                                .heure_fin
                            )
                          }
                        </span>

                      </div>


                      <div
                        className={
                          `planning-event-line planning-event-${typeClass}`
                        }
                      />


                      <div className="planning-event-content">


                        <div className="planning-event-title">

                          <div>

                            <h3>
                              {
                                event
                                  .type_journee_display
                                || event
                                  .type_journee
                                || "Planning"
                              }
                            </h3>

                            {
                              event.heure_debut
                              &&
                              event.heure_fin
                              && (

                                <small className="planning-event-duration">

                                  {
                                    formatHours(
                                      calculateHours(
                                        event
                                      )
                                    )
                                  }

                                </small>

                              )
                            }

                          </div>


                          <span
                            className={
                              `planning-event-badge planning-badge-${typeClass}`
                            }
                          >

                            {
                              event
                                .type_journee_display
                              || event
                                .type_journee
                              || "Planning"
                            }

                          </span>

                        </div>


                        <p>

                          <MapPin
                            size={14}
                          />

                          {
                            event.commentaire
                            || getDefaultDescription(
                              event
                                .type_journee
                            )
                          }

                        </p>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          ) : (

            <div className="planning-empty">

              <CalendarDays
                size={40}
              />

              <h3>
                Aucun planning
              </h3>

              <p>
                Aucun horaire n'est prévu
                pour cette journée.
              </p>

            </div>

          )}

        </article>


        {/* =================================================
            INFORMATIONS
        ================================================= */}

        <aside className="planning-card planning-information-card">


          <div className="planning-card-heading">

            <div>

              <h2>
                Informations
              </h2>

              <p>
                Résumé de la semaine
              </p>

            </div>

          </div>


          <div className="planning-information-list">


            <InformationItem
              color="blue"
              title="Heures prévues"
              value={
                formatHours(
                  totalHours
                )
              }
            />


            <InformationItem
              color="green"
              title="Jours planifiés"
              value={
                `${workingDays} jour${
                  workingDays > 1
                    ? "s"
                    : ""
                }`
              }
            />


            <InformationItem
              color="purple"
              title="Télétravail"
              value={
                `${remoteDays} jour${
                  remoteDays > 1
                    ? "s"
                    : ""
                }`
              }
            />


            <InformationItem
              color="orange"
              title="Absences"
              value={
                `${absenceDays} jour${
                  absenceDays > 1
                    ? "s"
                    : ""
                }`
              }
            />

          </div>


          <div className="planning-note">

            <strong>
              Besoin d'une modification ?
            </strong>

            <p>
              Vous pouvez transmettre
              une demande de modification
              de calendrier au service RH.
            </p>

            <Link
              to="/dossiers/demandes/calendrier"
              className="planning-modification-link"
            >

              Demander une modification

              <ChevronRight
                size={15}
              />

            </Link>

          </div>

        </aside>

      </section>

    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  icon,
  value,
  label,
  type,
}) {

  return (
    <article className="planning-summary-card">

      <span
        className={
          `planning-summary-icon planning-icon-${type}`
        }
      >
        {icon}
      </span>

      <div>

        <strong>
          {value}
        </strong>

        <p>
          {label}
        </p>

      </div>

    </article>
  );

}


// =========================================================
// INFORMATION
// =========================================================

function InformationItem({
  color,
  title,
  value,
}) {

  return (
    <div>

      <span
        className={
          `planning-information-dot dot-${color}`
        }
      />

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {value}
        </p>

      </div>

    </div>
  );

}


// =========================================================
// DESCRIPTION
// =========================================================

function getDefaultDescription(
  type
) {

  switch (
    normalizeType(type)
  ) {

    case "TELETRAVAIL":
      return "Travail à distance";

    case "ABSENCE":
      return "Absence enregistrée";

    case "CONGE":
    case "CONGES":
      return "Congé";

    case "FORMATION":
      return "Formation";

    default:
      return "Journée de travail";

  }

}


// =========================================================
// CAPITALIZE
// =========================================================

function capitalize(
  value
) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0)
      .toUpperCase()
    + value.slice(1)
  );
}
