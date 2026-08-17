import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Loader2,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../Services/api";

import "../Styles/admin-demande-detail.css";


export default function DemandeDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [
    demande,
    setDemande,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processingAction,
    setProcessingAction,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    actionResult,
    setActionResult,
  ] = useState(null);


  // =========================================================
  // LOAD
  // =========================================================

  const fetchDemande = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await API.get(
            `/api/demandes/${id}/`
          );

        setDemande(
          response.data
        );

      } catch (err) {
        console.error(
          "DEMANDE DETAIL ERROR",
          err
        );

        setError(
          err.response?.data?.detail
          || "Impossible de charger cette demande."
        );

      } finally {
        setLoading(false);
      }
    },
    [id]
  );


  useEffect(() => {
    fetchDemande();
  }, [fetchDemande]);


  // =========================================================
  // APPROUVER
  // =========================================================

  const handleApprove =
    async () => {
      setProcessingAction(
        "approve"
      );

      setError("");
      setMessage("");
      setActionResult(null);

      try {
        const response =
          await API.post(
            `/api/demandes/${id}/approuver/`
          );

        const data =
          response.data;

        setDemande(
          data.demande
          || demande
        );

        setActionResult(
          data
        );

        setMessage(
          data.message
          || "La demande a été approuvée."
        );

      } catch (err) {
        console.error(
          "APPROVE DEMANDE ERROR",
          err
        );

        setError(
          getApiError(
            err,
            "Impossible d'approuver cette demande."
          )
        );

      } finally {
        setProcessingAction("");
      }
    };


  // =========================================================
  // REFUSER
  // =========================================================

  const handleReject =
    async () => {
      setProcessingAction(
        "reject"
      );

      setError("");
      setMessage("");
      setActionResult(null);

      try {
        const response =
          await API.post(
            `/api/demandes/${id}/refuser/`
          );

        const data =
          response.data;

        setDemande(
          data.demande
          || demande
        );

        setMessage(
          data.message
          || "La demande a été refusée."
        );

      } catch (err) {
        console.error(
          "REJECT DEMANDE ERROR",
          err
        );

        setError(
          getApiError(
            err,
            "Impossible de refuser cette demande."
          )
        );

      } finally {
        setProcessingAction("");
      }
    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="demande-detail-page">

        <div className="demande-detail-loading">

          <Loader2
            size={30}
            className="demande-detail-spin"
          />

          <span>
            Chargement de la demande...
          </span>

        </div>

      </div>
    );
  }


  if (
    error
    && !demande
  ) {
    return (
      <div className="demande-detail-page">

        <div className="demande-detail-error">
          {error}
        </div>

      </div>
    );
  }


  if (!demande) {
    return null;
  }


  const details =
    demande.details
    || {};


  return (
    <div className="demande-detail-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="demande-detail-heading">

        <div className="demande-detail-heading-left">

          <button
            type="button"
            className="demande-detail-back"
            onClick={() =>
              navigate(
                "/admin/demandes"
              )
            }
            aria-label="Retour aux demandes"
          >
            <ArrowLeft
              size={18}
            />
          </button>


          <div>

            <span className="demande-detail-eyebrow">
              Demande #{demande.id}
            </span>

            <h1>
              {
                demande.type_demande_display
                || getTypeLabel(
                  demande.type_demande
                )
              }
            </h1>

            <p>
              Envoyée le{" "}
              {
                formatDateTime(
                  demande.date_demande
                )
              }
            </p>

          </div>

        </div>


        <StatusBadge
          status={
            demande.statut
          }
        />

      </section>


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {message && (
        <div className="demande-detail-success">

          <CheckCircle2
            size={18}
          />

          {message}

        </div>
      )}


      {error && (
        <div className="demande-detail-error">
          {error}
        </div>
      )}


      {/* =====================================================
          RESULTAT APPROBATION
      ===================================================== */}

      {
        actionResult
        && (
          <ApprovalResult
            data={
              actionResult
            }
          />
        )
      }


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="demande-detail-grid">

        {/* ===================================================
            LEFT
        =================================================== */}

        <main className="demande-detail-main">

          <section className="demande-detail-card">

            <div className="demande-detail-card-heading">

              <div>

                <h2>
                  Informations de la demande
                </h2>

                <p>
                  Détails transmis par le salarié.
                </p>

              </div>


              <span className="demande-detail-card-icon">

                <FileText
                  size={20}
                />

              </span>

            </div>


            <div className="demande-detail-info-grid">

              <InfoItem
                label="Type"
                value={
                  demande.type_demande_display
                  || getTypeLabel(
                    demande.type_demande
                  )
                }
              />


              <InfoItem
                label="Date de demande"
                value={
                  formatDateTime(
                    demande.date_demande
                  )
                }
              />


              {
                demande.montant_souhaite
                !== null
                && demande.montant_souhaite
                !== undefined
                && (
                  <InfoItem
                    label="Montant souhaité"
                    value={
                      formatMoney(
                        demande.montant_souhaite
                      )
                    }
                  />
                )
              }


              {
                Object.entries(
                  details
                ).map(
                  ([
                    key,
                    value,
                  ]) => (

                    <InfoItem
                      key={key}
                      label={
                        formatDetailLabel(
                          key
                        )
                      }
                      value={
                        formatDetailValue(
                          key,
                          value
                        )
                      }
                    />

                  )
                )
              }

            </div>


            {/* POINTAGES */}

            {
              Array.isArray(
                demande.pointages
              )
              && demande.pointages.length > 0
              && (
                <div className="demande-detail-pointages">

                  <h3>
                    Pointages liés
                  </h3>

                  <p>
                    {
                      demande.pointages.length
                    } pointage
                    {
                      demande.pointages.length > 1
                        ? "s"
                        : ""
                    } associé
                    {
                      demande.pointages.length > 1
                        ? "s"
                        : ""
                    } à cette demande.
                  </p>


                  {
                    demande.total_heures_sup
                    !== undefined
                    && demande.total_heures_sup
                    !== null
                    && (
                      <strong>
                        Total heures supplémentaires :{" "}
                        {
                          demande.total_heures_sup
                        } h
                      </strong>
                    )
                  }

                </div>
              )
            }


            {/* DOCUMENT */}

            {
              demande.document
              && (
                <div className="demande-detail-document">

                  <div>

                    <FileText
                      size={21}
                    />

                    <span>
                      Justificatif joint
                    </span>

                  </div>


                  <a
                    href={
                      demande.document
                    }
                    target="_blank"
                    rel="noreferrer"
                  >

                    <Download
                      size={16}
                    />

                    Ouvrir

                  </a>

                </div>
              )
            }

          </section>

        </main>


        {/* ===================================================
            RIGHT
        =================================================== */}

        <aside className="demande-detail-sidebar">

          {/* SALARIE */}

          <section className="demande-detail-card">

            <div className="demande-detail-card-heading">

              <div>

                <h2>
                  Salarié
                </h2>

                <p>
                  Demandeur
                </p>

              </div>


              <span className="demande-detail-card-icon">

                <UserRound
                  size={20}
                />

              </span>

            </div>


            <div className="demande-detail-user">

              <span className="demande-detail-avatar">
                {
                  getInitials(
                    demande.salarie_nom
                  )
                }
              </span>


              <div>

                <strong>
                  {
                    demande.salarie_nom
                    || "Salarié"
                  }
                </strong>

                <span>
                  ID salarié :{" "}
                  {
                    demande.salarie
                    || "—"
                  }
                </span>

              </div>

            </div>

          </section>


          {/* TRAITEMENT */}

          <section className="demande-detail-card">

            <div className="demande-detail-card-heading">

              <div>

                <h2>
                  Traitement
                </h2>

                <p>
                  Décision RH
                </p>

              </div>


              <span className="demande-detail-card-icon">

                <Clock3
                  size={20}
                />

              </span>

            </div>


            {
              demande.statut
              === "EN_ATTENTE"
                ? (
                  <div className="demande-detail-actions">

                    <button
                      type="button"
                      className="demande-detail-approve"
                      disabled={
                        Boolean(
                          processingAction
                        )
                      }
                      onClick={
                        handleApprove
                      }
                    >

                      {
                        processingAction
                        === "approve"
                          ? (
                            <Loader2
                              size={17}
                              className="demande-detail-spin"
                            />
                          )
                          : (
                            <CheckCircle2
                              size={17}
                            />
                          )
                      }

                      {
                        processingAction
                        === "approve"
                          ? "Approbation..."
                          : "Approuver"
                      }

                    </button>


                    <button
                      type="button"
                      className="demande-detail-refuse"
                      disabled={
                        Boolean(
                          processingAction
                        )
                      }
                      onClick={
                        handleReject
                      }
                    >

                      {
                        processingAction
                        === "reject"
                          ? (
                            <Loader2
                              size={17}
                              className="demande-detail-spin"
                            />
                          )
                          : (
                            <XCircle
                              size={17}
                            />
                          )
                      }

                      {
                        processingAction
                        === "reject"
                          ? "Refus..."
                          : "Refuser"
                      }

                    </button>

                  </div>
                )
                : (
                  <div className="demande-detail-processed">

                    <StatusBadge
                      status={
                        demande.statut
                      }
                    />


                    {
                      demande.processed_at
                      && (
                        <span>
                          Traitée le{" "}
                          {
                            formatDateTime(
                              demande.processed_at
                            )
                          }
                        </span>
                      )
                    }

                  </div>
                )
            }

          </section>

        </aside>

      </section>

    </div>
  );
}


