import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Download,
  File,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import API from "../../../Services/api";

import "../../../Styles/documents.css";


// =========================================================
// TYPES DOCUMENTS BACKEND
// =========================================================

const DOCUMENT_TYPES = [
  {
    value: "CNI",
    label: "Carte nationale d’identité",
  },
  {
    value: "PASSEPORT",
    label: "Passeport",
  },
  {
    value: "CONTRAT",
    label: "Contrat",
  },
  {
    value: "DIPLOME",
    label: "Diplôme",
  },
  {
    value: "PERMIS",
    label: "Permis",
  },
  {
    value: "RIB",
    label: "RIB",
  },
  {
    value: "JUSTIFICATIF_DOMICILE",
    label: "Justificatif de domicile",
  },
  {
    value: "CERTIFICAT_MEDICAL",
    label: "Certificat médical",
  },
  {
    value: "AUTRE",
    label: "Autre",
  },
];


// =========================================================
// DRF
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
// DEFAULT FORM
// =========================================================

const DEFAULT_FORM = {
  type_document: "",
  titre: "",
  numero: "",
  date_emission: "",
  date_expiration: "",
  description: "",
  fichier: null,
};


// =========================================================
// PAGE
// =========================================================

export default function DocumentsOfficiels() {

  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [
    formData,
    setFormData,
  ] = useState(DEFAULT_FORM);

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
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    filter,
    setFilter,
  ] = useState("all");

  const [
    message,
    setMessage,
  ] = useState({
    type: "",
    text: "",
  });


  // =========================================================
  // API GET
  // =========================================================

  const fetchDocuments = useCallback(
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

        const response =
          await API.get(
            "/api/documents/"
          );

        setDocuments(
          extractResults(
            response.data
          )
        );

      } catch (error) {

        console.error(
          "DOCUMENTS ERROR",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger vos documents.",
        });

        setDocuments([]);

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    []
  );


  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);


  // =========================================================
  // CHANGE
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
  // SUBMIT
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
      !formData.type_document
    ) {

      setMessage({
        type: "error",
        text:
          "Veuillez sélectionner un type de document.",
      });

      return;

    }


    if (
      !formData.fichier
    ) {

      setMessage({
        type: "error",
        text:
          "Veuillez sélectionner un fichier.",
      });

      return;

    }


    setSubmitting(true);


    try {

      const payload =
        new FormData();


      payload.append(
        "type_document",
        formData.type_document
      );


      payload.append(
        "fichier",
        formData.fichier
      );


      if (
        formData.titre
      ) {

        payload.append(
          "titre",
          formData.titre
        );

      }


      if (
        formData.numero
      ) {

        payload.append(
          "numero",
          formData.numero
        );

      }


      if (
        formData.date_emission
      ) {

        payload.append(
          "date_emission",
          formData.date_emission
        );

      }


      if (
        formData.date_expiration
      ) {

        payload.append(
          "date_expiration",
          formData.date_expiration
        );

      }


      if (
        formData.description
      ) {

        payload.append(
          "description",
          formData.description
        );

      }


      await API.post(
        "/api/documents/",
        payload,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );


      setMessage({
        type: "success",
        text:
          "Le document a bien été ajouté.",
      });


      setFormData(
        DEFAULT_FORM
      );


      setFormOpen(
        false
      );


      await fetchDocuments();


    } catch (error) {

      console.error(
        "DOCUMENT UPLOAD ERROR",
        error
      );


      const data =
        error.response?.data;


      let errorMessage =
        "Impossible d'ajouter le document.";


      if (
        typeof data === "string"
      ) {

        errorMessage =
          data;

      } else if (
        data?.detail
      ) {

        errorMessage =
          data.detail;

      } else if (
        data
        && typeof data
          === "object"
      ) {

        const firstError =
          Object.values(
            data
          )[0];


        if (
          Array.isArray(
            firstError
          )
        ) {

          errorMessage =
            firstError[0];

        } else if (
          firstError
        ) {

          errorMessage =
            String(
              firstError
            );

        }

      }


      setMessage({
        type: "error",
        text:
          errorMessage,
      });


    } finally {

      setSubmitting(
        false
      );

    }

  };


  // =========================================================
  // FILTER
  // =========================================================

  const filteredDocuments =
    useMemo(
      () => {

        if (
          filter === "all"
        ) {

          return documents;

        }


        if (
          filter === "active"
        ) {

          return documents.filter(
            (document) =>
              !document.archive
              && !document.est_expire
          );

        }


        if (
          filter === "expired"
        ) {

          return documents.filter(
            (document) =>
              document.est_expire
          );

        }


        if (
          filter === "archived"
        ) {

          return documents.filter(
            (document) =>
              document.archive
          );

        }


        return documents.filter(
          (document) =>
            document.type_document
            === filter
        );

      },
      [
        documents,
        filter,
      ]
    );


  // =========================================================
  // STATS
  // =========================================================

  const activeCount =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            !document.archive
            && !document.est_expire
        ).length,
      [documents]
    );


  const expiredCount =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            document.est_expire
        ).length,
      [documents]
    );


  const archivedCount =
    useMemo(
      () =>
        documents.filter(
          (document) =>
            document.archive
        ).length,
      [documents]
    );


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="documents-page">

        <div className="documents-loading">

          <Loader2
            size={30}
            className="documents-spin"
          />

          <span>
            Chargement des documents...
          </span>

        </div>

      </div>
    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="documents-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="documents-heading">

        <div>

          <span className="documents-eyebrow">
            Dossier salarié
          </span>

          <h1>
            Mes documents
          </h1>

          <p>
            Consultez et gérez vos documents
            administratifs en toute sécurité.
          </p>

        </div>


        <div className="documents-heading-actions">


          <button
            type="button"
            className="documents-secondary-button"
            onClick={() =>
              fetchDocuments(
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
                  ? "documents-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="documents-primary-button"
            onClick={() => {

              setMessage({
                type: "",
                text: "",
              });

              setFormOpen(
                (current) =>
                  !current
              );

            }}
          >

            {
              formOpen
                ? (
                  <>
                    <X size={17} />
                    Fermer
                  </>
                )
                : (
                  <>
                    <Plus size={17} />
                    Ajouter un document
                  </>
                )
            }

          </button>

        </div>

      </section>


      {/* ===================================================
          MESSAGE
      =================================================== */}

      {
        message.text
        && (

          <div
            className={
              `documents-message documents-message-${message.type}`
            }
          >

            {
              message.type
                === "success"
                ? (
                  <CheckCircle2
                    size={18}
                  />
                )
                : null
            }

            {
              message.text
            }

          </div>

        )
      }


      {/* ===================================================
          STATS
      =================================================== */}

      <section className="documents-summary-grid">


        <SummaryCard
          icon={
            <FileText
              size={22}
            />
          }
          value={
            documents.length
          }
          label="Documents"
          detail="Total enregistré"
          type="blue"
        />


        <SummaryCard
          icon={
            <ShieldCheck
              size={22}
            />
          }
          value={
            activeCount
          }
          label="Documents actifs"
          detail="Valides et non archivés"
          type="green"
        />


        <SummaryCard
          icon={
            <CalendarDays
              size={22}
            />
          }
          value={
            expiredCount
          }
          label="Expirés"
          detail="À renouveler"
          type="orange"
        />


        <SummaryCard
          icon={
            <Archive
              size={22}
            />
          }
          value={
            archivedCount
          }
          label="Archivés"
          detail="Documents archivés"
          type="purple"
        />

      </section>


      {/* ===================================================
          FORM
      =================================================== */}

      {
        formOpen
        && (

          <section className="documents-form-card">


            <div className="documents-card-heading">

              <div>

                <h2>
                  Ajouter un document
                </h2>

                <p>
                  Formats autorisés :
                  PDF, JPG, PNG, DOC et DOCX.
                  Taille maximale : 10 Mo.
                </p>

              </div>


              <span className="documents-card-icon">

                <Upload
                  size={21}
                />

              </span>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
            >


              <div className="documents-form-grid">


                {/* TYPE */}

                <div className="documents-field">

                  <label htmlFor="type_document">
                    Type de document *
                  </label>

                  <select
                    id="type_document"
                    name="type_document"
                    value={
                      formData.type_document
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Sélectionner
                    </option>

                    {
                      DOCUMENT_TYPES.map(
                        (type) => (

                          <option
                            value={
                              type.value
                            }
                            key={
                              type.value
                            }
                          >
                            {
                              type.label
                            }
                          </option>

                        )
                      )
                    }

                  </select>

                </div>


                {/* TITRE */}

                <div className="documents-field">

                  <label htmlFor="titre">
                    Titre
                  </label>

                  <input
                    id="titre"
                    name="titre"
                    type="text"
                    value={
                      formData.titre
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Exemple : Passeport 2026"
                  />

                </div>


                {/* NUMERO */}

                <div className="documents-field">

                  <label htmlFor="numero">
                    Numéro du document
                  </label>

                  <input
                    id="numero"
                    name="numero"
                    type="text"
                    value={
                      formData.numero
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Numéro"
                  />

                </div>


                {/* DATE EMISSION */}

                <div className="documents-field">

                  <label htmlFor="date_emission">
                    Date d'émission
                  </label>

                  <input
                    id="date_emission"
                    name="date_emission"
                    type="date"
                    value={
                      formData.date_emission
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* DATE EXPIRATION */}

                <div className="documents-field">

                  <label htmlFor="date_expiration">
                    Date d'expiration
                  </label>

                  <input
                    id="date_expiration"
                    name="date_expiration"
                    type="date"
                    value={
                      formData.date_expiration
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                {/* FILE */}

                <div className="documents-field">

                  <label htmlFor="fichier">
                    Fichier *
                  </label>

                  <input
                    id="fichier"
                    name="fichier"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                {/* DESCRIPTION */}

                <div className="documents-field documents-field-full">

                  <label htmlFor="description">
                    Description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ajoutez éventuellement une précision..."
                  />

                </div>

              </div>


              {/* ACTIONS */}

              <div className="documents-form-actions">

                <button
                  type="button"
                  className="documents-secondary-button"
                  onClick={() => {

                    setFormData(
                      DEFAULT_FORM
                    );

                    setFormOpen(
                      false
                    );

                  }}
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  className="documents-primary-button"
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
                            className="documents-spin"
                          />

                          Envoi...
                        </>
                      )
                      : (
                        <>
                          <Upload
                            size={17}
                          />

                          Ajouter le document
                        </>
                      )
                  }

                </button>

              </div>

            </form>

          </section>

        )
      }


      {/* ===================================================
          LIST
      =================================================== */}

      <section className="documents-card">


        <div className="documents-card-heading">

          <div>

            <h2>
              Documents enregistrés
            </h2>

            <p>
              Tous les documents de votre dossier.
            </p>

          </div>


          <select
            className="documents-filter"
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
              Tous
            </option>

            <option value="active">
              Actifs
            </option>

            <option value="expired">
              Expirés
            </option>

            <option value="archived">
              Archivés
            </option>

            <option value="PASSEPORT">
              Passeports
            </option>

            <option value="CNI">
              Cartes d'identité
            </option>

            <option value="CONTRAT">
              Contrats
            </option>

            <option value="DIPLOME">
              Diplômes
            </option>

            <option value="RIB">
              RIB
            </option>

          </select>

        </div>


        {
          filteredDocuments.length > 0
            ? (

              <div className="documents-grid">

                {
                  filteredDocuments.map(
                    (document) => (

                      <DocumentCard
                        key={
                          document.id
                        }
                        document={
                          document
                        }
                      />

                    )
                  )
                }

              </div>

            )
            : (

              <div className="documents-empty">

                <File
                  size={38}
                />

                <strong>
                  Aucun document
                </strong>

                <span>
                  Aucun document ne correspond
                  au filtre sélectionné.
                </span>

              </div>

            )
        }

      </section>

    </div>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  icon,
  value,
  label,
  detail,
  type,
}) {

  return (
    <article className="documents-summary-card">

      <span
        className={
          `documents-summary-icon documents-summary-icon-${type}`
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
// DOCUMENT CARD
// =========================================================

function DocumentCard({
  document,
}) {

  const status =
    document.archive
      ? "archived"
      : document.est_expire
        ? "expired"
        : "active";


  const statusLabels = {
    active: "Actif",
    expired: "Expiré",
    archived: "Archivé",
  };


  return (
    <article className="document-card">


      <div className="document-card-top">


        <div className="document-file-icon">

          <FileText
            size={22}
          />

        </div>


        <span
          className={
            `document-status document-status-${status}`
          }
        >
          {
            statusLabels[
              status
            ]
          }
        </span>

      </div>


      <div className="document-card-content">


        <h3>
          {
            document.titre
            || document.type_document_display
            || document.type_document
          }
        </h3>


        <p className="document-type">
          {
            document.type_document_display
            || document.type_document
          }
        </p>


        {
          document.numero
          && (

            <div className="document-info">

              <span>
                Numéro
              </span>

              <strong>
                {
                  document.numero
                }
              </strong>

            </div>

          )
        }


        {
          document.date_emission
          && (

            <div className="document-info">

              <span>
                Émis le
              </span>

              <strong>
                {
                  formatDate(
                    document.date_emission
                  )
                }
              </strong>

            </div>

          )
        }


        {
          document.date_expiration
          && (

            <div className="document-info">

              <span>
                Expire le
              </span>

              <strong>
                {
                  formatDate(
                    document.date_expiration
                  )
                }
              </strong>

            </div>

          )
        }


        <div className="document-info">

          <span>
            Fichier
          </span>

          <strong>
            {
              document.nom_fichier
              || "Document"
            }
          </strong>

        </div>


        <div className="document-info">

          <span>
            Taille
          </span>

          <strong>
            {
              formatFileSize(
                document.taille
              )
            }
          </strong>

        </div>


        {
          document.description
          && (

            <p className="document-description">
              {
                document.description
              }
            </p>

          )
        }

      </div>


      <div className="document-card-footer">

        {
          document.fichier
          && (

            <a
              href={
                getFileUrl(
                  document.fichier
                )
              }
              target="_blank"
              rel="noreferrer"
              className="document-download-button"
            >

              <Download
                size={15}
              />

              Ouvrir

            </a>

          )
        }

      </div>

    </article>
  );

}


// =========================================================
// FILE URL
// =========================================================

function getFileUrl(
  value
) {

  if (!value) {
    return "#";
  }


  if (
    value.startsWith(
      "http://"
    )
    || value.startsWith(
      "https://"
    )
  ) {

    return value;

  }


  return (
    `http://127.0.0.1:8000${value}`
  );

}


// =========================================================
// DATE
// =========================================================

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


// =========================================================
// SIZE
// =========================================================

function formatFileSize(
  bytes
) {

  const value =
    Number(bytes);


  if (
    !Number.isFinite(value)
    || value <= 0
  ) {

    return "—";

  }


  if (
    value < 1024
  ) {

    return `${value} o`;

  }


  if (
    value < 1024 * 1024
  ) {

    return `${
      (
        value / 1024
      ).toFixed(1)
    } Ko`;

  }


  return `${
    (
      value
      / 1024
      / 1024
    ).toFixed(1)
  } Mo`;

}
