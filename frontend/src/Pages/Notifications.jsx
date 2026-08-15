import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  CheckCheck,
  Clock3,
  FileText,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";

import API from "../Services/api";

import "../Styles/notifications.css";


export default function Notifications() {

  const navigate = useNavigate();


  // =========================================================
  // STATES
  // =========================================================

  const [
    notifications,
    setNotifications,
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
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    processingId,
    setProcessingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    compteur,
    setCompteur,
  ] = useState({
    total: 0,
    non_lues: 0,
    lues: 0,
  });


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
  // CHARGEMENT DES NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async (
    showRefresh = false
  ) => {

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {

      const [
        notificationsResponse,
        compteurResponse,
      ] = await Promise.all([
        API.get(
          "/api/notifications/"
        ),

        API.get(
          "/api/notifications/compteur/"
        ),
      ]);


      const notificationData = (
        extractResults(
          notificationsResponse.data
        )
      );


      setNotifications(
        notificationData
      );


      setCompteur({
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

    } catch (err) {

      console.error(
        "NOTIFICATIONS ERROR",
        err
      );

      setError(
        err.response?.data?.detail
        || "Impossible de charger les notifications."
      );

      setNotifications([]);

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  useEffect(() => {

    fetchNotifications();

  }, []);


  // =========================================================
  // COMPTEUR LOCAL
  // =========================================================

  const unreadCount = useMemo(() => {

    return notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  }, [notifications]);


  // =========================================================
  // ICÔNES
  // =========================================================

  const getNotificationIcon = (
    type
  ) => {

    const icons = {

      INFO:
        Info,

      ALERTE:
        AlertTriangle,

      VALIDATION:
        CheckCircle2,

      REFUS:
        XCircle,

      PAIE:
        WalletCards,

      DOCUMENT:
        FileText,

      DEMANDE:
        FileText,

      PLANNING:
        CalendarDays,

      POINTAGE:
        Clock3,

    };

    return (
      icons[type]
      || Bell
    );

  };


  // =========================================================
  // CLASSE SELON TYPE
  // =========================================================

  const getNotificationTypeClass = (
    type
  ) => {

    const classes = {

      INFO:
        "notification-type-info",

      ALERTE:
        "notification-type-alert",

      VALIDATION:
        "notification-type-success",

      REFUS:
        "notification-type-danger",

      PAIE:
        "notification-type-pay",

      DOCUMENT:
        "notification-type-document",

      DEMANDE:
        "notification-type-request",

      PLANNING:
        "notification-type-planning",

      POINTAGE:
        "notification-type-time",

    };

    return (
      classes[type]
      || "notification-type-default"
    );

  };


  // =========================================================
  // PRIORITÉ
  // =========================================================

  const getPriorityLabel = (
    notification
  ) => {

    if (
      notification.priorite_display
    ) {
      return (
        notification.priorite_display
      );
    }


    const labels = {

      BASSE:
        "Basse",

      NORMALE:
        "Normale",

      HAUTE:
        "Haute",

      URGENTE:
        "Urgente",

    };

    return (
      labels[
        notification.priorite
      ]
      || notification.priorite
      || ""
    );

  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    value
  ) => {

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


    const now = new Date();

    const difference = (
      now.getTime()
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
      minutes >= 0
      && minutes < 1
    ) {
      return "À l'instant";
    }


    if (
      minutes >= 1
      && minutes < 60
    ) {
      return (
        `Il y a ${minutes} min`
      );
    }


    if (
      hours >= 1
      && hours < 24
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
      days > 1
      && days < 7
    ) {
      return (
        `Il y a ${days} jours`
      );
    }


    return date.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  };


  // =========================================================
  // MARQUER COMME LUE
  // =========================================================

  const markAsRead = async (
    notification
  ) => {

    if (
      !notification
      || notification.is_read
    ) {
      return notification;
    }


    try {

      setProcessingId(
        notification.id
      );


      const response = await API.post(
        `/api/notifications/${notification.id}/marquer-lue/`
      );


      const updatedNotification = (
        response.data?.notification
        || {
          ...notification,
          is_read: true,
        }
      );


      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (item) =>
              item.id
              === notification.id
                ? updatedNotification
                : item
          )
      );


      setCompteur(
        (current) => ({
          total:
            current.total,

          non_lues:
            Math.max(
              0,
              current.non_lues - 1
            ),

          lues:
            current.lues + 1,
        })
      );


      return (
        updatedNotification
      );

    } catch (err) {

      console.error(
        "MARK READ ERROR",
        err
      );

      setError(
        err.response?.data?.detail
        || "Impossible de marquer la notification comme lue."
      );

      return notification;

    } finally {

      setProcessingId(
        null
      );

    }

  };


  // =========================================================
  // MARQUER COMME NON LUE
  // =========================================================

  const markAsUnread = async (
    notification
  ) => {

    if (
      !notification
      || !notification.is_read
    ) {
      return;
    }


    try {

      setProcessingId(
        notification.id
      );


      const response = await API.post(
        `/api/notifications/${notification.id}/marquer-non-lue/`
      );


      const updatedNotification = (
        response.data?.notification
        || {
          ...notification,
          is_read: false,
        }
      );


      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (item) =>
              item.id
              === notification.id
                ? updatedNotification
                : item
          )
      );


      setCompteur(
        (current) => ({
          total:
            current.total,

          non_lues:
            current.non_lues + 1,

          lues:
            Math.max(
              0,
              current.lues - 1
            ),
        })
      );

    } catch (err) {

      console.error(
        "MARK UNREAD ERROR",
        err
      );

      setError(
        err.response?.data?.detail
        || "Impossible de marquer la notification comme non lue."
      );

    } finally {

      setProcessingId(
        null
      );

    }

  };


  // =========================================================
  // TOUT MARQUER COMME LU
  // =========================================================

  const markAllAsRead = async () => {

    if (
      compteur.non_lues === 0
      && unreadCount === 0
    ) {
      return;
    }


    try {

      setMarkingAll(true);
      setError("");


      await API.post(
        "/api/notifications/tout-marquer-lu/"
      );


      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );


      setCompteur(
        (current) => ({
          total:
            current.total,

          non_lues:
            0,

          lues:
            current.total,
        })
      );

    } catch (err) {

      console.error(
        "MARK ALL READ ERROR",
        err
      );

      setError(
        err.response?.data?.detail
        || "Impossible de marquer toutes les notifications comme lues."
      );

    } finally {

      setMarkingAll(false);

    }

  };


  // =========================================================
  // CLIC SUR NOTIFICATION
  // =========================================================

  const handleNotificationClick = async (
    notification
  ) => {

    const updated = (
      await markAsRead(
        notification
      )
    );


    const link = (
      updated?.lien
      || notification.lien
    );


    if (link) {

      navigate(
        link
      );

    }

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="notifications-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="notifications-header">


        <div>

          <div className="notifications-title-row">

            <div className="notifications-title-icon">

              <Bell size={22} />

            </div>


            <div>

              <h1>
                Notifications
              </h1>


              <p>

                {compteur.non_lues > 0
                  ? (
                    `${compteur.non_lues} notification${
                      compteur.non_lues > 1
                        ? "s"
                        : ""
                    } non lue${
                      compteur.non_lues > 1
                        ? "s"
                        : ""
                    }`
                  )
                  : (
                    "Toutes vos notifications sont lues"
                  )
                }

              </p>

            </div>

          </div>

        </div>


        <div className="notifications-header-actions">


          <button
            type="button"
            className="notifications-refresh"
            onClick={() =>
              fetchNotifications(
                true
              )
            }
            disabled={refreshing}
            title="Actualiser"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "notifications-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="notifications-read-all"
            onClick={
              markAllAsRead
            }
            disabled={
              markingAll
              || compteur.non_lues === 0
            }
          >

            {markingAll ? (

              <Loader2
                size={18}
                className="notifications-spin"
              />

            ) : (

              <CheckCheck
                size={18}
              />

            )}

            {markingAll
              ? "Traitement..."
              : "Tout marquer comme lu"
            }

          </button>


        </div>

      </header>


      {/* ===================================================
          RÉSUMÉ
      =================================================== */}

      <div className="notifications-summary">


        <article>

          <span>
            Total
          </span>

          <strong>
            {compteur.total}
          </strong>

        </article>


        <article>

          <span>
            Non lues
          </span>

          <strong>
            {compteur.non_lues}
          </strong>

        </article>


        <article>

          <span>
            Lues
          </span>

          <strong>
            {compteur.lues}
          </strong>

        </article>


      </div>


      {/* ===================================================
          ERREUR
      =================================================== */}

      {error && (

        <div className="notifications-error">

          <AlertTriangle size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ===================================================
          CHARGEMENT
      =================================================== */}

      {loading ? (

        <div className="notifications-loading">

          <Loader2
            size={26}
            className="notifications-spin"
          />

          <span>
            Chargement des notifications...
          </span>

        </div>

      ) : notifications.length > 0 ? (

        /* =================================================
           LISTE
        ================================================= */

        <div className="notifications-list">


          {notifications.map(
            (notification) => {

              const Icon = (
                getNotificationIcon(
                  notification.type_notification
                )
              );


              const processing = (
                processingId
                === notification.id
              );


              return (

                <article
                  key={notification.id}
                  className={
                    `notification-card ${
                      notification.is_read
                        ? "notification-read"
                        : ""
                    } ${
                      getNotificationTypeClass(
                        notification.type_notification
                      )
                    }`
                  }
                >


                  {/* =======================================
                      ICÔNE
                  ======================================= */}

                  <button
                    type="button"
                    className="notification-main-action"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    disabled={processing}
                  >


                    <div className="notification-icon">

                      {processing ? (

                        <Loader2
                          size={21}
                          className="notifications-spin"
                        />

                      ) : (

                        <Icon
                          size={21}
                        />

                      )}

                    </div>


                    {/* =====================================
                        CONTENU
                    ===================================== */}

                    <div className="notification-content">


                      <div className="notification-title-row">


                        <div className="notification-title-container">

                          <h2>
                            {notification.titre}
                          </h2>


                          {!notification.is_read && (

                            <span
                              className="notification-unread-dot"
                              aria-label="Non lue"
                            />

                          )}

                        </div>


                        <time>

                          {formatDate(
                            notification.date_envoi
                          )}

                        </time>


                      </div>


                      <p>
                        {notification.message}
                      </p>


                      <div className="notification-meta">


                        <span>

                          {(
                            notification
                              .type_notification_display
                            || notification
                              .type_notification
                          )}

                        </span>


                        {notification.priorite && (

                          <span
                            className={
                              `notification-priority notification-priority-${
                                notification.priorite
                                  .toLowerCase()
                              }`
                            }
                          >

                            {getPriorityLabel(
                              notification
                            )}

                          </span>

                        )}


                        {notification.created_by_username && (

                          <span>
                            Par{" "}
                            {
                              notification
                                .created_by_username
                            }
                          </span>

                        )}


                      </div>


                    </div>


                  </button>


                  {/* =======================================
                      ACTION SECONDAIRE
                  ======================================= */}

                  <div className="notification-actions">


                    {notification.is_read ? (

                      <button
                        type="button"
                        onClick={() =>
                          markAsUnread(
                            notification
                          )
                        }
                        disabled={processing}
                      >

                        Marquer non lue

                      </button>

                    ) : (

                      <button
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification
                          )
                        }
                        disabled={processing}
                      >

                        Marquer lue

                      </button>

                    )}


                    {notification.lien && (

                      <button
                        type="button"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                      >

                        Ouvrir →

                      </button>

                    )}


                  </div>


                </article>

              );

            }
          )}


        </div>

      ) : (

        /* =================================================
           VIDE
        ================================================= */

        <div className="notifications-empty">

          <Bell size={42} />

          <h2>
            Aucune notification
          </h2>

          <p>
            Vos nouvelles notifications apparaîtront ici.
          </p>

        </div>

      )}


    </section>
  );
}
