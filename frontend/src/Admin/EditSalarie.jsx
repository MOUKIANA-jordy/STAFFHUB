import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import API from "../Services/api";
import "../Styles/create-salarie.css";


const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email_personnel: "",
  telephone: "",
  date_naissance: "",
  nationalite: "",
  poste: "",
  etablissement: "",
  type_contrat: "CDI",
  date_debut_contrat: "",
  date_fin_contrat: "",
  role: "SALARIE",
};


function getApiError(error) {
  const responseData = error?.response?.data;

  if (!responseData) {
    return "Impossible de joindre le serveur.";
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData.detail) {
    return responseData.detail;
  }

  return Object.entries(responseData)
    .map(([field, messages]) => {
      const content = Array.isArray(messages)
        ? messages.join(" ")
        : String(messages);

      return `${field} : ${content}`;
    })
    .join(" • ");
}


function normalizeSalarie(salarie) {
  return {
    nom: salarie.nom || "",
    prenom: salarie.prenom || "",
    email_personnel: salarie.email_personnel || "",
    telephone: salarie.telephone || "",
    date_naissance: salarie.date_naissance || "",
    nationalite: salarie.nationalite || "",
    poste: salarie.poste || "",
    etablissement: salarie.etablissement || "",
    type_contrat: salarie.type_contrat || "CDI",
    date_debut_contrat: salarie.date_debut_contrat || "",
    date_fin_contrat: salarie.date_fin_contrat || "",
    role: salarie.role || "SALARIE",
  };
}


function Field({
  label,
  name,
  required = false,
  hint,
  children,
  ...inputProps
}) {
  return (
    <label className="create-salarie-field">
      <span>
        {label}
        {required && <i aria-hidden="true">*</i>}
      </span>

      {children || (
        <input
          name={name}
          required={required}
          {...inputProps}
        />
      )}

      {hint && <small>{hint}</small>}
    </label>
  );
}


