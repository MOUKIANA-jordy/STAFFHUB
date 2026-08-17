import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";

import API from "../../../Services/api";

import "../../../Styles/iban.css";


const EMPTY_FORM = {
  iban: "",
  bic: "",
  titulaire: "",
  nom_banque: "",
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


export default function Iban() {
  const [
    formData,
    setFormData,
  ] = useState(
    EMPTY_FORM
  );

  const [
    recordId,
    setRecordId,
  ] = useState(null);

  const [
    ibanMasque,
    setIbanMasque,
  ] = useState("");

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

  const fetchIban = useCallback(
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
            "/api/iban/"
          );

        const results =
          extractResults(
            response.data
          );

        const item =
          results[0];

        if (!item) {
          setRecordId(null);

          setIbanMasque("");

          setFormData(
            EMPTY_FORM
          );

          return;
        }

        setRecordId(
          item.id
        );

        setIbanMasque(
          item.iban_masque
          || ""
        );

        setFormData({
          iban: "",
          bic:
            item.bic
            || "",
          titulaire:
            item.titulaire
            || "",
          nom_banque:
            item.nom_banque
            || "",
        });

      } catch (error) {
        console.error(
          "IBAN ERROR",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger vos coordonnées bancaires.",
        });

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    fetchIban();
  }, [fetchIban]);


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

        [name]:
          name === "iban"
          || name === "bic"
            ? value.toUpperCase()
            : value,
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
        bic:
          formData.bic,

        titulaire:
          formData.titulaire,

        nom_banque:
          formData.nom_banque,
      };


      if (
        formData.iban
          .trim()
      ) {
        payload.iban =
          formData.iban
            .replace(/\s/g, "")
            .replace(/-/g, "")
            .toUpperCase();
      }


      if (
        !recordId
        && !payload.iban
      ) {
        setMessage({
          type: "error",
          text:
            "L'IBAN est obligatoire lors du premier enregistrement.",
        });

        setSaving(false);

        return;
      }


      let response;


      if (recordId) {
        response =
          await API.patch(
            `/api/iban/${recordId}/`,
            payload
          );

      } else {
        response =
          await API.post(
            "/api/iban/",
            payload
          );
      }


      setRecordId(
        response.data.id
      );

      setIbanMasque(
        response.data.iban_masque
        || ibanMasque
      );

      setFormData({
        iban: "",
        bic:
          response.data.bic
          || formData.bic,
        titulaire:
          response.data.titulaire
          || formData.titulaire,
        nom_banque:
          response.data.nom_banque
          || formData.nom_banque,
      });


      setMessage({
        type: "success",
        text:
          recordId
            ? "Vos coordonnées bancaires ont été mises à jour."
            : "Vos coordonnées bancaires ont été enregistrées.",
      });


      await fetchIban();

    } catch (error) {
      console.error(
        "IBAN SAVE ERROR",
        error
      );

      setMessage({
        type: "error",
        text:
          getApiError(
            error,
            "Impossible d'enregistrer vos coordonnées bancaires."
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
      <div className="iban-page">

        <div className="iban-loading">

          <Loader2
            size={30}
            className="iban-spin"
          />

          <span>
            Chargement des coordonnées bancaires...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="iban-page">

      <section className="iban-heading">

        <div>

          <span className="iban-eyebrow">
            Dossier salarié
          </span>

          <h1>
            Coordonnées bancaires
          </h1>

          <p>
            Gérez le compte bancaire utilisé
            pour le versement de votre rémunération.
          </p>

        </div>


        <button
          type="button"
          className="iban-secondary-button"
          onClick={() =>
            fetchIban(
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
                ? "iban-spin"
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
              `iban-message iban-message-${message.type}`
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


      {
        ibanMasque
        && (
          <section className="iban-current-card">

            <div className="iban-bank-icon">

              <CreditCard
                size={24}
              />

            </div>


            <div className="iban-current-content">

              <span>
                Compte bancaire enregistré
              </span>

              <strong>
                {ibanMasque}
              </strong>

              <small>
                {
                  formData.nom_banque
                  || "Établissement bancaire non renseigné"
                }
              </small>

            </div>


            <span className="iban-secure-badge">

              <ShieldCheck
                size={15}
              />

              Sécurisé

            </span>

          </section>
        )
      }


      <form
        className="iban-card"
        onSubmit={
          handleSubmit
        }
      >

        <div className="iban-card-heading">

          <div>

            <h2>
              Informations bancaires
            </h2>

            <p>
              L'IBAN complet n'est jamais
              réaffiché après son enregistrement.
            </p>

          </div>


          <span className="iban-card-icon">

            <Building2
              size={21}
            />

          </span>

        </div>


        <div className="iban-security-note">

          <ShieldCheck
            size={18}
          />

          <div>

            <strong>
              Données bancaires protégées
            </strong>

            <p>
              StaffHub n'affiche que
              la version masquée de votre IBAN.
              Pour le modifier, saisissez un nouvel IBAN.
            </p>

          </div>

        </div>


        <div className="iban-form-grid">

          <div className="iban-field iban-field-full">

            <label htmlFor="iban">
              IBAN
              {!recordId ? " *" : ""}
            </label>

            <input
              id="iban"
              name="iban"
              type="text"
              value={
                formData.iban
              }
              onChange={
                handleChange
              }
              required={
                !recordId
              }
              placeholder={
                recordId
                  ? "Saisir uniquement pour remplacer l'IBAN actuel"
                  : "FR76 1234 5678 9012 3456 7890 123"
              }
              autoComplete="off"
            />

            {
              ibanMasque
              && (
                <small>
                  IBAN actuel : {ibanMasque}
                </small>
              )
            }

          </div>


          <div className="iban-field">

            <label htmlFor="bic">
              BIC
            </label>

            <input
              id="bic"
              name="bic"
              type="text"
              value={
                formData.bic
              }
              onChange={
                handleChange
              }
              maxLength={11}
              placeholder="Exemple : AGRIFRPP"
            />

            <small>
              8 ou 11 caractères.
            </small>

          </div>


          <div className="iban-field">

            <label htmlFor="nom_banque">
              Nom de la banque
            </label>

            <input
              id="nom_banque"
              name="nom_banque"
              type="text"
              value={
                formData.nom_banque
              }
              onChange={
                handleChange
              }
              placeholder="Exemple : Crédit Agricole"
            />

          </div>


          <div className="iban-field iban-field-full">

            <label htmlFor="titulaire">
              Titulaire du compte *
            </label>

            <input
              id="titulaire"
              name="titulaire"
              type="text"
              value={
                formData.titulaire
              }
              onChange={
                handleChange
              }
              required
              placeholder="Nom et prénom du titulaire"
            />

          </div>

        </div>


        <div className="iban-actions">

          <button
            type="submit"
            className="iban-primary-button"
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
                      className="iban-spin"
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
