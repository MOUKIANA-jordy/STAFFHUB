import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";

import API from "../../Services/api";

import "../../Styles/absences.css";


const EMPTY_FORM = {
  type_absence: "CONGES_PAYES",
  date_debut: "",
  date_fin: "",
  motif: "",
  document: null,
};


const ABSENCE_TYPES = [
  {
    value: "CONGES_PAYES",
    label: "Congés payés",
  },
  {
    value: "RTT",
    label: "RTT",
  },
  {
    value: "MALADIE",
    label: "Maladie",
  },
  {
    value: "SANS_SOLDE",
    label: "Congé sans solde",
  },
  {
    value: "EVENEMENT_FAMILIAL",
    label: "Événement familial",
  },
  {
    value: "AUTRE",
    label: "Autre",
  },
];


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


export default function Absences() {
  const [
    demandes,
    setDemandes,
  ] = useState([]);

  const [
    plannings,
    setPlannings,
  ] = useState([]);

  const [
    formData,
    setFormData,
  ] = useState(EMPTY_FORM);

  const [
    isFormOpen,
    setIsFormOpen,
  ] = useState(false);

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState({
    type: "",
    text: "",
  });


  // =========================================================
  // CHARGEMENT API
  // =========================================================

  const fetchData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage({
        type: "",
        text: "",
      });

      try {
        const [
          demandesResponse,
          planningResponse,
        ] = await Promise.all([
          API.get(
            "/api/demandes/",
            {
              params: {
                type_demande: "ABSENCE",
                ordering: "-date_demande",
              },
            }
          ),

          API.get(
            "/api/planning/",
            {
              params: {
                type_journee: "ABSENCE",
                ordering: "date",
              },
            }
          ),
        ]);


        setDemandes(
          extractResults(
            demandesResponse.data
          )
        );


        setPlannings(
          extractResults(
            planningResponse.data
          )
        );

      } catch (error) {
        console.error(
          "ABSENCES GET ERROR :",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger vos absences.",
        });

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // =========================================================
  // CHANGEMENT FORMULAIRE
  // =========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      files,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,

        [name]:
          files
            ? files[0] || null
            : value,
      })
    );
  };


  // =========================================================
  // DURÉE
  // =========================================================

  const duration =
    useMemo(
      () =>
        calculateDuration(
          formData.date_debut,
          formData.date_fin
        ),
      [
        formData.date_debut,
        formData.date_fin,
      ]
    );


  // =========================================================
  // ENVOI DEMANDE
  // =========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setMessage({
      type: "",
      text: "",
    });


    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (
      !formData.date_debut
      || !formData.date_fin
    ) {
      setMessage({
        type: "error",
        text:
          "Veuillez renseigner les dates de début et de fin.",
      });

      return;
    }


    const debut =
      new Date(
        `${formData.date_debut}T12:00:00`
      );

    const fin =
      new Date(
        `${formData.date_fin}T12:00:00`
      );


    if (fin < debut) {
      setMessage({
        type: "error",
        text:
          "La date de fin ne peut pas être antérieure à la date de début.",
      });

      return;
    }


    if (
      !formData.motif.trim()
    ) {
      setMessage({
        type: "error",
        text:
          "Veuillez renseigner le motif de votre absence.",
      });

      return;
    }


    if (
      formData.document
      && formData.document.size
        > 5 * 1024 * 1024
    ) {
      setMessage({
        type: "error",
        text:
          "Le justificatif ne doit pas dépasser 5 Mo.",
      });

      return;
    }


    setSubmitting(true);


    try {
      const details = {
        date_debut:
          formData.date_debut,

        date_fin:
          formData.date_fin,

        motif:
          formData.motif.trim(),

        type_absence:
          formData.type_absence,
      };


      // -------------------------------------------------------
      // AVEC DOCUMENT
      // -------------------------------------------------------

      if (formData.document) {
        const payload =
          new FormData();


        payload.append(
          "type_demande",
          "ABSENCE"
        );


        payload.append(
          "details",
          JSON.stringify(
            details
          )
        );


        payload.append(
          "document",
          formData.document
        );


        await API.post(
          "/api/demandes/",
          payload
        );

      } else {

        // -----------------------------------------------------
        // SANS DOCUMENT
        // -----------------------------------------------------

        await API.post(
          "/api/demandes/",
          {
            type_demande:
              "ABSENCE",

            details,
          }
        );
      }


      setMessage({
        type: "success",
        text:
          "Votre demande d'absence a bien été envoyée.",
      });


      setFormData(
        EMPTY_FORM
      );


      setIsFormOpen(
        false
      );


      const fileInput =
        document.getElementById(
          "absence-document"
        );

      if (fileInput) {
        fileInput.value = "";
      }


      await fetchData();

    } catch (error) {
      console.error(
        "ABSENCE POST ERROR :",
        error
      );


      setMessage({
        type: "error",
        text:
          getApiError(
            error,
            "Impossible d'envoyer la demande d'absence."
          ),
      });

    } finally {
      setSubmitting(false);
    }
  };


  // =========================================================
  // FILTRAGE
  // =========================================================

  const filteredDemandes =
    useMemo(
      () => {
        if (
          filter === "all"
        ) {
          return demandes;
        }


        const statusMap = {
          pending:
            "EN_ATTENTE",

          approved:
            "APPROUVE",

          rejected:
            "REFUSE",
        };


        return demandes.filter(
          (demande) =>
            demande.statut
            === statusMap[filter]
        );
      },
      [
        demandes,
        filter,
      ]
    );


  // =========================================================
  // STATS
  // =========================================================

  const stats =
    useMemo(
      () => {
        const pending =
          demandes.filter(
            (item) =>
              item.statut
              === "EN_ATTENTE"
          ).length;


        const approved =
          demandes.filter(
            (item) =>
              item.statut
              === "APPROUVE"
          ).length;


        const rejected =
          demandes.filter(
            (item) =>
              item.statut
              === "REFUSE"
          ).length;


        const currentYear =
          new Date().getFullYear();


        const plannedDays =
          plannings.filter(
            (planning) => {
              if (!planning.date) {
                return false;
              }

              const date =
                new Date(
                  `${planning.date}T12:00:00`
                );

              return (
                !Number.isNaN(
                  date.getTime()
                )
                &&
                date.getFullYear()
                === currentYear
              );
            }
          ).length;


        return {
          total:
            demandes.length,

          pending,

          approved,

          rejected,

          plannedDays,
        };
      },
      [
        demandes,
        plannings,
      ]
    );


  // =========================================================
  // ABSENCES À VENIR
  // =========================================================

  const upcomingAbsences =
    useMemo(
      () => {
        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );


        return plannings
          .filter(
            (planning) => {
              if (!planning.date) {
                return false;
              }

              const date =
                new Date(
                  `${planning.date}T12:00:00`
                );

              return (
                !Number.isNaN(
                  date.getTime()
                )
                &&
                date >= today
              );
            }
          )
          .sort(
            (a, b) =>
              new Date(a.date)
              - new Date(b.date)
          )
          .slice(
            0,
            5
          );
      },
      [plannings]
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
            Chargement de vos absences...
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

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="absences-heading">

        <div>

          <h1>
            Mes absences
          </h1>

          <p>
            Consultez vos demandes et effectuez
            une nouvelle demande d'absence.
          </p>

        </div>


        <div className="absences-heading-actions">

          <button
            type="button"
            className="absences-secondary-button"
            disabled={
              refreshing
            }
            onClick={() =>
              fetchData(true)
            }
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "absences-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="absences-primary-button"
            onClick={() => {
              setMessage({
                type: "",
                text: "",
              });

              setIsFormOpen(
                (current) =>
                  !current
              );
            }}
          >

            <Plus
              size={17}
            />

            {
              isFormOpen
                ? "Fermer"
                : "Nouvelle demande"
            }

          </button>

        </div>

      </section>


      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {
        message.text
        && (
          <div
            className={
              `absences-message ${
                message.type
                === "success"
                  ? "absences-message-success"
                  : "absences-message-error"
              }`
            }
          >
            {
              message.type
              === "success"
                ? (
                  <CheckCircle2
                    size={17}
                  />
                )
                : (
                  <XCircle
                    size={17}
                  />
                )
            }

            {message.text}
          </div>
        )
      }


      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="absences-summary-grid">

        <SummaryCard
          value={
            stats.total
          }
          label="Demandes"
          detail="Total"
          type="blue"
          icon={
            <FileText
              size={21}
            />
          }
        />


        <SummaryCard
          value={
            stats.pending
          }
          label="En attente"
          detail="Demandes en cours"
          type="orange"
          icon={
            <Clock3
              size={21}
            />
          }
        />


        <SummaryCard
          value={
            stats.approved
          }
          label="Validées"
          detail="Demandes approuvées"
          type="green"
          icon={
            <CheckCircle2
              size={21}
            />
          }
        />


        <SummaryCard
          value={
            stats.plannedDays
          }
          label="Jours d'absence"
          detail="Planifiés cette année"
          type="purple"
          icon={
            <CalendarDays
              size={21}
            />
          }
        />

      </section>


      {/* =====================================================
          FORMULAIRE
      ===================================================== */}

      {
        isFormOpen
        && (
          <section className="absences-form-card">

            <div className="absences-card-heading">

              <div>

                <h2>
                  Nouvelle demande d'absence
                </h2>

                <p>
                  Complétez les informations
                  avant l'envoi au service RH.
                </p>

              </div>


              <span className="absences-card-icon">

                <Plus
                  size={21}
                />

              </span>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="absences-form-grid">

                {/* TYPE */}

                <div className="absences-field">

                  <label htmlFor="type_absence">
                    Type d'absence
                  </label>

                  <select
                    id="type_absence"
                    name="type_absence"
                    value={
                      formData.type_absence
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    {
                      ABSENCE_TYPES.map(
                        (type) => (
                          <option
                            key={
                              type.value
                            }
                            value={
                              type.value
                            }
                          >
                            {type.label}
                          </option>
                        )
                      )
                    }

                  </select>

                </div>


                {/* DURÉE */}

                <div className="absences-field">

                  <label>
                    Durée calculée
                  </label>

                  <div className="absences-duration">
                    {
                      duration
                      || "À définir"
                    }
                  </div>

                </div>


                {/* DATE DEBUT */}

                <div className="absences-field">

                  <label htmlFor="date_debut">
                    Date de début
                  </label>

                  <input
                    id="date_debut"
                    name="date_debut"
                    type="date"
                    value={
                      formData.date_debut
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                {/* DATE FIN */}

                <div className="absences-field">

                  <label htmlFor="date_fin">
                    Date de fin
                  </label>

                  <input
                    id="date_fin"
                    name="date_fin"
                    type="date"
                    value={
                      formData.date_fin
                    }
                    min={
                      formData.date_debut
                      || undefined
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                {/* MOTIF */}

                <div className="absences-field absences-field-full">

                  <label htmlFor="motif">
                    Motif ou commentaire
                  </label>

                  <textarea
                    id="motif"
                    name="motif"
                    rows="4"
                    value={
                      formData.motif
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Précisez le motif de votre absence..."
                    required
                  />

                </div>


                {/* JUSTIFICATIF */}

                <div className="absences-field absences-field-full">

                  <label htmlFor="absence-document">
                    Justificatif
                  </label>

                  <input
                    id="absence-document"
                    name="document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      handleChange
                    }
                  />

                  <small>
                    Facultatif — PDF, JPG ou PNG,
                    5 Mo maximum.
                  </small>

                </div>

              </div>


              <div className="absences-form-actions">

                <button
                  type="button"
                  className="absences-secondary-button"
                  disabled={
                    submitting
                  }
                  onClick={() => {
                    setIsFormOpen(
                      false
                    );

                    setFormData(
                      EMPTY_FORM
                    );

                    setMessage({
                      type: "",
                      text: "",
                    });
                  }}
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  className="absences-primary-button"
                  disabled={
                    submitting
                  }
                >

                  {
                    submitting
                      ? (
                        <>
                          <Loader2
                            size={17}
                            className="absences-spin"
                          />

                          Envoi...
                        </>
                      )
                      : (
                        <>
                          <Send
                            size={17}
                          />

                          Envoyer la demande
                        </>
                      )
                  }

                </button>

              </div>

            </form>

          </section>
        )
      }


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="absences-content-grid">

        {/* ===================================================
            HISTORIQUE
        =================================================== */}

        <article className="absences-card">

          <div className="absences-card-heading">

            <div>

              <h2>
                Historique des demandes
              </h2>

              <p>
                Suivez l'état de vos demandes d'absence.
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
                Validées
              </option>

              <option value="pending">
                En attente
              </option>

              <option value="rejected">
                Refusées
              </option>
            </select>

          </div>


          <div className="absences-table-wrapper">

            <table className="absences-table">

              <thead>
                <tr>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Durée</th>
                  <th>Motif</th>
                  <th>Statut</th>
                </tr>
              </thead>


              <tbody>

                {
                  filteredDemandes.map(
                    (demande) => {
                      const details =
                        demande.details
                        || {};


                      return (
                        <tr
                          key={
                            demande.id
                          }
                        >

                          <td>
                            <strong>
                              {
                                getAbsenceTypeLabel(
                                  details.type_absence
                                )
                              }
                            </strong>
                          </td>


                          <td>

                            <span>
                              {
                                formatDate(
                                  details.date_debut
                                )
                              }
                            </span>

                            {
                              details.date_fin
                              && (
                                <small>
                                  au{" "}
                                  {
                                    formatDate(
                                      details.date_fin
                                    )
                                  }
                                </small>
                              )
                            }

                          </td>


                          <td>
                            {
                              calculateDuration(
                                details.date_debut,
                                details.date_fin
                              )
                              || "—"
                            }
                          </td>


                          <td>
                            {
                              details.motif
                              || "—"
                            }
                          </td>


                          <td>
                            <StatusBadge
                              status={
                                demande.statut
                              }
                            />
                          </td>

                        </tr>
                      );
                    }
                  )
                }

              </tbody>

            </table>


            {
              filteredDemandes.length
              === 0
              && (
                <div className="absences-empty">
                  Aucune demande ne correspond
                  à ce filtre.
                </div>
              )
            }

          </div>

        </article>


        {/* ===================================================
            ABSENCES PLANIFIÉES
        =================================================== */}

        <aside className="absences-card absences-calendar-card">

          <div className="absences-card-heading">

            <div>

              <h2>
                Prochaines absences
              </h2>

              <p>
                Journées déjà validées
                dans votre planning.
              </p>

            </div>

          </div>


          {
            upcomingAbsences.length > 0
              ? (
                <div className="absences-upcoming-list">

                  {
                    upcomingAbsences.map(
                      (
                        planning,
                        index
                      ) => (
                        <UpcomingAbsence
                          key={
                            planning.id
                          }
                          planning={
                            planning
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
                    )
                  }

                </div>
              )
              : (
                <div className="absences-empty">
                  Aucune absence à venir.
                </div>
              )
          }


          <div className="absences-information">

            <strong>
              Fonctionnement
            </strong>

            <p>
              Une demande apparaît dans le planning
              uniquement après validation par
              le service RH.
            </p>

          </div>

        </aside>

      </section>

    </div>
  );
}


// ===========================================================
// SUMMARY CARD
// ===========================================================

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


// ===========================================================
// STATUS
// ===========================================================

function StatusBadge({
  status,
}) {
  const config = {
    EN_ATTENTE: {
      label:
        "En attente",

      css:
        "pending",
    },

    APPROUVE: {
      label:
        "Validée",

      css:
        "approved",
    },

    REFUSE: {
      label:
        "Refusée",

      css:
        "rejected",
    },
  };


  const current =
    config[status]
    || {
      label:
        status || "—",

      css:
        "pending",
    };


  return (
    <span
      className={
        `absences-status absences-status-${current.css}`
      }
    >
      {current.label}
    </span>
  );
}


// ===========================================================
// PROCHAINE ABSENCE
// ===========================================================

function UpcomingAbsence({
  planning,
  type,
}) {
  const date =
    new Date(
      `${planning.date}T12:00:00`
    );


  const day =
    Number.isNaN(
      date.getTime()
    )
      ? "--"
      : date
          .getDate()
          .toString()
          .padStart(
            2,
            "0"
          );


  const month =
    Number.isNaN(
      date.getTime()
    )
      ? "---"
      : date
          .toLocaleDateString(
            "fr-FR",
            {
              month:
                "short",
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
            planning.commentaire
            || formatDate(
              planning.date
            )
          }
        </p>

      </div>

    </div>
  );
}


// ===========================================================
// TYPE ABSENCE
// ===========================================================

function getAbsenceTypeLabel(
  value
) {
  const labels = {
    CONGES_PAYES:
      "Congés payés",

    RTT:
      "RTT",

    MALADIE:
      "Maladie",

    SANS_SOLDE:
      "Congé sans solde",

    EVENEMENT_FAMILIAL:
      "Événement familial",

    AUTRE:
      "Autre",
  };


  return (
    labels[value]
    || "Absence"
  );
}


// ===========================================================
// DURÉE
// ===========================================================

function calculateDuration(
  startDate,
  endDate
) {
  if (
    !startDate
    || !endDate
  ) {
    return "";
  }


  const start =
    new Date(
      `${startDate}T12:00:00`
    );


  const end =
    new Date(
      `${endDate}T12:00:00`
    );


  if (
    Number.isNaN(
      start.getTime()
    )
    || Number.isNaN(
      end.getTime()
    )
    || end < start
  ) {
    return "";
  }


  const millisecondsPerDay =
    1000
    * 60
    * 60
    * 24;


  const numberOfDays =
    Math.floor(
      (
        end.getTime()
        - start.getTime()
      )
      / millisecondsPerDay
    )
    + 1;


  return (
    `${numberOfDays} jour${
      numberOfDays > 1
        ? "s"
        : ""
    }`
  );
}


// ===========================================================
// DATE
// ===========================================================

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }


  const date =
    new Date(
      `${value}T12:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
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


// ===========================================================
// API ERROR
// ===========================================================

function getApiError(
  error,
  fallback
) {
  const data =
    error.response?.data;


  if (
    typeof data
    === "string"
  ) {
    return data;
  }


  if (
    data?.detail
  ) {
    return data.detail;
  }


  if (
    data
    && typeof data
      === "object"
  ) {
    const message =
      extractNestedError(
        data
      );

    if (message) {
      return message;
    }
  }


  return fallback;
}


function extractNestedError(
  value
) {
  if (
    typeof value
    === "string"
  ) {
    return value;
  }


  if (
    Array.isArray(value)
  ) {
    for (
      const item
      of value
    ) {
      const result =
        extractNestedError(
          item
        );

      if (result) {
        return result;
      }
    }

    return "";
  }


  if (
    value
    && typeof value
      === "object"
  ) {
    for (
      const item
      of Object.values(
        value
      )
    ) {
      const result =
        extractNestedError(
          item
        );

      if (result) {
        return result;
      }
    }
  }


  return "";
}
