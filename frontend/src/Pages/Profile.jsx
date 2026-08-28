import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  UserRound,
  UsersRound,
} from "lucide-react";

import API from "../Services/api";

import "../Styles/profile.css";


const TABS = [
  {
    id: "personal",
    label: "Informations personnelles",
  },
  {
    id: "work",
    label: "Emploi",
  },
  {
    id: "contact",
    label: "Coordonnées",
  },
  {
    id: "documents",
    label: "Documents",
  },
];


const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email_personnel: "",
  telephone: "",
  date_naissance: "",
  nationalite: "",
  contact_urgence_nom: "",
  contact_urgence_lien: "",
  contact_urgence_telephone: "",
};


export default function Profile() {
  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState(
    EMPTY_FORM
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "personal"
  );

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  // =========================================================
  // CHARGEMENT PROFIL
  // =========================================================

  useEffect(() => {
    const fetchProfile =
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await API.get(
              "/api/me/"
            );

          const data =
            response.data?.data
            || response.data;

          setProfile(
            data
          );

          setFormData(
            toFormData(
              data
            )
          );

        } catch (err) {
          console.error(
            "PROFILE ERROR",
            err
          );

          setError(
            err.response
              ?.data
              ?.detail
            || (
              "Impossible de "
              + "charger votre profil."
            )
          );

        } finally {
          setLoading(false);
        }
      };


    fetchProfile();
  }, []);


  // =========================================================
  // COMPLETION DOSSIER
  // =========================================================

  const completion =
    useMemo(
      () => {
        if (!profile) {
          return 0;
        }


        const values = [
          profile.nom,
          profile.prenom,
          profile.date_naissance,
          profile.email_personnel,
          profile.telephone,
          profile.nationalite,

          profile.poste,
          profile.etablissement,
          profile.matricule,

          addressLabel(
            profile
          )
          !== "Non renseignée"
            ? true
            : null,

          profile
            .coordonnees_bancaires
            ?.iban_masque
            || null,

          profile
            .contact_urgence
            ?.nom
            || null,

          getIdentityDocument(
            profile
          )
            ? true
            : null,
        ];


        return Math.round(
          (
            values.filter(
              Boolean
            ).length
            / values.length
          )
          * 100
        );
      },
      [profile]
    );


  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange =
    (
      event
    ) => {
      const {
        name,
        value,
      } = event.target;


      setFormData(
        (
          previous
        ) => ({
          ...previous,
          [name]:
            value,
        })
      );
    };


  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel =
    () => {
      setFormData(
        toFormData(
          profile
        )
      );

      setMessage("");
      setError("");
      setIsEditing(false);
    };


  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setSaving(true);
      setMessage("");
      setError("");


      try {
        const response =
          await API.patch(
            "/api/me/",
            {
              ...formData,

              date_naissance:
                formData
                  .date_naissance
                || null,
            }
          );


        const updated =
          response.data?.data
          || response.data;


        setProfile(
          updated
        );


        setFormData(
          toFormData(
            updated
          )
        );


        setMessage(
          response.data?.message
          || (
            "Profil mis à jour "
            + "avec succès."
          )
        );


        setIsEditing(false);

      } catch (err) {
        console.error(
          "PROFILE UPDATE ERROR",
          err
        );

        setError(
          readApiError(
            err.response?.data
          )
        );

      } finally {
        setSaving(false);
      }
    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="profile-loading">
        Chargement du profil...
      </div>
    );
  }


  if (!profile) {
    return (
      <div className="profile-page">

        <div className="profile-message profile-message-error">
          {
            error
            || "Profil introuvable."
          }
        </div>

      </div>
    );
  }


  // =========================================================
  // DONNEES
  // =========================================================

  const fullName =
    `${profile.prenom || ""} ${
      profile.nom || ""
    }`.trim();


  const initials =
    (
      `${profile.prenom?.[0] || ""}`
      + `${profile.nom?.[0] || ""}`
    ).toUpperCase()
    || "U";


  const photo =
    profile.photo
    || profile.photo_profil
    || profile.avatar;


  const active =
    profile.actif !== false
    && profile.is_active !== false;


  const identityDocument =
    getIdentityDocument(
      profile
    );


  const residenceDocument =
    getResidenceDocument(
      profile
    );


  const bank =
    profile
      .coordonnees_bancaires
    || null;


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="profile-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="profile-page-heading">

        <div>

          <h1>
            Mon profil
          </h1>

          <p>
            Consultez et mettez à jour
            vos informations personnelles
          </p>

        </div>

      </header>


      {
        message
        && (
          <div className="profile-message profile-message-success">
            {message}
          </div>
        )
      }


      {
        error
        && (
          <div className="profile-message profile-message-error">
            {error}
          </div>
        )
      }


      {/* =====================================================
          IDENTITE PRINCIPALE
      ===================================================== */}

      <section className="profile-identity-card">

        <div className="profile-avatar">

          {
            photo
              ? (
                <img
                  src={photo}
                  alt={fullName}
                />
              )
              : (
                <span>
                  {initials}
                </span>
              )
          }

        </div>


        <div className="profile-identity-main">

          <h2>
            {
              fullName
              || profile.username
            }
          </h2>


          <p>
            {
              profile.poste
              || "Poste non renseigné"
            }
          </p>


          <div className="profile-badges">

            <span className="profile-contract-badge">
              {
                contractLabel(
                  profile.type_contrat
                )
              }
            </span>


            <span
              className={
                `profile-active-badge ${
                  !active
                    ? "is-inactive"
                    : ""
                }`
              }
            >
              <i />

              {
                active
                  ? "Actif"
                  : "Inactif"
              }
            </span>

          </div>


          <div className="profile-key-data">

            <div>

              <span>
                Numéro employé
              </span>

              <strong>
                {
                  profile.matricule
                  || "Non renseigné"
                }
              </strong>

            </div>


            <div>

              <span>
                Établissement
              </span>

              <strong>
                {
                  profile.etablissement
                  || "Non renseigné"
                }
              </strong>

            </div>

          </div>

        </div>


        <div className="profile-completion">

          <div className="profile-completion-heading">

            <strong>
              Dossier complété à{" "}
              {completion} %
            </strong>

            <CheckCircle2
              size={18}
            />

          </div>


          <div
            className="profile-progress"
            aria-label={
              `Dossier complété à ${completion} %`
            }
          >

            <span
              style={{
                width:
                  `${completion}%`,
              }}
            />

          </div>


          {
            !isEditing
            && (
              <button
                className="profile-primary-button"
                type="button"
                onClick={() =>
                  setIsEditing(
                    true
                  )
                }
              >
                <Pencil
                  size={17}
                />

                Modifier mes informations
              </button>
            )
          }

        </div>

      </section>


      {/* =====================================================
          DETAILS
      ===================================================== */}

      <section className="profile-details-card">

        <nav
          className="profile-tabs"
          aria-label="Rubriques du profil"
        >

          {
            TABS.map(
              (tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={
                    activeTab
                    === tab.id
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                >
                  {tab.label}
                </button>
              )
            )
          }

        </nav>


        <form
          onSubmit={
            handleSubmit
          }
        >

          {/* =================================================
              INFORMATIONS PERSONNELLES
          ================================================= */}

          {
            activeTab
            === "personal"
            && (
              <div className="profile-card-grid">

                <InfoCard
                  icon={UserRound}
                  title="État civil"
                >

                  <EditableRow
                    label="Nom"
                    name="nom"
                    value={
                      formData.nom
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Prénom"
                    name="prenom"
                    value={
                      formData.prenom
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Date de naissance"
                    name="date_naissance"
                    type="date"
                    value={
                      formData
                        .date_naissance
                    }
                    display={
                      formatDate(
                        profile
                          .date_naissance
                      )
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Nationalité"
                    name="nationalite"
                    value={
                      formData.nationalite
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />

                </InfoCard>


                <InfoCard
                  icon={Mail}
                  title="Coordonnées"
                >

                  <EditableRow
                    label="Adresse e-mail"
                    name="email_personnel"
                    type="email"
                    value={
                      formData
                        .email_personnel
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Téléphone"
                    name="telephone"
                    type="tel"
                    value={
                      formData.telephone
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <DataRow
                    label="Adresse"
                    value={
                      addressLabel(
                        profile
                      )
                    }
                  />

                </InfoCard>


                <InfoCard
                  icon={Phone}
                  title="Contact d’urgence"
                >

                  <EditableRow
                    label="Nom"
                    name="contact_urgence_nom"
                    value={
                      formData
                        .contact_urgence_nom
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Lien"
                    name="contact_urgence_lien"
                    value={
                      formData
                        .contact_urgence_lien
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Téléphone"
                    name="contact_urgence_telephone"
                    type="tel"
                    value={
                      formData
                        .contact_urgence_telephone
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />

                </InfoCard>


                <DocumentAlert
                  profile={
                    profile
                  }
                />

              </div>
            )
          }


          {/* =================================================
              EMPLOI
          ================================================= */}

          {
            activeTab
            === "work"
            && (
              <div className="profile-card-grid">

                <InfoCard
                  icon={
                    BriefcaseBusiness
                  }
                  title="Informations professionnelles"
                >

                  <DataRow
                    label="Poste"
                    value={
                      profile.poste
                    }
                  />


                  <DataRow
                    label="Rôle"
                    value={
                      roleLabel(
                        profile.role
                      )
                    }
                  />


                  <DataRow
                    label="Type de contrat"
                    value={
                      contractLabel(
                        profile
                          .type_contrat
                      )
                    }
                  />


                  <DataRow
                    label="Établissement"
                    value={
                      profile
                        .etablissement
                    }
                  />

                </InfoCard>


                <InfoCard
                  icon={FileText}
                  title="Contrat"
                >

                  <DataRow
                    label="Date de début"
                    value={
                      formatDate(
                        profile
                          .date_debut_contrat
                      )
                    }
                  />


                  <DataRow
                    label="Date de fin"
                    value={
                      profile
                        .date_fin_contrat
                        ? formatDate(
                            profile
                              .date_fin_contrat
                          )
                        : "Aucune"
                    }
                  />


                  <DataRow
                    label="Matricule"
                    value={
                      profile.matricule
                    }
                  />


                  <DataRow
                    label="Identifiant"
                    value={
                      profile.username
                    }
                  />

                </InfoCard>

              </div>
            )
          }


          {/* =================================================
              COORDONNEES
          ================================================= */}

          {
            activeTab
            === "contact"
            && (
              <div className="profile-card-grid">

                <InfoCard
                  icon={MapPin}
                  title="Adresse et communication"
                >

                  <DataRow
                    label="Adresse"
                    value={
                      addressLabel(
                        profile
                      )
                    }
                  />


                  <DataRow
                    label="E-mail professionnel"
                    value={
                      profile.email_pro
                    }
                  />


                  <EditableRow
                    label="E-mail personnel"
                    name="email_personnel"
                    type="email"
                    value={
                      formData
                        .email_personnel
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Téléphone"
                    name="telephone"
                    type="tel"
                    value={
                      formData.telephone
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />

                </InfoCard>


                <InfoCard
                  icon={UsersRound}
                  title="Contact d’urgence"
                >

                  <EditableRow
                    label="Nom"
                    name="contact_urgence_nom"
                    value={
                      formData
                        .contact_urgence_nom
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Lien"
                    name="contact_urgence_lien"
                    value={
                      formData
                        .contact_urgence_lien
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />


                  <EditableRow
                    label="Téléphone"
                    name="contact_urgence_telephone"
                    type="tel"
                    value={
                      formData
                        .contact_urgence_telephone
                    }
                    editing={
                      isEditing
                    }
                    onChange={
                      handleChange
                    }
                  />

                </InfoCard>


                <InfoCard
                  icon={FileText}
                  title="Coordonnées bancaires"
                >

                  <DataRow
                    label="IBAN"
                    value={
                      bank?.iban_masque
                    }
                  />


                  <DataRow
                    label="BIC"
                    value={
                      bank?.bic
                    }
                  />


                  <DataRow
                    label="Titulaire"
                    value={
                      bank?.titulaire
                    }
                  />


                  <DataRow
                    label="Banque"
                    value={
                      bank?.nom_banque
                    }
                  />

                </InfoCard>

              </div>
            )
          }


          {/* =================================================
              DOCUMENTS
          ================================================= */}

          {
            activeTab
            === "documents"
            && (
              <div className="profile-card-grid">

                <InfoCard
                  icon={FileText}
                  title="Documents administratifs"
                >

                  <DataRow
                    label="Pièce d’identité"
                    value={
                      identityDocument
                        ? documentStatus(
                            identityDocument
                          )
                        : "Non renseignée"
                    }
                  />


                  <DataRow
                    label="N° pièce"
                    value={
                      identityDocument
                        ?.numero
                    }
                  />


                  <DataRow
                    label="Expiration pièce"
                    value={
                      identityDocument
                        ?.date_expiration
                        ? formatDate(
                            identityDocument
                              .date_expiration
                          )
                        : "Non renseignée"
                    }
                  />


                  <DataRow
                    label="Titre de séjour"
                    value={
                      residenceDocument
                        ? documentStatus(
                            residenceDocument
                          )
                        : "Non renseigné"
                    }
                  />


                  <DataRow
                    label="N° titre de séjour"
                    value={
                      residenceDocument
                        ?.numero
                    }
                  />


                  <DataRow
                    label="Expiration du titre"
                    value={
                      residenceDocument
                        ?.date_expiration
                        ? formatDate(
                            residenceDocument
                              .date_expiration
                          )
                        : "Non renseignée"
                    }
                  />


                  <DataRow
                    label="RIB / IBAN"
                    value={
                      bank?.iban_masque
                        ? "Enregistré"
                        : "Non renseigné"
                    }
                  />

                </InfoCard>


                <DocumentAlert
                  profile={
                    profile
                  }
                />

              </div>
            )
          }


          {/* =================================================
              ACTIONS EDITION
          ================================================= */}

          {
            isEditing
            && (
              <div className="profile-form-actions">

                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={
                    handleCancel
                  }
                  disabled={
                    saving
                  }
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={
                    saving
                  }
                >
                  {
                    saving
                      ? "Enregistrement..."
                      : "Enregistrer les modifications"
                  }
                </button>

              </div>
            )
          }

        </form>

      </section>

    </div>
  );
}


// ===========================================================
// INFO CARD
// ===========================================================

function InfoCard({
  icon: Icon,
  title,
  children,
}) {
  return (
    <article className="profile-info-card">

      <header>

        <span>
          <Icon size={22} />
        </span>

        <h3>
          {title}
        </h3>

      </header>


      <div>
        {children}
      </div>

    </article>
  );
}


// ===========================================================
// DATA ROW
// ===========================================================

function DataRow({
  label,
  value,
}) {
  return (
    <div className="profile-data-row">

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


// ===========================================================
// EDITABLE ROW
// ===========================================================

function EditableRow({
  label,
  name,
  type = "text",
  value,
  display,
  editing,
  onChange,
}) {
  if (!editing) {
    return (
      <DataRow
        label={label}
        value={
          display
          || value
        }
      />
    );
  }


  return (
    <label className="profile-edit-row">

      <span>
        {label}
      </span>

      <input
        name={name}
        type={type}
        value={
          value
          || ""
        }
        onChange={
          onChange
        }
      />

    </label>
  );
}


// ===========================================================
// DOCUMENT ALERT
// ===========================================================

function DocumentAlert({
  profile,
}) {
  const document =
    getClosestExpiringDocument(
      profile
    );


  if (!document) {
    return (
      <article className="profile-document-alert is-clear">

        <header>

          <CheckCircle2
            size={25}
          />

          <h3>
            Documents à jour
          </h3>

        </header>


        <p>
          Aucun document administratif
          arrivant prochainement à expiration.
        </p>

      </article>
    );
  }


  const days =
    getDaysRemaining(
      document
        .date_expiration
    );


  const expired =
    days < 0;


  return (
    <article className="profile-document-alert">

      <header>

        <AlertTriangle
          size={25}
        />

        <h3>
          {
            expired
              ? "Document expiré"
              : "Document à renouveler"
          }
        </h3>

      </header>


      <p>
        {
          document
            .type_document_display
          || document.titre
          || "Document"
        }
        {" — "}

        {
          expired
            ? (
              `expiré depuis ${
                Math.abs(days)
              } jour${
                Math.abs(days) > 1
                  ? "s"
                  : ""
              }`
            )
            : (
              `expire dans ${days} jour${
                days > 1
                  ? "s"
                  : ""
              }`
            )
        }
      </p>

    </article>
  );
}


// ===========================================================
// FORM DATA
// ===========================================================

function toFormData(
  data = {}
) {
  return {
    nom:
      data.nom
      || "",

    prenom:
      data.prenom
      || "",

    email_personnel:
      data.email_personnel
      || "",

    telephone:
      data.telephone
      || "",

    date_naissance:
      data.date_naissance
      || "",

    nationalite:
      data.nationalite
      || "",

    contact_urgence_nom:
      data.contact_urgence_nom
      || data.contact_urgence?.nom
      || "",

    contact_urgence_lien:
      data.contact_urgence_lien
      || data.contact_urgence?.lien
      || "",

    contact_urgence_telephone:
      data.contact_urgence_telephone
      || data.contact_urgence
        ?.telephone
      || "",
  };
}


// ===========================================================
// API ERROR
// ===========================================================

function readApiError(
  data
) {
  if (!data) {
    return (
      "Impossible de modifier "
      + "le profil."
    );
  }


  if (
    typeof data
    === "string"
  ) {
    return data;
  }


  if (
    data.detail
  ) {
    return data.detail;
  }


  const first =
    Object.values(
      data
    )[0];


  if (
    Array.isArray(
      first
    )
  ) {
    return (
      first[0]
      || "Erreur."
    );
  }


  if (
    typeof first
    === "string"
  ) {
    return first;
  }


  return (
    "Impossible de modifier "
    + "le profil."
  );
}


// ===========================================================
// DATE
// ===========================================================

function formatDate(
  value
) {
  if (!value) {
    return "Non renseignée";
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  return Number.isNaN(
    date.getTime()
  )
    ? "Non renseignée"
    : date.toLocaleDateString(
        "fr-FR"
      );
}


// ===========================================================
// CONTRAT
// ===========================================================

function contractLabel(
  value
) {
  return (
    {
      CDI:
        "CDI",

      CDD:
        "CDD",

      VACATAIRE:
        "Vacataire",

      STAGIAIRE:
        "Stagiaire",

      ALTERNANT:
        "Alternant",
    }[value]
    || value
    || "Contrat non renseigné"
  );
}


// ===========================================================
// ROLE
// ===========================================================

function roleLabel(
  value
) {
  return (
    {
      SALARIE:
        "Salarié",

      RH:
        "Ressources humaines",

      ADMIN:
        "Administrateur",
    }[value]
    || value
    || "Salarié"
  );
}


// ===========================================================
// ADRESSE
// ===========================================================

function addressLabel(
  profile
) {
  const address =
    profile?.adresse;


  if (!address) {
    return "Non renseignée";
  }


  const street = [
    address.numero,
    address.voie,
  ]
    .filter(Boolean)
    .join(" ");


  const city = [
    address.code_postal,
    address.commune,
  ]
    .filter(Boolean)
    .join(" ");


  return [
    street,
    address.complement,
    city,
    address.pays,
  ]
    .filter(Boolean)
    .join(", ")
    || "Non renseignée";
}


// ===========================================================
// DOCUMENTS
// ===========================================================

function getDocuments(
  profile
) {
  return Array.isArray(
    profile?.documents
  )
    ? profile.documents
    : [];
}


function getIdentityDocument(
  profile
) {
  return getDocuments(
    profile
  ).find(
    (document) =>
      [
        "CNI",
        "PASSEPORT",
      ].includes(
        document
          .type_document
      )
  ) || null;
}


function getResidenceDocument(
  profile
) {
  return getDocuments(
    profile
  ).find(
    (document) =>
      document
        .type_document
      === "TITRE_SEJOUR"
  ) || null;
}


function documentStatus(
  document
) {
  if (!document) {
    return "Non renseigné";
  }


  if (
    document.est_expire
  ) {
    return "Expiré";
  }


  return "Enregistré";
}


// ===========================================================
// DOCUMENT EXPIRATION
// ===========================================================

function getClosestExpiringDocument(
  profile
) {
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const candidates =
    getDocuments(
      profile
    )
      .filter(
        (document) =>
          document
            .date_expiration
      )
      .map(
        (document) => ({
          ...document,

          days:
            getDaysRemaining(
              document
                .date_expiration
            ),
        })
      )
      .filter(
        (document) =>
          document.days
          <= 90
      )
      .sort(
        (a, b) =>
          a.days - b.days
      );


  return (
    candidates[0]
    || null
  );
}


function getDaysRemaining(
  value
) {
  if (!value) {
    return Infinity;
  }


  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );


  const expiration =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      expiration.getTime()
    )
  ) {
    return Infinity;
  }


  return Math.ceil(
    (
      expiration.getTime()
      - today.getTime()
    )
    / (
      1000
      * 60
      * 60
      * 24
    )
  );
}
