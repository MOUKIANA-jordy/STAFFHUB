import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Info,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";

import Button from "./Button";
import API from "../Services/api";
import "../Styles/demandes.css";
import Select from "./Select";
import DatePicker from "./DatePicker";

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
  const initialValues = useMemo(
    () =>
      fields.reduce((values, field) => {
        values[field.name] = field.defaultValue ?? "";
        return values;
      }, {}),
    [fields]
  );

  const [formData, setFormData] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [lastCreated, setLastCreated] = useState(null);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const extractResults = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  const fetchHistory = useCallback(async () => {
    if (!endpoint || !requestType) {
      setHistory([]);
      setLoadingHistory(false);
      return;
    }

    try {
      setLoadingHistory(true);
      const response = await API.get(endpoint, {
        params: {
          type_demande: requestType,
          ordering: "-date_demande",
        },
      });
      setHistory(extractResults(response.data));
    } catch (error) {
      console.error("HISTORY ERROR", error);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [endpoint, requestType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setMessage("");
    setMessageType("");

    setFormData((currentData) => ({
      ...currentData,
      [name]: files ? files[0] || null : value,
    }));
  };

  const toSnakeCase = (value) =>
    value
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .replace(/-/g, "_")
      .toLowerCase();

  const buildPayload = () => {
    const details = {};
    let montantSouhaite = null;
    let document = null;
    let pointages = [];

    fields.forEach((field) => {
      if (
        typeof field.hidden === "function" &&
        field.hidden(formData)
      ) {
        return;
      }

      const value = formData[field.name];

      if (value === "" || value === null || value === undefined) {
        return;
      }

      if (
        field.apiField === "montant_souhaite" ||
        field.name === "amount" ||
        field.name === "montant_souhaite"
      ) {
        montantSouhaite = value;
        return;
      }

      if (
        field.apiField === "document" ||
        field.name === "document"
      ) {
        document = value;
        return;
      }

      if (
        field.apiField === "pointages" ||
        field.name === "pointages"
      ) {
        pointages = Array.isArray(value) ? value : [value];
        return;
      }

      const detailKey =
        field.detailKey ||
        field.apiField ||
        toSnakeCase(field.name);

      details[detailKey] = value;
    });

    const payload = {
      type_demande: requestType,
      details,
    };

    if (montantSouhaite !== null) {
      payload.montant_souhaite = montantSouhaite;
    }

    if (pointages.length > 0) {
      payload.pointages = pointages;
    }

    if (document) {
      payload.document = document;
    }

    return payload;
  };

  const getApiErrorMessage = (data) => {
    if (!data) {
      return "Une erreur est survenue pendant l’envoi.";
    }

    if (typeof data === "string") {
      if (
        data.includes("<html") ||
        data.includes("<!DOCTYPE html>")
      ) {
        return "Le serveur a rencontré une erreur pendant l’envoi.";
      }

      return data;
    }

    if (data.detail) return data.detail;

    const extractMessage = (value) => {
      if (typeof value === "string") return value;

      if (Array.isArray(value)) {
        return value.length > 0 ? extractMessage(value[0]) : null;
      }

      if (value && typeof value === "object") {
        for (const nestedValue of Object.values(value)) {
          const result = extractMessage(nestedValue);
          if (result) return result;
        }
      }

      return null;
    };

    for (const value of Object.values(data)) {
      const result = extractMessage(value);
      if (result) return result;
    }

    return "La demande contient des informations invalides.";
  };

  const validateFields = () => {
    for (const field of fields) {
      if (
        typeof field.hidden === "function" &&
        field.hidden(formData)
      ) {
        continue;
      }

      const required =
        typeof field.required === "function"
          ? field.required(formData)
          : Boolean(field.required);

      if (!required) continue;

      const value = formData[field.name];

      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return `${field.label} est obligatoire.`;
      }
    }

    return "";
  };

  const goToReview = () => {
    const validationError = validateFields();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setMessage("");
    setMessageType("");
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (currentStep === 1) {
      goToReview();
      return;
    }

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
        throw new Error("Aucun type de demande n’a été défini.");
      }

      const payload = buildPayload();
      const hasFile = payload.document instanceof File;
      let requestPayload;

      if (hasFile) {
        requestPayload = new FormData();
        requestPayload.append(
          "type_demande",
          payload.type_demande
        );

        if (payload.montant_souhaite !== undefined) {
          requestPayload.append(
            "montant_souhaite",
            payload.montant_souhaite
          );
        }

        requestPayload.append(
          "details",
          JSON.stringify(payload.details || {})
        );

        if (Array.isArray(payload.pointages)) {
          payload.pointages.forEach((pointageId) => {
            requestPayload.append("pointages", pointageId);
          });
        }

        requestPayload.append("document", payload.document);
      } else {
        requestPayload = {
          type_demande: payload.type_demande,
          details: payload.details || {},
        };

        if (payload.montant_souhaite !== undefined) {
          requestPayload.montant_souhaite =
            payload.montant_souhaite;
        }

        if (
          Array.isArray(payload.pointages) &&
          payload.pointages.length > 0
        ) {
          requestPayload.pointages = payload.pointages;
        }
      }

      const response = await API.post(endpoint, requestPayload);

      setLastCreated(
        response.data || {
          ...payload,
          statut: "EN_ATTENTE",
        }
      );

      setMessage("Votre demande a bien été envoyée.");
      setMessageType("success");
      setCurrentStep(3);

      await fetchHistory();

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Erreur pendant l’envoi :", error);
      const apiErrors = error.response?.data;

      setMessage(
        apiErrors
          ? getApiErrorMessage(apiErrors)
          : error.message ||
              "Une erreur est survenue pendant l’envoi."
      );

      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialValues);
    setMessage("");
    setMessageType("");
    setLastCreated(null);
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatHistoryDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getHistoryDetail = (item) => {
    if (
      item.montant_souhaite !== null &&
      item.montant_souhaite !== undefined
    ) {
      const amount = Number(item.montant_souhaite);

      if (!Number.isNaN(amount)) {
        return `${amount.toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} €`;
      }
    }

    const details = item.details || {};

    return (
      details.commentaire ||
      details.reason ||
      details.motif ||
      details.date ||
      "—"
    );
  };

  const requestAmount =
    formData.amount ||
    formData.montant_souhaite ||
    "";

  const reviewRows = fields
    .filter((field) => {
      if (
        typeof field.hidden === "function" &&
        field.hidden(formData)
      ) {
        return false;
      }

      const value = formData[field.name];

      return (
        value !== "" &&
        value !== null &&
        value !== undefined
      );
    })
    .map((field) => ({
      label: field.label,
      value: formatReviewValue(
        field,
        formData[field.name]
      ),
    }));

  const steps = [
    {
      id: 1,
      label: "Détails",
      icon: FileText,
    },
    {
      id: 2,
      label: "Vérification",
      icon: ShieldCheck,
    },
    {
      id: 3,
      label: "Confirmation",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="request-page">
      <section className="request-hero">
        <div className="request-hero-main">
          <div
            className={`request-heading-icon request-accent-${accent}`}
          >
            {icon}
          </div>

          <div>
            <div className="request-breadcrumb">
              Mes demandes
              <span>›</span>
              Nouvelle demande
              <span>›</span>
              {title || requestType}
            </div>

            <h1>
              {title || `Demande ${requestType || ""}`}
            </h1>

            <p>{description}</p>
          </div>
        </div>

        <button
          type="button"
          className="request-help-button"
        >
          <Info size={17} />
          Besoin d’aide ?
        </button>
      </section>

      <section className="request-overview-card">
        <div className="request-overview-item">
          <CircleDollarSign size={24} />

          <div>
            <span>Montant demandé</span>
            <strong>
              {requestAmount
                ? `${requestAmount} €`
                : "—"}
            </strong>
            <small>Demande en cours</small>
          </div>
        </div>

        <div className="request-overview-item">
          <CalendarDays size={24} />

          <div>
            <span>Demandes précédentes</span>
            <strong>{history.length}</strong>
            <small>Historique disponible</small>
          </div>
        </div>

        <div className="request-overview-item">
          <Clock3 size={24} />

          <div>
            <span>Statut</span>
            <strong>
              {currentStep === 3
                ? "Envoyée"
                : "Brouillon"}
            </strong>
            <small>Suivi dans StaffHub</small>
          </div>
        </div>

        <div className="request-overview-note">
          <Info size={20} />

          <p>
            Votre demande sera examinée par le service RH
            avant validation.
          </p>
        </div>
      </section>

      <section className="request-stepper">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={[
                "request-step",
                isActive ? "is-active" : "",
                isDone ? "is-done" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>
                {isDone
                  ? <Check size={16} />
                  : <StepIcon size={16} />}
              </span>

              <div>
                <small>Étape {step.id}</small>
                <strong>{step.label}</strong>
              </div>
            </div>
          );
        })}
      </section>

      {message && (
        <div
          className={`request-message ${
            messageType === "success"
              ? "request-message-success"
              : "request-message-error"
          }`}
        >
          {message}
        </div>
      )}

      <section className="request-layout">
        <main className="request-card">
          {currentStep === 1 && (
            <>
              <div className="request-card-heading">
                <div className="request-card-heading-number">
                  1
                </div>

                <div>
                  <h2>Détails de la demande</h2>
                  <p>
                    Renseignez les informations nécessaires.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="request-form-grid">
                  {fields.map((field) => (
                    <RequestField
                      key={field.name}
                      field={field}
                      value={formData[field.name]}
                      onChange={handleChange}
                      formData={formData}
                    />
                  ))}
                </div>

                <div className="request-info-banner">
                  <Info size={18} />

                  <div>
                    <strong>
                      Transmission au service RH
                    </strong>

                    <p>
                      Après l’envoi, votre demande apparaîtra
                      dans « Mes demandes » avec son statut.
                    </p>
                  </div>
                </div>

                <div className="request-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isSubmitting}
                    onClick={resetForm}
                  >
                    <RotateCcw size={16} />
                    Réinitialiser
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    Continuer
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="request-card-heading">
                <div className="request-card-heading-number">
                  2
                </div>

                <div>
                  <h2>Vérification</h2>
                  <p>
                    Contrôlez les informations avant l’envoi.
                  </p>
                </div>
              </div>

              <div className="request-review">
                <div className="request-review-title">
                  <div
                    className={`request-review-icon request-accent-${accent}`}
                  >
                    {icon}
                  </div>

                  <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                </div>

                <div className="request-review-grid">
                  {reviewRows.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="request-info-banner">
                <ShieldCheck size={18} />

                <div>
                  <strong>Dernière vérification</strong>
                  <p>
                    Une fois envoyée, la demande sera
                    transmise au service RH.
                  </p>
                </div>
              </div>

              <div className="request-actions">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft size={16} />
                  Modifier
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  <Send size={16} />
                  {submitLabel}
                </Button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="request-confirmation">
              <div className="request-confirmation-icon">
                <CheckCircle2 size={40} />
              </div>

              <span className="request-confirmation-eyebrow">
                Demande envoyée
              </span>

              <h2>
                Votre demande a bien été transmise
              </h2>

              <p>
                Le service RH peut maintenant consulter et
                traiter votre demande. Vous pourrez suivre son
                statut depuis votre historique StaffHub.
              </p>

              <div className="request-confirmation-grid">
                <div>
                  <span>Type</span>
                  <strong>{title || requestType}</strong>
                </div>

                <div>
                  <span>Statut</span>
                  <strong>En attente</strong>
                </div>

                <div>
                  <span>Référence</span>
                  <strong>
                    {lastCreated?.id
                      ? `DEM-${String(lastCreated.id).padStart(5, "0")}`
                      : "Générée par le serveur"}
                  </strong>
                </div>

                <div>
                  <span>Suivi</span>
                  <strong>Historique StaffHub</strong>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                onClick={resetForm}
              >
                Nouvelle demande
              </Button>
            </div>
          )}
        </main>

        <aside className="request-sidebar-card">
          <div className="request-sidebar-heading">
            <Lightbulb size={19} />

            <div>
              <h2>À savoir</h2>
              <p>Avant d’envoyer votre demande.</p>
            </div>
          </div>

          <div className="request-information-list">
            {information.length > 0 ? (
              information.map((item, index) => {
                const icons = [
                  ShieldCheck,
                  Clock3,
                  Bell,
                  LockKeyhole,
                ];

                const ItemIcon =
                  icons[index % icons.length];

                return (
                  <div key={`${item.title}-${index}`}>
                    <span>
                      <ItemIcon size={17} />
                    </span>

                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div>
                  <span>
                    <ShieldCheck size={17} />
                  </span>

                  <div>
                    <strong>Validation RH</strong>
                    <p>
                      Votre demande sera examinée avant
                      validation.
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    <Clock3 size={17} />
                  </span>

                  <div>
                    <strong>Délai de traitement</strong>
                    <p>
                      Le traitement peut prendre quelques jours.
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    <Bell size={17} />
                  </span>

                  <div>
                    <strong>Notification</strong>
                    <p>
                      Vous serez informé après traitement.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </section>

      <section className="request-history-card">
        <div className="request-card-heading">
          <div>
            <h2>Mes dernières demandes</h2>
            <p>
              Suivez les demandes déjà envoyées.
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
                  <th>Date</th>
                  <th>Demande</th>
                  <th>Détail</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {formatHistoryDate(item.date_demande)}
                    </td>

                    <td>
                      {item.type_demande_display ||
                        item.type_demande}
                    </td>

                    <td>{getHistoryDetail(item)}</td>

                    <td>
                      <StatusBadge
                        status={item.statut}
                      />
                    </td>
                  </tr>
                ))}
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

function RequestField({
  field,
  value,
  onChange,
  formData,
}) {
  if (
    typeof field.hidden === "function" &&
    field.hidden(formData)
  ) {
    return null;
  }

  const isRequired =
    typeof field.required === "function"
      ? field.required(formData)
      : Boolean(field.required);

  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? "",
    onChange,
    required: isRequired,
    disabled: field.disabled,
  };

  return (
    <div
      className={`request-field ${
        field.fullWidth ? "request-field-full" : ""
      }`}
    >
      <label htmlFor={field.name}>
        {field.label}
        {isRequired && <span> *</span>}
      </label>

      {field.type === "select" && (
        <Select
          id={field.name}
          name={field.name}
          value={value ?? ""}
          onChange={onChange}
          options={field.options || []}
          placeholder={field.placeholder || "Sélectionner"}
          disabled={field.disabled}
          required={isRequired}
        />
      )}

      {field.type === "date" && (
        <DatePicker
          id={field.name}
          name={field.name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={field.placeholder || "Sélectionner une date"}
          disabled={field.disabled}
          required={isRequired}
          minDate={field.min}
          maxDate={field.max}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          {...commonProps}
          rows={field.rows || 4}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
        />
      )}

      {field.type === "file" && (
        <input
          id={field.name}
          name={field.name}
          type="file"
          accept={field.accept}
          onChange={onChange}
          required={isRequired}
          disabled={field.disabled}
        />
      )}

      {!["select", "date", "textarea", "file"].includes(
        field.type
      ) && (
        <input
          {...commonProps}
          type={field.type || "text"}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
        />
      )}

      {field.help && (
        <small>{field.help}</small>
      )}
    </div>
  );
}

function formatReviewValue(field, value) {
  if (value instanceof File) {
    return value.name;
  }

  if (field.type === "date" && value) {
    const date = new Date(`${value}T12:00:00`);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
  }

  if (
    field.apiField === "montant_souhaite" ||
    field.name === "amount" ||
    field.name === "montant_souhaite"
  ) {
    const amount = Number(value);

    if (!Number.isNaN(amount)) {
      return `${amount.toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} €`;
    }
  }

  return String(value);
}

function StatusBadge({ status }) {
  const labels = {
    EN_ATTENTE: "En attente",
    APPROUVEE: "Approuvée",
    APPROUVE: "Approuvée",
    REFUSEE: "Refusée",
    REFUSE: "Refusée",
  };

  const cssClasses = {
    EN_ATTENTE: "pending",
    APPROUVEE: "approved",
    APPROUVE: "approved",
    REFUSEE: "rejected",
    REFUSE: "rejected",
  };

  return (
    <span
      className={`request-status request-status-${
        cssClasses[status] || "pending"
      }`}
    >
      {labels[status] || status || "—"}
    </span>
  );
}