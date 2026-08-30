import React, { useState } from "react";

import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Database,
  FileText,
  LockKeyhole,
  Save,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";

import "../Styles/settings.css";


export default function Settings() {

  // =========================================================
  // STATES
  // =========================================================

  const [activeSection, setActiveSection] =
    useState("entreprise");

  const [saved, setSaved] =
    useState(false);

  const [settings, setSettings] =
    useState({
      companyName: "StaffHub",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",

      defaultContract: "CDI",
      workHoursPerWeek: "35",

      emailNotifications: true,
      requestNotifications: true,
      documentNotifications: true,
      planningNotifications: true,

      forcePasswordChange: true,
      sessionExpiration: "60",
    });


  // =========================================================
  // SECTIONS
  // =========================================================

  const sections = [
    {
      id: "entreprise",
      label: "Entreprise",
      description: "Informations générales",
      icon: Building2,
    },
    {
      id: "rh",
      label: "Gestion RH",
      description: "Règles et organisation",
      icon: Users,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alertes du système",
      icon: Bell,
    },
    {
      id: "securite",
      label: "Sécurité",
      description: "Accès et authentification",
      icon: ShieldCheck,
    },
    {
      id: "systeme",
      label: "Système",
      description: "Informations techniques",
      icon: Database,
    },
  ];


  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setSettings(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );


    setSaved(false);
  };


  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = () => {

    /*
      Pour l'instant :
      interface uniquement.

      Plus tard on pourra connecter :
      API.patch("/api/settings/", settings)
    */

    setSaved(true);


    window.setTimeout(
      () => {
        setSaved(false);
      },
      3000
    );
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="settings-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="settings-header">

        <div>

          <span className="settings-eyebrow">
            Administration
          </span>

          <h1>
            Paramètres
          </h1>

          <p>
            Configurez les informations générales et
            les préférences de votre espace StaffHub.
          </p>

        </div>


        <div className="settings-header-icon">

          <Settings2
            size={24}
            strokeWidth={1.8}
          />

        </div>

      </header>


      {/* ===================================================
          LAYOUT
      =================================================== */}

      <div className="settings-layout">


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <aside className="settings-navigation">

          <div className="settings-navigation-heading">

            <strong>
              Configuration
            </strong>

            <span>
              Paramètres généraux
            </span>

          </div>


          <nav>

            {sections.map(
              (section) => {

                const Icon =
                  section.icon;

                const active =
                  activeSection
                  === section.id;


                return (
                  <button
                    key={section.id}
                    type="button"
                    className={
                      `settings-nav-item ${
                        active
                          ? "settings-nav-item-active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setActiveSection(
                        section.id
                      )
                    }
                  >

                    <span className="settings-nav-icon">

                      <Icon
                        size={18}
                        strokeWidth={1.8}
                      />

                    </span>


                    <span className="settings-nav-content">

                      <strong>
                        {section.label}
                      </strong>

                      <small>
                        {section.description}
                      </small>

                    </span>


                    <ChevronRight
                      size={16}
                      className="settings-nav-arrow"
                    />

                  </button>
                );
              }
            )}

          </nav>

        </aside>


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="settings-content">


          {/* =================================================
              ENTREPRISE
          ================================================= */}

          {activeSection === "entreprise" && (

            <SettingsSection
              title="Informations de l'entreprise"
              description={
                "Informations générales utilisées dans l'espace RH."
              }
              icon={Building2}
            >

              <div className="settings-form-grid">

                <Field
                  label="Nom de l'entreprise"
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleChange}
                  placeholder="StaffHub"
                />

                <Field
                  label="E-mail de contact"
                  name="companyEmail"
                  type="email"
                  value={settings.companyEmail}
                  onChange={handleChange}
                  placeholder="contact@entreprise.fr"
                />

                <Field
                  label="Téléphone"
                  name="companyPhone"
                  value={settings.companyPhone}
                  onChange={handleChange}
                  placeholder="+33 1 00 00 00 00"
                />

                <Field
                  label="Adresse"
                  name="companyAddress"
                  value={settings.companyAddress}
                  onChange={handleChange}
                  placeholder="Adresse de l'entreprise"
                  full
                />

              </div>

            </SettingsSection>

          )}


          {/* =================================================
              RH
          ================================================= */}

          {activeSection === "rh" && (

            <SettingsSection
              title="Gestion des ressources humaines"
              description={
                "Définissez certaines valeurs utilisées par défaut."
              }
              icon={Users}
            >

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label htmlFor="defaultContract">
                    Type de contrat par défaut
                  </label>

                  <select
                    id="defaultContract"
                    name="defaultContract"
                    value={
                      settings.defaultContract
                    }
                    onChange={handleChange}
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

                    <option value="ALTERNANT">
                      Alternant
                    </option>

                    <option value="STAGIAIRE">
                      Stagiaire
                    </option>

                  </select>

                </div>


                <Field
                  label="Durée hebdomadaire"
                  name="workHoursPerWeek"
                  type="number"
                  value={
                    settings.workHoursPerWeek
                  }
                  onChange={handleChange}
                  suffix="heures"
                />

              </div>


              <div className="settings-info-box">

                <Clock3
                  size={18}
                />

                <div>

                  <strong>
                    Temps de travail
                  </strong>

                  <p>
                    Cette valeur pourra être utilisée
                    ultérieurement pour le calcul des
                    heures et des pointages.
                  </p>

                </div>

              </div>

            </SettingsSection>

          )}


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          {activeSection === "notifications" && (

            <SettingsSection
              title="Notifications"
              description={
                "Choisissez les événements importants à signaler."
              }
              icon={Bell}
            >

              <div className="settings-toggle-list">

                <Toggle
                  name="emailNotifications"
                  checked={
                    settings.emailNotifications
                  }
                  onChange={handleChange}
                  title="Notifications générales"
                  description={
                    "Activer les notifications principales de la plateforme."
                  }
                />

                <Toggle
                  name="requestNotifications"
                  checked={
                    settings.requestNotifications
                  }
                  onChange={handleChange}
                  title="Nouvelles demandes"
                  description={
                    "Signaler aux RH lorsqu'une nouvelle demande est créée."
                  }
                />

                <Toggle
                  name="documentNotifications"
                  checked={
                    settings.documentNotifications
                  }
                  onChange={handleChange}
                  title="Documents administratifs"
                  description={
                    "Signaler les nouveaux documents et les échéances."
                  }
                />

                <Toggle
                  name="planningNotifications"
                  checked={
                    settings.planningNotifications
                  }
                  onChange={handleChange}
                  title="Planning"
                  description={
                    "Activer les alertes liées aux modifications de planning."
                  }
                />

              </div>

            </SettingsSection>

          )}


          {/* =================================================
              SECURITE
          ================================================= */}

          {activeSection === "securite" && (

            <SettingsSection
              title="Sécurité"
              description={
                "Paramètres liés aux comptes et aux sessions."
              }
              icon={ShieldCheck}
            >

              <div className="settings-toggle-list">

                <Toggle
                  name="forcePasswordChange"
                  checked={
                    settings.forcePasswordChange
                  }
                  onChange={handleChange}
                  title="Mot de passe temporaire"
                  description={
                    "Demander aux nouveaux salariés de modifier leur mot de passe lors de leur première connexion."
                  }
                />

              </div>


              <div className="settings-form-grid settings-security-fields">

                <div className="settings-field">

                  <label htmlFor="sessionExpiration">
                    Durée de session
                  </label>

                  <select
                    id="sessionExpiration"
                    name="sessionExpiration"
                    value={
                      settings.sessionExpiration
                    }
                    onChange={handleChange}
                  >

                    <option value="30">
                      30 minutes
                    </option>

                    <option value="60">
                      1 heure
                    </option>

                    <option value="120">
                      2 heures
                    </option>

                    <option value="480">
                      8 heures
                    </option>

                  </select>

                </div>

              </div>


              <div className="settings-security-notice">

                <LockKeyhole
                  size={18}
                />

                <div>

                  <strong>
                    Authentification sécurisée
                  </strong>

                  <p>
                    Les utilisateurs de StaffHub sont
                    authentifiés avant d'accéder aux
                    données de l'application.
                  </p>

                </div>

              </div>

            </SettingsSection>

          )}


          {/* =================================================
              SYSTEME
          ================================================= */}

          {activeSection === "systeme" && (

            <SettingsSection
              title="Informations système"
              description={
                "Informations générales sur l'application."
              }
              icon={Database}
            >

              <div className="settings-system-list">

                <SystemRow
                  label="Application"
                  value="StaffHub"
                />

                <SystemRow
                  label="Interface"
                  value="React"
                />

                <SystemRow
                  label="API"
                  value="Django REST Framework"
                />

                <SystemRow
                  label="Authentification"
                  value="JWT"
                />

                <SystemRow
                  label="État du système"
                  value="Opérationnel"
                  status
                />

              </div>


              <div className="settings-system-note">

                <FileText
                  size={18}
                />

                <p>
                  Cette section est informative.
                  Les paramètres techniques sensibles
                  restent gérés côté serveur.
                </p>

              </div>

            </SettingsSection>

          )}


          {/* =================================================
              FOOTER
          ================================================= */}

          {activeSection !== "systeme" && (

            <footer className="settings-actions">

              {saved && (

                <span className="settings-saved">

                  <Check
                    size={16}
                  />

                  Modifications enregistrées

                </span>

              )}


              <button
                type="button"
                className="settings-save-button"
                onClick={handleSave}
              >

                <Save
                  size={17}
                  strokeWidth={1.8}
                />

                Enregistrer

              </button>

            </footer>

          )}

        </section>

      </div>

    </main>
  );
}


// =========================================================
// SECTION
// =========================================================

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}) {

  return (
    <div className="settings-section-card">

      <header className="settings-section-header">

        <span className="settings-section-icon">

          <Icon
            size={20}
            strokeWidth={1.8}
          />

        </span>


        <div>

          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>

        </div>

      </header>


      <div className="settings-section-body">
        {children}
      </div>

    </div>
  );
}


// =========================================================
// FIELD
// =========================================================

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  suffix = "",
  full = false,
}) {

  return (
    <div
      className={
        `settings-field ${
          full
            ? "settings-field-full"
            : ""
        }`
      }
    >

      <label htmlFor={name}>
        {label}
      </label>


      <div className="settings-input-wrapper">

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />


        {suffix && (
          <span>
            {suffix}
          </span>
        )}

      </div>

    </div>
  );
}


// =========================================================
// TOGGLE
// =========================================================

function Toggle({
  name,
  checked,
  onChange,
  title,
  description,
}) {

  return (
    <label className="settings-toggle-row">

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>


      <span className="settings-switch">

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
        />

        <span className="settings-switch-slider" />

      </span>

    </label>
  );
}


// =========================================================
// SYSTEM ROW
// =========================================================

function SystemRow({
  label,
  value,
  status = false,
}) {

  return (
    <div className="settings-system-row">

      <span>
        {label}
      </span>


      {status ? (

        <strong className="settings-system-status">
          <span />
          {value}
        </strong>

      ) : (

        <strong>
          {value}
        </strong>

      )}

    </div>
  );
}
