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
  UserRound,
  WalletCards,
} from "lucide-react";

import useAuth from "../Hooks/useAuth";
import API from "../Services/api";

import "../Styles/home.css";


/* =========================================================
   EXTRACTION PAGINATION DRF
========================================================= */

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


/* =========================================================
   ACCÈS RAPIDES
========================================================= */

const quickActions = [
  {
    title: "Demande d'acompte",
    description:
      "Demander un acompte sur votre salaire.",
    icon: HandCoins,
    path: "/dossiers/demandes/acompte",
    accent: "blue",
  },

  {
    title: "Demande d'avance",
    description:
      "Créer une demande d'avance exceptionnelle.",
    icon: WalletCards,
    path: "/dossiers/demandes/avance",
    accent: "purple",
  },

  {
    title: "Mes absences",
    description:
      "Consulter et suivre vos absences.",
    icon: UserRound,
    path: "/activites/absences",
    accent: "cyan",
  },

  {
    title: "Planning",
    description:
      "Consulter votre planning de travail.",
    icon: CalendarDays,
    path: "/activites/planning",
    accent: "blue",
  },

  {
    title: "Mes documents",
    description:
      "Accéder à vos documents administratifs.",
    icon: Folder,
    path: "/dossiers/informations/documents",
    accent: "purple",
  },

  {
    title: "Fiches de paie",
    description:
      "Consulter ou demander vos bulletins.",
    icon: FileText,
    path: "/dossiers/demandes/fiches",
    accent: "cyan",
  },

  {
    title: "Pointages",
    description:
      "Consulter vos heures enregistrées.",
    icon: Clock3,
    path: "/activites/pointages",
    accent: "blue",
  },

  {
    title: "Mon profil",
    description:
      "Consulter vos informations personnelles.",
    icon: UserRound,
    path: "/home/profile",
    accent: "purple",
  },
];


