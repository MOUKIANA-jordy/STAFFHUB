import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
  Save,
} from "lucide-react";

import API from "../../../Services/api";

import "../../../Styles/adresse.css";


const EMPTY_FORM = {
  numero: "",
  voie: "",
  complement: "",
  code_postal: "",
  commune: "",
  pays: "France",
  telephone: "",
  email: "",
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


export default function Adresse() {

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

  const fetchAdresse = useCallback(
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
            "/api/adresses/"
          );

        const results =
          extractResults(
            response.data
          );

        const item =
          results[0];

        if (!item) {

          setRecordId(
            null
          );

          setFormData(
            EMPTY_FORM
          );

          return;

        }


        setRecordId(
          item.id
        );


        setFormData({
          numero:
            item.numero
            || "",

          voie:
            item.voie
            || "",

          complement:
            item.complement
            || "",

          code_postal:
            item.code_postal
            || "",

          commune:
            item.commune
            || "",

          pays:
            item.pays
            || "France",

          telephone:
            item.telephone
            || "",

          email:
            item.email
            || "",
        });

      } catch (error) {

        console.error(
          "ADRESSE ERROR",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger votre adresse.",
        });

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    []
  );


  useEffect(() => {
    fetchAdresse();
  }, [fetchAdresse]);


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

      let response;


      if (recordId) {

        response =
          await API.patch(
            `/api/adresses/${recordId}/`,
            formData
          );

      } else {

        response =
          await API.post(
            "/api/adresses/",
            formData
          );

      }


      setRecordId(
        response.data.id
      );


      setFormData({
        numero:
          response.data.numero
          || "",

        voie:
          response.data.voie
          || "",

        complement:
          response.data.complement
          || "",

        code_postal:
          response.data.code_postal
          || "",

        commune:
          response.data.commune
          || "",

        pays:
          response.data.pays
          || "France",

        telephone:
          response.data.telephone
          || "",

        email:
          response.data.email
          || "",
      });


      setMessage({
        type: "success",
        text:
          recordId
            ? "Votre adresse a été mise à jour."
            : "Votre adresse a été enregistrée.",
      });

    } catch (error) {

      console.error(
        "ADRESSE SAVE ERROR",
        error
      );


      const apiData =
        error.response?.data;


      let errorMessage =
        "Impossible d'enregistrer votre adresse.";


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
      <div className="adresse-page">

        <div className="adresse-loading">

          <Loader2
            size={30}
            className="adresse-spin"
          />

          <span>
            Chargement de l'adresse...
          </span>

        </div>

      </div>
    );

  }


  return (
    <div className="adresse-page">


      <section className="adresse-heading">

        <div>

          <span className="adresse-eyebrow">
            Informations personnelles
          </span>

          <h1>
            Adresse et coordonnées
          </h1>

          <p>
            Gérez votre adresse,
            votre téléphone et votre email personnel.
          </p>

        </div>


        <button
          type="button"
          className="adresse-secondary-button"
          onClick={() =>
            fetchAdresse(
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
                ? "adresse-spin"
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
              `adresse-message adresse-message-${message.type}`
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
        className="adresse-card"
        onSubmit={
          handleSubmit
        }
      >


        <div className="adresse-card-heading">

          <div>

            <h2>
              Adresse principale
            </h2>

            <p>
              Les informations sont
              enregistrées dans votre dossier RH.
            </p>

          </div>


          <span className="adresse-card-icon">

            <MapPin
              size={21}
            />

          </span>

        </div>


        <div className="adresse-form-grid">


          <Field
            label="Numéro"
            name="numero"
            value={
              formData.numero
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Voie"
            name="voie"
            value={
              formData.voie
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Complément"
            name="complement"
            value={
              formData.complement
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Code postal"
            name="code_postal"
            value={
              formData.code_postal
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Commune"
            name="commune"
            value={
              formData.commune
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Pays"
            name="pays"
            value={
              formData.pays
            }
            onChange={
              handleChange
            }
            required
          />


          <Field
            label="Téléphone"
            name="telephone"
            type="tel"
            value={
              formData.telephone
            }
            onChange={
              handleChange
            }
          />


          <Field
            label="Email"
            name="email"
            type="email"
            value={
              formData.email
            }
            onChange={
              handleChange
            }
          />

        </div>


        <div className="adresse-actions">

          <button
            type="submit"
            className="adresse-primary-button"
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
                      className="adresse-spin"
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
    <div className="adresse-field">

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
