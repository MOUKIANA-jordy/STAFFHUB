import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  CalendarDays,
  FileText,
  UserRound,
} from "lucide-react";

import "../Styles/notifications.css";

const initialNotifications = [
  {
    id: 1,
    title: "Nouvelle politique de télétravail",
    description: "Veuillez prendre connaissance du nouveau document.",
    time: "Il y a 1 heure",
    type: "document",
    read: false,
  },
  {
    id: 2,
    title: "Entretien annuel",
    description: "Votre entretien annuel est prévu le 15 juin.",
    time: "Il y a 3 heures",
    type: "calendar",
    read: false,
  },
  {
    id: 3,
    title: "Profil mis à jour",
    description: "Les informations de votre profil ont été modifiées.",
    time: "Il y a 1 jour",
    type: "profile",
    read: true,
  },
];

const notificationIcons = {
  document: FileText,
  calendar: CalendarDays,
  profile: UserRound,
  default: Bell,
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const markAsRead = (notificationId) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <section className="notifications-page">
      <header className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : "Toutes vos notifications ont été lues"}
          </p>
        </div>

        <button
          type="button"
          className="notifications-read-all"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={18} />
          Tout marquer comme lu
        </button>
      </header>

      <div className="notifications-list">
        {notifications.map((notification) => {
          const Icon =
            notificationIcons[notification.type] ||
            notificationIcons.default;

          return (
            <article
              key={notification.id}
              className={`notification-card ${
                notification.read ? "notification-read" : ""
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon">
                <Icon size={21} />
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h2>{notification.title}</h2>

                  {!notification.read && (
                    <span
                      className="notification-unread-dot"
                      aria-label="Non lue"
                    />
                  )}
                </div>

                <p>{notification.description}</p>
                <time>{notification.time}</time>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
