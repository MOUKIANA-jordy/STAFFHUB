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
  AlertCircle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Folder,
  HandCoins,
  Loader2,
  MoreHorizontal,
  UserRound,
  WalletCards,
} from "lucide-react";

import useAuth from "../Hooks/useAuth";
import API from "../Services/api";

import "../Styles/home.css";


// =========================================================
// EXTRACTION PAGINATION DRF
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
// ACCÈS RAPIDES
// =========================================================

const quickActions = [
  {
    title: "Demande d'acompte",
    description: "Demander un acompte sur le salaire",
    icon: HandCoins,
    path: "/dossiers/demandes/acompte",
    accent: "blue",
  },
  {
    title: "Demande d'avance",
    description: "Créer une demande d'avance",
    icon: WalletCards,
    path: "/dossiers/demandes/avance",
    accent: "purple",
  },
  {
    title: "Mes absences",
    description: "Consulter mes absences",
    icon: UserRound,
    path: "/activites/absences",
    accent: "cyan",
  },
  {
    title: "Planning",
    description: "Consulter mon planning",
    icon: CalendarDays,
    path: "/activites/planning",
    accent: "blue",
  },
  {
    title: "Mes documents",
    description: "Accéder à mes documents",
    icon: Folder,
    path: "/dossiers/informations/documents",
    accent: "purple",
  },
  {
    title: "Fiches de paie",
    description: "Consulter mes bulletins",
    icon: FileText,
    path: "/dossiers/demandes/fiches",
    accent: "cyan",
  },
  {
    title: "Pointages",
    description: "Suivre mes heures",
    icon: Clock3,
    path: "/activites/pointages",
    accent: "blue",
  },
  {
    title: "Mon profil",
    description: "Mes informations personnelles",
    icon: UserRound,
    path: "/home/profile",
    accent: "purple",
  },
];


