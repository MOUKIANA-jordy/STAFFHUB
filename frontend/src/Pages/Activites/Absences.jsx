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
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  Umbrella,
  XCircle,
} from "lucide-react";

import API from "../../Services/api";

import "../../Styles/absences.css";


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
// HELPERS
// =========================================================

function normalize(value) {
  return String(
    value || ""
  ).toUpperCase();
}


function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(
    `${value}T12:00:00`
  );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


function formatDate(value) {
  const date =
    parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatLongDate(value) {
  const date =
    parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


function formatTime(value) {
  if (!value) {
    return "Journée";
  }

  return String(value)
    .slice(
      0,
      5
    );
}


function isAbsencePlanning(item) {
  return (
    normalize(
      item?.type_journee
    )
    === "ABSENCE"
  );
}


function isAbsenceRequest(item) {
  return (
    normalize(
      item?.type_demande
    )
    === "CALENDRIER"
    &&
    normalize(
      item?.details
        ?.type_journee
    )
    === "ABSENCE"
  );
}


function requestStatus(status) {
  switch (
    normalize(status)
  ) {
    case "APPROUVE":
      return "approved";

    case "REFUSE":
      return "rejected";

    default:
      return "pending";
  }
}


function requestStatusLabel(status) {
  switch (
    normalize(status)
  ) {
    case "APPROUVE":
      return "Approuvée";

    case "REFUSE":
      return "Refusée";

    case "EN_ATTENTE":
      return "En attente";

    default:
      return status || "—";
  }
}


// =========================================================
// PAGE
// =========================================================

export default function Absences() {
  const [
    planning,
    setPlanning,
  ] = useState([]);

  const [
    demandes,
    setDemandes,
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
    filter,
    setFilter,
  ] = useState("all");


  // =========================================================
  // API
  // =========================================================

  const fetchAbsences = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [
          planningResponse,
          demandesResponse,
        ] = await Promise.all([
          API.get(
            "/api/planning/"
          ),

          API.get(
            "/api/demandes/",
            {
              params: {
                ordering:
                  "-date_demande",
              },
            }
          ),
        ]);

        setPlanning(
          extractResults(
            planningResponse.data
          )
        );

        setDemandes(
          extractResults(
            demandesResponse.data
          )
        );

      } catch (err) {
        console.error(
          "ABSENCES ERROR",
          err
        );

        setError(
          err.response?.data?.detail
          || "Impossible de charger vos absences."
        );

        setPlanning([]);
        setDemandes([]);

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);


  // =========================================================
  // ABSENCES RÉELLES
  // =========================================================

  const absences = useMemo(
    () =>
      planning
        .filter(
          isAbsencePlanning
        )
        .sort(
          (a, b) =>
            String(
              b.date || ""
            ).localeCompare(
              String(
                a.date || ""
              )
            )
        ),
    [planning]
  );


  // =========================================================
  // DEMANDES D'ABSENCE
  // =========================================================

  const absenceRequests = useMemo(
    () =>
      demandes
        .filter(
          isAbsenceRequest
        ),
    [demandes]
  );


  const filteredRequests = useMemo(
    () => {
      if (
        filter === "all"
      ) {
        return absenceRequests;
      }

      return absenceRequests.filter(
        (request) =>
          requestStatus(
            request.statut
          )
          === filter
      );
    },
    [
      absenceRequests,
      filter,
    ]
  );


  // =========================================================
  // STATS
  // =========================================================

  const pendingCount = useMemo(
    () =>
      absenceRequests.filter(
        (item) =>
          normalize(
            item.statut
          )
          === "EN_ATTENTE"
      ).length,
    [absenceRequests]
  );


  const approvedCount = useMemo(
    () =>
      absenceRequests.filter(
        (item) =>
          normalize(
            item.statut
          )
          === "APPROUVE"
      ).length,
    [absenceRequests]
  );


  const rejectedCount = useMemo(
    () =>
      absenceRequests.filter(
        (item) =>
          normalize(
            item.statut
          )
          === "REFUSE"
      ).length,
    [absenceRequests]
  );


  const currentYear =
    new Date()
      .getFullYear();


  const absenceDaysThisYear = useMemo(
    () =>
      absences.filter(
        (item) => {
          const date =
            parseDate(
              item.date
            );

          return (
            date
            && date.getFullYear()
              === currentYear
          );
        }
      ).length,
    [
      absences,
      currentYear,
    ]
  );


  // =========================================================
  // PROCHAINES ABSENCES
  // =========================================================

  const upcomingAbsences = useMemo(
    () => {
      const now =
        new Date();

      now.setHours(
        0,
        0,
        0,
        0
      );

      return absences
        .filter(
          (item) => {
            const date =
              parseDate(
                item.date
              );

            return (
              date
              && date >= now
            );
          }
        )
        .sort(
          (a, b) =>
            String(
              a.date
            ).localeCompare(
              String(
                b.date
              )
            )
        )
        .slice(
          0,
          5
        );
    },
    [absences]
  );


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="absences-page">

        <div className="absences-loading">

          <Loader2
            size={30}
            className="absences-spin"
          />

          <span>
            Chargement des absences...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="absences-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="absences-heading">

        <div>

          <span className="absences-eyebrow">
            Activité
          </span>

          <h1>
            Mes absences
          </h1>

          <p>
            Consultez vos absences planifiées
            et suivez vos demandes.
          </p>

        </div>


        <div className="absences-heading-actions">

          <button
            type="button"
            className="absences-secondary-button"
            onClick={() =>
              fetchAbsences(
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
                  ? "absences-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <Link
            to="/dossiers/demandes/calendrier"
            className="absences-primary-button"
          >

            <CalendarDays
              size={17}
            />

            Nouvelle demande

          </Link>

        </div>

      </section>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="absences-message absences-message-error">
          {error}
        </div>
      )}


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="absences-summary-grid">

        <SummaryCard
          value={
            String(
              absenceDaysThisYear
            )
          }
          label="Absences enregistrées"
          detail={
            `Année ${currentYear}`
          }
          type="blue"
          icon={
            <Umbrella size={22} />
          }
        />


        <SummaryCard
          value={
            String(
              pendingCount
            )
          }
          label="En attente"
          detail="Demandes à traiter"
          type="orange"
          icon={
            <Clock3 size={22} />
          }
        />


        <SummaryCard
          value={
            String(
              approvedCount
            )
          }
          label="Approuvées"
          detail="Demandes validées"
          type="green"
          icon={
            <CheckCircle2 size={22} />
          }
        />


        <SummaryCard
          value={
            String(
              rejectedCount
            )
          }
          label="Refusées"
          detail="Demandes refusées"
          type="purple"
          icon={
            <XCircle size={22} />
          }
        />

      </section>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="absences-content-grid">

        {/* =================================================
            HISTORIQUE
        ================================================= */}

        <article className="absences-card">

          <div className="absences-card-heading">

            <div>

              <h2>
                Demandes d'absence
              </h2>

              <p>
                Suivez les demandes envoyées
                au service RH.
              </p>

            </div>


            <select
              className="absences-filter"
              value={
                filter
              }
              onChange={
                (event) =>
                  setFilter(
                    event.target.value
                  )
              }
            >

              <option value="all">
                Toutes
              </option>

              <option value="approved">
                Approuvées
              </option>

              <option value="pending">
                En attente
              </option>

              <option value="rejected">
                Refusées
              </option>

            </select>

          </div>


          {filteredRequests.length > 0 ? (

            <div className="absences-table-wrapper">

              <table className="absences-table">

                <thead>

                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Horaire</th>
                    <th>Motif</th>
                    <th>Statut</th>
                  </tr>

                </thead>


                <tbody>

                  {filteredRequests.map(
                    (request) => {

                      const details =
                        request.details
                        || {};

                      return (
                        <tr key={request.id}>

                          <td>

                            <strong>
                              {
                                formatDate(
                                  details.date
                                )
                              }
                            </strong>

                            <small>
                              Demandée le{" "}
                              {
                                request.date_demande
                                  ? new Date(
                                      request.date_demande
                                    )
                                      .toLocaleDateString(
                                        "fr-FR"
                                      )
                                  : "—"
                              }
                            </small>

                          </td>


                          <td>
                            Absence
                          </td>


                          <td>

                            {
                              details.heure_debut
                              || details.heure_fin
                                ? `${formatTime(
                                    details.heure_debut
                                  )} – ${formatTime(
                                    details.heure_fin
                                  )}`
                                : "Journée"
                            }

                          </td>


                          <td>

                            <span className="absences-reason">

                              {
                                details.motif
                                || details.commentaire
                                || "—"
                              }

                            </span>

                          </td>


                          <td>

                            <StatusBadge
                              status={
                                request.statut
                              }
                            />

                          </td>

                        </tr>
                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="absences-empty">

              <CalendarDays
                size={36}
              />

              <strong>
                Aucune demande
              </strong>

              <span>
                Aucune demande d'absence ne
                correspond au filtre sélectionné.
              </span>

            </div>

          )}

        </article>


        {/* =================================================
            PROCHAINES ABSENCES
        ================================================= */}

        <aside className="absences-card absences-calendar-card">

          <div className="absences-card-heading">

            <div>

              <h2>
                Prochaines absences
              </h2>

              <p>
                Absences validées et présentes
                dans votre planning.
              </p>

            </div>

          </div>


          {upcomingAbsences.length > 0 ? (

            <div className="absences-upcoming-list">

              {upcomingAbsences.map(
                (
                  absence,
                  index
                ) => (

                  <UpcomingAbsence
                    key={
                      absence.id
                    }
                    absence={
                      absence
                    }
                    type={
                      [
                        "blue",
                        "green",
                        "purple",
                      ][
                        index % 3
                      ]
                    }
                  />

                )
              )}

            </div>

          ) : (

            <div className="absences-side-empty">

              <Umbrella
                size={30}
              />

              <strong>
                Aucune absence à venir
              </strong>

              <span>
                Votre planning ne contient
                aucune absence future.
              </span>

            </div>

          )}


          <div className="absences-information">

            <strong>
              Besoin de signaler une absence ?
            </strong>

            <p>
              Utilisez la demande de modification
              de calendrier. Après validation RH,
              l'absence apparaîtra automatiquement
              dans votre planning.
            </p>

            <Link
              to="/dossiers/demandes/calendrier"
              className="absences-information-link"
            >

              Faire une demande

              <ChevronRight
                size={15}
              />

            </Link>

          </div>

        </aside>

      </section>


      {/* ===================================================
          PLANNING ABSENCES
      =================================================== */}

      <section className="absences-card absences-planning-card">

        <div className="absences-card-heading">

          <div>

            <h2>
              Historique des absences enregistrées
            </h2>

            <p>
              Ces données proviennent directement
              de votre planning.
            </p>

          </div>


          <span className="absences-count-badge">
            {absences.length}
          </span>

        </div>


        {absences.length > 0 ? (

          <div className="absences-planning-list">

            {absences.map(
              (absence) => (

                <div
                  className="absences-planning-item"
                  key={absence.id}
                >

                  <div className="absences-planning-date">

                    <CalendarDays
                      size={18}
                    />

                  </div>


                  <div className="absences-planning-content">

                    <strong>
                      {
                        formatLongDate(
                          absence.date
                        )
                      }
                    </strong>

                    <p>
                      {
                        absence.commentaire
                        || "Absence enregistrée"
                      }
                    </p>

                  </div>


                  <div className="absences-planning-hours">

                    {
                      absence.heure_debut
                      || absence.heure_fin
                        ? `${formatTime(
                            absence.heure_debut
                          )} – ${formatTime(
                            absence.heure_fin
                          )}`
                        : "Journée"
                    }

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="absences-empty">

            <Umbrella
              size={36}
            />

            <strong>
              Aucune absence enregistrée
            </strong>

            <span>
              Aucune entrée ABSENCE n'existe
              actuellement dans votre planning.
            </span>

          </div>

        )}

      </section>

    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  value,
  label,
  detail,
  type,
  icon,
}) {
  return (
    <article className="absences-summary-card">

      <span
        className={
          `absences-summary-icon absences-summary-icon-${type}`
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

        <small>
          {detail}
        </small>

      </div>

    </article>
  );
}


// =========================================================
// STATUS
// =========================================================

function StatusBadge({
  status,
}) {
  const normalized =
    requestStatus(
      status
    );

  return (
    <span
      className={
        `absences-status absences-status-${normalized}`
      }
    >
      {
        requestStatusLabel(
          status
        )
      }
    </span>
  );
}


// =========================================================
// UPCOMING
// =========================================================

function UpcomingAbsence({
  absence,
  type,
}) {
  const date =
    parseDate(
      absence.date
    );

  if (!date) {
    return null;
  }

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  const month =
    date
      .toLocaleDateString(
        "fr-FR",
        {
          month: "short",
        }
      )
      .replace(
        ".",
        ""
      );

  return (
    <div className="absences-upcoming-item">

      <div
        className={
          `absences-upcoming-date absences-upcoming-date-${type}`
        }
      >

        <strong>
          {day}
        </strong>

        <span>
          {month}
        </span>

      </div>


      <div>

        <h3>
          Absence
        </h3>

        <p>
          {
            absence.commentaire
            || formatLongDate(
              absence.date
            )
          }
        </p>

      </div>

    </div>
  );
}