// ===========================================================
// RESULTAT APPROBATION
// ===========================================================

function ApprovalResult({
  data,
}) {
  const hasPayment =
    data.paiement_cree
    || data.paiement_id;

  const hasPlanning =
    Array.isArray(
      data.plannings_crees
    )
    && data.plannings_crees.length > 0;

  const hasFiche =
    data.fiche_creee
    || data.fiche_paie_id;


  if (
    !hasPayment
    && !hasPlanning
    && !hasFiche
  ) {
    return null;
  }


  return (
    <section className="demande-detail-card">

      <div className="demande-detail-card-heading">

        <div>

          <h2>
            Résultat du traitement
          </h2>

          <p>
            Actions effectuées automatiquement
            par StaffHub.
          </p>

        </div>


        <span className="demande-detail-card-icon">

          <CheckCircle2
            size={20}
          />

        </span>

      </div>


      <div className="demande-detail-info-grid">

        {
          hasPayment
          && (
            <>
              <InfoItem
                label="Paiement créé"
                value="Oui"
              />


              {
                data.montant_paiement
                && (
                  <InfoItem
                    label="Montant du paiement"
                    value={
                      formatMoney(
                        data.montant_paiement
                      )
                    }
                  />
                )
              }


              {
                data.date_paiement
                && (
                  <InfoItem
                    label="Date de paiement"
                    value={
                      formatDateOnly(
                        data.date_paiement
                      )
                    }
                  />
                )
              }
            </>
          )
        }


        {
          hasPlanning
          && (
            <InfoItem
              label="Planning"
              value={
                `${
                  data.plannings_crees.length
                } entrée${
                  data.plannings_crees.length > 1
                    ? "s"
                    : ""
                } créée${
                  data.plannings_crees.length > 1
                    ? "s"
                    : ""
                }`
              }
            />
          )
        }


        {
          hasFiche
          && (
            <InfoItem
              label="Bulletin de paie"
              value="Généré"
            />
          )
        }

      </div>


      {
        data.fiche_pdf
        && (
          <div className="demande-detail-document">

            <div>

              <FileText
                size={21}
              />

              <span>
                Bulletin StaffHub généré
              </span>

            </div>


            <a
              href={
                data.fiche_pdf
              }
              target="_blank"
              rel="noreferrer"
            >

              <Download
                size={16}
              />

              Ouvrir le PDF

            </a>

          </div>
        )
      }

    </section>
  );
}


