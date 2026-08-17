import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
} from "lucide-react";

import API from "../../../Services/api";

import "../../../Styles/donnees-complementaires.css";


const EMPTY_FORM = {
  situation_professionnelle: "",
  type_permis: "",
  vehicule_personnel: "",
  mobilite: "",
  langues: "",
  competences: "",
  disponibilite: "",
  contraintes_horaires: "",
  contact_preferentiel: "",
  remarques_rh: "",
};


const extractResults = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data
    && Array.isArray(data.results)
  ) {
    return data.results;
  }

  return [];
};


export default function DonneesComple() {
  const [
    formData,
    setFormData,
  ] = useState(
    EMPTY_FORM
  );

  const [
    dossierId,
    setDossierId,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState({
    type: "",
    text: "",
  });


  // =========================================================
  // LOAD
  // =========================================================

  const fetchDossier = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setMessage({
        type: "",
        text: "",
      });

      try {
        const response =
          await API.get(
            "/api/dossiers/"
          );

        const results =
          extractResults(
            response.data
          );

        const dossier =
          results[0];

        if (!dossier) {
          setDossierId(null);

          setFormData(
            EMPTY_FORM
          );

          return;
        }

        setDossierId(
          dossier.id
        );

        const infos =
          dossier.infos_complementaires
          || {};

        setFormData({
          situation_professionnelle:
            infos.situation_professionnelle
            || "",

          type_permis:
            infos.type_permis
            || "",

          vehicule_personnel:
            infos.vehicule_personnel
            || "",

          mobilite:
            infos.mobilite
            || "",

          langues:
            infos.langues
            || "",

          competences:
            infos.competences
            || "",

          disponibilite:
            infos.disponibilite
            || "",

          contraintes_horaires:
            infos.contraintes_horaires
            || "",

          contact_preferentiel:
            infos.contact_preferentiel
            || "",

          remarques_rh:
            infos.remarques_rh
            || "",
        });

      } catch (error) {
        console.error(
          "DONNEES COMPLEMENTAIRES ERROR",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger les données complémentaires.",
        });

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);


  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };


  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setSaving(true);

    setMessage({
      type: "",
      text: "",
    });

    try {
      const payload = {
        infos_complementaires:
          formData,
      };

      let response;

      if (dossierId) {
        response =
          await API.patch(
            `/api/dossiers/${dossierId}/`,
            payload
          );

      } else {
        response =
          await API.post(
            "/api/dossiers/",
            payload
          );
      }

      setDossierId(
        response.data.id
      );

      setMessage({
        type: "success",
        text:
          dossierId
            ? "Les données complémentaires ont été mises à jour."
            : "Les données complémentaires ont été enregistrées.",
      });

      await fetchDossier();

    } catch (error) {
      console.error(
        "SAVE DONNEES COMPLEMENTAIRES ERROR",
        error
      );

      setMessage({
        type: "error",
        text:
          getApiError(
            error,
            "Impossible d'enregistrer les données complémentaires."
          ),
      });

    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="donnees-page">

        <div className="donnees-loading">

          <Loader2
            size={30}
            className="donnees-spin"
          />

          <span>
            Chargement des données complémentaires...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="donnees-page">

      <section className="donnees-heading">

        <div>

          <span className="donnees-eyebrow">
            Dossier salarié
          </span>

          <h1>
            Données complémentaires
          </h1>

          <p>
            Ajoutez les informations utiles
            à la gestion de votre dossier RH.
          </p>

        </div>


        <button
          type="button"
          className="donnees-secondary-button"
          onClick={() =>
            fetchDossier(
              true
            )
          }
          disabled={
            refreshing
          }
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "donnees-spin"
                : ""
            }
          />

          Actualiser

        </button>

      </section>


      {
        message.text
        && (
          <div
            className={
              `donnees-message donnees-message-${message.type}`
            }
          >

            {
              message.type
              === "success"
              && (
                <CheckCircle2
                  size={18}
                />
              )
            }

            {message.text}

          </div>
        )
      }


      <form
        className="donnees-card"
        onSubmit={
          handleSubmit
        }
      >

        <div className="donnees-card-heading">

          <div>

            <h2>
              Informations complémentaires
            </h2>

            <p>
              Ces informations sont stockées
              dans votre dossier RH.
            </p>

          </div>


          <span className="donnees-card-icon">

            <Settings2
              size={21}
            />

          </span>

        </div>


        <div className="donnees-form-grid">

          <div className="donnees-field">

            <label htmlFor="situation_professionnelle">
              Situation professionnelle
            </label>

            <select
              id="situation_professionnelle"
              name="situation_professionnelle"
              value={
                formData.situation_professionnelle
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Sélectionner
              </option>

              <option value="TEMPS_PLEIN">
                Temps plein
              </option>

              <option value="TEMPS_PARTIEL">
                Temps partiel
              </option>

              <option value="ALTERNANCE">
                Alternance
              </option>

              <option value="STAGE">
                Stage
              </option>

              <option value="AUTRE">
                Autre
              </option>

            </select>

          </div>


          <Field
            label="Type de permis"
            name="type_permis"
            value={
              formData.type_permis
            }
            onChange={
              handleChange
            }
            placeholder="Exemple : Permis B"
          />


          <div className="donnees-field">

            <label htmlFor="vehicule_personnel">
              Véhicule personnel
            </label>

            <select
              id="vehicule_personnel"
              name="vehicule_personnel"
              value={
                formData.vehicule_personnel
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Non renseigné
              </option>

              <option value="OUI">
                Oui
              </option>

              <option value="NON">
                Non
              </option>

            </select>

          </div>


          <div className="donnees-field">

            <label htmlFor="mobilite">
              Mobilité
            </label>

            <select
              id="mobilite"
              name="mobilite"
              value={
                formData.mobilite
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Non renseigné
              </option>

              <option value="LOCALE">
                Locale
              </option>

              <option value="REGIONALE">
                Régionale
              </option>

              <option value="NATIONALE">
                Nationale
              </option>

              <option value="INTERNATIONALE">
                Internationale
              </option>

            </select>

          </div>


          <Field
            label="Langues"
            name="langues"
            value={
              formData.langues
            }
            onChange={
              handleChange
            }
            placeholder="Exemple : Français, anglais"
          />


          <Field
            label="Disponibilité"
            name="disponibilite"
            value={
              formData.disponibilite
            }
            onChange={
              handleChange
            }
            placeholder="Exemple : Immédiate"
          />


          <Field
            label="Contact préférentiel"
            name="contact_preferentiel"
            value={
              formData.contact_preferentiel
            }
            onChange={
              handleChange
            }
            placeholder="Email, téléphone..."
          />


          <div className="donnees-field donnees-field-full">

            <label htmlFor="competences">
              Compétences complémentaires
            </label>

            <textarea
              id="competences"
              name="competences"
              rows="4"
              value={
                formData.competences
              }
              onChange={
                handleChange
              }
              placeholder="Décrivez vos compétences complémentaires..."
            />

          </div>


          <div className="donnees-field donnees-field-full">

            <label htmlFor="contraintes_horaires">
              Contraintes horaires
            </label>

            <textarea
              id="contraintes_horaires"
              name="contraintes_horaires"
              rows="3"
              value={
                formData.contraintes_horaires
              }
              onChange={
                handleChange
              }
              placeholder="Précisez éventuellement vos contraintes..."
            />

          </div>


          <div className="donnees-field donnees-field-full">

            <label htmlFor="remarques_rh">
              Informations complémentaires
            </label>

            <textarea
              id="remarques_rh"
              name="remarques_rh"
              rows="5"
              value={
                formData.remarques_rh
              }
              onChange={
                handleChange
              }
              placeholder="Autres informations utiles..."
            />

          </div>

        </div>


        <div className="donnees-info-box">

          <FileText
            size={18}
          />

          <div>

            <strong>
              Informations flexibles
            </strong>

            <p>
              Cette rubrique utilise le champ
              « infos_complementaires » du dossier.
              Elle pourra donc être enrichie plus tard
              sans modifier immédiatement le modèle Django.
            </p>

          </div>

        </div>


        <div className="donnees-actions">

          <button
            type="submit"
            className="donnees-primary-button"
            disabled={
              saving
            }
          >

            {
              saving
                ? (
                  <>
                    <Loader2
                      size={17}
                      className="donnees-spin"
                    />

                    Enregistrement...
                  </>
                )
                : (
                  <>
                    <Save
                      size={17}
                    />

                    Enregistrer
                  </>
                )
            }

          </button>

        </div>

      </form>

    </div>
  );
}


function Field({
  label,
  name,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <div className="donnees-field">

      <label htmlFor={name}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

    </div>
  );
}


function getApiError(
  error,
  fallback
) {
  const data =
    error.response?.data;

  if (
    typeof data
    === "string"
  ) {
    return data;
  }

  if (
    data?.detail
  ) {
    return data.detail;
  }

  if (
    data
    && typeof data
      === "object"
  ) {
    const first =
      Object.values(
        data
      )[0];

    if (
      Array.isArray(first)
    ) {
      return first[0];
    }

    if (first) {
      return String(first);
    }
  }

  return fallback;
}
