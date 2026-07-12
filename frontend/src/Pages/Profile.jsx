import React, { useEffect, useState } from "react";
import useAuth from "../Hooks/useAuth";
import "../Styles/profile.css";

export default function Profile() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    address: "",
    city: "",
    postal_code: "",
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      first_name: user.first_name || user.prenom || "",
      last_name: user.last_name || user.nom || "",
      email: user.email || "",
      phone: user.phone || user.telephone || "",
      job_title: user.job_title || user.poste || "",
      department: user.department || user.service || "",
      address: user.address || user.adresse || "",
      city: user.city || user.ville || "",
      postal_code: user.postal_code || user.code_postal || "",
    });
  }, [user]);

  const fullName =
    `${formData.first_name} ${formData.last_name}`.trim() ||
    user?.username ||
    "Utilisateur";

  const initials =
    `${formData.first_name?.charAt(0) || ""}${
      formData.last_name?.charAt(0) || ""
    }`.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    "U";

  const role =
    user?.role ||
    user?.job_title ||
    user?.poste ||
    (user?.is_staff ? "Administrateur" : "Salarié");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || user?.prenom || "",
      last_name: user?.last_name || user?.nom || "",
      email: user?.email || "",
      phone: user?.phone || user?.telephone || "",
      job_title: user?.job_title || user?.poste || "",
      department: user?.department || user?.service || "",
      address: user?.address || user?.adresse || "",
      city: user?.city || user?.ville || "",
      postal_code: user?.postal_code || user?.code_postal || "",
    });

    setMessage("");
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      /*
       * Branche ici ton API Django.
       *
       * Exemple :
       *
       * const token = localStorage.getItem("access");
       *
       * const response = await fetch(
       *   "http://127.0.0.1:8000/api/profile/",
       *   {
       *     method: "PATCH",
       *     headers: {
       *       "Content-Type": "application/json",
       *       Authorization: `Bearer ${token}`,
       *     },
       *     body: JSON.stringify(formData),
       *   }
       * );
       *
       * if (!response.ok) {
       *   throw new Error("Impossible de modifier le profil.");
       * }
       */

      setMessage("Profil mis à jour avec succès.");
      setIsEditing(false);
    } catch (error) {
      setMessage(
        error.message || "Une erreur est survenue pendant la modification."
      );
    }
  };

  if (!user) {
    return (
      <div className="profile-loading">
        Chargement du profil...
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-page-heading">
        <div>
          <h1>Mon profil</h1>
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
              setIsEditing(true);
            }}
          >
            Modifier le profil
          </button>
        )}
      </section>

      {message && (
        <div
          className={`profile-message ${
            message.includes("succès")
              ? "profile-message-success"
              : "profile-message-error"
          }`}
        >
          {message}
        </div>
      )}

      <section className="profile-layout">
        <aside className="profile-summary-card">
          <div className="profile-cover" />

          <div className="profile-summary-content">
            <div className="profile-avatar">
              {user?.avatar || user?.photo ? (
                <img
                  src={user.avatar || user.photo}
                  alt={`Photo de ${fullName}`}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <h2>{fullName}</h2>
            <p className="profile-role">{role}</p>

            <span
              className={`profile-status ${
                user?.is_active === false
                  ? "profile-status-inactive"
                  : ""
              }`}
            >
              <span />
              {user?.is_active === false
                ? "Compte inactif"
                : "Compte actif"}
            </span>

            <div className="profile-summary-list">
              <div>
                <span>Email</span>
                <strong>{formData.email || "Non renseigné"}</strong>
              </div>

              <div>
                <span>Téléphone</span>
                <strong>{formData.phone || "Non renseigné"}</strong>
              </div>

              <div>
                <span>Service</span>
                <strong>
                  {formData.department || "Non renseigné"}
                </strong>
              </div>

              <div>
                <span>Identifiant</span>
                <strong>{user.username || "Non renseigné"}</strong>
              </div>
            </div>
          </div>
        </aside>

        <main className="profile-content">
          <form onSubmit={handleSubmit}>
            <article className="profile-card">
              <div className="profile-card-heading">
                <div>
                  <h2>Informations personnelles</h2>
                  <p>
                    Informations principales associées à votre compte.
                  </p>
                </div>

                <span className="profile-card-icon">👤</span>
              </div>

              <div className="profile-form-grid">
                <ProfileField
                  label="Prénom"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <ProfileField
                  label="Nom"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <ProfileField
                  label="Adresse e-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <ProfileField
                  label="Téléphone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </article>

            <article className="profile-card">
              <div className="profile-card-heading">
                <div>
                  <h2>Informations professionnelles</h2>
                  <p>
                    Poste et rattachement dans l’entreprise.
                  </p>
                </div>

                <span className="profile-card-icon">💼</span>
              </div>

              <div className="profile-form-grid">
                <ProfileField
                  label="Poste"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <ProfileField
                  label="Service"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <ProfileField
                  label="Rôle"
                  name="role"
                  value={role}
                  disabled
                />

                <ProfileField
                  label="Matricule"
                  name="employee_number"
                  value={
                    user.employee_number ||
                    user.matricule ||
                    "Non renseigné"
                  }
                  disabled
                />
              </div>
            </article>

            <article className="profile-card">
              <div className="profile-card-heading">
                <div>
                  <h2>Adresse</h2>
                  <p>
                    Coordonnées utilisées pour votre dossier salarié.
                  </p>
                </div>

                <span className="profile-card-icon">⌂</span>
              </div>

              <div className="profile-form-grid">
                <div className="profile-field profile-field-full">
                  <label htmlFor="address">Adresse</label>

                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Numéro et nom de rue"
                  />
                </div>

                <ProfileField
                  label="Ville"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                />

                <ProfileField
                  label="Code postal"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </article>

            {isEditing && (
              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={handleCancel}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="profile-primary-button"
                >
                  Enregistrer les modifications
                </button>
              </div>
            )}
          </form>
        </main>
      </section>
    </div>
  );
}

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
      <label htmlFor={name}>{label}</label>

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
