import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import "../Styles/demandes.css";
import API from "../Services/api";


export default function RequestFormPage({
  title,
  requestType,
  description,
  icon,
  accent = "blue",
  fields = [],
  information = [],
  endpoint = "/api/demandes/",
  submitLabel = "Envoyer la demande",
}) {

  // =========================================================
  // VALEURS INITIALES
  // =========================================================

  const initialValues = useMemo(() => {
    return fields.reduce(
      (values, field) => {
        values[field.name] =
          field.defaultValue ?? "";

        return values;
      },
      {}
    );
  }, [fields]);


  // =========================================================
  // STATES
  // =========================================================

  const [
    formData,
    setFormData,
  ] = useState(initialValues);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    messageType,
    setMessageType,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    loadingHistory,
    setLoadingHistory,
  ] = useState(true);


  // =========================================================
  // RESET SI LES CHAMPS CHANGENT
  // =========================================================

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);


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
  // CHARGER L'HISTORIQUE RÉEL
  // =========================================================

  const fetchHistory = useCallback(
    async () => {

      if (
        !endpoint
        || !requestType
      ) {
        setHistory([]);
        setLoadingHistory(false);
        return;
      }

      try {
        setLoadingHistory(true);

        const response = await API.get(
          endpoint,
          {
            params: {
              type_demande:
                requestType,

              ordering:
                "-date_demande",
            },
          }
        );

        setHistory(
          extractResults(
            response.data
          )
        );

      } catch (error) {
        console.error(
          "HISTORY ERROR",
          error
        );

        setHistory([]);

      } finally {
        setLoadingHistory(false);
      }

    },
    [
      endpoint,
      requestType,
    ]
  );


  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  // =========================================================
  // CHANGEMENT CHAMP
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
      (currentData) => ({
        ...currentData,

        [name]:
          files
            ? files[0] || null
            : value,
      })
    );

  };


  // =========================================================
  // CONVERSION CAMELCASE → SNAKE_CASE
  // =========================================================

  const toSnakeCase = (
    value
  ) => {
    return value
      .replace(
        /([a-z0-9])([A-Z])/g,
        "$1_$2"
      )
      .replace(
        /-/g,
        "_"
      )
      .toLowerCase();
  };


  // =========================================================
  // CONSTRUIRE LE PAYLOAD DJANGO
  // =========================================================

  const buildPayload = () => {

    const details = {};

    let montantSouhaite = null;
    let document = null;
    let pointages = [];


    fields.forEach(
      (field) => {

        // champ masqué = ne pas envoyer
        if (
          typeof field.hidden === "function"
          && field.hidden(formData)
        ) {
          return;
        }

        const value =
          formData[field.name];


        if (
          value === ""
          || value === null
          || value === undefined
        ) {
          return;
        }


        // -----------------------------------------------------
        // MONTANT
        // -----------------------------------------------------

        if (
          field.apiField
            === "montant_souhaite"
          || field.name === "amount"
          || field.name
            === "montant_souhaite"
        ) {

          montantSouhaite = value;

          return;
        }


        // -----------------------------------------------------
        // DOCUMENT
        // -----------------------------------------------------

        if (
          field.apiField
            === "document"
          || field.name === "document"
        ) {

          document = value;

          return;
        }


        // -----------------------------------------------------
        // POINTAGES
        // -----------------------------------------------------

        if (
          field.apiField
            === "pointages"
          || field.name === "pointages"
        ) {

          if (Array.isArray(value)) {
            pointages = value;
          } else {
            pointages = [value];
          }

          return;
        }


        // -----------------------------------------------------
        // DETAILS
        // -----------------------------------------------------

        const detailKey =
          field.detailKey
          || field.apiField
          || toSnakeCase(
            field.name
          );


        details[
          detailKey
        ] = value;

      }
    );


    const payload = {
      type_demande:
        requestType,

      details,
    };


    if (
      montantSouhaite !== null
    ) {
      payload.montant_souhaite =
        montantSouhaite;
    }


    if (
      pointages.length > 0
    ) {
      payload.pointages =
        pointages;
    }


    if (document) {
      payload.document =
        document;
    }


    return payload;
  };


  // =========================================================
  // EXTRAIRE LES ERREURS DRF
  // =========================================================

  const getApiErrorMessage = (
    data
  ) => {

    if (!data) {
      return (
        "Une erreur est survenue pendant l’envoi."
      );
    }


    if (
      typeof data === "string"
    ) {
      return data;
    }


    if (
      data.detail
    ) {
      return data.detail;
    }


    const extractMessage = (
      value
    ) => {

      if (
        typeof value === "string"
      ) {
        return value;
      }


      if (
        Array.isArray(value)
      ) {

        if (
          value.length === 0
        ) {
          return null;
        }

        return extractMessage(
          value[0]
        );

      }


      if (
        value
        && typeof value
          === "object"
      ) {

        for (
          const nestedValue
          of Object.values(value)
        ) {

          const result =
            extractMessage(
              nestedValue
            );

          if (result) {
            return result;
          }

        }

      }


      return null;
    };


    for (
      const value
      of Object.values(data)
    ) {

      const result =
        extractMessage(
          value
        );

      if (result) {
        return result;
      }

    }


    return (
      "La demande contient des informations invalides."
    );
  };


  // =========================================================
  // ENVOI
  // =========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setMessage("");
    setMessageType("");
    setIsSubmitting(true);


    try {

      if (!endpoint) {
        throw new Error(
          "Aucun endpoint API n’a été défini pour cette demande."
        );
      }


      if (!requestType) {
        throw new Error(
          "Aucun type de demande n’a été défini."
        );
      }


      const payload =
        buildPayload();


      // -----------------------------------------------------
      // FICHIER ?
      // -----------------------------------------------------

      const hasFile =
        payload.document
        instanceof File;


      let requestPayload;


      if (hasFile) {

        requestPayload =
          new FormData();


        requestPayload.append(
          "type_demande",
          payload.type_demande
        );


        if (
          payload.montant_souhaite
          !== undefined
        ) {

          requestPayload.append(
            "montant_souhaite",
            payload.montant_souhaite
          );

        }


        requestPayload.append(
          "details",
          JSON.stringify(
            payload.details || {}
          )
        );


        if (
          Array.isArray(
            payload.pointages
          )
        ) {

          payload.pointages.forEach(
            (pointageId) => {

              requestPayload.append(
                "pointages",
                pointageId
              );

            }
          );

        }


        requestPayload.append(
          "document",
          payload.document
        );

      } else {

        requestPayload = {
          type_demande:
            payload.type_demande,

          details:
            payload.details || {},
        };


        if (
          payload.montant_souhaite
          !== undefined
        ) {
          requestPayload.montant_souhaite =
            payload.montant_souhaite;
        }


        if (
          Array.isArray(
            payload.pointages
          )
          && payload.pointages.length > 0
        ) {
          requestPayload.pointages =
            payload.pointages;
        }

      }


      console.log(
        "DEMANDE PAYLOAD :",
        hasFile
          ? "FormData"
          : requestPayload
      );


      await API.post(
        endpoint,
        requestPayload
      );


      setMessage(
        "Votre demande a bien été envoyée."
      );

      setMessageType(
        "success"
      );


      setFormData(
        initialValues
      );


      await fetchHistory();

    } catch (error) {

      console.error(
        "Erreur pendant l’envoi :",
        error
      );


      const apiErrors =
        error.response?.data;


      setMessage(
        apiErrors
          ? getApiErrorMessage(
              apiErrors
            )
          : (
              error.message
              || "Une erreur est survenue pendant l’envoi."
            )
      );


      setMessageType(
        "error"
      );

    } finally {

      setIsSubmitting(
        false
      );

    }

  };


  // =========================================================
  // FORMAT DATE HISTORIQUE
  // =========================================================

  const formatHistoryDate = (
    value
  ) => {

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
      return "—";
    }


    return date.toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  };


  // =========================================================
  // DÉTAIL HISTORIQUE
  // =========================================================

  const getHistoryDetail = (
    item
  ) => {

    // montant
    if (
      item.montant_souhaite
      !== null
      && item.montant_souhaite
      !== undefined
    ) {

      const amount =
        Number(
          item.montant_souhaite
        );


      if (
        !Number.isNaN(
          amount
        )
      ) {

        return (
          `${amount.toLocaleString(
            "fr-FR",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )} €`
        );

      }

    }


    const details =
      item.details || {};


    // -------------------------------------------------------
    // CALENDRIER
    // -------------------------------------------------------

    if (
      item.type_demande
      === "CALENDRIER"
    ) {

      const parts = [];


      if (details.date) {

        const date =
          new Date(
            `${details.date}T12:00:00`
          );


        if (
          !Number.isNaN(
            date.getTime()
          )
        ) {

          parts.push(
            date.toLocaleDateString(
              "fr-FR"
            )
          );

        }

      }


      const typeLabels = {
        BUREAU: "Bureau",
        TELETRAVAIL: "Télétravail",
        CONGE: "Congé",
        ABSENCE: "Absence",
        VACATION: "Vacation",
        FORMATION: "Formation",
      };


      if (
        details.type_journee
      ) {

        parts.push(
          typeLabels[
            details.type_journee
          ]
          || details.type_journee
        );

      }


      if (
        details.heure_debut
        && details.heure_fin
      ) {

        parts.push(
          `${details.heure_debut} - ${details.heure_fin}`
        );

      }


      if (
        details.motif
      ) {

        parts.push(
          details.motif
        );

      }


      return (
        parts.length > 0
          ? parts.join(" • ")
          : "—"
      );

    }


    // -------------------------------------------------------
    // AUTRES DEMANDES
    // -------------------------------------------------------

    if (
      details.commentaire
    ) {
      return details.commentaire;
    }


    if (
      details.reason
    ) {
      return details.reason;
    }


    if (
      details.motif
    ) {
      return details.motif;
    }


    if (
      details.date
    ) {
      return details.date;
    }


    return "—";

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="request-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="request-heading">

        <div>

          <h1>
            {
              title
              || `Demande ${
                requestType || ""
              }`
            }
          </h1>

          <p>
            {description}
          </p>

        </div>


        <div
          className={
            `request-heading-icon request-accent-${accent}`
          }
        >

          {icon}

        </div>

      </section>


      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message && (

        <div
          className={
            `request-message ${
              messageType === "success"
                ? "request-message-success"
                : "request-message-error"
            }`
          }
        >

          {message}

        </div>

      )}


      {/* ===================================================
          LAYOUT
      =================================================== */}

      <section className="request-layout">


        {/* =================================================
            FORMULAIRE
        ================================================= */}

        <main className="request-card">


          <div className="request-card-heading">

            <div>

              <h2>
                Nouvelle demande
              </h2>

              <p>
                Complétez les informations ci-dessous.
              </p>

            </div>


            <span
              className={
                `request-small-icon request-accent-${accent}`
              }
            >

              {icon}

            </span>

          </div>


          <form
            onSubmit={handleSubmit}
          >

            <div className="request-form-grid">


              {fields.map(
                (field) => (

                  <RequestField
                    key={field.name}
                    field={field}
                    value={
                      formData[
                        field.name
                      ]
                    }
                    onChange={
                      handleChange
                    }
                    formData={
                      formData
                    }
                  />

                )
              )}


            </div>


            <div className="request-actions">


              <button
                type="button"
                className="request-secondary-button"
                disabled={isSubmitting}
                onClick={() => {

                  setFormData(
                    initialValues
                  );

                  setMessage("");
                  setMessageType("");

                }}
              >

                Réinitialiser

              </button>


              <button
                type="submit"
                className="request-primary-button"
                disabled={isSubmitting}
              >

                {
                  isSubmitting
                    ? "Envoi..."
                    : submitLabel
                }

              </button>


            </div>

          </form>

        </main>


        {/* =================================================
            INFORMATIONS
        ================================================= */}

        <aside className="request-sidebar-card">


          <div className="request-card-heading">

            <div>

              <h2>
                Informations
              </h2>

              <p>
                À savoir avant l’envoi.
              </p>

            </div>

          </div>


          <div className="request-information-list">


            {information.map(
              (
                item,
                index
              ) => (

                <div
                  key={
                    `${item.title}-${index}`
                  }
                >

                  <span>
                    {index + 1}
                  </span>


                  <div>

                    <strong>
                      {item.title}
                    </strong>

                    <p>
                      {item.text}
                    </p>

                  </div>

                </div>

              )
            )}


          </div>

        </aside>


      </section>


      {/* ===================================================
          HISTORIQUE RÉEL
      =================================================== */}

      <section className="request-history-card">


        <div className="request-card-heading">

          <div>

            <h2>
              Historique
            </h2>

            <p>
              Vos dernières demandes.
            </p>

          </div>

        </div>


        {loadingHistory ? (

          <div className="request-empty">
            Chargement de l'historique...
          </div>

        ) : history.length > 0 ? (

          <div className="request-table-wrapper">


            <table className="request-table">


              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Demande
                  </th>

                  <th>
                    Détail
                  </th>

                  <th>
                    Statut
                  </th>

                </tr>

              </thead>


              <tbody>


                {history.map(
                  (item) => (

                    <tr
                      key={item.id}
                    >

                      <td>

                        {formatHistoryDate(
                          item.date_demande
                        )}

                      </td>


                      <td>

                        {
                          item.type_demande_display
                          || item.type_demande
                        }

                      </td>


                      <td>

                        {getHistoryDetail(
                          item
                        )}

                      </td>


                      <td>

                        <StatusBadge
                          status={
                            item.statut
                          }
                        />

                      </td>


                    </tr>

                  )
                )}


              </tbody>


            </table>

          </div>

        ) : (

          <div className="request-empty">
            Aucune demande enregistrée.
          </div>

        )}


      </section>


    </div>
  );
}