// ===========================================================
// INFO ITEM
// ===========================================================

function InfoItem({
  label,
  value,
}) {
  return (
    <div className="demande-detail-info-item">

      <span>
        {label}
      </span>

      <strong>
        {
          value
          ?? "—"
        }
      </strong>

    </div>
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
        "Approuvée",

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
        `demande-detail-status demande-detail-status-${current.css}`
      }
    >
      {current.label}
    </span>
  );
}


// ===========================================================
// LABELS
// ===========================================================

function getTypeLabel(
  type
) {
  const labels = {
    ACOMPTE:
      "Acompte",

    AVANCE:
      "Avance",

    CALENDRIER:
      "Modification du calendrier",

    FICHE:
      "Demande de fiche",

    CET:
      "Paiement CET",

    HEURES_SUP:
      "Paiement heures supplémentaires",

    ABSENCE:
      "Absence",
  };


  return (
    labels[type]
    || type
    || "—"
  );
}


function formatDetailLabel(
  key
) {
  const labels = {
    date:
      "Date concernée",

    date_debut:
      "Date de début",

    date_fin:
      "Date de fin",

    type_journee:
      "Type de journée",

    heure_debut:
      "Heure de début",

    heure_fin:
      "Heure de fin",

    motif:
      "Motif",

    commentaire:
      "Commentaire",

    heures_cet:
      "Heures CET",

    mois:
      "Mois",

    document_type:
      "Document demandé",

    periode:
      "Période",

    mode_reception:
      "Mode de réception",

    total_heures_selectionnees:
      "Heures sélectionnées",

    payment_date:
      "Date de paiement",

    repayment_months:
      "Nombre de mensualités",

    reason:
      "Motif",
  };


  return (
    labels[key]
    || key.replace(
      /_/g,
      " "
    )
  );
}