export default function Home() {
  const {
    user,
  } = useAuth();


  // =========================================================
  // STATES
  // =========================================================

  const [
    demandes,
    setDemandes,
  ] = useState([]);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    notificationsCount,
    setNotificationsCount,
  ] = useState({
    total: 0,
    non_lues: 0,
    lues: 0,
  });

  const [
    pointages,
    setPointages,
  ] = useState([]);

  const [
    planning,
    setPlanning,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // =========================================================
  // CHARGEMENT
  // =========================================================

  const fetchDashboard = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          demandesResponse,
          notificationsResponse,
          compteurResponse,
          pointagesResponse,
	  console.log("POINTAGES API :", pointagesResponse.data);
          planningResponse,
        ] = await Promise.all([
          API.get(
            "/api/demandes/",
            {
              params: {
                ordering:
                  "-date_demande",
              },
            }
          ),

          API.get(
            "/api/notifications/",
            {
              params: {
                ordering:
                  "-date_envoi",
              },
            }
          ),

          API.get(
            "/api/notifications/compteur/"
          ),

          API.get(
            "/api/pointage/"
          ),

          API.get(
            "/api/planning/"
          ),
        ]);

        setDemandes(
          extractResults(
            demandesResponse.data
          )
        );

        setNotifications(
          extractResults(
            notificationsResponse.data
          )
        );

        setNotificationsCount({
          total:
            compteurResponse.data?.total
            || 0,

          non_lues:
            compteurResponse.data?.non_lues
            || 0,

          lues:
            compteurResponse.data?.lues
            || 0,
        });

        setPointages(
          extractResults(
            pointagesResponse.data
          )
        );

        setPlanning(
          extractResults(
            planningResponse.data
          )
        );

      } catch (err) {
        console.error(
          "DASHBOARD ERROR",
          err
        );

        setError(
          err.response?.data?.detail
          || "Impossible de charger certaines données du tableau de bord."
        );

      } finally {
        setLoading(false);
      }
    },
    []
  );


  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);


  // =========================================================
  // USER
  // =========================================================

  const firstName =
    user?.prenom
    || user?.first_name
    || user?.username
    || "Utilisateur";


  // =========================================================
  // DATE
  // =========================================================

  const currentDate = (
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    ).format(
      new Date()
    )
  );


  // =========================================================
  // DEMANDES
  // =========================================================

  const demandesEnAttente = useMemo(
    () =>
      demandes.filter(
        (demande) =>
          demande.statut
          === "EN_ATTENTE"
      ),
    [demandes]
  );


  const demandesApprouvees = useMemo(
    () =>
      demandes.filter(
        (demande) =>
          demande.statut
          === "APPROUVE"
      ),
    [demandes]
  );


  // =========================================================
  // PLANNING / ABSENCES
  // =========================================================

  const absences = useMemo(
    () =>
      planning.filter(
        (item) =>
          item.type_journee
          === "ABSENCE"
          || item.type
          === "ABSENCE"
      ),
    [planning]
  );


  // =========================================================
  // HEURES
  // =========================================================

  const parseHours = (
    pointage
  ) => {
    const possibleValues = [
      pointage.total_heures,
      pointage.total,
      pointage.heures,
      pointage.duree,
    ];

    for (
      const value
      of possibleValues
    ) {
      const parsed = Number(
        value
      );

      if (
        Number.isFinite(parsed)
      ) {
        return parsed;
      }
    }

    return 0;
  };


  const totalHours = useMemo(
    () =>
      pointages.reduce(
        (total, pointage) =>
          total
          + parseHours(
            pointage
          ),
        0
      ),
    [pointages]
  );


  // =========================================================
  // HEURES PAR JOUR
  // =========================================================

  const workingHours = useMemo(
    () => {
      const days = {
        1: {
          day: "Lun",
          value: 0,
        },
        2: {
          day: "Mar",
          value: 0,
        },
        3: {
          day: "Mer",
          value: 0,
        },
        4: {
          day: "Jeu",
          value: 0,
        },
        5: {
          day: "Ven",
          value: 0,
        },
        6: {
          day: "Sam",
          value: 0,
        },
        0: {
          day: "Dim",
          value: 0,
        },
      };

      pointages.forEach(
        (pointage) => {
          const dateValue =
            pointage.date
            || pointage.date_pointage
            || pointage.created_at;

          if (!dateValue) {
            return;
          }

          const date = new Date(
            dateValue
          );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return;
          }

          const dayNumber = (
            date.getDay()
          );

          days[
            dayNumber
          ].value += (
            parseHours(
              pointage
            )
          );
        }
      );

      return [
        days[1],
        days[2],
        days[3],
        days[4],
        days[5],
        days[6],
        days[0],
      ];
    },
    [pointages]
  );


  // =========================================================
  // NOTIFICATIONS DASHBOARD
  // =========================================================

  const latestNotifications = useMemo(
    () =>
      notifications.slice(
        0,
        3
      ),
    [notifications]
  );


  // =========================================================
  // ACTIVITÉ RÉCENTE
  // =========================================================

  const recentActivities = useMemo(
    () => {
      return demandes
        .slice(
          0,
          4
        )
        .map(
          (demande) => {
            let icon = FileText;
            let type = "blue";
            let text =
              `${
                demande.type_demande_display
                || demande.type_demande
              } envoyée`;

            if (
              demande.statut
              === "APPROUVE"
            ) {
              icon =
                CheckCircle2;

              type =
                "success";

              text =
                `${
                  demande.type_demande_display
                  || demande.type_demande
                } approuvée`;
            }

            if (
              demande.statut
              === "REFUSE"
            ) {
              icon =
                AlertCircle;

              type =
                "purple";

              text =
                `${
                  demande.type_demande_display
                  || demande.type_demande
                } refusée`;
            }

            return {
              id:
                demande.id,

              icon,

              type,

              text,

              date:
                formatRelativeDate(
                  demande.date_demande
                ),
            };
          }
        );
    },
    [demandes]
  );


  // =========================================================
  // MAX CHART
  // =========================================================

  const maxHours = Math.max(
    8,
    ...workingHours.map(
      (item) =>
        item.value
    )
  );


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="dashboard">

        <div
          style={{
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            color: "var(--rh-text-secondary)",
          }}
        >

          <Loader2
            size={28}
            className="notifications-spin"
          />

          <span>
            Chargement du tableau de bord...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dashboard">


      {/* ===================================================
          INTRODUCTION
      =================================================== */}

      <section className="dashboard-heading">

        <div>

          <span className="dashboard-eyebrow">
            Tableau de bord
          </span>

          <h1>
            Bonjour, {firstName}

            <span className="dashboard-wave">
              👋
            </span>
          </h1>

          <p>
            Retrouvez l'essentiel de votre activité
            RH en un coup d'œil.
          </p>

        </div>


        <div className="dashboard-date">

          <CalendarDays
            size={17}
            strokeWidth={1.8}
          />

          <span>
            {currentDate}
          </span>

        </div>

      </section>


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="request-message request-message-error">
          {error}
        </div>

      )}


      {/* ===================================================
          KPI
      =================================================== */}

      <section className="stats-grid">


        {/* DEMANDES */}

        <article className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon stat-icon-blue">

              <FileText
                size={23}
                strokeWidth={1.8}
              />

            </div>

            <span className="stat-badge">
              Réel
            </span>

          </div>


          <div className="stat-content">

            <strong>
              {
                demandesEnAttente.length
              }
            </strong>

            <span>
              Demandes en cours
            </span>

            <small>
              {
                demandes.length
              } demande
              {
                demandes.length > 1
                  ? "s"
                  : ""
              } au total
            </small>

          </div>

        </article>


        {/* VALIDÉES */}

        <article className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon stat-icon-cyan">

              <CheckCircle2
                size={23}
                strokeWidth={1.8}
              />

            </div>

            <span className="stat-badge">
              Dossiers
            </span>

          </div>


          <div className="stat-content">

            <strong>
              {
                demandesApprouvees.length
              }
            </strong>

            <span>
              Demandes approuvées
            </span>

            <small>
              Validées par le service RH
            </small>

          </div>

        </article>


        {/* HEURES */}

        <article className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon stat-icon-purple">

              <Clock3
                size={23}
                strokeWidth={1.8}
              />

            </div>

            <span className="stat-badge">
              Pointages
            </span>

          </div>


          <div className="stat-content">

            <strong>
              {
                formatHours(
                  totalHours
                )
              }
            </strong>

            <span>
              Heures enregistrées
            </span>

            <small>
              {
                pointages.length
              } pointage
              {
                pointages.length > 1
                  ? "s"
                  : ""
              }
            </small>

          </div>

        </article>


        {/* NOTIFICATIONS */}

        <article className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon stat-icon-gradient">

              <Bell
                size={23}
                strokeWidth={1.8}
              />

            </div>

            {notificationsCount.non_lues > 0 && (

              <span className="stat-badge stat-badge-new">
                Nouveau
              </span>

            )}

          </div>


          <div className="stat-content">

            <strong>
              {
                notificationsCount.non_lues
              }
            </strong>

            <span>
              Notifications non lues
            </span>

            <small>
              {
                notificationsCount.total
              } notification
              {
                notificationsCount.total > 1
                  ? "s"
                  : ""
              } au total
            </small>

          </div>

        </article>

      </section>


      {/* ===================================================
          MAIN
      =================================================== */}

      <section className="dashboard-main-grid">


        {/* ACCÈS RAPIDES */}

        <article className="dashboard-card quick-access-card">

          <div className="card-heading">

            <div>

              <h2>
                Accès rapides
              </h2>

              <p>
                Vos fonctionnalités principales.
              </p>

            </div>


            <MoreHorizontal
              size={20}
              color="var(--rh-text-muted)"
            />

          </div>


          <div className="quick-actions-grid">

            {quickActions.map(
              (action) => {

                const Icon =
                  action.icon;

                return (

                  <Link
                    to={
                      action.path
                    }
                    className="quick-action"
                    key={
                      action.title
                    }
                  >

                    <span
                      className={
                        `quick-action-icon quick-action-${action.accent}`
                      }
                    >

                      <Icon
                        size={21}
                        strokeWidth={1.8}
                      />

                    </span>


                    <div>

                      <strong>
                        {
                          action.title
                        }
                      </strong>

                      <small>
                        {
                          action.description
                        }
                      </small>

                    </div>


                    <ChevronRight
                      size={17}
                      className="quick-action-arrow"
                    />

                  </Link>

                );

              }
            )}

          </div>

        </article>


        {/* ACTIVITÉ */}

        <article className="dashboard-card recent-card">

          <div className="card-heading">

            <div>

              <h2>
                Activité récente
              </h2>

              <p>
                Vos dernières demandes.
              </p>

            </div>

          </div>


          <div className="activity-list">

            {recentActivities.length > 0 ? (

              recentActivities.map(
                (activity) => {

                  const Icon =
                    activity.icon;

                  return (

                    <div
                      className="activity-item"
                      key={
                        activity.id
                      }
                    >

                      <div
                        className={
                          `activity-icon activity-icon-${activity.type}`
                        }
                      >

                        <Icon
                          size={17}
                          strokeWidth={1.8}
                        />

                      </div>


                      <div className="activity-content">

                        <p>
                          {
                            activity.text
                          }
                        </p>

                        <span>
                          {
                            activity.date
                          }
                        </span>

                      </div>

                    </div>

                  );

                }
              )

            ) : (

              <div className="request-empty">
                Aucune activité récente.
              </div>

            )}

          </div>

        </article>

      </section>


      {/* ===================================================
          BOTTOM
      =================================================== */}

      <section className="dashboard-bottom-grid">


        {/* ABSENCES */}

        <article className="dashboard-card absence-card">

          <div className="card-heading">

            <div>

              <h2>
                Absences
              </h2>

              <p>
                Données du planning.
              </p>

            </div>

          </div>


          <div className="absence-content">

            <div className="donut-chart">

              <div className="donut-center">

                <strong>
                  {
                    absences.length
                  }
                </strong>

                <span>
                  jour
                  {
                    absences.length > 1
                      ? "s"
                      : ""
                  }
                </span>

              </div>

            </div>


            <div className="absence-legend">

              <div>

                <span className="legend-dot legend-blue" />

                <p>
                  Absences enregistrées
                </p>

                <strong>
                  {
                    absences.length
                  }
                </strong>

              </div>


              <div>

                <span className="legend-dot legend-cyan" />

                <p>
                  Planning total
                </p>

                <strong>
                  {
                    planning.length
                  }
                </strong>

              </div>

            </div>

          </div>


          <Link
            to="/activites/absences"
            className="card-link"
          >
            Voir le détail

            <ChevronRight
              size={15}
            />
          </Link>

        </article>


        {/* HEURES */}

        <article className="dashboard-card hours-card">

          <div className="card-heading">

            <div>

              <h2>
                Heures travaillées
              </h2>

              <p>
                Selon vos pointages.
              </p>

            </div>

          </div>


          <div className="hours-chart">

            <div className="chart-scale">

              <span>
                {
                  Math.ceil(
                    maxHours
                  )
                }
              </span>

              <span>
                {
                  Math.round(
                    maxHours * 0.75
                  )
                }
              </span>

              <span>
                {
                  Math.round(
                    maxHours * 0.5
                  )
                }
              </span>

              <span>
                {
                  Math.round(
                    maxHours * 0.25
                  )
                }
              </span>

              <span>
                0
              </span>

            </div>


            <div className="chart-bars">

              {workingHours.map(
                (item) => (

                  <div
                    className="bar-column"
                    key={
                      item.day
                    }
                  >

                    <div className="bar-track">

                      <div
                        className="bar-value"
                        style={{
                          height:
                            `${
                              (
                                item.value
                                / maxHours
                              )
                              * 100
                            }%`,
                        }}
                      />

                    </div>


                    <span>
                      {
                        item.day
                      }
                    </span>

                  </div>

                )
              )}

            </div>

          </div>


          <div className="hours-total">

            <Clock3
              size={15}
            />

            <span>
              Total :
            </span>

            <strong>
              {
                formatHours(
                  totalHours
                )
              }
            </strong>

          </div>

        </article>


        {/* NOTIFICATIONS */}

        <article className="dashboard-card notifications-card">

          <div className="card-heading">

            <div>

              <h2>
                Notifications
              </h2>

              <p>
                Vos dernières alertes StaffHub.
              </p>

            </div>


            <Link
              to="/home/notifications"
              className="text-button"
            >
              Tout voir
            </Link>

          </div>


          <div className="dashboard-notifications-list">

            {latestNotifications.length > 0 ? (

              latestNotifications.map(
                (
                  notification
                ) => (

                  <div
                    className="dashboard-notification-item"
                    key={
                      notification.id
                    }
                  >

                    <span
                      className={
                        `dashboard-notification-dot ${
                          getNotificationDotClass(
                            notification.type_notification
                          )
                        }`
                      }
                    />


                    <div className="dashboard-notification-content">

                      <div className="dashboard-notification-title-row">

                        <h3>
                          {
                            notification.titre
                          }
                        </h3>

                        <time>
                          {
                            formatRelativeDate(
                              notification.date_envoi
                            )
                          }
                        </time>

                      </div>


                      <p>
                        {
                          notification.message
                        }
                      </p>

                    </div>

                  </div>

                )
              )

            ) : (

              <div className="request-empty">
                Aucune notification.
              </div>

            )}

          </div>


          <Link
            to="/home/notifications"
            className="notifications-link"
          >
            Voir toutes les notifications

            <ChevronRight
              size={15}
            />
          </Link>

        </article>

      </section>

    </div>
  );
}


