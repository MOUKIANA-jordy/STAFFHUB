import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Users,
  XCircle,
  ClipboardList,
  WalletCards,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import API from "../Services/api";

import "../Styles/admin.css";


export default function AdminDashboard() {
  const navigate =
    useNavigate();


  // =========================================================
  // STATES
  // =========================================================

  const [
    stats,
    setStats,
  ] = useState({
    salaries: 0,
    demandes: 0,
    demandes_en_attente: 0,
    demandes_approuvees: 0,
    demandes_refusees: 0,
    pointages: 0,
    fiches: 0,
    plannings: 0,
  });


  const [
    planning,
    setPlanning,
  ] = useState([]);


  const [
    requests,
    setRequests,
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


  // =========================================================
  // HELPER DRF
  // =========================================================

  const extractResults = (
    data
  ) => {
    if (
      Array.isArray(data)
    ) {
      return data;
    }


    if (
      data
      && Array.isArray(
        data.results
      )
    ) {
      return data.results;
    }


    return [];
  };


  // =========================================================
  // FETCH
  // =========================================================

  const fetchDashboard = async (
    isRefresh = false
  ) => {
    if (
      isRefresh
    ) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }


    setError("");


    try {
      const [
        statsRes,
        planningRes,
        requestsRes,
      ] = await Promise.all([
        API.get(
          "/api/admin/stats/"
        ),

        API.get(
          "/api/planning/"
        ),

        API.get(
          "/api/demandes/"
        ),
      ]);


      setStats({
        salaries:
          statsRes.data.salaries
          || 0,

        demandes:
          statsRes.data.demandes
          || 0,

        demandes_en_attente:
          statsRes.data
            .demandes_en_attente
          || 0,

        demandes_approuvees:
          statsRes.data
            .demandes_approuvees
          || 0,

        demandes_refusees:
          statsRes.data
            .demandes_refusees
          || 0,

        pointages:
          statsRes.data.pointages
          || 0,

        fiches:
          statsRes.data.fiches
          || 0,

        plannings:
          statsRes.data.plannings
          || 0,
      });


      setPlanning(
        extractResults(
          planningRes.data
        )
      );


      setRequests(
        extractResults(
          requestsRes.data
        )
      );


    } catch (err) {
      console.error(
        "ADMIN DASHBOARD ERROR",
        err
      );


      setError(
        err.response?.data?.detail
        || "Impossible de charger le dashboard RH."
      );


    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchDashboard();
  }, []);


  // =========================================================
  // POURCENTAGES
  // =========================================================

  const totalDemandes =
    stats.demandes
    || 0;


  const percentEncours =
    totalDemandes > 0
      ? (
          stats
            .demandes_en_attente
          / totalDemandes
        ) * 100
      : 0;


  const percentAcceptees =
    totalDemandes > 0
      ? (
          stats
            .demandes_approuvees
          / totalDemandes
        ) * 100
      : 0;


  const percentRefusees =
    totalDemandes > 0
      ? (
          stats
            .demandes_refusees
          / totalDemandes
        ) * 100
      : 0;


  // =========================================================
  // KPI
  // =========================================================

  const primaryStats =
    useMemo(
      () => [
        {
          label:
            "Salariés",

          value:
            stats.salaries,

          icon:
            Users,

          className:
            "stat-purple",
        },

        {
          label:
            "Demandes",

          value:
            stats.demandes,

          icon:
            ClipboardList,

          className:
            "stat-blue",
        },

        {
          label:
            "En attente",

          value:
            stats
              .demandes_en_attente,

          icon:
            Clock3,

          className:
            "stat-yellow",
        },

        {
          label:
            "Approuvées",

          value:
            stats
              .demandes_approuvees,

          icon:
            CheckCircle2,

          className:
            "stat-green",
        },
      ],
      [stats]
    );


  const secondaryStats =
    useMemo(
      () => [
        {
          label:
            "Refusées",

          value:
            stats
              .demandes_refusees,

          icon:
            XCircle,

          className:
            "stat-red",
        },

        {
          label:
            "Pointages",

          value:
            stats.pointages,

          icon:
            Clock3,

          className:
            "stat-cyan",
        },

        {
          label:
            "Fiches de paie",

          value:
            stats.fiches,

          icon:
            WalletCards,

          className:
            "stat-orange",
        },

        {
          label:
            "Plannings",

          value:
            stats.plannings,

          icon:
            CalendarDays,

          className:
            "stat-navy",
        },
      ],
      [stats]
    );


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateValue
  ) => {
    if (
      !dateValue
    ) {
      return "—";
    }


    const date =
      new Date(
        `${dateValue}T00:00:00`
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }


    return date.toLocaleDateString(
      "fr-FR"
    );
  };


  // =========================================================
  // TYPE DEMANDE
  // =========================================================

  const formatRequestType = (
    request
  ) => (
    request
      .type_demande_display
    || request.type_demande
    || "—"
  );


  // =========================================================
  // STATUT
  // =========================================================

  const getStatusClass = (
    status
  ) => {
    const classes = {
      EN_ATTENTE:
        "admin-status-pending",

      APPROUVE:
        "admin-status-approved",

      REFUSE:
        "admin-status-rejected",
    };


    return (
      classes[status]
      || ""
    );
  };


  const getStatusLabel = (
    status
  ) => {
    const labels = {
      EN_ATTENTE:
        "En attente",

      APPROUVE:
        "Approuvé",

      REFUSE:
        "Refusé",
    };


    return (
      labels[status]
      || status
      || "—"
    );
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading
  ) {
    return (
      <main className="admin-dashboard">

        <div className="admin-loading">

          <RefreshCw
            size={28}
            className="admin-spin"
          />

          <span>
            Chargement du dashboard RH...
          </span>

        </div>

      </main>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="admin-dashboard">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="admin-dashboard-header">

        <div>

          <span className="admin-eyebrow">
            Administration RH
          </span>

          <h1 className="dashboard-title">
            Dashboard RH
          </h1>

          <p>
            Vue d'ensemble de l'activité StaffHub.
          </p>

        </div>


        <button
          type="button"
          className="admin-refresh-button"
          onClick={() =>
            fetchDashboard(
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
                ? "admin-spin"
                : ""
            }
          />

          Actualiser

        </button>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {
        error
        && (
          <div className="admin-error">
            {error}
          </div>
        )
      }


      {/* ===================================================
          KPI PRINCIPAUX
      =================================================== */}

      <section className="stats-grid">

        {
          primaryStats.map(
            (item) => (
              <StatCard
                key={
                  item.label
                }
                item={
                  item
                }
              />
            )
          )
        }

      </section>


      {/* ===================================================
          KPI SECONDAIRES
      =================================================== */}

      <section className="stats-grid admin-secondary-stats">

        {
          secondaryStats.map(
            (item) => (
              <StatCard
                key={
                  item.label
                }
                item={
                  item
                }
              />
            )
          )
        }

      </section>


      {/* ===================================================
          ACTIVITÉ / RÉPARTITION
      =================================================== */}

      <section className="charts-grid">

        <article className="chart-card">

          <header className="admin-card-heading">

            <div>

              <h2>
                Activité RH
              </h2>

              <p>
                Vue synthétique de l'activité opérationnelle.
              </p>

            </div>

          </header>


          <div className="admin-activity-grid">

            <ActivityMetric
              icon={
                CalendarDays
              }
              value={
                stats.plannings
              }
              label="Plannings"
              accent="blue"
            />


            <ActivityMetric
              icon={
                Clock3
              }
              value={
                stats.pointages
              }
              label="Pointages"
              accent="cyan"
            />


            <ActivityMetric
              icon={
                FileText
              }
              value={
                stats.fiches
              }
              label="Fiches de paie"
              accent="purple"
            />

          </div>

        </article>


        <article className="overview-card">

          <header className="admin-card-heading">

            <div>

              <h3>
                Répartition des demandes
              </h3>

              <p>
                État des demandes RH.
              </p>

            </div>

          </header>


          <OverviewItem
            label="En attente"
            value={
              stats
                .demandes_en_attente
            }
            percent={
              percentEncours
            }
            className="bar-fill-yellow"
          />


          <OverviewItem
            label="Approuvées"
            value={
              stats
                .demandes_approuvees
            }
            percent={
              percentAcceptees
            }
            className="bar-fill-green"
          />


          <OverviewItem
            label="Refusées"
            value={
              stats
                .demandes_refusees
            }
            percent={
              percentRefusees
            }
            className="bar-fill-red"
          />

        </article>

      </section>


      {/* ===================================================
          PLANNING RECENT
      =================================================== */}

      <section className="chart-card admin-planning-card">

        <header className="admin-card-heading admin-card-heading-action">

          <div>

            <h2>
              Planning récent
            </h2>

            <p>
              Dernières journées planifiées.
            </p>

          </div>


          <button
            type="button"
            className="admin-link-button"
            onClick={() =>
              navigate(
                "/activites/planning"
              )
            }
          >

            Voir le planning

            <ArrowRight
              size={16}
            />

          </button>

        </header>


        {
          planning.length > 0
            ? (
              <div className="admin-planning-list">

                {
                  planning
                    .slice(
                      0,
                      6
                    )
                    .map(
                      (item) => (
                        <article
                          key={
                            item.id
                          }
                          className="admin-planning-item"
                        >

                          <div className="admin-planning-date">

                            <CalendarDays
                              size={16}
                            />

                            <strong>
                              {
                                formatDate(
                                  item.date
                                )
                              }
                            </strong>

                          </div>


                          <div className="admin-planning-main">

                            <span className="admin-planning-type">

                              {
                                item
                                  .type_journee_display
                                || item
                                  .type_journee
                                || "—"
                              }

                            </span>


                            {
                              item.heure_debut
                              && item.heure_fin
                              && (
                                <span className="admin-planning-time">

                                  {
                                    item
                                      .heure_debut
                                      .slice(
                                        0,
                                        5
                                      )
                                  }

                                  {" — "}

                                  {
                                    item
                                      .heure_fin
                                      .slice(
                                        0,
                                        5
                                      )
                                  }

                                </span>
                              )
                            }


                            {
                              item.commentaire
                              && (
                                <span className="admin-planning-comment">

                                  {
                                    item.commentaire
                                  }

                                </span>
                              )
                            }

                          </div>

                        </article>
                      )
                    )
                }

              </div>
            )
            : (
              <div className="admin-empty">
                Aucun planning disponible.
              </div>
            )
        }

      </section>


      {/* ===================================================
          DEMANDES RECENTES
      =================================================== */}

      <section className="table-container">

        <header className="admin-card-heading admin-card-heading-action">

          <div>

            <h2>
              Dernières demandes
            </h2>

            <p>
              Les cinq demandes les plus récentes.
            </p>

          </div>


          <button
            type="button"
            className="admin-link-button"
            onClick={() =>
              navigate(
                "/admin/demandes"
              )
            }
          >

            Voir tout

            <ArrowRight
              size={16}
            />

          </button>

        </header>


        <div className="admin-table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Salarié
                </th>

                <th>
                  Type
                </th>

                <th>
                  Statut
                </th>

                <th>
                  Date
                </th>

              </tr>

            </thead>


            <tbody>

              {
                requests.length > 0
                  ? (
                    requests
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (request) => (
                          <tr
                            key={
                              request.id
                            }
                            className="admin-clickable-row"
                            onClick={() =>
                              navigate(
                                `/admin/requests/${request.id}`
                              )
                            }
                          >

                            <td>
                              {
                                request
                                  .salarie_nom
                                || "—"
                              }
                            </td>


                            <td>
                              {
                                formatRequestType(
                                  request
                                )
                              }
                            </td>


                            <td>

                              <span
                                className={
                                  `admin-status ${getStatusClass(
                                    request.statut
                                  )}`
                                }
                              >

                                {
                                  getStatusLabel(
                                    request.statut
                                  )
                                }

                              </span>

                            </td>


                            <td>
                              {
                                request
                                  .date_demande
                                  ? new Date(
                                      request
                                        .date_demande
                                    )
                                      .toLocaleDateString(
                                        "fr-FR"
                                      )
                                  : "—"
                              }
                            </td>

                          </tr>
                        )
                      )
                  )
                  : (
                    <tr>

                      <td
                        colSpan="4"
                        className="admin-table-empty"
                      >
                        Aucune demande disponible.
                      </td>

                    </tr>
                  )
              }

            </tbody>

          </table>

        </div>

      </section>

    </main>
  );
}