// ===========================================================
// FORMAT DETAIL
// ===========================================================

function formatDetailValue(
  key,
  value
) {
  if (
    value === null
    || value === undefined
    || value === ""
  ) {
    return "—";
  }


  if (
    key === "type_journee"
  ) {
    const labels = {
      BUREAU:
        "Bureau",

      TELETRAVAIL:
        "Télétravail",

      CONGE:
        "Congé",

      ABSENCE:
        "Absence",

      VACATION:
        "Vacation",

      FORMATION:
        "Formation",
    };


    return (
      labels[value]
      || value
    );
  }


  if (
    key === "document_type"
  ) {
    const labels = {
      FICHE_PAIE:
        "Fiche de paie",

      DUPLICATA_PAIE:
        "Duplicata de fiche de paie",

      ATTESTATION_SALAIRE:
        "Attestation de salaire",

      RELEVE_ANNUEL:
        "Relevé annuel",

      AUTRE:
        "Autre document",
    };


    return (
      labels[value]
      || value
    );
  }


  if (
    key === "mode_reception"
  ) {
    const labels = {
      ESPACE_SALARIE:
        "Espace salarié",

      EMAIL:
        "E-mail",

      MAIN_PROPRE:
        "Remise en main propre",
    };


    return (
      labels[value]
      || value
    );
  }


  if (
    [
      "date",
      "date_debut",
      "date_fin",
    ].includes(key)
  ) {
    return formatDateOnly(
      value
    );
  }


  if (
    Array.isArray(value)
  ) {
    return value.join(", ");
  }


  if (
    typeof value
    === "object"
  ) {
    return JSON.stringify(
      value
    );
  }


  return String(value);
}


// ===========================================================
// FORMAT DATE
// ===========================================================

function formatDateOnly(
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
    "fr-FR"
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


  return date.toLocaleString(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


// ===========================================================
// MONEY
// ===========================================================

function formatMoney(
  value
) {
  const amount =
    Number(value);


  if (
    Number.isNaN(
      amount
    )
  ) {
    return value;
  }


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


// ===========================================================
// INITIALS
// ===========================================================

function getInitials(
  name
) {
  if (!name) {
    return "?";
  }


  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (item) =>
        item.charAt(0)
    )
    .join("")
    .toUpperCase();
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
    return (
      extractNestedError(
        data
      )
      || fallback
    );
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
      const child
      of value
    ) {
      const result =
        extractNestedError(
          child
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
      const child
      of Object.values(value)
    ) {
      const result =
        extractNestedError(
          child
        );

      if (result) {
        return result;
      }
    }
  }


  return "";
}