// =========================================================
// FORMAT HEURES
// =========================================================

function formatHours(
  value
) {
  const numeric = Number(
    value
  );

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return "0h";
  }

  const rounded = (
    Math.round(
      numeric * 100
    )
    / 100
  );

  return `${rounded}h`;
}


// =========================================================
// FORMAT DATE RELATIVE
// =========================================================

function formatRelativeDate(
  value
) {
  if (!value) {
    return "";
  }

  const date = new Date(
    value
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference = (
    Date.now()
    - date.getTime()
  );

  const minutes = Math.floor(
    difference
    / 60000
  );

  const hours = Math.floor(
    difference
    / 3600000
  );

  const days = Math.floor(
    difference
    / 86400000
  );

  if (
    minutes < 1
  ) {
    return "À l'instant";
  }

  if (
    minutes < 60
  ) {
    return (
      `Il y a ${minutes} min`
    );
  }

  if (
    hours < 24
  ) {
    return (
      `Il y a ${hours} h`
    );
  }

  if (
    days === 1
  ) {
    return "Hier";
  }

  if (
    days < 7
  ) {
    return (
      `Il y a ${days} jours`
    );
  }

  return date.toLocaleDateString(
    "fr-FR"
  );
}


// =========================================================
// COULEUR NOTIFICATION
// =========================================================

function getNotificationDotClass(
  type
) {
  if (
    type === "VALIDATION"
    || type === "PLANNING"
  ) {
    return (
      "dashboard-notification-cyan"
    );
  }

  if (
    type === "PAIE"
    || type === "DOCUMENT"
  ) {
    return (
      "dashboard-notification-purple"
    );
  }

  return (
    "dashboard-notification-blue"
  );
}
