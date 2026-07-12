import React from "react";
import { Link } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import "../Styles/home.css";

const quickActions = [
  {
    title: "Demande d'acompte",
    icon: "€",
    path: "/dossiers/demandes/acompte",
  },
  {
    title: "Demande d'avance",
    icon: "⇄",
    path: "/dossiers/demandes/avance",
  },
  {
    title: "Mes absences",
    icon: "👤",
    path: "/activites/absences",
  },
  {
    title: "Planning",
    icon: "▣",
    path: "/activites/planning",
  },
  {
    title: "Mes documents",
    icon: "📁",
    path: "/dossiers/informations/documents",
  },
  {
    title: "Fiches de paie",
    icon: "📄",
    path: "/dossiers/demandes/fiches",
  },
  {
    title: "Pointages",
    icon: "◷",
    path: "/activites/pointages",
  },
  {
    title: "Mon profil",
    icon: "●",
    path: "/profile",
  },
];

const recentActivities = [
  {
    id: 1,
    icon: "✓",
    type: "success",
    text: "Votre demande d'acompte a été envoyée",
    date: "Il y a 15 minutes",
  },
  {
    id: 2,
    icon: "📄",
    type: "blue",
    text: 'Document "Contrat_Travail.pdf" ajouté',
    date: "Il y a 2 heures",
  },
  {
    id: 3,
    icon: "▣",
    type: "purple",
    text: "Planning mis à jour pour la semaine prochaine",
    date: "Il y a 5 heures",
  },
  {
    id: 4,
    icon: "◷",
    type: "orange",
    text: "Pointage du jour validé",
    date: "Il y a 1 jour",
  },
  {
    id: 5,
    icon: "●",
    type: "green",
    text: "Votre profil a été mis à jour",
    date: "Il y a 2 jours",
  },
];

const notifications = [
  {
    id: 1,
    type: "blue",
    title: "Nouvelle politique de télétravail",
    description: "Veuillez prendre connaissance du nouveau document.",
    date: "Il y a 1 heure",
  },
  {
    id: 2,
    type: "green",
    title: "Entretien annuel",
    description: "Votre entretien annuel est prévu prochainement.",
    date: "Il y a 3 heures",
  },
  {
    id: 3,
    type: "orange",
    title: "Formation obligatoire",
    description: "Une nouvelle formation est disponible.",
    date: "Il y a 1 jour",
  },
];

const workingHours = [
  { day: "Lun", value: 50 },
  { day: "Mar", value: 68 },
  { day: "Mer", value: 40 },
  { day: "Jeu", value: 60 },
  { day: "Ven", value: 50 },
  { day: "Sam", value: 0 },
  { day: "Dim", value: 0 },
];

export default function Home() {
  const { user } = useAuth();

  const firstName =
    user?.first_name ||
    user?.prenom ||
    user?.username ||
    "Utilisateur";

  return (
    <div className="dashboard">
      {/* INTRODUCTION */}
      <section className="dashboard-heading">
        <div>
          <h1>
            Bonjour, {firstName} <span>👋</span>
          </h1>
          <p>Voici un aperçu de votre activité aujourd’hui.</p>
        </div>

        <div className="dashboard-date">
          {new Intl.DateTimeFormat("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </div>
      </section>

      {/* STATISTIQUES */}
      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-icon stat-icon-blue">▤</div>

          <div className="stat-content">
            <strong>12</strong>
            <span>Demandes en cours</span>
            <small className="text-blue">
              3 en attente de validation
            </small>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-green">▣</div>

          <div className="stat-content">
            <strong>18</strong>
            <span>Jours de congés</span>
            <small className="text-green">
              Restants cette année
            </small>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-purple">◷</div>

          <div className="stat-content">
            <strong>148h</strong>
            <span>Heures travaillées</span>
            <small className="text-purple">Ce mois-ci</small>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-icon stat-icon-orange">♢</div>

          <div className="stat-content">
            <strong>5</strong>
            <span>Notifications</span>
            <small className="text-orange">Nouvelles</small>
          </div>
        </article>
      </section>

      {/* ACCÈS RAPIDES ET ACTIVITÉ */}
      <section className="dashboard-main-grid">
        <article className="dashboard-card quick-access-card">
          <div className="card-heading">
            <h2>Accès rapides</h2>
            <button type="button" className="more-button">
              •••
            </button>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <Link
                to={action.path}
                className="quick-action"
                key={action.title}
              >
                <span className="quick-action-icon">
                  {action.icon}
                </span>

                <span>{action.title}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="dashboard-card recent-card">
          <div className="card-heading">
            <h2>Activité récente</h2>
            <button type="button" className="more-button">
              •••
            </button>
          </div>

          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div
                  className={`activity-icon activity-icon-${activity.type}`}
                >
                  {activity.icon}
                </div>

                <div className="activity-content">
                  <p>{activity.text}</p>
                  <span>{activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* GRAPHIQUES ET NOTIFICATIONS */}
      <section className="dashboard-bottom-grid">
        <article className="dashboard-card absence-card">
          <div className="card-heading">
            <h2>Absences</h2>

            <select defaultValue="month" className="period-select">
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          <div className="absence-content">
            <div className="donut-chart">
              <div className="donut-center">
                <strong>5</strong>
                <span>jours</span>
              </div>
            </div>

            <div className="absence-legend">
              <div>
                <span className="legend-dot legend-blue" />
                <p>Congés payés</p>
                <strong>3 jours</strong>
              </div>

              <div>
                <span className="legend-dot legend-green" />
                <p>RTT</p>
                <strong>1 jour</strong>
              </div>

              <div>
                <span className="legend-dot legend-purple" />
                <p>Maladie</p>
                <strong>1 jour</strong>
              </div>

              <div>
                <span className="legend-dot legend-gray" />
                <p>Autres</p>
                <strong>0 jour</strong>
              </div>
            </div>
          </div>

          <Link to="/activites/absences" className="card-link">
            Voir le détail →
          </Link>
        </article>

        <article className="dashboard-card hours-card">
          <div className="card-heading">
            <h2>Répartition des heures</h2>

            <select defaultValue="month" className="period-select">
              <option value="month">Ce mois</option>
              <option value="week">Cette semaine</option>
            </select>
          </div>

          <div className="hours-chart">
            <div className="chart-scale">
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            <div className="chart-bars">
              {workingHours.map((item) => (
                <div className="bar-column" key={item.day}>
                  <div className="bar-track">
                    <div
                      className="bar-value"
                      style={{
                        height: `${(item.value / 80) * 100}%`,
                      }}
                    />
                  </div>

                  <span>{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="hours-total">Total : 148h</p>
        </article>

        <article className="dashboard-card notifications-card">
          <div className="card-heading">
            <h2>Notifications</h2>
            <button type="button" className="text-button">
              Tout voir
            </button>
          </div>

          <div className="notifications-list">
            {notifications.map((notification) => (
              <div className="notification-item" key={notification.id}>
                <span
                  className={`notification-dot notification-dot-${notification.type}`}
                />

                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>
                    <time>{notification.date}</time>
                  </div>

                  <p>{notification.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="notifications-link">
            Voir toutes les notifications →
          </button>
        </article>
      </section>
    </div>
  );
}