export default function EditSalarie() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isPermanentContract = form.type_contrat === "CDI";

  useEffect(() => {
    let isMounted = true;

    const loadEmployee = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get(`/api/salaries/${id}/`);
        const salarie = response.data?.data || response.data;

        if (isMounted) {
          setEmployee(salarie);
          setForm(normalizeSalarie(salarie));
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getApiError(requestError));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEmployee();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setSuccess("");
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "type_contrat" && value === "CDI"
        ? { date_fin_contrat: "" }
        : {}),
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      ["nom", "Le nom"],
      ["prenom", "Le prénom"],
      ["email_personnel", "L’adresse e-mail personnelle"],
      ["poste", "Le poste"],
      ["etablissement", "L’établissement"],
      ["date_debut_contrat", "La date de début du contrat"],
    ];

    const missingField = requiredFields.find(([field]) => {
      return !String(form[field] || "").trim();
    });

    if (missingField) {
      return `${missingField[1]} est obligatoire.`;
    }

    if (
      form.date_fin_contrat
      && form.date_fin_contrat < form.date_debut_contrat
    ) {
      return "La date de fin ne peut pas être antérieure à la date de début.";
    }

    return "";
  };

  const buildPayload = () => {
    return {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email_personnel: form.email_personnel.trim().toLowerCase(),
      telephone: form.telephone.trim(),
      date_naissance: form.date_naissance || null,
      nationalite: form.nationalite.trim(),
      poste: form.poste.trim(),
      etablissement: form.etablissement.trim(),
      type_contrat: form.type_contrat,
      date_debut_contrat: form.date_debut_contrat,
      date_fin_contrat: isPermanentContract
        ? null
        : form.date_fin_contrat || null,
      role: form.role,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.patch(
        `/api/salaries/${id}/`,
        buildPayload(),
      );

      const updatedEmployee = response.data?.data || response.data;

      setEmployee((current) => ({
        ...current,
        ...updatedEmployee,
      }));
      setForm(normalizeSalarie(updatedEmployee));
      setSuccess("Les informations du salarié ont été enregistrées.");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError) {
      console.error("Modification du salarié :", requestError);
      setError(getApiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="create-salarie-page">
        <div className="create-salarie-loading">
          <Loader2
            className="create-salarie-spinner"
            size={28}
          />
          <span>Chargement du salarié...</span>
        </div>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className="create-salarie-page">
        <div className="create-salarie-error" role="alert">
          {error || "Salarié introuvable."}
        </div>

        <div className="create-salarie-empty-action">
          <button
            type="button"
            className="create-salarie-secondary-button"
            onClick={() => navigate("/admin/users")}
          >
            Retour aux salariés
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="create-salarie-page">
      <header className="create-salarie-heading">
        <button
          type="button"
          className="create-salarie-back"
          onClick={() => navigate(-1)}
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <span className="create-salarie-eyebrow">
            Administration des salariés
          </span>

          <h1>Modifier le salarié</h1>

          <p>
            {employee.prenom} {employee.nom} · {employee.matricule}
          </p>
        </div>

        <div className="create-salarie-preview">
          <UserRound size={19} />
          <span>{form.prenom} {form.nom}</span>
        </div>
      </header>

      {success && (
        <div
          className="create-salarie-success-message-bar"
          role="status"
        >
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {error && (
        <div
          className="create-salarie-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        className="create-salarie-form"
        onSubmit={handleSubmit}
      >
        <section className="create-salarie-card">
          <header className="create-salarie-card-heading">
            <span><UserRound size={21} /></span>
            <div>
              <h2>Identité et coordonnées</h2>
              <p>Informations personnelles modifiables.</p>
            </div>
          </header>

          <div className="create-salarie-grid">
            <Field
              label="Nom"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
            />

            <Field
              label="Prénom"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
            />

            <Field
              label="E-mail personnel"
              name="email_personnel"
              type="email"
              value={form.email_personnel}
              onChange={handleChange}
              required
            />

            <Field
              label="Téléphone"
              name="telephone"
              type="tel"
              value={form.telephone}
              onChange={handleChange}
            />

            <Field
              label="Date de naissance"
              name="date_naissance"
              type="date"
              value={form.date_naissance}
              onChange={handleChange}
            />

            <Field
              label="Nationalité"
              name="nationalite"
              value={form.nationalite}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="create-salarie-card">
          <header className="create-salarie-card-heading">
            <span><BriefcaseBusiness size={21} /></span>
            <div>
              <h2>Emploi et contrat</h2>
              <p>Affectation et durée du contrat.</p>
            </div>
          </header>

          <div className="create-salarie-grid">
            <Field
              label="Poste"
              name="poste"
              value={form.poste}
              onChange={handleChange}
              required
            />

            <Field
              label="Établissement"
              name="etablissement"
              value={form.etablissement}
              onChange={handleChange}
              required
            />

            <Field label="Type de contrat" required>
              <select
                name="type_contrat"
                value={form.type_contrat}
                onChange={handleChange}
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="VACATAIRE">Vacataire</option>
                <option value="STAGIAIRE">Stagiaire</option>
                <option value="ALTERNANT">Alternant</option>
              </select>
            </Field>

            <Field
              label="Début du contrat"
              name="date_debut_contrat"
              type="date"
              value={form.date_debut_contrat}
              onChange={handleChange}
              required
            />

            <Field
              label="Fin du contrat"
              name="date_fin_contrat"
              type="date"
              value={form.date_fin_contrat}
              onChange={handleChange}
              min={form.date_debut_contrat || undefined}
              disabled={isPermanentContract}
              hint={isPermanentContract ? "Un CDI ne possède pas de date de fin." : "À renseigner si elle est connue."}
            />
          </div>
        </section>

        <section className="create-salarie-card">
          <header className="create-salarie-card-heading">
            <span><ShieldCheck size={21} /></span>
            <div>
              <h2>Rôle et compte</h2>
              <p>Le matricule et l’e-mail professionnel sont protégés.</p>
            </div>
          </header>

          <div className="create-salarie-grid">
            <Field label="Rôle applicatif" required>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="SALARIE">Salarié</option>
                <option value="RH">Ressources humaines</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </Field>

            <Field
              label="Matricule"
              value={employee.matricule || ""}
              disabled
              hint="Le matricule ne peut pas être modifié ici."
            />

            <Field
              label="E-mail professionnel"
              value={employee.email_pro || ""}
              disabled
              hint="Cette adresse est gérée par le compte utilisateur."
            />
          </div>
        </section>

        <footer className="create-salarie-actions">
          <button
            type="button"
            className="create-salarie-secondary-button"
            onClick={() => navigate(`/admin/salarie/${id}`)}
            disabled={saving}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="create-salarie-primary-button"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2
                  className="create-salarie-spinner"
                  size={18}
                />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} />
                Enregistrer les modifications
              </>
            )}
          </button>
        </footer>
      </form>
    </main>
  );
}
