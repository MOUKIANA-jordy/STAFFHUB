import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";

import API from "../../../Services/api";

import "../../../Styles/paiement-hsup.css";


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


export default function PaiementHSup() {
  const [
    pointages,
    setPointages,
  ] = useState([]);

  const [
    selectedPointages,
    setSelectedPointages,
  ] = useState([]);

  const [
    demandes,
    setDemandes,
  ] = useState([]);

  const [
    commentaire,
    setCommentaire,
  ] = useState("");

  const [
    document,
    setDocument,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState({
    type: "",
    text: "",
  });


  // =========================================================
  // CHARGEMENT
  // =========================================================

  const fetchData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [
          pointagesResponse,
          demandesResponse,
        ] = await Promise.all([
          API.get(
            "/api/pointage/"
          ),

          API.get(
            "/api/demandes/",
            {
              params: {
                type_demande:
                  "HEURES_SUP",

                ordering:
                  "-date_demande",
              },
            }
          ),
        ]);


        const pointageResults =
          extractResults(
            pointagesResponse.data
          );


        // On affiche uniquement les pointages
        // contenant des heures supplémentaires.
        const avecHeuresSup =
          pointageResults.filter(
            (pointage) =>
              Number(
                pointage.heures_sup
                || 0
              ) > 0
          );


        setPointages(
          avecHeuresSup
        );


        setDemandes(
          extractResults(
            demandesResponse.data
          )
        );

      } catch (error) {
        console.error(
          "HEURES SUP GET ERROR",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger les heures supplémentaires.",
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
  // SÉLECTION POINTAGE
  // =========================================================

  const togglePointage = (
    pointageId
  ) => {
    setSelectedPointages(
      (current) => {
        if (
          current.includes(
            pointageId
          )
        ) {
          return current.filter(
            (id) =>
              id !== pointageId
          );
        }

        return [
          ...current,
          pointageId,
        ];
      }
    );
  };


  // =========================================================
  // TOTAL
  // =========================================================

  const totalHeures =
    useMemo(
      () => {
        return pointages
          .filter(
            (pointage) =>
              selectedPointages.includes(
                pointage.id
              )
          )
          .reduce(
            (
              total,
              pointage
            ) =>
              total
              + Number(
                  pointage.heures_sup
                  || 0
                ),
            0
          );
      },
      [
        pointages,
        selectedPointages,
      ]
    );


  // =========================================================
  // ENVOI
  // =========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setMessage({
      type: "",
      text: "",
    });


    if (
      selectedPointages.length
      === 0
    ) {
      setMessage({
        type: "error",
        text:
          "Sélectionnez au moins un pointage contenant des heures supplémentaires.",
      });

      return;
    }


    if (
      document
      && document.size
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
        commentaire:
          commentaire.trim(),

        total_heures_selectionnees:
          totalHeures.toFixed(2),
      };


      if (document) {
        const payload =
          new FormData();


        payload.append(
          "type_demande",
          "HEURES_SUP"
        );


        selectedPointages.forEach(
          (pointageId) => {
            payload.append(
              "pointages",
              pointageId
            );
          }
        );


        payload.append(
          "details",
          JSON.stringify(
            details
          )
        );


        payload.append(
          "document",
          document
        );


        await API.post(
          "/api/demandes/",
          payload
        );

      } else {
        await API.post(
          "/api/demandes/",
          {
            type_demande:
              "HEURES_SUP",

            pointages:
              selectedPointages,

            details,
          }
        );
      }


      setMessage({
        type: "success",
        text:
          "Votre demande a été envoyée.",
      });


      setSelectedPointages([]);
      setCommentaire("");
      setDocument(null);


      const fileInput =
        window.document
          .getElementById(
            "hsup-document"
          );

      if (fileInput) {
        fileInput.value = "";
      }


      await fetchData();

    } catch (error) {
      console.error(
        "HEURES SUP POST ERROR",
        error
      );


      setMessage({
        type: "error",
        text:
          getApiError(
            error,
            "Impossible d'envoyer votre demande."
          ),
      });

    } finally {
      setSubmitting(false);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="hsup-page">

        <div className="hsup-loading">

          <Loader2
            size={30}
            className="hsup-spin"
          />

          <span>
            Chargement des heures supplémentaires...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="hsup-page">

      {/* HEADER */}

      <section className="hsup-heading">

        <div>

          <span className="hsup-eyebrow">
            Demandes RH
          </span>

          <h1>
            Paiement des heures supplémentaires
          </h1>

          <p>
            Sélectionnez les pointages contenant
            les heures supplémentaires que vous
            souhaitez faire payer.
          </p>

        </div>


        <button
          type="button"
          className="hsup-secondary-button"
          onClick={() =>
            fetchData(
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
                ? "hsup-spin"
                : ""
            }
          />

          Actualiser

        </button>

      </section>


      {/* MESSAGE */}

      {
        message.text
        && (
          <div
            className={
              `hsup-message hsup-message-${message.type}`
            }
          >

            {
              message.type
              === "success"
              && (
                <CheckCircle2
                  size={18}
                />
              )
            }

            {message.text}

          </div>
        )
      }


      {/* STATS */}

      <section className="hsup-summary-grid">

        <SummaryCard
          icon={
            <Clock3 size={21} />
          }
          value={
            pointages.length
          }
          label="Pointages disponibles"
          type="blue"
        />


        <SummaryCard
          icon={
            <CheckCircle2 size={21} />
          }
          value={
            selectedPointages.length
          }
          label="Pointages sélectionnés"
          type="purple"
        />


        <SummaryCard
          icon={
            <Clock3 size={21} />
          }
          value={
            `${formatHours(
              totalHeures
            )} h`
          }
          label="Heures sélectionnées"
          type="green"
        />


        <SummaryCard
          icon={
            <FileText size={21} />
          }
          value={
            demandes.length
          }
          label="Demandes envoyées"
          type="orange"
        />

      </section>


      {/* FORMULAIRE */}

      <form
        className="hsup-card"
        onSubmit={
          handleSubmit
        }
      >

        <div className="hsup-card-heading">

          <div>

            <h2>
              Sélection des pointages
            </h2>

            <p>
              Seuls les pointages contenant
              des heures supplémentaires sont affichés.
            </p>

          </div>


          <span className="hsup-card-icon">
            <Clock3 size={21} />
          </span>

        </div>


        {
          pointages.length > 0
            ? (
              <div className="hsup-pointages-list">

                {
                  pointages.map(
                    (pointage) => {
                      const selected =
                        selectedPointages.includes(
                          pointage.id
                        );


                      return (
                        <label
                          key={
                            pointage.id
                          }
                          className={
                            `hsup-pointage-row ${
                              selected
                                ? "hsup-pointage-selected"
                                : ""
                            }`
                          }
                        >

                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              togglePointage(
                                pointage.id
                              )
                            }
                          />


                          <span className="hsup-checkbox" />


                          <div className="hsup-pointage-date">

                            <strong>
                              {
                                formatDate(
                                  pointage.date
                                )
                              }
                            </strong>

                            <span>
                              {
                                pointage.salarie_nom
                                || ""
                              }
                            </span>

                          </div>


                          <div className="hsup-pointage-hours">

                            <span>
                              Arrivée
                            </span>

                            <strong>
                              {
                                formatTime(
                                  pointage.heure_arrivee
                                )
                              }
                            </strong>

                          </div>


                          <div className="hsup-pointage-hours">

                            <span>
                              Départ
                            </span>

                            <strong>
                              {
                                formatTime(
                                  pointage.heure_depart
                                )
                              }
                            </strong>

                          </div>


                          <div className="hsup-pointage-hours">

                            <span>
                              Travaillées
                            </span>

                            <strong>
                              {
                                formatHours(
                                  pointage.heures_travaillees
                                )
                              } h
                            </strong>

                          </div>


                          <div className="hsup-pointage-overtime">

                            <span>
                              Heures sup.
                            </span>

                            <strong>
                              +
                              {
                                formatHours(
                                  pointage.heures_sup
                                )
                              } h
                            </strong>

                          </div>

                        </label>
                      );
                    }
                  )
                }

              </div>
            )
            : (
              <div className="hsup-empty">

                <Clock3
                  size={38}
                />

                <strong>
                  Aucune heure supplémentaire
                </strong>

                <span>
                  Aucun pointage contenant des heures
                  supplémentaires n'est disponible.
                </span>

              </div>
            )
        }


        {/* TOTAL */}

        {
          selectedPointages.length
          > 0
          && (
            <div className="hsup-total-box">

              <div>

                <span>
                  Total sélectionné
                </span>

                <strong>
                  {
                    formatHours(
                      totalHeures
                    )
                  } heures
                </strong>

              </div>


              <span>
                {
                  selectedPointages.length
                } pointage
                {
                  selectedPointages.length > 1
                    ? "s"
                    : ""
                }
              </span>

            </div>
          )
        }


        {/* COMMENTAIRE */}

        <div className="hsup-field">

          <label htmlFor="hsup-commentaire">
            Commentaire
          </label>

          <textarea
            id="hsup-commentaire"
            rows="4"
            value={
              commentaire
            }
            onChange={
              (event) =>
                setCommentaire(
                  event.target.value
                )
            }
            placeholder="Ajoutez éventuellement une précision concernant les heures effectuées..."
          />

        </div>


        {/* DOCUMENT */}

        <div className="hsup-field">

          <label htmlFor="hsup-document">
            Justificatif
          </label>

          <input
            id="hsup-document"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={
              (event) =>
                setDocument(
                  event.target.files?.[0]
                  || null
                )
            }
          />

          <small>
            Facultatif — PDF, JPG ou PNG.
          </small>

        </div>


        {/* INFO */}

        <div className="hsup-information">

          <Clock3
            size={18}
          />

          <div>

            <strong>
              Calcul basé sur les pointages
            </strong>

            <p>
              Le nombre d'heures supplémentaires
              n'est pas saisi manuellement.
              StaffHub utilise directement les heures
              supplémentaires enregistrées dans
              vos pointages.
            </p>

          </div>

        </div>


        {/* SUBMIT */}

        <div className="hsup-actions">

          <button
            type="submit"
            className="hsup-primary-button"
            disabled={
              submitting
              || selectedPointages.length
                === 0
            }
          >

            {
              submitting
                ? (
                  <>
                    <Loader2
                      size={17}
                      className="hsup-spin"
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


      {/* HISTORIQUE */}

      <section className="hsup-card">

        <div className="hsup-card-heading">

          <div>

            <h2>
              Historique
            </h2>

            <p>
              Vos demandes de paiement
              d'heures supplémentaires.
            </p>

          </div>

        </div>


        {
          demandes.length > 0
            ? (
              <div className="hsup-table-wrapper">

                <table className="hsup-table">

                  <thead>

                    <tr>
                      <th>Date</th>
                      <th>Pointages</th>
                      <th>Heures</th>
                      <th>Statut</th>
                    </tr>

                  </thead>


                  <tbody>

                    {
                      demandes.map(
                        (demande) => (
                          <tr
                            key={
                              demande.id
                            }
                          >

                            <td>
                              {
                                formatDateTime(
                                  demande.date_demande
                                )
                              }
                            </td>


                            <td>
                              {
                                Array.isArray(
                                  demande.pointages
                                )
                                  ? demande.pointages.length
                                  : "—"
                              }
                            </td>


                            <td>
                              {
                                demande.total_heures_sup
                                !== undefined
                                  ? `${
                                      formatHours(
                                        demande.total_heures_sup
                                      )
                                    } h`
                                  : (
                                      demande.details
                                        ?.total_heures_selectionnees
                                        ? `${
                                            formatHours(
                                              demande.details
                                                .total_heures_selectionnees
                                            )
                                          } h`
                                        : "—"
                                    )
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
                        )
                      )
                    }

                  </tbody>

                </table>

              </div>
            )
            : (
              <div className="hsup-empty">

                <FileText size={38} />

                <strong>
                  Aucune demande
                </strong>

                <span>
                  Vous n'avez encore envoyé
                  aucune demande.
                </span>

              </div>
            )
        }

      </section>

    </div>
  );
}


function SummaryCard({
  icon,
  value,
  label,
  type,
}) {
  return (
    <article className="hsup-summary-card">

      <span
        className={
          `hsup-summary-icon hsup-summary-icon-${type}`
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


function StatusBadge({
  status,
}) {
  const config = {
    EN_ATTENTE: {
      label: "En attente",
      css: "pending",
    },

    APPROUVE: {
      label: "Approuvée",
      css: "approved",
    },

    REFUSE: {
      label: "Refusée",
      css: "rejected",
    },
  };


  const current =
    config[status]
    || {
      label:
        status || "—",

      css: "pending",
    };


  return (
    <span
      className={
        `hsup-status hsup-status-${current.css}`
      }
    >
      {current.label}
    </span>
  );
}


function formatHours(
  value
) {
  const number =
    Number(value || 0);

  if (
    Number.isNaN(number)
  ) {
    return "0";
  }

  return number
    .toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits:
          number % 1 === 0
            ? 0
            : 1,

        maximumFractionDigits: 2,
      }
    );
}


function formatTime(
  value
) {
  if (!value) {
    return "—";
  }

  return String(value)
    .slice(0, 5);
}


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


function formatDateTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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


function getApiError(
  error,
  fallback
) {
  const data =
    error.response?.data;

  if (
    typeof data === "string"
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
    return extractNestedError(
      data
    ) || fallback;
  }

  return fallback;
}


function extractNestedError(
  value
) {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    Array.isArray(value)
  ) {
    for (
      const child
      of value
    ) {
      const message =
        extractNestedError(
          child
        );

      if (message) {
        return message;
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
      const child
      of Object.values(value)
    ) {
      const message =
        extractNestedError(
          child
        );

      if (message) {
        return message;
      }
    }
  }

  return "";
}
