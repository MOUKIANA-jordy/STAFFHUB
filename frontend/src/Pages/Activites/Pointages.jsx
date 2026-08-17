import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Clock3,
  Download,
  Loader2,
  RefreshCw,
  Timer,
  TrendingUp,
} from "lucide-react";

import API from "../../Services/api";

import "../../Styles/pointages.css";


// =========================================================
// PAGINATION DRF
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
// PAGE
// =========================================================

export default function Pointages() {

  const [
    pointages,
    setPointages,
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
    period,
    setPeriod,
  ] = useState("month");


  // =========================================================
  // API
  // =========================================================

  const fetchPointages = useCallback(
    async (refresh = false) => {

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {

        const response = await API.get(
          "/api/pointage/"
        );

        setPointages(
          extractResults(
            response.data
          )
        );

      } catch (err) {

        console.error(
          "POINTAGES ERROR",
          err
        );

        setError(
          err.response?.data?.detail
          || "Impossible de charger vos pointages."
        );

        setPointages([]);

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    []
  );


  useEffect(() => {
    fetchPointages();
  }, [fetchPointages]);


  // =========================================================
  // DATE DU JOUR
  // =========================================================

  const today = useMemo(
    () => {
      const now = new Date();

      const year =
        now.getFullYear();

      const month =
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

      const day =
        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        );

      return (
        `${year}-${month}-${day}`
      );
    },
    []
  );


  // =========================================================
  // POINTAGE AUJOURD'HUI
  // =========================================================

  const todayRecord = useMemo(
    () =>
      pointages.find(
        (pointage) =>
          pointage.date === today
      )
      || null,
    [
      pointages,
      today,
    ]
  );


  // =========================================================
  // FILTRE PÉRIODE
  // =========================================================

  const filteredPointages = useMemo(
    () => {

      const now = new Date();

      return pointages.filter(
        (pointage) => {

          if (!pointage.date) {
            return false;
          }

          const date = new Date(
            `${pointage.date}T12:00:00`
          );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return false;
          }


          if (
            period === "year"
          ) {

            return (
              date.getFullYear()
              === now.getFullYear()
            );

          }


          if (
            period === "month"
          ) {

            return (
              date.getFullYear()
              === now.getFullYear()
              &&
              date.getMonth()
              === now.getMonth()
            );

          }


          if (
            period === "week"
          ) {

            const currentDay =
              now.getDay();

            const distanceToMonday =
              currentDay === 0
                ? -6
                : 1 - currentDay;

            const monday =
              new Date(now);

            monday.setHours(
              0,
              0,
              0,
              0
            );

            monday.setDate(
              now.getDate()
              + distanceToMonday
            );

            const nextMonday =
              new Date(monday);

            nextMonday.setDate(
              monday.getDate()
              + 7
            );

            return (
              date >= monday
              && date < nextMonday
            );

          }


          return true;

        }
      );

    },
    [
      pointages,
      period,
    ]
  );


  // =========================================================
  // TOTAL HEURES
  // =========================================================

  const totalHours = useMemo(
    () =>
      filteredPointages.reduce(
        (total, pointage) =>
          total
          + toNumber(
            pointage.heures_travaillees
          ),
        0
      ),
    [filteredPointages]
  );


  // =========================================================
  // HEURES SUP
  // =========================================================

  const totalOvertime = useMemo(
    () =>
      filteredPointages.reduce(
        (total, pointage) =>
          total
          + toNumber(
            pointage.heures_sup
          ),
        0
      ),
    [filteredPointages]
  );


  // =========================================================
  // NOMBRE DE JOURS
  // =========================================================

  const daysWorked = useMemo(
    () =>
      new Set(
        filteredPointages
          .map(
            (pointage) =>
              pointage.date
          )
          .filter(Boolean)
      ).size,
    [filteredPointages]
  );


  // =========================================================
  // MOYENNE
  // =========================================================

  const averageHours = useMemo(
    () => {

      if (
        daysWorked === 0
      ) {
        return 0;
      }

      return (
        totalHours
        / daysWorked
      );

    },
    [
      totalHours,
      daysWorked,
    ]
  );


  // =========================================================
  // TRI HISTORIQUE
  // =========================================================

  const sortedPointages = useMemo(
    () =>
      [...filteredPointages]
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
    [filteredPointages]
  );


  // =========================================================
  // EXPORT CSV
  // =========================================================

  const exportCSV = () => {

    if (
      sortedPointages.length === 0
    ) {
      return;
    }


    const headers = [
      "Date",
      "Arrivée",
      "Départ",
      "Heures travaillées",
      "Heures supplémentaires",
      "Mois de paie",
      "Commentaire",
    ];


    const rows = sortedPointages.map(
      (pointage) => [
        pointage.date || "",
        pointage.heure_arrivee || "",
        pointage.heure_depart || "",
        pointage.heures_travaillees || "",
        pointage.heures_sup || "",
        pointage.mois_paie || "",
        (
          pointage.commentaire
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


    const blob = new Blob(
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
      `mes_pointages_${period}.csv`;

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
      <div className="pointages-page">

        <div className="pointages-loading">

          <Loader2
            size={30}
            className="pointages-spin"
          />

          <span>
            Chargement des pointages...
          </span>

        </div>

      </div>
    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="pointages-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="pointages-heading">

        <div>

          <span className="pointages-eyebrow">
            Activité
          </span>

          <h1>
            Mes pointages
          </h1>

          <p>
            Consultez vos horaires,
            heures travaillées et
            heures supplémentaires.
          </p>

        </div>


        <div className="pointages-heading-actions">

          <button
            type="button"
            className="pointages-refresh-button"
            onClick={() =>
              fetchPointages(
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
                  ? "pointages-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="pointages-export-button"
            onClick={
              exportCSV
            }
            disabled={
              sortedPointages.length
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

        <div className="pointages-error">
          {error}
        </div>

      )}


      {/* ===================================================
          AUJOURD'HUI
      =================================================== */}

      <section className="pointages-top-grid">


        <article className="pointages-clock-card">

          <div className="pointages-card-heading">

            <div>

              <h2>
                Pointage du jour
              </h2>

              <p>
                {
                  formatLongDate(
                    new Date()
                  )
                }
              </p>

            </div>


            <div className="pointages-card-icon">

              <Clock3
                size={21}
              />

            </div>

          </div>


          {todayRecord ? (

            <div className="pointages-current-record">

              <div>

                <span>
                  Arrivée
                </span>

                <strong>
                  {
                    formatTime(
                      todayRecord
                        .heure_arrivee
                    )
                  }
                </strong>

              </div>


              <div>

                <span>
                  Départ
                </span>

                <strong>
                  {
                    todayRecord
                      .heure_depart
                      ? formatTime(
                          todayRecord
                            .heure_depart
                        )
                      : "En cours"
                  }
                </strong>

              </div>

            </div>

          ) : (

            <div className="pointages-no-today">

              <Clock3
                size={30}
              />

              <strong>
                Aucun pointage aujourd'hui
              </strong>

              <span>
                Aucun horaire n'a encore
                été enregistré pour cette journée.
              </span>

            </div>

          )}

        </article>


        {/* =================================================
            RÉSUMÉ JOUR
        ================================================= */}

        <article className="pointages-today-card">

          <div className="pointages-card-heading">

            <div>

              <h2>
                Résumé du jour
              </h2>

              <p>
                Données enregistrées
              </p>

            </div>


            <div className="pointages-card-icon">

              <Timer
                size={21}
              />

            </div>

          </div>


          <div className="pointages-today-list">

            <PointageValue
              label="Arrivée"
              value={
                todayRecord
                  ? formatTime(
                      todayRecord
                        .heure_arrivee
                    )
                  : "—"
              }
              type="blue"
            />


            <PointageValue
              label="Départ"
              value={
                todayRecord
                  ? formatTime(
                      todayRecord
                        .heure_depart
                    )
                  : "—"
              }
              type="green"
            />


            <PointageValue
              label="Heures travaillées"
              value={
                todayRecord
                  ? formatHours(
                      todayRecord
                        .heures_travaillees
                    )
                  : "0h"
              }
              type="purple"
            />


            <PointageValue
              label="Heures sup."
              value={
                todayRecord
                  ? formatHours(
                      todayRecord
                        .heures_sup
                    )
                  : "0h"
              }
              type="orange"
            />

          </div>

        </article>

      </section>


      {/* ===================================================
          STATS
      =================================================== */}

      <section className="pointages-summary-grid">


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
          label="Heures travaillées"
          detail={
            periodLabel(
              period
            )
          }
          type="blue"
        />


        <SummaryCard
          icon={
            <TrendingUp
              size={22}
            />
          }
          value={
            formatHours(
              totalOvertime
            )
          }
          label="Heures supplémentaires"
          detail={
            periodLabel(
              period
            )
          }
          type="purple"
        />


        <SummaryCard
          icon={
            <CalendarDays
              size={22}
            />
          }
          value={
            String(
              daysWorked
            )
          }
          label="Jours pointés"
          detail={
            `${filteredPointages.length} pointage${
              filteredPointages.length > 1
                ? "s"
                : ""
            }`
          }
          type="green"
        />


        <SummaryCard
          icon={
            <Timer
              size={22}
            />
          }
          value={
            formatHours(
              averageHours
            )
          }
          label="Moyenne par jour"
          detail="Temps moyen travaillé"
          type="orange"
        />

      </section>


      {/* ===================================================
          HISTORIQUE
      =================================================== */}

      <section className="pointages-history-card">

        <div className="pointages-card-heading">

          <div>

            <h2>
              Historique des pointages
            </h2>

            <p>
              Vos horaires enregistrés
              dans RH Manager.
            </p>

          </div>


          <div className="pointages-filters">

            <select
              value={
                period
              }
              onChange={
                (event) =>
                  setPeriod(
                    event.target.value
                  )
              }
            >

              <option value="week">
                Cette semaine
              </option>

              <option value="month">
                Ce mois
              </option>

              <option value="year">
                Cette année
              </option>

              <option value="all">
                Tout
              </option>

            </select>

          </div>

        </div>


        {sortedPointages.length > 0 ? (

          <div className="pointages-table-wrapper">

            <table className="pointages-table">

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Arrivée
                  </th>

                  <th>
                    Départ
                  </th>

                  <th>
                    Heures
                  </th>

                  <th>
                    Heures sup.
                  </th>

                  <th>
                    Mois de paie
                  </th>

                  <th>
                    Commentaire
                  </th>

                </tr>

              </thead>


              <tbody>

                {sortedPointages.map(
                  (record) => (

                    <tr
                      key={
                        record.id
                      }
                    >

                      <td>

                        <strong className="pointages-date">
                          {
                            formatDate(
                              record.date
                            )
                          }
                        </strong>

                      </td>


                      <td>

                        <span className="pointages-time-badge">

                          {
                            formatTime(
                              record
                                .heure_arrivee
                            )
                          }

                        </span>

                      </td>


                      <td>

                        <span className="pointages-time-badge">

                          {
                            record
                              .heure_depart
                              ? formatTime(
                                  record
                                    .heure_depart
                                )
                              : "—"
                          }

                        </span>

                      </td>


                      <td>

                        <strong>
                          {
                            formatHours(
                              record
                                .heures_travaillees
                            )
                          }
                        </strong>

                      </td>


                      <td>

                        <span
                          className={
                            toNumber(
                              record
                                .heures_sup
                            ) > 0
                              ? "pointages-overtime pointages-overtime-active"
                              : "pointages-overtime"
                          }
                        >

                          {
                            formatHours(
                              record
                                .heures_sup
                            )
                          }

                        </span>

                      </td>


                      <td>

                        {
                          formatDate(
                            record
                              .mois_paie
                          )
                        }

                      </td>


                      <td>

                        <span className="pointages-comment">

                          {
                            record
                              .commentaire
                            || "—"
                          }

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="pointages-empty">

            <Clock3
              size={36}
            />

            <strong>
              Aucun pointage
            </strong>

            <span>
              Aucun pointage ne correspond
              à la période sélectionnée.
            </span>

          </div>

        )}

      </section>

    </div>
  );
}


// =========================================================
// VALUE
// =========================================================

function PointageValue({
  label,
  value,
  type,
}) {

  return (
    <div className="pointages-value">

      <span
        className={
          `pointages-value-dot pointages-value-dot-${type}`
        }
      />

      <div>

        <p>
          {label}
        </p>

        <strong>
          {value || "—"}
        </strong>

      </div>

    </div>
  );

}


// =========================================================
// SUMMARY
// =========================================================

function SummaryCard({
  icon,
  value,
  label,
  detail,
  type,
}) {

  return (
    <article className="pointages-summary-card">

      <span
        className={
          `pointages-summary-icon pointages-summary-icon-${type}`
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
// HELPERS
// =========================================================

function toNumber(
  value
) {

  const number = Number(
    value
  );

  return Number.isFinite(
    number
  )
    ? number
    : 0;

}


function formatHours(
  value
) {

  const number =
    toNumber(
      value
    );

  const rounded =
    Math.round(
      number * 100
    )
    / 100;

  return `${rounded}h`;

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


function formatDate(
  value
) {

  if (!value) {
    return "—";
  }

  const date = new Date(
    `${value}T12:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return (
    date.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
  );

}


function formatLongDate(
  date
) {

  return (
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(
      date
    )
  );

}


function periodLabel(
  value
) {

  const labels = {
    week:
      "Cette semaine",

    month:
      "Ce mois",

    year:
      "Cette année",

    all:
      "Toutes périodes",
  };

  return (
    labels[value]
    || ""
  );

}
