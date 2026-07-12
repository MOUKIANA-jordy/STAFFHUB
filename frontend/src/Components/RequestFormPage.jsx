import React, { useMemo, useState } from "react";
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
  history = [],
  endpoint,
  submitLabel = "Envoyer la demande",
}) {
  const initialValues = useMemo(() => {
    return fields.reduce((values, field) => {
      values[field.name] = field.defaultValue || "";
      return values;
    }, {});
  }, [fields]);

  const [formData, setFormData] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setMessage("");
  setIsSubmitting(true);

  try {
    if (!endpoint) {
      throw new Error(
        "Aucun endpoint API n’a été défini pour cette demande."
      );
    }

    const hasFile = Object.values(formData).some(
      (value) => value instanceof File
    );

    let payload = formData;

    if (hasFile) {
      payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });
    }

    await API.post(endpoint, payload, {
      headers: hasFile
        ? {
            "Content-Type": "multipart/form-data",
          }
        : undefined,
    });

    setMessage("Votre demande a bien été envoyée.");
    setFormData(initialValues);
  } catch (error) {
    console.error("Erreur pendant l’envoi :", error);

    const apiErrors = error.response?.data;

    if (typeof apiErrors === "string") {
      setMessage(apiErrors);
    } else if (apiErrors?.detail) {
      setMessage(apiErrors.detail);
    } else if (apiErrors && typeof apiErrors === "object") {
      const firstError = Object.values(apiErrors)[0];

      setMessage(
        Array.isArray(firstError)
          ? firstError[0]
          : String(firstError)
      );
    } else {
      setMessage(
        error.message ||
          "Une erreur est survenue pendant l’envoi."
      );
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="request-page">
      <section className="request-heading">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div className={`request-heading-icon request-accent-${accent}`}>
          {icon}
        </div>
      </section>

      {message && (
        <div
          className={`request-message ${
            message.includes("bien été")
              ? "request-message-success"
              : "request-message-error"
          }`}
        >
          {message}
        </div>
      )}

      <section className="request-layout">
        <main className="request-card">
          <div className="request-card-heading">
            <div>
              <h2>Nouvelle demande</h2>
              <p>Complétez les informations ci-dessous.</p>
            </div>

            <span className={`request-small-icon request-accent-${accent}`}>
              {icon}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="request-form-grid">
              {fields.map((field) => (
                <RequestField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              ))}
            </div>

            <div className="request-actions">
              <button
                type="button"
                className="request-secondary-button"
                onClick={() => {
                  setFormData(initialValues);
                  setMessage("");
                }}
              >
                Réinitialiser
              </button>

              <button
                type="submit"
                className="request-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi..." : submitLabel}
              </button>
            </div>
          </form>
        </main>

        <aside className="request-sidebar-card">
          <div className="request-card-heading">
            <div>
              <h2>Informations</h2>
              <p>À savoir avant l’envoi.</p>
            </div>
          </div>

          <div className="request-information-list">
            {information.map((item, index) => (
              <div key={`${item.title}-${index}`}>
                <span>{index + 1}</span>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="request-history-card">
        <div className="request-card-heading">
          <div>
            <h2>Historique</h2>
            <p>Vos dernières demandes.</p>
          </div>
        </div>

        {history.length > 0 ? (
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
                    <td>{item.date}</td>
                    <td>{item.title}</td>
                    <td>{item.detail}</td>
                    <td>
                      <StatusBadge status={item.status} />
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

function RequestField({ field, value, onChange }) {
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value || "",
    onChange,
    required: field.required,
  };

  return (
    <div
      className={`request-field ${
        field.fullWidth ? "request-field-full" : ""
      }`}
    >
      <label htmlFor={field.name}>
        {field.label}
        {field.required && <span> *</span>}
      </label>

      {field.type === "select" && (
        <select {...commonProps}>
          <option value="">Sélectionner</option>

          {field.options?.map((option) => (
            <option
              key={
                typeof option === "string" ? option : option.value
              }
              value={
                typeof option === "string" ? option : option.value
              }
            >
              {typeof option === "string" ? option : option.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "textarea" && (
        <textarea
          {...commonProps}
          rows={field.rows || 4}
          placeholder={field.placeholder}
        />
      )}

      {field.type === "file" && (
        <input
          id={field.name}
          name={field.name}
          type="file"
          accept={field.accept}
          onChange={onChange}
          required={field.required}
        />
      )}

      {!["select", "textarea", "file"].includes(field.type) && (
        <input
          {...commonProps}
          type={field.type || "text"}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
        />
      )}

      {field.help && <small>{field.help}</small>}
    </div>
  );
}

function StatusBadge({ status }) {
  const labels = {
    approved: "Validée",
    pending: "En attente",
    rejected: "Refusée",
    paid: "Payée",
  };

  return (
    <span className={`request-status request-status-${status}`}>
      {labels[status] || status}
    </span>
  );
}
