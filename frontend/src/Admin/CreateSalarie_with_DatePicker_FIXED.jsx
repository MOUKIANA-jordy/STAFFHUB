import React, {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../Services/api";
import DatePicker from "../Components/DatePicker";

import "../Styles/create-salarie.css";


const INITIAL_FORM = {
  // IDENTITÉ
  nom: "",
  prenom: "",
  email_personnel: "",
  telephone: "",
  date_naissance: "",
  nationalite: "",

  // EMPLOI
  poste: "",
  etablissement: "",
  type_contrat: "CDI",
  date_debut_contrat: "",
  date_fin_contrat: "",
  role: "SALARIE",

  // COMPTE
  username: "",
  password: "",

  // ADRESSE
  adresse_numero: "",
  adresse_voie: "",
  adresse_complement: "",
  adresse_code_postal: "",
  adresse_commune: "",
  adresse_pays: "France",

  // CONTACT URGENCE
  contact_urgence_nom: "",
  contact_urgence_lien: "",
  contact_urgence_telephone: "",

  // BANQUE
  iban: "",
  bic: "",
  titulaire: "",
  nom_banque: "",

  // DOCUMENTS
  piece_identite_type: "CNI",
  piece_identite_numero: "",
  piece_identite_date_emission: "",
  piece_identite_date_expiration: "",
  piece_identite_fichier: null,

  titre_sejour_numero: "",
  titre_sejour_date_emission: "",
  titre_sejour_date_expiration: "",
  titre_sejour_fichier: null,
};


const ROLE_LABELS = {
  SALARIE: "Salarié",
  RH: "Ressources humaines",
  ADMIN: "Administrateur",
};


const CONTRACT_LABELS = {
  CDI: "CDI",
  CDD: "CDD",
  VACATAIRE: "Vacataire",
  STAGIAIRE: "Stagiaire",
  ALTERNANT: "Alternant",
};


const STEPS = [
  {
    id: 1,
    label: "Informations",
    description: "Identité du salarié",
    icon: UserRound,
  },
  {
    id: 2,
    label: "Emploi",
    description: "Poste et contrat",
    icon: BriefcaseBusiness,
  },
  {
    id: 3,
    label: "Onboarding",
    description: "Compléter le dossier",
    icon: Sparkles,
  },
  {
    id: 4,
    label: "Vérification",
    description: "Contrôle final",
    icon: ShieldCheck,
  },
];


function getApiError(error) {
  const responseData =
    error?.response?.data;

  if (!responseData) {
    return (
      "Impossible de joindre le serveur. "
      + "Vérifiez que Django est démarré."
    );
  }

  if (
    typeof responseData
    === "string"
  ) {
    return responseData;
  }

  if (
    responseData.detail
  ) {
    return responseData.detail;
  }

  return Object.entries(
    responseData
  )
    .map(
      ([
        field,
        messages,
      ]) => {
        const content =
          Array.isArray(messages)
            ? messages.join(" ")
            : String(messages);

        return (
          `${field} : ${content}`
        );
      }
    )
    .join(" • ");
}


function Field({
  label,
  name,
  required = false,
  hint,
  children,
  type = "text",
  value,
  onChange,
  disabled,
  min,
  max,
  placeholder,
  ...inputProps
}) {
  return (
    <label className="create-salarie-field">
      <span>
        {label}

        {
          required
          && (
            <i aria-hidden="true">
              *
            </i>
          )
        }
      </span>

      {
        children
        || (
          type === "date"
            ? (
                <DatePicker
                  id={name}
                  name={name}
                  value={value ?? ""}
                  onChange={onChange}
                  placeholder={placeholder || "Sélectionner une date"}
                  disabled={disabled}
                  required={required}
                  minDate={min}
                  maxDate={max}
                />
              )
            : (
                <input
                  name={name}
                  type={type}
                  value={value}
                  onChange={onChange}
                  required={required}
                  disabled={disabled}
                  min={min}
                  max={max}
                  placeholder={placeholder}
                  {...inputProps}
                />
              )
        )
      }

      {
        hint
        && (
          <small>
            {hint}
          </small>
        )
      }
    </label>
  );
}


function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="create-salarie-summary-item">
      <span>
        {label}
      </span>

      <strong>
        {
          value
          || "Non renseigné"
        }
      </strong>
    </div>
  );
}


