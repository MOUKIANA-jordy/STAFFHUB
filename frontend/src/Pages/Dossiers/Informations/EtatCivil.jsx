import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  UserRound,
} from "lucide-react";

import API from "../../../Services/api";

import "../../../Styles/etatcivil.css";


const EMPTY_FORM = {
  numero_secu: "",
  nom_naissance: "",
  nom_usage: "",
  prenom: "",
  sexe: "NR",
  date_naissance: "",
  lieu_naissance: "",
  pays_naissance: "",
  nationalite: "",
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


export default function EtatCivil() {

  const [
    formData,
    setFormData,
  ] = useState(EMPTY_FORM);

  const [
    recordId,
    setRecordId,
  ] = useState(null);

  const [
    maskedSocialSecurity,
    setMaskedSocialSecurity,
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
  // CHARGEMENT
  // =========================================================

  const fetchEtatCivil = useCallback(
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
            "/api/etatcivil/"
          );

        const results =
          extractResults(
            response.data
          );

        const item =
          results[0];

        if (!item) {
          setRecordId(null);

          setMaskedSocialSecurity("");

          setFormData(
            EMPTY_FORM
          );

          return;
        }

        setRecordId(
          item.id
        );

        setMaskedSocialSecurity(
          item.numero_secu_masque
          || ""
        );

        setFormData({
          numero_secu: "",
          nom_naissance:
            item.nom_naissance
            || "",
          nom_usage:
            item.nom_usage
            || "",
          prenom:
            item.prenom
            || "",
          sexe:
            item.sexe
            || "NR",
          date_naissance:
            item.date_naissance
            || "",
          lieu_naissance:
            item.lieu_naissance
            || "",
          pays_naissance:
            item.pays_naissance
            || "",
          nationalite:
            item.nationalite
            || "",
        });

      } catch (error) {

        console.error(
          "ETAT CIVIL ERROR",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger votre état civil.",
        });

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    []
  );


  useEffect(() => {
    fetchEtatCivil();
  }, [fetchEtatCivil]);


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

    setMessage({
      type: "",
      text: "",
    });

    setSaving(true);

    try {

      const payload = {
        nom_naissance:
          formData.nom_naissance,

        nom_usage:
          formData.nom_usage,

        prenom:
          formData.prenom,

        sexe:
          formData.sexe,

        date_naissance:
          formData.date_naissance
          || null,

        lieu_naissance:
          formData.lieu_naissance,

        pays_naissance:
          formData.pays_naissance,

        nationalite:
          formData.nationalite,
      };


      if (
        formData.numero_secu
          .trim()
      ) {

        payload.numero_secu =
          formData.numero_secu
            .replace(/\s/g, "");

      }


      let response;


      if (recordId) {

        response =
          await API.patch(
            `/api/etatcivil/${recordId}/`,
            payload
          );

      } else {

        response =
          await API.post(
            "/api/etatcivil/",
            payload
          );

      }


      const saved =
        response.data;


      setRecordId(
        saved.id
      );

      setMaskedSocialSecurity(
        saved.numero_secu_masque
        || maskedSocialSecurity
      );


      setFormData(
        (current) => ({
          ...current,
          numero_secu: "",
        })
      );


      setMessage({
        type: "success",
        text:
          recordId
            ? "Votre état civil a été mis à jour."
            : "Votre état civil a été enregistré.",
      });


      await fetchEtatCivil();

    } catch (error) {

      console.error(
        "ETAT CIVIL SAVE ERROR",
        error
      );


      const apiData =
        error.response?.data;


      let errorMessage =
        "Impossible d'enregistrer votre état civil.";


      if (
        apiData?.detail
      ) {

        errorMessage =
          apiData.detail;

      } else if (
        apiData
        && typeof apiData
          === "object"
      ) {

        const firstError =
          Object.values(
            apiData
          )[0];

        errorMessage =
          Array.isArray(
            firstError
          )
            ? firstError[0]
            : String(
                firstError
              );

      }


      setMessage({
        type: "error",
        text:
          errorMessage,
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
      <div className="etatcivil-page">

        <div className="etatcivil-loading">

          <Loader2
            size={30}
            className="etatcivil-spin"
          />

          <span>
            Chargement de l'état civil...
          </span>

        </div>

      </div>
    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="etatcivil-page">


      <section className="etatcivil-heading">

        <div>

          <span className="etatcivil-eyebrow">
            Informations personnelles
          </span>

          <h1>
            État civil
          </h1>

          <p>
            Consultez et mettez à jour
            vos informations d'identité.
          </p>

        </div>


        <button
          type="button"
          className="etatcivil-secondary-button"
          onClick={() =>
            fetchEtatCivil(
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
                ? "etatcivil-spin"
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
              `etatcivil-message etatcivil-message-${message.type}`
            }
          >

            {
              message.type
                === "success"
                ? (
                  <CheckCircle2
                    size={18}
                  />
                )
                : null
            }

            {message.text}

          </div>

        )
      }


      <form
        className="etatcivil-card"
        onSubmit={
          handleSubmit
        }
      >


        <div className="etatcivil-card-heading">

          <div>

            <h2>
              Informations d'identité
            </h2>

            <p>
              Les champs sont enregistrés
              directement dans votre dossier RH.
            </p>

          </div>


          <span className="etatcivil-card-icon">

            <UserRound
              size={21}
            />

          </span>

        </div>


        <div className="etatcivil-form-grid">


          <Field
            label="Prénom"
            name="prenom"
            value={
              formData.prenom
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Nom de naissance"
            name="nom_naissance"
            value={
              formData.nom_naissance
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Nom d'usage"
            name="nom_usage"
            value={
              formData.nom_usage
            }
            onChange={
              handleChange
            }
          />


          <div className="etatcivil-field">

            <label htmlFor="sexe">
              Sexe
            </label>

            <select
              id="sexe"
              name="sexe"
              value={
                formData.sexe
              }
              onChange={
                handleChange
              }
            >

              <option value="NR">
                Non renseigné
              </option>

              <option value="M">
                Homme
              </option>

              <option value="F">
                Femme
              </option>

              <option value="AUTRE">
                Autre
              </option>

            </select>

          </div>


          <Field
            label="Date de naissance"
            name="date_naissance"
            type="date"
            value={
              formData.date_naissance
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Lieu de naissance"
            name="lieu_naissance"
            value={
              formData.lieu_naissance
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Pays de naissance"
            name="pays_naissance"
            value={
              formData.pays_naissance
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Nationalité"
            name="nationalite"
            value={
              formData.nationalite
            }
            onChange={
              handleChange
            }
          />


          <div className="etatcivil-field etatcivil-field-full">

            <label htmlFor="numero_secu">
              Numéro de sécurité sociale
            </label>


            {
              maskedSocialSecurity
              && (

                <div className="etatcivil-masked-value">

                  Numéro enregistré :
                  <strong>
                    {maskedSocialSecurity}
                  </strong>

                </div>

              )
            }


            <input
              id="numero_secu"
              name="numero_secu"
              type="text"
              inputMode="numeric"
              value={
                formData.numero_secu
              }
              onChange={
                handleChange
              }
              placeholder={
                maskedSocialSecurity
                  ? "Saisir uniquement pour remplacer le numéro actuel"
                  : "Saisir le numéro de sécurité sociale"
              }
            />


            <small>
              Pour des raisons de sécurité,
              le numéro complet n'est jamais
              renvoyé par l'API.
            </small>

          </div>

        </div>


        <div className="etatcivil-actions">

          <button
            type="submit"
            className="etatcivil-primary-button"
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
                      className="etatcivil-spin"
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
  type = "text",
  value,
  onChange,
  required = false,
}) {

  return (
    <div className="etatcivil-field">

      <label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />

    </div>
  );
}