// ===========================================================
// CHAMP
// ===========================================================

function RequestField({
  field,
  value,
  onChange,
  formData,
}) {

  // champ conditionnel
  if (
    typeof field.hidden
    === "function"
    && field.hidden(
      formData
    )
  ) {
    return null;
  }


  const isRequired =
    typeof field.required
    === "function"
      ? field.required(
          formData
        )
      : Boolean(
          field.required
        );


  const commonProps = {
    id:
      field.name,

    name:
      field.name,

    value:
      value ?? "",

    onChange,

    required:
      isRequired,

    disabled:
      field.disabled,
  };


  return (
    <div
      className={
        `request-field ${
          field.fullWidth
            ? "request-field-full"
            : ""
        }`
      }
    >


      <label
        htmlFor={field.name}
      >

        {field.label}

        {isRequired && (
          <span>
            {" "}*
          </span>
        )}

      </label>


      {field.type === "select" && (

        <select
          {...commonProps}
        >

          <option value="">
            Sélectionner
          </option>


          {field.options?.map(
            (option) => {

              const optionValue =
                typeof option
                === "string"
                  ? option
                  : option.value;


              const optionLabel =
                typeof option
                === "string"
                  ? option
                  : option.label;


              return (

                <option
                  key={optionValue}
                  value={optionValue}
                >
                  {optionLabel}
                </option>

              );

            }
          )}

        </select>

      )}


      {field.type === "textarea" && (

        <textarea
          {...commonProps}
          rows={
            field.rows
            || 4
          }
          placeholder={
            field.placeholder
          }
        />

      )}


      {field.type === "file" && (

        <input
          id={field.name}
          name={field.name}
          type="file"
          accept={
            field.accept
          }
          onChange={
            onChange
          }
          required={
            isRequired
          }
          disabled={
            field.disabled
          }
        />

      )}


      {![
        "select",
        "textarea",
        "file",
      ].includes(
        field.type
      ) && (

        <input
          {...commonProps}
          type={
            field.type
            || "text"
          }
          min={
            field.min
          }
          max={
            field.max
          }
          step={
            field.step
          }
          placeholder={
            field.placeholder
          }
        />

      )}


      {field.help && (

        <small>
          {field.help}
        </small>

      )}


    </div>
  );
}


// ===========================================================
// STATUT
// ===========================================================

function StatusBadge({
  status,
}) {

  const labels = {
    EN_ATTENTE:
      "En attente",

    APPROUVE:
      "Approuvée",

    REFUSE:
      "Refusée",
  };


  const cssClasses = {
    EN_ATTENTE:
      "pending",

    APPROUVE:
      "approved",

    REFUSE:
      "rejected",
  };


  return (
    <span
      className={
        `request-status request-status-${
          cssClasses[status]
          || "pending"
        }`
      }
    >

      {
        labels[status]
        || status
        || "—"
      }

    </span>
  );
}
