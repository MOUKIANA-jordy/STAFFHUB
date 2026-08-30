import React, {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../Services/api";

import "../Styles/create-salarie.css";


const INITIAL_FORM = {
  // =========================================================
  // IDENTITE
  // =========================================================

  nom: "",
  prenom: "",
  email_personnel: "",
  telephone: "",
  date_naissance: "",
  nationalite: "",

  // =========================================================
  // EMPLOI
  // =========================================================

  poste: "",
  etablissement: "",
  type_contrat: "CDI",
  date_debut_contrat: "",
  date_fin_contrat: "",
  role: "SALARIE",

  // =========================================================
  // COMPTE
  // =========================================================

  username: "",
  password: "",

  // =========================================================
  // ADRESSE
  // =========================================================

  adresse_numero: "",
  adresse_voie: "",
  adresse_complement: "",
  adresse_code_postal: "",
  adresse_commune: "",
  adresse_pays: "France",

  // =========================================================
  // CONTACT URGENCE
  // =========================================================

  contact_urgence_nom: "",
  contact_urgence_lien: "",
  contact_urgence_telephone: "",

  // =========================================================
  // BANQUE
  // =========================================================

  iban: "",
  bic: "",
  titulaire: "",
  nom_banque: "",

  // =========================================================
  // DOCUMENTS
  // =========================================================

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
          <input
            name={name}
            required={required}
            {...inputProps}
          />
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

  const validateForm = () => {
    const requiredFields = [
      [
        "nom",
        "Le nom",
      ],
      [
        "prenom",
        "Le prénom",
      ],
      [
        "email_personnel",
        "L’adresse e-mail personnelle",
      ],
      [
        "poste",
        "Le poste",
      ],
      [
        "etablissement",
        "L’établissement",
      ],
      [
        "date_debut_contrat",
        "La date de début du contrat",
      ],
    ];


    const missingField =
      requiredFields.find(
        ([name]) => {
          return !String(
            form[name]
            || ""
          ).trim();
        }
      );


    if (missingField) {
      return (
        `${missingField[1]} `
        + "est obligatoire."
      );
    }


    if (
      form.date_fin_contrat
      && form.date_fin_contrat
        < form.date_debut_contrat
    ) {
      return (
        "La date de fin ne peut pas "
        + "être antérieure à la date "
        + "de début."
      );
    }


    if (
      form.password
      && form.password.length < 8
    ) {
      return (
        "Le mot de passe doit "
        + "contenir au moins "
        + "8 caractères."
      );
    }


    if (
      form.piece_identite_date_emission
      && form.piece_identite_date_expiration
      && form.piece_identite_date_expiration
        < form.piece_identite_date_emission
    ) {
      return (
        "La date d’expiration de la "
        + "pièce d’identité est invalide."
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


    return "";
  };


  // =========================================================
  // PAYLOAD
  // =========================================================

  const buildPayload = () => {
    const payload = {
      // Salarie
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

      // Contact urgence
      contact_urgence_nom:
        form.contact_urgence_nom.trim(),

      contact_urgence_lien:
        form.contact_urgence_lien.trim(),

      contact_urgence_telephone:
        form.contact_urgence_telephone
          .trim(),

      // Données liées
      adresse_data: {
        numero:
          form.adresse_numero.trim(),

        voie:
          form.adresse_voie.trim(),

        complement:
          form.adresse_complement.trim(),

        code_postal:
          form.adresse_code_postal.trim(),

        commune:
          form.adresse_commune.trim(),

        pays:
          form.adresse_pays.trim()
          || "France",
      },

      iban_data: {
        iban:
          form.iban.trim(),

        bic:
          form.bic.trim(),

        titulaire:
          form.titulaire.trim(),

        nom_banque:
          form.nom_banque.trim(),
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


      const validationError =
        validateForm();


      if (
        validationError
      ) {
        setError(
          validationError
        );

        return;
      }


      setSaving(true);
      setError("");


      try {
        // -----------------------------------------------------
        // SALARIE
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // PIECE IDENTITE
        // -----------------------------------------------------

        if (
          form.piece_identite_fichier
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


        // -----------------------------------------------------
        // TITRE DE SEJOUR
        // Temporairement AUTRE tant que le backend
        // n'a pas encore TITRE_SEJOUR.
        // -----------------------------------------------------

        if (
          form.titre_sejour_fichier
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


        // -----------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------

        setCreated({
          salarie,

          message:
            responseData.message
            || "Le salarié a bien été créé.",

          emailSent:
            responseData.email_envoye,
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
  // NOUVEAU SALARIE
  // =========================================================

  const createAnotherEmployee =
    () => {
      setForm(
        INITIAL_FORM
      );

      setCreated(null);
      setError("");


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
                Invitation
              </span>

              <strong>
                {
                  created.emailSent
                  === false
                    ? (
                      "Compte créé, "
                      + "e-mail non envoyé"
                    )
                    : (
                      "E-mail de connexion "
                      + "envoyé"
                    )
                }
              </strong>
            </div>

          </div>


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

      {/* =====================================================
          HEADER
      ===================================================== */}

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
            Créer un salarié
          </h1>


          <p>
            Créez son dossier RH et son compte
            de connexion.
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
        className="create-salarie-form"
        onSubmit={
          handleSubmit
        }
      >

        {/* ===================================================
            IDENTITE
        =================================================== */}

        <section className="create-salarie-card">

          <header className="create-salarie-card-heading">

            <span>
              <UserRound
                size={21}
              />
            </span>


            <div>
              <h2>
                Identité et coordonnées
              </h2>

              <p>
                Informations personnelles principales.
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


        {/* ===================================================
            ADRESSE
        =================================================== */}

        <section className="create-salarie-card">

          <header className="create-salarie-card-heading">

            <span>
              <MapPin
                size={21}
              />
            </span>


            <div>
              <h2>
                Adresse
              </h2>

              <p>
                Adresse personnelle du salarié.
              </p>
            </div>

          </header>


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

        </section>


        {/* ===================================================
            CONTACT URGENCE
        =================================================== */}

        <section className="create-salarie-card">

          <header className="create-salarie-card-heading">

            <span>
              <UsersRound
                size={21}
              />
            </span>


            <div>
              <h2>
                Contact d'urgence
              </h2>

              <p>
                Personne à contacter en cas d'urgence.
              </p>
            </div>

          </header>


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

        </section>


        {/* ===================================================
            BANQUE
        =================================================== */}

        <section className="create-salarie-card">

          <header className="create-salarie-card-heading">

            <span>
              <Banknote
                size={21}
              />
            </span>


            <div>
              <h2>
                Coordonnées bancaires
              </h2>

              <p>
                RIB et informations de versement du salaire.
              </p>
            </div>

          </header>


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

        </section>


        {/* ===================================================
            DOCUMENTS
        =================================================== */}

        <section className="create-salarie-card">

          <header className="create-salarie-card-heading">

            <span>
              <FileText
                size={21}
              />
            </span>


            <div>
              <h2>
                Documents administratifs
              </h2>

              <p>
                Pièce d'identité et titre de séjour.
              </p>
            </div>

          </header>


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
              hint="PDF, JPG ou PNG."
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
              hint="Facultatif si le salarié n'est pas concerné."
            />

          </div>

        </section>


        {/* ===================================================
            EMPLOI
        =================================================== */}

        <section className="create-salarie-card">

          <header className="create-salarie-card-heading">

            <span>
              <BriefcaseBusiness
                size={21}
              />
            </span>


            <div>
              <h2>
                Emploi et contrat
              </h2>

              <p>
                Affectation, droits applicatifs et durée du contrat.
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
              label="Rôle applicatif"
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
              label="Début du contrat"
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
              label="Fin du contrat"
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
                  ? (
                    "Un CDI ne possède pas "
                    + "de date de fin."
                  )
                  : (
                    "À renseigner si elle "
                    + "est connue."
                  )
              }
            />

          </div>

        </section>


        {/* ===================================================
            COMPTE
        =================================================== */}

        <section className="create-salarie-card">

          <header className="create-salarie-card-heading">

            <span>
              <ShieldCheck
                size={21}
              />
            </span>


            <div>
              <h2>
                Compte de connexion
              </h2>

              <p>
                Ces champs sont facultatifs :
                le serveur peut les générer.
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
              hint="Minimum 8 caractères."
            />

          </div>


          <div className="create-salarie-account-note">

            <Mail
              size={18}
            />

            <p>
              L'e-mail professionnel et le matricule
              sont générés automatiquement par Django.
            </p>

          </div>

        </section>


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <footer className="create-salarie-actions">

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

        </footer>

      </form>

    </main>
  );
}
