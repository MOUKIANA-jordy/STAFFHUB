import React, {
  useEffect,
  useState,
} from "react";

import API from "../Services/api";

import "../Styles/profile.css";


export default function Profile() {

  // =========================================================
  // STATES
  // =========================================================

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email_personnel: "",
    telephone: "",
    date_naissance: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");


  // =========================================================
  // CHARGEMENT DU PROFIL
  // =========================================================

  useEffect(() => {

    const fetchProfile = async () => {

      setLoading(true);
      setError("");

      try {

        const response = await API.get(
          "/api/me/"
        );

        const data = response.data;

        setProfile(data);

        setFormData({
          nom:
            data.nom || "",

          prenom:
            data.prenom || "",

          email_personnel:
            data.email_personnel || "",

          telephone:
            data.telephone || "",

          date_naissance:
            data.date_naissance || "",
        });

      } catch (err) {

        console.error(
          "PROFILE ERROR",
          err
        );

        setError(
          err.response?.data?.detail
          || "Impossible de charger votre profil."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchProfile();

  }, []);


  // =========================================================
  // CHANGEMENT DES CHAMPS
  // =========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

  };


  // =========================================================
  // ANNULER
  // =========================================================

  const handleCancel = () => {

    if (!profile) {
      return;
    }

    setFormData({
      nom:
        profile.nom || "",

      prenom:
        profile.prenom || "",

      email_personnel:
        profile.email_personnel || "",

      telephone:
        profile.telephone || "",

      date_naissance:
        profile.date_naissance || "",
    });

    setMessage("");
    setError("");

    setIsEditing(false);

  };


  // =========================================================
  // ENREGISTRER
  // =========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {

      const response = await API.patch(
        "/api/me/",
        {
          nom:
            formData.nom,

          prenom:
            formData.prenom,

          email_personnel:
            formData.email_personnel,

          telephone:
            formData.telephone,

          date_naissance:
            formData.date_naissance || null,
        }
      );

      const updatedProfile = (
        response.data?.data
        || response.data
      );

      setProfile(updatedProfile);

      setFormData({
        nom:
          updatedProfile.nom || "",

        prenom:
          updatedProfile.prenom || "",

        email_personnel:
          updatedProfile.email_personnel || "",

        telephone:
          updatedProfile.telephone || "",

        date_naissance:
          updatedProfile.date_naissance || "",
      });

      setMessage(
        response.data?.message
        || "Profil mis à jour avec succès."
      );

      setIsEditing(false);

    } catch (err) {

      console.error(
        "PROFILE UPDATE ERROR",
        err
      );

      const data = (
        err.response?.data
      );

      if (
        data
        && typeof data === "object"
      ) {

        const firstError = Object.values(
          data
        )[0];

        if (Array.isArray(firstError)) {

          setError(
            firstError[0]
          );

        } else if (
          typeof firstError === "string"
        ) {

          setError(
            firstError
          );

        } else {

          setError(
            "Impossible de modifier le profil."
          );

        }

      } else {

        setError(
          "Impossible de modifier le profil."
        );

      }

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // NOM COMPLET
  // =========================================================

  const fullName = profile
    ? `${profile.prenom || ""} ${profile.nom || ""}`.trim()
    : "";


  // =========================================================
  // INITIALES
  // =========================================================

  const initials = profile
    ? (
        `${profile.prenom?.charAt(0) || ""}`
        + `${profile.nom?.charAt(0) || ""}`
      ).toUpperCase()
    : "U";


  // =========================================================
  // AFFICHAGE DU RÔLE
  // =========================================================

  const getRoleDisplay = (role) => {

    const roles = {
      SALARIE:
        "Salarié",

      RH:
        "Ressources humaines",

      ADMIN:
        "Administrateur",
    };

    return (
      roles[role]
      || role
      || "Salarié"
    );

  };


  // =========================================================
  // TYPE CONTRAT
  // =========================================================

  const getContratDisplay = (typeContrat) => {

    const contrats = {
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
    };

    return (
      contrats[typeContrat]
      || typeContrat
      || "—"
    );

  };


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "Non renseignée";
    }

    return new Date(
      `${dateValue}T00:00:00`
    ).toLocaleDateString(
      "fr-FR"
    );

  };


  // =========================================================
  // CHARGEMENT
  // =========================================================

  if (loading) {

    return (
      <div className="profile-loading">
        Chargement du profil...
      </div>
    );

  }


  // =========================================================
  // ERREUR SANS PROFIL
  // =========================================================

  if (!profile) {

    return (
      <div className="profile-page">

        <div className="profile-message profile-message-error">
          {error || "Profil introuvable."}
        </div>

      </div>
    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="profile-page">


      {/* ===================================================
          TITRE
      =================================================== */}

      <section className="profile-page-heading">

        <div>

          <h1>
            Mon profil
          </h1>

          <p>
            Consultez et modifiez vos informations personnelles.
          </p>

        </div>


        {!isEditing && (

          <button
            type="button"
            className="profile-primary-button"
            onClick={() => {

              setMessage("");
              setError("");
              setIsEditing(true);

            }}
          >
            Modifier le profil
          </button>

        )}

      </section>


      {/* ===================================================
          MESSAGE SUCCÈS
      =================================================== */}

      {message && (

        <div className="profile-message profile-message-success">
          {message}
        </div>

      )}


      {/* ===================================================
          MESSAGE ERREUR
      =================================================== */}

      {error && (

        <div className="profile-message profile-message-error">
          {error}
        </div>

      )}


      {/* ===================================================
          LAYOUT
      =================================================== */}

      <section className="profile-layout">


        {/* =================================================
            CARTE PROFIL
        ================================================= */}

        <aside className="profile-summary-card">

          <div className="profile-cover" />


          <div className="profile-summary-content">


            {/* AVATAR */}

            <div className="profile-avatar">

              <span>
                {initials}
              </span>

            </div>


            {/* NOM */}

            <h2>
              {fullName || profile.username}
            </h2>


            {/* RÔLE */}

            <p className="profile-role">

              {getRoleDisplay(
                profile.role
              )}

            </p>


            {/* STATUT */}

            <span className="profile-status">

              <span />

              Compte actif

            </span>


            {/* INFORMATIONS RAPIDES */}

            <div className="profile-summary-list">


              {/* EMAIL PRO */}

              <div>

                <span>
                  Email professionnel
                </span>

                <strong>
                  {
                    profile.email_pro
                    || "Non renseigné"
                  }
                </strong>

              </div>


              {/* EMAIL PERSONNEL */}

              <div>

                <span>
                  Email personnel
                </span>

                <strong>
                  {
                    profile.email_personnel
                    || "Non renseigné"
                  }
                </strong>

              </div>


              {/* TÉLÉPHONE */}

              <div>

                <span>
                  Téléphone
                </span>

                <strong>
                  {
                    profile.telephone
                    || "Non renseigné"
                  }
                </strong>

              </div>


              {/* IDENTIFIANT */}

              <div>

                <span>
                  Identifiant
                </span>

                <strong>
                  {
                    profile.username
                    || "Non renseigné"
                  }
                </strong>

              </div>


            </div>

          </div>

        </aside>


        {/* =================================================
            CONTENU
        ================================================= */}

        <main className="profile-content">

          <form
            onSubmit={handleSubmit}
          >


            {/* ===============================================
                INFORMATIONS PERSONNELLES
            =============================================== */}

            <article className="profile-card">

              <div className="profile-card-heading">

                <div>

                  <h2>
                    Informations personnelles
                  </h2>

                  <p>
                    Informations principales associées à votre compte.
                  </p>

                </div>

                <span className="profile-card-icon">
                  👤
                </span>

              </div>


              <div className="profile-form-grid">


                <ProfileField
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  disabled={!isEditing}
                />


                <ProfileField
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  disabled={!isEditing}
                />


                <ProfileField
                  label="Email personnel"
                  name="email_personnel"
                  type="email"
                  value={formData.email_personnel}
                  onChange={handleChange}
                  disabled={!isEditing}
                />


                <ProfileField
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />


                <ProfileField
                  label="Date de naissance"
                  name="date_naissance"
                  type="date"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  disabled={!isEditing}
                />


                <ProfileField
                  label="Email professionnel"
                  name="email_pro"
                  type="email"
                  value={
                    profile.email_pro || ""
                  }
                  disabled
                />


              </div>

            </article>


            {/* ===============================================
                INFORMATIONS PROFESSIONNELLES
            =============================================== */}

            <article className="profile-card">

              <div className="profile-card-heading">

                <div>

                  <h2>
                    Informations professionnelles
                  </h2>

                  <p>
                    Informations liées à votre emploi dans StaffHub.
                  </p>

                </div>

                <span className="profile-card-icon">
                  💼
                </span>

              </div>


              <div className="profile-form-grid">


                <ProfileField
                  label="Poste"
                  name="poste"
                  value={
                    profile.poste || ""
                  }
                  disabled
                />


                <ProfileField
                  label="Établissement"
                  name="etablissement"
                  value={
                    profile.etablissement || ""
                  }
                  disabled
                />


                <ProfileField
                  label="Rôle"
                  name="role"
                  value={
                    getRoleDisplay(
                      profile.role
                    )
                  }
                  disabled
                />


                <ProfileField
                  label="Matricule"
                  name="matricule"
                  value={
                    profile.matricule || ""
                  }
                  disabled
                />


                <ProfileField
                  label="Type de contrat"
                  name="type_contrat"
                  value={
                    getContratDisplay(
                      profile.type_contrat
                    )
                  }
                  disabled
                />


                <ProfileField
                  label="Date de début du contrat"
                  name="date_debut_contrat"
                  value={
                    formatDate(
                      profile.date_debut_contrat
                    )
                  }
                  disabled
                />


                <ProfileField
                  label="Date de fin du contrat"
                  name="date_fin_contrat"
                  value={
                    profile.date_fin_contrat
                      ? formatDate(
                          profile.date_fin_contrat
                        )
                      : "Aucune"
                  }
                  disabled
                />


                <ProfileField
                  label="Nom d'utilisateur"
                  name="username"
                  value={
                    profile.username || ""
                  }
                  disabled
                />


              </div>

            </article>


            {/* ===============================================
                ACTIONS
            =============================================== */}

            {isEditing && (

              <div className="profile-form-actions">


                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={saving}
                >

                  {
                    saving
                      ? "Enregistrement..."
                      : "Enregistrer les modifications"
                  }

                </button>


              </div>

            )}


          </form>

        </main>


      </section>

    </div>
  );
}


// ===========================================================
// CHAMP PROFIL
// ===========================================================

function ProfileField({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled,
}) {

  return (
    <div className="profile-field">

      <label htmlFor={name}>
        {label}
      </label>


      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        placeholder={`${label}...`}
      />

    </div>
  );
}
