import React, { useEffect, useMemo, useState } from "react";
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
  { id: "personal", label: "Informations personnelles" },
  { id: "work", label: "Emploi" },
  { id: "contact", label: "Coordonnées" },
  { id: "documents", label: "Documents" },
];

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email_personnel: "",
  telephone: "",
  date_naissance: "",
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await API.get("/api/me/");
        const data = response.data?.data || response.data;
        setProfile(data);
        setFormData(toFormData(data));
      } catch (err) {
        console.error("PROFILE ERROR", err);
        setError(err.response?.data?.detail || "Impossible de charger votre profil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const values = [
      profile.nom,
      profile.prenom,
      profile.date_naissance,
      profile.email_personnel,
      profile.telephone,
      profile.poste,
      profile.etablissement,
      profile.matricule,
    ];
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(toFormData(profile));
    setMessage("");
    setError("");
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await API.patch("/api/me/", {
        ...formData,
        date_naissance: formData.date_naissance || null,
      });
      const updated = response.data?.data || response.data;
      setProfile(updated);
      setFormData(toFormData(updated));
      setMessage(response.data?.message || "Profil mis à jour avec succès.");
      setIsEditing(false);
    } catch (err) {
      console.error("PROFILE UPDATE ERROR", err);
      setError(readApiError(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Chargement du profil...</div>;
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-message profile-message-error">
          {error || "Profil introuvable."}
        </div>
      </div>
    );
  }

  const fullName = `${profile.prenom || ""} ${profile.nom || ""}`.trim();
  const initials = `${profile.prenom?.[0] || ""}${profile.nom?.[0] || ""}`.toUpperCase() || "U";
  const photo = profile.photo || profile.photo_profil || profile.avatar;
  const active = profile.actif !== false && profile.is_active !== false;

  return (
    <div className="profile-page">
      <header className="profile-page-heading">
        <div>
          <h1>Mon profil</h1>
          <p>Consultez et mettez à jour vos informations personnelles</p>
        </div>
      </header>

      {message && <div className="profile-message profile-message-success">{message}</div>}
      {error && <div className="profile-message profile-message-error">{error}</div>}

      <section className="profile-identity-card">
        <div className="profile-avatar">
          {photo ? <img src={photo} alt={fullName} /> : <span>{initials}</span>}
        </div>

        <div className="profile-identity-main">
          <h2>{fullName || profile.username}</h2>
          <p>{profile.poste || "Poste non renseigné"}</p>
          <div className="profile-badges">
            <span className="profile-contract-badge">{contractLabel(profile.type_contrat)}</span>
            <span className={`profile-active-badge ${!active ? "is-inactive" : ""}`}>
              <i />{active ? "Actif" : "Inactif"}
            </span>
          </div>
          <div className="profile-key-data">
            <div><span>Numéro employé</span><strong>{profile.matricule || "Non renseigné"}</strong></div>
            <div><span>Établissement</span><strong>{profile.etablissement || "Non renseigné"}</strong></div>
          </div>
        </div>

        <div className="profile-completion">
          <div className="profile-completion-heading">
            <strong>Dossier complété à {completion} %</strong>
            <CheckCircle2 size={18} />
          </div>
          <div className="profile-progress" aria-label={`Dossier complété à ${completion} %`}>
            <span style={{ width: `${completion}%` }} />
          </div>
          {!isEditing && (
            <button className="profile-primary-button" type="button" onClick={() => setIsEditing(true)}>
              <Pencil size={17} /> Modifier mes informations
            </button>
          )}
        </div>
      </section>

      <section className="profile-details-card">
        <nav className="profile-tabs" aria-label="Rubriques du profil">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <form onSubmit={handleSubmit}>
          {activeTab === "personal" && (
            <div className="profile-card-grid">
              <InfoCard icon={UserRound} title="État civil">
                <EditableRow label="Nom" name="nom" value={formData.nom} editing={isEditing} onChange={handleChange} />
                <EditableRow label="Prénom" name="prenom" value={formData.prenom} editing={isEditing} onChange={handleChange} />
                <EditableRow label="Date de naissance" name="date_naissance" type="date" value={formData.date_naissance} display={formatDate(profile.date_naissance)} editing={isEditing} onChange={handleChange} />
                <DataRow label="Nationalité" value={profile.nationalite} />
              </InfoCard>

              <InfoCard icon={Mail} title="Coordonnées">
                <EditableRow label="Adresse e-mail" name="email_personnel" type="email" value={formData.email_personnel} editing={isEditing} onChange={handleChange} />
                <EditableRow label="Téléphone" name="telephone" type="tel" value={formData.telephone} editing={isEditing} onChange={handleChange} />
                <DataRow label="Adresse" value={addressLabel(profile)} />
              </InfoCard>

              <InfoCard icon={Phone} title="Contact d’urgence">
                <DataRow label="Nom" value={emergencyValue(profile, "nom")} />
                <DataRow label="Lien" value={emergencyValue(profile, "lien")} />
                <DataRow label="Téléphone" value={emergencyValue(profile, "telephone")} />
              </InfoCard>

              <DocumentAlert profile={profile} />
            </div>
          )}

          {activeTab === "work" && (
            <div className="profile-card-grid">
              <InfoCard icon={BriefcaseBusiness} title="Informations professionnelles">
                <DataRow label="Poste" value={profile.poste} />
                <DataRow label="Rôle" value={roleLabel(profile.role)} />
                <DataRow label="Type de contrat" value={contractLabel(profile.type_contrat)} />
                <DataRow label="Établissement" value={profile.etablissement} />
              </InfoCard>
              <InfoCard icon={CalendarIcon} title="Contrat">
                <DataRow label="Date de début" value={formatDate(profile.date_debut_contrat)} />
                <DataRow label="Date de fin" value={profile.date_fin_contrat ? formatDate(profile.date_fin_contrat) : "Aucune"} />
                <DataRow label="Matricule" value={profile.matricule} />
                <DataRow label="Identifiant" value={profile.username} />
              </InfoCard>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="profile-card-grid">
              <InfoCard icon={MapPin} title="Adresse et communication">
                <DataRow label="Adresse" value={addressLabel(profile)} />
                <DataRow label="E-mail professionnel" value={profile.email_pro} />
                <EditableRow label="E-mail personnel" name="email_personnel" type="email" value={formData.email_personnel} editing={isEditing} onChange={handleChange} />
                <EditableRow label="Téléphone" name="telephone" type="tel" value={formData.telephone} editing={isEditing} onChange={handleChange} />
              </InfoCard>
              <InfoCard icon={UsersRound} title="Contact d’urgence">
                <DataRow label="Nom" value={emergencyValue(profile, "nom")} />
                <DataRow label="Lien" value={emergencyValue(profile, "lien")} />
                <DataRow label="Téléphone" value={emergencyValue(profile, "telephone")} />
              </InfoCard>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="profile-card-grid">
              <InfoCard icon={FileText} title="Documents administratifs">
                <DataRow label="Pièce d’identité" value={profile.piece_identite_statut || "Non renseignée"} />
                <DataRow label="Titre de séjour" value={profile.titre_sejour_statut || "Non renseigné"} />
                <DataRow label="RIB / IBAN" value={profile.iban ? "Enregistré" : "Non renseigné"} />
              </InfoCard>
              <DocumentAlert profile={profile} />
            </div>
          )}

          {isEditing && (
            <div className="profile-form-actions">
              <button type="button" className="profile-secondary-button" onClick={handleCancel} disabled={saving}>Annuler</button>
              <button type="submit" className="profile-primary-button" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return <article className="profile-info-card"><header><span><Icon size={22} /></span><h3>{title}</h3></header><div>{children}</div></article>;
}

function DataRow({ label, value }) {
  return <div className="profile-data-row"><span>{label}</span><strong>{value || "Non renseigné"}</strong></div>;
}

function EditableRow({ label, name, type = "text", value, display, editing, onChange }) {
  if (!editing) return <DataRow label={label} value={display || value} />;
  return <label className="profile-edit-row"><span>{label}</span><input name={name} type={type} value={value || ""} onChange={onChange} /></label>;
}

function DocumentAlert({ profile }) {
  const days = profile.titre_sejour_jours_restants ?? profile.document_jours_restants;
  const text = days != null ? `Titre de séjour — expire dans ${days} jours` : "Aucun document arrivant à expiration";
  return <article className={`profile-document-alert ${days == null ? "is-clear" : ""}`}><header><AlertTriangle size={25} /><h3>{days == null ? "Documents à jour" : "Document à renouveler"}</h3></header><p>{text}</p></article>;
}

function CalendarIcon(props) { return <FileText {...props} />; }

function toFormData(data = {}) {
  return { nom: data.nom || "", prenom: data.prenom || "", email_personnel: data.email_personnel || "", telephone: data.telephone || "", date_naissance: data.date_naissance || "" };
}

function readApiError(data) {
  if (!data || typeof data !== "object") return "Impossible de modifier le profil.";
  const first = Object.values(data)[0];
  return Array.isArray(first) ? first[0] : typeof first === "string" ? first : "Impossible de modifier le profil.";
}

function formatDate(value) {
  if (!value) return "Non renseignée";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Non renseignée" : date.toLocaleDateString("fr-FR");
}

function contractLabel(value) {
  return ({ CDI: "CDI", CDD: "CDD", VACATAIRE: "Vacataire", STAGIAIRE: "Stagiaire", ALTERNANT: "Alternant" })[value] || value || "Contrat non renseigné";
}

function roleLabel(value) {
  return ({ SALARIE: "Salarié", RH: "Ressources humaines", ADMIN: "Administrateur" })[value] || value || "Salarié";
}

function addressLabel(profile) {
  if (profile.adresse_complete) return profile.adresse_complete;
  const parts = [profile.adresse, profile.code_postal, profile.ville].filter(Boolean);
  return parts.join(", ") || "Non renseignée";
}

function emergencyValue(profile, key) {
  return profile.contact_urgence?.[key] || profile[`urgence_${key}`] || profile[`contact_urgence_${key}`] || "Non renseigné";
}