export default function CreateSalarie() {
  const navigate =
    useNavigate();

  const [
    form,
    setForm,
  ] = useState(
    INITIAL_FORM
  );

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  const [
    onboardingMode,
    setOnboardingMode,
  ] = useState("INVITE");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    created,
    setCreated,
  ] = useState(null);

  const isPermanentContract =
    form.type_contrat
    === "CDI";

  const employeePreview =
    useMemo(
      () => {
        return (
          `${form.prenom} ${form.nom}`
            .trim()
          || "Nouveau salarié"
        );
      },
      [
        form.nom,
        form.prenom,
      ]
    );

  const progress =
    Math.round(
      (
        currentStep
        / STEPS.length
      )
      * 100
    );


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

    setError("");

    setForm(
      (current) => ({
        ...current,

        [name]:
          files
            ? files[0] || null
            : value,

        ...(
          name
          === "type_contrat"
          && value
          === "CDI"
            ? {
                date_fin_contrat:
                  "",
              }
            : {}
        ),
      })
    );
  };


  // =========================================================
  // VALIDATION
  // =========================================================

  const validateStep =
    (
      step = currentStep
    ) => {
      if (
        step === 1
      ) {
        if (
          !form.nom.trim()
        ) {
          return "Le nom est obligatoire.";
        }

        if (
          !form.prenom.trim()
        ) {
          return "Le prénom est obligatoire.";
        }

        if (
          !form.email_personnel.trim()
        ) {
          return "L’adresse e-mail personnelle est obligatoire.";
        }

        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
          !emailPattern.test(
            form.email_personnel.trim()
          )
        ) {
          return "L’adresse e-mail personnelle n’est pas valide.";
        }
      }

      if (
        step === 2
      ) {
        if (
          !form.poste.trim()
        ) {
          return "Le poste est obligatoire.";
        }

        if (
          !form.etablissement.trim()
        ) {
          return "L’établissement est obligatoire.";
        }

        if (
          !form.date_debut_contrat
        ) {
          return "La date de début du contrat est obligatoire.";
        }

        if (
          form.date_fin_contrat
          && form.date_fin_contrat
            < form.date_debut_contrat
        ) {
          return (
            "La date de fin ne peut pas être "
            + "antérieure à la date de début."
          );
        }
      }

      if (
        step === 3
        && onboardingMode
        === "RH"
      ) {
        if (
          form.piece_identite_date_emission
          && form.piece_identite_date_expiration
          && form.piece_identite_date_expiration
            < form.piece_identite_date_emission
        ) {
          return (
            "La date d’expiration de la pièce "
            + "d’identité est invalide."
          );
        }

        if (
          form.titre_sejour_date_emission
          && form.titre_sejour_date_expiration
          && form.titre_sejour_date_expiration
            < form.titre_sejour_date_emission
        ) {
          return (
            "La date d’expiration du titre "
            + "de séjour est invalide."
          );
        }
      }

      if (
        step === 4
        && form.password
        && form.password.length
          < 8
      ) {
        return (
          "Le mot de passe doit contenir "
          + "au moins 8 caractères."
        );
      }

      return "";
    };


  const validateForm = () => {
    for (
      let step = 1;
      step <= STEPS.length;
      step += 1
    ) {
      const validationError =
        validateStep(step);

      if (
        validationError
      ) {
        return {
          message:
            validationError,
          step,
        };
      }
    }

    return {
      message: "",
      step: 4,
    };
  };


  // =========================================================
  // NAVIGATION
  // =========================================================

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  const nextStep = () => {
    const validationError =
      validateStep(
        currentStep
      );

    if (
      validationError
    ) {
      setError(
        validationError
      );

      goToTop();
      return;
    }

    setError("");

    setCurrentStep(
      (step) =>
        Math.min(
          step + 1,
          STEPS.length
        )
    );

    goToTop();
  };


  const previousStep = () => {
    setError("");

    setCurrentStep(
      (step) =>
        Math.max(
          step - 1,
          1
        )
    );

    goToTop();
  };


  const goToStep = (
    step
  ) => {
    if (
      step > currentStep
    ) {
      return;
    }

    setError("");
    setCurrentStep(step);
    goToTop();
  };


  // =========================================================
  // PAYLOAD
  // =========================================================

  const buildPayload = () => {
    const payload = {
      nom:
        form.nom.trim(),

      prenom:
        form.prenom.trim(),

      email_personnel:
        form.email_personnel
          .trim()
          .toLowerCase(),

      telephone:
        form.telephone.trim(),

      date_naissance:
        form.date_naissance
        || null,

      nationalite:
        form.nationalite.trim(),

      poste:
        form.poste.trim(),

      etablissement:
        form.etablissement.trim(),

      type_contrat:
        form.type_contrat,

      date_debut_contrat:
        form.date_debut_contrat,

      date_fin_contrat:
        isPermanentContract
          ? null
          : (
              form.date_fin_contrat
              || null
            ),

      role:
        form.role,

      contact_urgence_nom:
        onboardingMode === "RH"
          ? form.contact_urgence_nom.trim()
          : "",

      contact_urgence_lien:
        onboardingMode === "RH"
          ? form.contact_urgence_lien.trim()
          : "",

      contact_urgence_telephone:
        onboardingMode === "RH"
          ? form.contact_urgence_telephone.trim()
          : "",

      adresse_data: {
        numero:
          onboardingMode === "RH"
            ? form.adresse_numero.trim()
            : "",

        voie:
          onboardingMode === "RH"
            ? form.adresse_voie.trim()
            : "",

        complement:
          onboardingMode === "RH"
            ? form.adresse_complement.trim()
            : "",

        code_postal:
          onboardingMode === "RH"
            ? form.adresse_code_postal.trim()
            : "",

        commune:
          onboardingMode === "RH"
            ? form.adresse_commune.trim()
            : "",

        pays:
          onboardingMode === "RH"
            ? (
                form.adresse_pays.trim()
                || "France"
              )
            : "",
      },

      iban_data: {
        iban:
          onboardingMode === "RH"
            ? form.iban.trim()
            : "",

        bic:
          onboardingMode === "RH"
            ? form.bic.trim()
            : "",

        titulaire:
          onboardingMode === "RH"
            ? form.titulaire.trim()
            : "",

        nom_banque:
          onboardingMode === "RH"
            ? form.nom_banque.trim()
            : "",
      },
    };

    if (
      form.username.trim()
    ) {
      payload.username =
        form.username.trim();
    }

    if (
      form.password
    ) {
      payload.password =
        form.password;
    }

    return payload;
  };


  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  const uploadDocument =
    async ({
      salarieId,
      typeDocument,
      titre,
      numero,
      dateEmission,
      dateExpiration,
      fichier,
    }) => {
      if (
        !salarieId
        || !fichier
      ) {
        return;
      }

      const documentData =
        new FormData();

      documentData.append(
        "salarie",
        salarieId
      );

      documentData.append(
        "type_document",
        typeDocument
      );

      documentData.append(
        "titre",
        titre
      );

      documentData.append(
        "fichier",
        fichier
      );

      if (
        numero
      ) {
        documentData.append(
          "numero",
          numero
        );
      }

      if (
        dateEmission
      ) {
        documentData.append(
          "date_emission",
          dateEmission
        );
      }

      if (
        dateExpiration
      ) {
        documentData.append(
          "date_expiration",
          dateExpiration
        );
      }

      await API.post(
        "/api/documents/",
        documentData
      );
    };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        currentStep
        !== STEPS.length
      ) {
        nextStep();
        return;
      }

      const validation =
        validateForm();

      if (
        validation.message
      ) {
        setError(
          validation.message
        );

        setCurrentStep(
          validation.step
        );

        goToTop();
        return;
      }

      setSaving(true);
      setError("");

      try {
        const response =
          await API.post(
            "/api/salaries/",
            buildPayload()
          );

        const responseData =
          response.data
          || {};

        const salarie =
          responseData.data
          || responseData;

        if (
          onboardingMode
          === "RH"
          && form.piece_identite_fichier
        ) {
          await uploadDocument({
            salarieId:
              salarie.id,

            typeDocument:
              form.piece_identite_type,

            titre:
              form.piece_identite_type
              === "PASSEPORT"
                ? "Passeport"
                : "Pièce d'identité",

            numero:
              form.piece_identite_numero,

            dateEmission:
              form.piece_identite_date_emission,

            dateExpiration:
              form.piece_identite_date_expiration,

            fichier:
              form.piece_identite_fichier,
          });
        }

        if (
          onboardingMode
          === "RH"
          && form.titre_sejour_fichier
        ) {
          await uploadDocument({
            salarieId:
              salarie.id,

            typeDocument:
              "TITRE_SEJOUR",

            titre:
              "Titre de séjour",

            numero:
              form.titre_sejour_numero,

            dateEmission:
              form.titre_sejour_date_emission,

            dateExpiration:
              form.titre_sejour_date_expiration,

            fichier:
              form.titre_sejour_fichier,
          });
        }

        setCreated({
          salarie,

          message:
            responseData.message
            || "Le salarié a bien été créé.",

          emailSent:
            responseData.email_envoye,

          onboardingMode,
        });
      } catch (
        requestError
      ) {
        console.error(
          "Création du salarié :",
          requestError
        );

        setError(
          getApiError(
            requestError
          )
        );
      } finally {
        setSaving(false);
      }
    };


  // =========================================================
  // RESET
  // =========================================================

  const createAnotherEmployee =
    () => {
      setForm(
        INITIAL_FORM
      );

      setCreated(null);
      setError("");
      setCurrentStep(1);
      setOnboardingMode("INVITE");
      goToTop();
    };


  // =========================================================
  // SUCCESS
  // =========================================================

  if (
    created
  ) {
    const salarie =
      created.salarie
      || {};

    const fullName =
      `${salarie.prenom || form.prenom} ${
        salarie.nom || form.nom
      }`.trim();

    return (
      <main className="create-salarie-page">
        <section className="create-salarie-success">
          <span className="create-salarie-success-icon">
            <CheckCircle2
              size={38}
            />
          </span>

          <p className="create-salarie-eyebrow">
            Création terminée
          </p>

          <h1>
            {fullName}
          </h1>

          <p className="create-salarie-success-message">
            {created.message}
          </p>

          <div className="create-salarie-result-grid">
            <div>
              <span>
                Matricule
              </span>

              <strong>
                {
                  salarie.matricule
                  || "Généré par le serveur"
                }
              </strong>
            </div>

            <div>
              <span>
                E-mail professionnel
              </span>

              <strong>
                {
                  salarie.email_pro
                  || "Généré par le serveur"
                }
              </strong>
            </div>

            <div>
              <span>
                Rôle
              </span>

              <strong>
                {
                  ROLE_LABELS[
                    salarie.role
                    || form.role
                  ]
                }
              </strong>
            </div>

            <div>
              <span>
                Onboarding
              </span>

              <strong>
                {
                  created.onboardingMode
                  === "INVITE"
                    ? "Invitation salarié"
                    : "Dossier complété par le RH"
                }
              </strong>
            </div>
          </div>

          {
            created.onboardingMode
            === "INVITE"
            && (
              <div className="create-salarie-success-note">
                <Mail
                  size={20}
                />

                <div>
                  <strong>
                    Invitation de connexion
                  </strong>

                  <p>
                    {
                      created.emailSent
                      === false
                        ? (
                            "Le compte a été créé, mais l’e-mail "
                            + "d’invitation n’a pas été envoyé."
                          )
                        : (
                            "Le compte a été créé et l’invitation "
                            + "de connexion a été envoyée."
                          )
                    }
                  </p>
                </div>
              </div>
            )
          }

          <div className="create-salarie-success-actions">
            <button
              type="button"
              className="create-salarie-secondary-button"
              onClick={
                createAnotherEmployee
              }
            >
              Créer un autre salarié
            </button>

            <button
              type="button"
              className="create-salarie-primary-button"
              onClick={() =>
                navigate(
                  "/admin/users"
                )
              }
            >
              Voir les salariés
            </button>
          </div>
        </section>
      </main>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="create-salarie-page">
      <header className="create-salarie-heading">
        <button
          type="button"
          className="create-salarie-back"
          onClick={() =>
            navigate(-1)
          }
          aria-label="Retour"
        >
          <ArrowLeft
            size={20}
          />
        </button>

        <div>
          <span className="create-salarie-eyebrow">
            Administration des salariés
          </span>

          <h1>
            Ajouter un salarié
          </h1>

          <p>
            Créez le profil professionnel puis choisissez
            comment compléter son dossier RH.
          </p>
        </div>

        <div className="create-salarie-preview">
          <UserRound
            size={19}
          />

          <span>
            {employeePreview}
          </span>
        </div>
      </header>


      {/* =====================================================
          STEPPER
      ===================================================== */}

      <section className="create-salarie-stepper-card create-salarie-stepper-card-compact">
        <div className="create-salarie-stepper-top">
          <div>
            <span>
              Étape {currentStep} sur {STEPS.length}
            </span>

            <strong>
              {
                STEPS[
                  currentStep - 1
                ].label
              }
            </strong>
          </div>

          <span className="create-salarie-progress-value">
            {progress} %
          </span>
        </div>

        <div className="create-salarie-progress">
          <span
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>

        <div className="create-salarie-stepper create-salarie-stepper-four">
          {
            STEPS.map(
              (step) => {
                const Icon =
                  step.icon;

                const completed =
                  step.id
                  < currentStep;

                const active =
                  step.id
                  === currentStep;

                return (
                  <button
                    key={
                      step.id
                    }
                    type="button"
                    className={[
                      "create-salarie-step",
                      active
                        ? "is-active"
                        : "",
                      completed
                        ? "is-completed"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      goToStep(
                        step.id
                      )
                    }
                    disabled={
                      step.id
                      > currentStep
                    }
                  >
                    <span className="create-salarie-step-icon">
                      {
                        completed
                          ? (
                              <Check
                                size={17}
                              />
                            )
                          : (
                              <Icon
                                size={17}
                              />
                            )
                      }
                    </span>

                    <span className="create-salarie-step-copy">
                      <small>
                        0{step.id}
                      </small>

                      <strong>
                        {step.label}
                      </strong>

                      <em>
                        {step.description}
                      </em>
                    </span>
                  </button>
                );
              }
            )
          }
        </div>
      </section>


      {
        error
        && (
          <div
            className="create-salarie-error"
            role="alert"
          >
            {error}
          </div>
        )
      }


      <form
        className="create-salarie-form create-salarie-form-wizard"
        onSubmit={
          handleSubmit
        }
      >

        {/* ===================================================
            ÉTAPE 1 — INFORMATIONS
        =================================================== */}

        {
          currentStep
          === 1
          && (
            <section className="create-salarie-card create-salarie-step-panel">
              <header className="create-salarie-card-heading">
                <span>
                  <UserRound
                    size={21}
                  />
                </span>

                <div>
                  <p className="create-salarie-section-kicker">
                    Étape 1
                  </p>

                  <h2>
                    Informations personnelles
                  </h2>

                  <p>
                    Commencez par les informations essentielles
                    permettant d’identifier le salarié.
                  </p>
                </div>
              </header>

              <div className="create-salarie-grid">
                <Field
                  label="Nom"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  autoComplete="family-name"
                  placeholder="Ex. Moukiana"
                  required
                />

                <Field
                  label="Prénom"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  autoComplete="given-name"
                  placeholder="Ex. Jordy"
                  required
                />

                <Field
                  label="E-mail personnel"
                  name="email_personnel"
                  type="email"
                  value={
                    form.email_personnel
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="email"
                  placeholder="prenom.nom@email.com"
                  required
                  hint="L’invitation de connexion pourra être envoyée à cette adresse."
                />

                <Field
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={
                    form.telephone
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="tel"
                  placeholder="06 00 00 00 00"
                />

                <Field
                  label="Date de naissance"
                  name="date_naissance"
                  type="date"
                  value={
                    form.date_naissance
                  }
                  onChange={
                    handleChange
                  }
                />

                <Field
                  label="Nationalité"
                  name="nationalite"
                  value={
                    form.nationalite
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ex. Congolaise"
                />
              </div>
            </section>
          )
        }


        {/* ===================================================
            ÉTAPE 2 — EMPLOI
        =================================================== */}

        {
          currentStep
          === 2
          && (
            <section className="create-salarie-card create-salarie-step-panel">
              <header className="create-salarie-card-heading">
                <span>
                  <BriefcaseBusiness
                    size={21}
                  />
                </span>

                <div>
                  <p className="create-salarie-section-kicker">
                    Étape 2
                  </p>

                  <h2>
                    Emploi et contrat
                  </h2>

                  <p>
                    Définissez l’affectation, le contrat
                    et les droits applicatifs du salarié.
                  </p>
                </div>
              </header>

              <div className="create-salarie-grid">
                <Field
                  label="Poste"
                  name="poste"
                  value={
                    form.poste
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ex. Comptable"
                  required
                />

                <Field
                  label="Établissement"
                  name="etablissement"
                  value={
                    form.etablissement
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Ex. Siège social"
                  required
                />

                <Field
                  label="Type de contrat"
                  required
                >
                  <select
                    name="type_contrat"
                    value={
                      form.type_contrat
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="CDI">
                      CDI
                    </option>

                    <option value="CDD">
                      CDD
                    </option>

                    <option value="VACATAIRE">
                      Vacataire
                    </option>

                    <option value="STAGIAIRE">
                      Stagiaire
                    </option>

                    <option value="ALTERNANT">
                      Alternant
                    </option>
                  </select>
                </Field>

                <Field
                  label="Rôle StaffHub"
                  required
                >
                  <select
                    name="role"
                    value={
                      form.role
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="SALARIE">
                      Salarié
                    </option>

                    <option value="RH">
                      Ressources humaines
                    </option>

                    <option value="ADMIN">
                      Administrateur
                    </option>
                  </select>
                </Field>

                <Field
                  label="Date de début"
                  name="date_debut_contrat"
                  type="date"
                  value={
                    form.date_debut_contrat
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                <Field
                  label="Date de fin"
                  name="date_fin_contrat"
                  type="date"
                  value={
                    form.date_fin_contrat
                  }
                  onChange={
                    handleChange
                  }
                  min={
                    form.date_debut_contrat
                    || undefined
                  }
                  disabled={
                    isPermanentContract
                  }
                  hint={
                    isPermanentContract
                      ? "Un CDI ne possède pas de date de fin."
                      : "Facultatif si la date n’est pas encore connue."
                  }
                />
              </div>
            </section>
          )
        }


        {/* ===================================================
            ÉTAPE 3 — ONBOARDING
        =================================================== */}

        {
          currentStep
          === 3
          && (
            <section className="create-salarie-card create-salarie-step-panel">
              <header className="create-salarie-card-heading">
                <span>
                  <Sparkles
                    size={21}
                  />
                </span>

                <div>
                  <p className="create-salarie-section-kicker">
                    Étape 3
                  </p>

                  <h2>
                    Choisir l’onboarding
                  </h2>

                  <p>
                    Choisissez qui complètera les informations
                    administratives du dossier.
                  </p>
                </div>
              </header>

              <div className="create-salarie-onboarding-options">
                <button
                  type="button"
                  className={[
                    "create-salarie-onboarding-card",
                    onboardingMode
                    === "INVITE"
                      ? "is-selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    setOnboardingMode(
                      "INVITE"
                    );
                    setError("");
                  }}
                >
                  <span className="create-salarie-onboarding-icon">
                    <Mail
                      size={24}
                    />
                  </span>

                  <span className="create-salarie-onboarding-content">
                    <span className="create-salarie-onboarding-title-row">
                      <strong>
                        Inviter le salarié
                      </strong>

                      <em>
                        Recommandé
                      </em>
                    </span>

                    <span>
                      Le compte StaffHub est créé et le salarié
                      reçoit son invitation de connexion.
                    </span>

                    <ul>
                      <li>
                        Adresse personnelle
                      </li>
                      <li>
                        Contact d’urgence
                      </li>
                      <li>
                        Coordonnées bancaires
                      </li>
                      <li>
                        Documents administratifs
                      </li>
                    </ul>
                  </span>

                  <span className="create-salarie-radio">
                    {
                      onboardingMode
                      === "INVITE"
                      && (
                        <Check
                          size={15}
                        />
                      )
                    }
                  </span>
                </button>


                <button
                  type="button"
                  className={[
                    "create-salarie-onboarding-card",
                    onboardingMode
                    === "RH"
                      ? "is-selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    setOnboardingMode(
                      "RH"
                    );
                    setError("");
                  }}
                >
                  <span className="create-salarie-onboarding-icon">
                    <UserRound
                      size={24}
                    />
                  </span>

                  <span className="create-salarie-onboarding-content">
                    <span className="create-salarie-onboarding-title-row">
                      <strong>
                        Compléter le dossier moi-même
                      </strong>
                    </span>

                    <span>
                      Le RH saisit immédiatement les informations
                      complémentaires avant la création.
                    </span>

                    <ul>
                      <li>
                        Adresse et contact d’urgence
                      </li>
                      <li>
                        RIB / coordonnées bancaires
                      </li>
                      <li>
                        Pièce d’identité
                      </li>
                      <li>
                        Titre de séjour
                      </li>
                    </ul>
                  </span>

                  <span className="create-salarie-radio">
                    {
                      onboardingMode
                      === "RH"
                      && (
                        <Check
                          size={15}
                        />
                      )
                    }
                  </span>
                </button>
              </div>


              {
                onboardingMode
                === "INVITE"
                  ? (
                      <div className="create-salarie-invite-panel">
                        <div className="create-salarie-invite-visual">
                          <Mail
                            size={27}
                          />
                        </div>

                        <div>
                          <h3>
                            Le salarié complètera son dossier
                          </h3>

                          <p>
                            StaffHub créera d’abord son compte avec les
                            informations professionnelles saisies.
                            L’invitation sera envoyée à :
                          </p>

                          <strong>
                            {
                              form.email_personnel
                              || "E-mail personnel non renseigné"
                            }
                          </strong>
                        </div>
                      </div>
                    )
                  : (
                      <div className="create-salarie-rh-onboarding">
                        <div className="create-salarie-subsection">
                          <div className="create-salarie-subsection-heading">
                            <MapPin
                              size={19}
                            />

                            <div>
                              <h3>
                                Adresse
                              </h3>

                              <p>
                                Adresse personnelle du salarié.
                              </p>
                            </div>
                          </div>

                          <div className="create-salarie-grid">
                            <Field
                              label="Numéro"
                              name="adresse_numero"
                              value={
                                form.adresse_numero
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Ex. 10"
                            />

                            <Field
                              label="Voie"
                              name="adresse_voie"
                              value={
                                form.adresse_voie
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Ex. rue de Paris"
                            />

                            <Field
                              label="Complément"
                              name="adresse_complement"
                              value={
                                form.adresse_complement
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Appartement, bâtiment..."
                            />

                            <Field
                              label="Code postal"
                              name="adresse_code_postal"
                              value={
                                form.adresse_code_postal
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="75017"
                            />

                            <Field
                              label="Commune"
                              name="adresse_commune"
                              value={
                                form.adresse_commune
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Paris"
                            />

                            <Field
                              label="Pays"
                              name="adresse_pays"
                              value={
                                form.adresse_pays
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="France"
                            />
                          </div>
                        </div>


                        <div className="create-salarie-subsection">
                          <div className="create-salarie-subsection-heading">
                            <UsersRound
                              size={19}
                            />

                            <div>
                              <h3>
                                Contact d’urgence
                              </h3>

                              <p>
                                Personne à joindre en cas d’urgence.
                              </p>
                            </div>
                          </div>

                          <div className="create-salarie-grid">
                            <Field
                              label="Nom complet"
                              name="contact_urgence_nom"
                              value={
                                form.contact_urgence_nom
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Ex. Jean Moukiana"
                            />

                            <Field
                              label="Lien"
                              name="contact_urgence_lien"
                              value={
                                form.contact_urgence_lien
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Ex. Père, conjoint..."
                            />

                            <Field
                              label="Téléphone"
                              name="contact_urgence_telephone"
                              type="tel"
                              value={
                                form.contact_urgence_telephone
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="06 00 00 00 00"
                            />
                          </div>
                        </div>


                        <div className="create-salarie-subsection">
                          <div className="create-salarie-subsection-heading">
                            <Banknote
                              size={19}
                            />

                            <div>
                              <h3>
                                Coordonnées bancaires
                              </h3>

                              <p>
                                Informations nécessaires au versement du salaire.
                              </p>
                            </div>
                          </div>

                          <div className="create-salarie-grid">
                            <Field
                              label="IBAN"
                              name="iban"
                              value={
                                form.iban
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="FR76..."
                            />

                            <Field
                              label="BIC"
                              name="bic"
                              value={
                                form.bic
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="AGRIFRPP"
                            />

                            <Field
                              label="Titulaire"
                              name="titulaire"
                              value={
                                form.titulaire
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Nom du titulaire"
                            />

                            <Field
                              label="Banque"
                              name="nom_banque"
                              value={
                                form.nom_banque
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Ex. LCL"
                            />
                          </div>
                        </div>


                        <div className="create-salarie-subsection">
                          <div className="create-salarie-subsection-heading">
                            <FileText
                              size={19}
                            />

                            <div>
                              <h3>
                                Documents administratifs
                              </h3>

                              <p>
                                Pièce d’identité et titre de séjour.
                              </p>
                            </div>
                          </div>

                          <div className="create-salarie-grid">
                            <Field
                              label="Type de pièce"
                            >
                              <select
                                name="piece_identite_type"
                                value={
                                  form.piece_identite_type
                                }
                                onChange={
                                  handleChange
                                }
                              >
                                <option value="CNI">
                                  Carte nationale d'identité
                                </option>

                                <option value="PASSEPORT">
                                  Passeport
                                </option>
                              </select>
                            </Field>

                            <Field
                              label="N° pièce d'identité"
                              name="piece_identite_numero"
                              value={
                                form.piece_identite_numero
                              }
                              onChange={
                                handleChange
                              }
                            />

                            <Field
                              label="Date d'émission"
                              name="piece_identite_date_emission"
                              type="date"
                              value={
                                form.piece_identite_date_emission
                              }
                              onChange={
                                handleChange
                              }
                            />

                            <Field
                              label="Date d'expiration"
                              name="piece_identite_date_expiration"
                              type="date"
                              value={
                                form.piece_identite_date_expiration
                              }
                              onChange={
                                handleChange
                              }
                            />

                            <Field
                              label="Fichier pièce d'identité"
                              name="piece_identite_fichier"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={
                                handleChange
                              }
                              hint={
                                form.piece_identite_fichier
                                  ? `Sélectionné : ${form.piece_identite_fichier.name}`
                                  : "PDF, JPG ou PNG."
                              }
                            />

                            <Field
                              label="N° titre de séjour"
                              name="titre_sejour_numero"
                              value={
                                form.titre_sejour_numero
                              }
                              onChange={
                                handleChange
                              }
                            />

                            <Field
                              label="Début de validité"
                              name="titre_sejour_date_emission"
                              type="date"
                              value={
                                form.titre_sejour_date_emission
                              }
                              onChange={
                                handleChange
                              }
                            />

                            <Field
                              label="Expiration du titre"
                              name="titre_sejour_date_expiration"
                              type="date"
                              value={
                                form.titre_sejour_date_expiration
                              }
                              onChange={
                                handleChange
                              }
                            />

                            <Field
                              label="Fichier titre de séjour"
                              name="titre_sejour_fichier"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={
                                handleChange
                              }
                              hint={
                                form.titre_sejour_fichier
                                  ? `Sélectionné : ${form.titre_sejour_fichier.name}`
                                  : "Facultatif si le salarié n'est pas concerné."
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
              }
            </section>
          )
        }


        {/* ===================================================
            ÉTAPE 4 — VÉRIFICATION
        =================================================== */}

        {
          currentStep
          === 4
          && (
            <div className="create-salarie-final-layout">
              <section className="create-salarie-card create-salarie-step-panel">
                <header className="create-salarie-card-heading">
                  <span>
                    <ShieldCheck
                      size={21}
                    />
                  </span>

                  <div>
                    <p className="create-salarie-section-kicker">
                      Étape 4
                    </p>

                    <h2>
                      Vérification
                    </h2>

                    <p>
                      Contrôlez les informations avant la création du compte.
                    </p>
                  </div>
                </header>


                <div className="create-salarie-review-hero">
                  <div className="create-salarie-review-avatar">
                    <UserRound
                      size={28}
                    />
                  </div>

                  <div>
                    <h3>
                      {employeePreview}
                    </h3>

                    <p>
                      {
                        form.poste
                        || "Poste non renseigné"
                      }
                      {" · "}
                      {
                        CONTRACT_LABELS[
                          form.type_contrat
                        ]
                      }
                    </p>
                  </div>

                  <span>
                    {
                      ROLE_LABELS[
                        form.role
                      ]
                    }
                  </span>
                </div>


                <div className="create-salarie-summary-section">
                  <div className="create-salarie-summary-heading">
                    <h3>
                      Informations
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStep(1)
                      }
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="create-salarie-summary-grid">
                    <SummaryItem
                      label="Nom complet"
                      value={
                        employeePreview
                      }
                    />

                    <SummaryItem
                      label="E-mail personnel"
                      value={
                        form.email_personnel
                      }
                    />

                    <SummaryItem
                      label="Téléphone"
                      value={
                        form.telephone
                      }
                    />

                    <SummaryItem
                      label="Nationalité"
                      value={
                        form.nationalite
                      }
                    />
                  </div>
                </div>


                <div className="create-salarie-summary-section">
                  <div className="create-salarie-summary-heading">
                    <h3>
                      Emploi
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStep(2)
                      }
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="create-salarie-summary-grid">
                    <SummaryItem
                      label="Poste"
                      value={
                        form.poste
                      }
                    />

                    <SummaryItem
                      label="Établissement"
                      value={
                        form.etablissement
                      }
                    />

                    <SummaryItem
                      label="Contrat"
                      value={
                        CONTRACT_LABELS[
                          form.type_contrat
                        ]
                      }
                    />

                    <SummaryItem
                      label="Début"
                      value={
                        form.date_debut_contrat
                      }
                    />
                  </div>
                </div>


                <div className="create-salarie-summary-section">
                  <div className="create-salarie-summary-heading">
                    <h3>
                      Onboarding
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStep(3)
                      }
                    >
                      Modifier
                    </button>
                  </div>

                  <div className="create-salarie-onboarding-summary">
                    {
                      onboardingMode
                      === "INVITE"
                        ? (
                            <>
                              <Mail
                                size={20}
                              />

                              <div>
                                <strong>
                                  Invitation salarié
                                </strong>

                                <p>
                                  Le salarié recevra son accès StaffHub
                                  et complètera son dossier.
                                </p>
                              </div>
                            </>
                          )
                        : (
                            <>
                              <CheckCircle2
                                size={20}
                              />

                              <div>
                                <strong>
                                  Dossier complété par le RH
                                </strong>

                                <p>
                                  Les informations administratives saisies
                                  seront enregistrées avec le profil.
                                </p>
                              </div>
                            </>
                          )
                    }
                  </div>
                </div>
              </section>


              <section className="create-salarie-card create-salarie-account-card">
                <header className="create-salarie-card-heading">
                  <span>
                    <Mail
                      size={21}
                    />
                  </span>

                  <div>
                    <h2>
                      Compte StaffHub
                    </h2>

                    <p>
                      Paramètres facultatifs du compte de connexion.
                    </p>
                  </div>
                </header>

                <div className="create-salarie-grid">
                  <Field
                    label="Nom d’utilisateur"
                    name="username"
                    value={
                      form.username
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="off"
                    placeholder="Laisser vide pour utiliser le matricule"
                    hint="Le matricule généré devient l'identifiant par défaut."
                  />

                  <Field
                    label="Mot de passe temporaire"
                    name="password"
                    type="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                    placeholder="Laisser vide pour génération automatique"
                    hint="Minimum 8 caractères si vous le renseignez."
                  />
                </div>

                <div className="create-salarie-account-note">
                  <CheckCircle2
                    size={18}
                  />

                  <p>
                    Le matricule et l’e-mail professionnel
                    sont générés automatiquement par Django.
                  </p>
                </div>
              </section>
            </div>
          )
        }


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <footer className="create-salarie-actions create-salarie-wizard-actions">
          <div>
            {
              currentStep
              === 1
                ? (
                    <button
                      type="button"
                      className="create-salarie-secondary-button"
                      onClick={() =>
                        navigate(-1)
                      }
                      disabled={
                        saving
                      }
                    >
                      Annuler
                    </button>
                  )
                : (
                    <button
                      type="button"
                      className="create-salarie-secondary-button"
                      onClick={
                        previousStep
                      }
                      disabled={
                        saving
                      }
                    >
                      <ArrowLeft
                        size={18}
                      />

                      Précédent
                    </button>
                  )
            }
          </div>

          <span className="create-salarie-action-step">
            Étape {currentStep} / {STEPS.length}
          </span>

          {
            currentStep
            < STEPS.length
              ? (
                  <button
                    type="button"
                    className="create-salarie-primary-button"
                    onClick={
                      nextStep
                    }
                    disabled={
                      saving
                    }
                  >
                    Suivant

                    <ArrowRight
                      size={18}
                    />
                  </button>
                )
              : (
                  <button
                    type="submit"
                    className="create-salarie-primary-button"
                    disabled={
                      saving
                    }
                  >
                    {
                      saving
                        ? (
                            <>
                              <Loader2
                                className="create-salarie-spinner"
                                size={18}
                              />

                              Création en cours...
                            </>
                          )
                        : (
                            <>
                              <Save
                                size={18}
                              />

                              Créer le salarié
                            </>
                          )
                    }
                  </button>
                )
          }
        </footer>
      </form>
    </main>
  );
}