// =========================================================
// KPI CARD
// =========================================================

function StatCard({
  item,
}) {
  const Icon =
    item.icon;


  return (
    <article
      className={
        `stat-card ${item.className}`
      }
    >

      <div className="stat-card-top">

        <span className="stat-card-icon">

          <Icon
            size={20}
            strokeWidth={1.8}
          />

        </span>

        <span className="stat-card-label">
          {item.label}
        </span>

      </div>


      <p>
        {item.value}
      </p>

    </article>
  );
}


// =========================================================
// ACTIVITY
// =========================================================

function ActivityMetric({
  icon,
  value,
  label,
  accent,
}) {
  const Icon =
    icon;


  return (
    <article className="admin-activity-item">

      <span
        className={
          `admin-activity-icon admin-activity-icon-${accent}`
        }
      >

        <Icon
          size={21}
        />

      </span>


      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </div>

    </article>
  );
}


// =========================================================
// OVERVIEW
// =========================================================

function OverviewItem({
  label,
  value,
  percent,
  className,
}) {
  return (
    <div className="overview-item">

      <div className="overview-item-header">

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>


      <div className="bar">

        <div
          className={
            `bar-fill ${className}`
          }
          style={{
            width:
              `${Math.min(
                percent,
                100
              )}%`,
          }}
        />

      </div>

    </div>
  );
}