export default function Home() {
  const {
    user,
  } = useAuth();


  /* =======================================================
     STATE
  ======================================================= */

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


  /* =======================================================
     CHARGEMENT
  ======================================================= */

  const fetchDashboard =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const [
            demandesResponse,
            notificationsResponse,
            compteurResponse,
            pointagesResponse,
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
            || (
              "Impossible de charger "
              + "certaines données du tableau de bord."
            )
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


  /* =======================================================
     UTILISATEUR
  ======================================================= */

  const firstName =
    user?.prenom
    || user?.first_name
    || user?.username
    || "Utilisateur";


  /* =======================================================
     DATE
  ======================================================= */

  const currentDate =
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
    );


  /* =======================================================
     DEMANDES
  ======================================================= */

  const demandesEnAttente =
    useMemo(
      () =>
        demandes.filter(
          (demande) =>
            demande.statut
            === "EN_ATTENTE"
        ),
      [demandes]
    );


  const demandesApprouvees =
    useMemo(
      () =>
        demandes.filter(
          (demande) =>
            demande.statut
            === "APPROUVE"
        ),
      [demandes]
    );


  /* =======================================================
     ABSENCES
  ======================================================= */

  const absences =
    useMemo(
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


  /* =======================================================
     HEURES
  ======================================================= */

  const totalHours =
    useMemo(
      () =>
        pointages.reduce(
          (
            total,
            pointage
          ) => {
            const value =
              Number(
                pointage
                  ?.heures_travaillees
              );

            return (
              total
              + (
                Number.isFinite(value)
                  ? value
                  : 0
              )
            );
          },
          0
        ),
      [pointages]
    );


  const totalOvertime =
    useMemo(
      () =>
        pointages.reduce(
          (
            total,
            pointage
          ) => {
            const value =
              Number(
                pointage
                  ?.heures_sup
              );

            return (
              total
              + (
                Number.isFinite(value)
                  ? value
                  : 0
              )
            );
          },
          0
        ),
      [pointages]
    );


  /* =======================================================
     HEURES PAR JOUR
  ======================================================= */

  const workingHours =
    useMemo(
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

            const date =
              new Date(
                dateValue
              );

            if (
              Number.isNaN(
                date.getTime()
              )
            ) {
              return;
            }

            const value =
              Number(
                pointage
                  ?.heures_travaillees
              );

            days[
              date.getDay()
            ].value += (
              Number.isFinite(value)
                ? value
                : 0
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


  const maxHours =
    Math.max(
      8,
      ...workingHours.map(
        (item) =>
          item.value
      )
    );


  /* =======================================================
     ACTIVITÉ RÉCENTE
  ======================================================= */

  const recentActivities =
    useMemo(
      () =>
        demandes
          .slice(
            0,
            4
          )
          .map(
            (demande) => {
              let icon =
                FileText;

              let type =
                "blue";

              let text =
                `${
                  demande
                    .type_demande_display
                  || demande
                    .type_demande
                  || "Demande"
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
                    demande
                      .type_demande_display
                    || demande
                      .type_demande
                    || "Demande"
                  } approuvée`;
              }


              if (
                demande.statut
                === "REFUSE"
              ) {
                icon =
                  AlertCircle;

                type =
                  "danger";

                text =
                  `${
                    demande
                      .type_demande_display
                    || demande
                      .type_demande
                    || "Demande"
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
                    demande
                      .date_demande
                  ),
              };
            }
          ),
      [demandes]
    );


  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const latestNotifications =
    useMemo(
      () =>
        notifications.slice(
          0,
          3
        ),
      [notifications]
    );


  /* =======================================================
     POURCENTAGE ABSENCE
  ======================================================= */

  const absencePercent =
    planning.length > 0
      ? Math.min(
          100,
          Math.round(
            (
              absences.length
              / planning.length
            )
            * 100
          )
        )
      : 0;


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dashboard">

        <div className="dashboard-loading">

          <Loader2
            size={30}
            className="dashboard-spinner"
          />

          <span>
            Chargement du tableau de bord...
          </span>

        </div>

      </div>
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dashboard">

      {/* ===================================================
          HEADER
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
            Retrouvez les informations essentielles
            de votre espace salarié.
          </p>

        </div>


        <div className="dashboard-date">

          <CalendarDays
            size={18}
            strokeWidth={1.8}
          />

          <span>
            {currentDate}
          </span>

        </div>

      </section>


      {/* ===================================================
          ERREUR
      =================================================== */}

      {
        error
        && (
          <div className="dashboard-error">
            <AlertCircle
              size={18}
            />

            <span>
              {error}
            </span>
          </div>
        )
      }


      {/* ===================================================
          KPI
      =================================================== */}

      <section className="stats-grid">

        <DashboardStat
          icon={FileText}
          accent="blue"
          value={
            demandesEnAttente.length
          }
          label="Demandes en cours"
          description={
            `${demandes.length} demande${
              demandes.length > 1
                ? "s"
                : ""
            } au total`
          }
          badge="Suivi RH"
        />


        <DashboardStat
          icon={CheckCircle2}
          accent="green"
          value={
            demandesApprouvees.length
          }
          label="Demandes approuvées"
          description="Validées par le service RH"
          badge="Validées"
        />


        <DashboardStat
          icon={Clock3}
          accent="purple"
          value={
            formatHours(
              totalHours
            )
          }
          label="Heures enregistrées"
          description={
            `${formatHours(
              totalOvertime
            )} supplémentaires`
          }
          badge="Pointages"
        />


        <DashboardStat
          icon={Bell}
          accent="cyan"
          value={
            notificationsCount
              .non_lues
          }
          label="Notifications non lues"
          description={
            `${notificationsCount.total} au total`
          }
          badge={
            notificationsCount
              .non_lues > 0
              ? "Nouveau"
              : "À jour"
          }
        />

      </section>


      {/* ===================================================
          ZONE PRINCIPALE
      =================================================== */}

      <section className="dashboard-main-grid">

        {/* ACCÈS RAPIDES */}

        <article className="dashboard-card">

          <CardHeading
            title="Accès rapides"
            description={
              "Vos principales fonctionnalités."
            }
          />


          <div className="quick-actions-grid">

            {
              quickActions.map(
                (action) => {
                  const Icon =
                    action.icon;

                  return (
                    <Link
                      key={
                        action.title
                      }
                      to={
                        action.path
                      }
                      className="quick-action"
                    >

                      <span
                        className={
                          `quick-action-icon quick-action-${action.accent}`
                        }
                      >

                        <Icon
                          size={20}
                          strokeWidth={1.8}
                        />

                      </span>


                      <div>

                        <strong>
                          {action.title}
                        </strong>

                        <small>
                          {action.description}
                        </small>

                      </div>


                      <ChevronRight
                        size={17}
                        className="quick-action-arrow"
                      />

                    </Link>
                  );
                }
              )
            }

          </div>

        </article>


        {/* ACTIVITÉ RÉCENTE */}

        <article className="dashboard-card">

          <CardHeading
            title="Activité récente"
            description={
              "Vos dernières demandes."
            }
            action={
              <Link
                to="/home/dossiers"
                className="text-button"
              >
                Voir tout
              </Link>
            }
          />


          <div className="activity-list">

            {
              recentActivities.length
              > 0
                ? (
                  recentActivities.map(
                    (activity) => {
                      const Icon =
                        activity.icon;

                      return (
                        <div
                          key={
                            activity.id
                          }
                          className="activity-item"
                        >

                          <span
                            className={
                              `activity-icon activity-icon-${activity.type}`
                            }
                          >

                            <Icon
                              size={17}
                              strokeWidth={1.8}
                            />

                          </span>


                          <div className="activity-content">

                            <p>
                              {activity.text}
                            </p>

                            <span>
                              {activity.date}
                            </span>

                          </div>

                        </div>
                      );
                    }
                  )
                )
                : (
                  <div className="dashboard-empty">
                    Aucune activité récente.
                  </div>
                )
            }

          </div>

        </article>

      </section>


      {/* ===================================================
          BOTTOM
      =================================================== */}

      <section className="dashboard-bottom-grid">

        {/* ABSENCES */}

        <article className="dashboard-card">

          <CardHeading
            title="Absences"
            description={
              "Données issues de votre planning."
            }
          />


          <div className="absence-content">

            <div
              className="donut-chart"
              style={{
                "--absence-percent":
                  `${absencePercent * 3.6}deg`,
              }}
            >

              <div className="donut-center">

                <strong>
                  {absences.length}
                </strong>

                <span>
                  absence{
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
                  Absences
                </p>

                <strong>
                  {absences.length}
                </strong>

              </div>


              <div>

                <span className="legend-dot legend-cyan" />

                <p>
                  Jours planifiés
                </p>

                <strong>
                  {planning.length}
                </strong>

              </div>


              <div>

                <span className="legend-dot legend-gray" />

                <p>
                  Taux
                </p>

                <strong>
                  {absencePercent} %
                </strong>

              </div>

            </div>

          </div>


          <Link
            to="/activites/absences"
            className="card-link"
          >
            Voir mes absences

            <ChevronRight
              size={15}
            />
          </Link>

        </article>


        {/* HEURES */}

        <article className="dashboard-card">

          <CardHeading
            title="Heures travaillées"
            description={
              "Répartition selon vos pointages."
            }
          />


          <div className="hours-chart">

            <div className="chart-scale">

              <span>
                {Math.ceil(maxHours)}
              </span>

              <span>
                {Math.round(
                  maxHours * 0.75
                )}
              </span>

              <span>
                {Math.round(
                  maxHours * 0.5
                )}
              </span>

              <span>
                {Math.round(
                  maxHours * 0.25
                )}
              </span>

              <span>
                0
              </span>

            </div>


            <div className="chart-bars">

              {
                workingHours.map(
                  (item) => (
                    <div
                      key={item.day}
                      className="bar-column"
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
                        {item.day}
                      </span>

                    </div>
                  )
                )
              }

            </div>

          </div>


          <div className="hours-total">

            <Clock3
              size={16}
            />

            <span>
              Total
            </span>

            <strong>
              {
                formatHours(
                  totalHours
                )
              }
            </strong>

            <span className="hours-separator">
              •
            </span>

            <span>
              Heures sup.
            </span>

            <strong>
              {
                formatHours(
                  totalOvertime
                )
              }
            </strong>

          </div>

        </article>


        {/* NOTIFICATIONS */}

        <article className="dashboard-card">

          <CardHeading
            title="Notifications"
            description={
              "Vos dernières alertes StaffHub."
            }
            action={
              <Link
                to="/home/notifications"
                className="text-button"
              >
                Tout voir
              </Link>
            }
          />


          <div className="dashboard-notifications-list">

            {
              latestNotifications.length
              > 0
                ? (
                  latestNotifications.map(
                    (
                      notification
                    ) => (
                      <div
                        key={
                          notification.id
                        }
                        className="dashboard-notification-item"
                      >

                        <span
                          className={
                            `dashboard-notification-dot ${
                              getNotificationDotClass(
                                notification
                                  .type_notification
                              )
                            }`
                          }
                        />


                        <div className="dashboard-notification-content">

                          <div className="dashboard-notification-title-row">

                            <h3>
                              {
                                notification.titre
                                || "Notification"
                              }
                            </h3>

                            <time>
                              {
                                formatRelativeDate(
                                  notification
                                    .date_envoi
                                )
                              }
                            </time>

                          </div>


                          <p>
                            {
                              notification.message
                              || "Aucun détail."
                            }
                          </p>

                        </div>

                      </div>
                    )
                  )
                )
                : (
                  <div className="dashboard-empty">
                    Aucune notification.
                  </div>
                )
            }

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


/* =========================================================
   KPI COMPONENT
========================================================= */

function DashboardStat({
  icon: Icon,
  accent,
  value,
  label,
  description,
  badge,
}) {
  return (
    <article className="stat-card">

      <div className="stat-card-top">

        <span
          className={
            `stat-icon stat-icon-${accent}`
          }
        >

          <Icon
            size={22}
            strokeWidth={1.8}
          />

        </span>


        <span className="stat-badge">
          {badge}
        </span>

      </div>


      <div className="stat-content">

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

        <small>
          {description}
        </small>

      </div>

    </article>
  );
}


/* =========================================================
   CARD HEADING
========================================================= */

function CardHeading({
  title,
  description,
  action,
}) {
  return (
    <div className="card-heading">

      <div>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>

      {action}

    </div>
  );
}


/* =========================================================
   FORMAT HEURES
========================================================= */

function formatHours(value) {
  const numeric =
    Number(value);

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return "0h";
  }

  const rounded =
    Math.round(
      numeric * 100
    )
    / 100;

  return `${rounded}h`;
}


/* =========================================================
   DATE RELATIVE
========================================================= */

function formatRelativeDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const difference =
    Date.now()
    - date.getTime();

  const minutes =
    Math.floor(
      difference
      / 60000
    );

  const hours =
    Math.floor(
      difference
      / 3600000
    );

  const days =
    Math.floor(
      difference
      / 86400000
    );


  if (minutes < 1) {
    return "À l'instant";
  }

  if (minutes < 60) {
    return (
      `Il y a ${minutes} min`
    );
  }

  if (hours < 24) {
    return (
      `Il y a ${hours} h`
    );
  }

  if (days === 1) {
    return "Hier";
  }

  if (days < 7) {
    return (
      `Il y a ${days} jours`
    );
  }

  return date.toLocaleDateString(
    "fr-FR"
  );
}


/* =========================================================
   COULEUR NOTIFICATION
========================================================= */

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
