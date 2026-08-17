import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Edit3,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import API from "../../../Services/api";

import "../../../Styles/famille.css";


const EMPTY_FORM = {
  nom: "",
  prenom: "",
  lien: "",
  telephone: "",
  email: "",
  contact_urgence: false,
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


export default function Famille() {
  const [
    membres,
    setMembres,
  ] = useState([]);

  const [
    formData,
    setFormData,
  ] = useState(EMPTY_FORM);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    formOpen,
    setFormOpen,
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
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    message,
    setMessage,
  ] = useState({
    type: "",
    text: "",
  });


  // =========================================================
  // GET
  // =========================================================

  const fetchFamille = useCallback(
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
            "/api/famille/"
          );

        setMembres(
          extractResults(
            response.data
          )
        );

      } catch (error) {
        console.error(
          "FAMILLE ERROR",
          error
        );

        setMessage({
          type: "error",
          text:
            error.response?.data?.detail
            || "Impossible de charger les informations familiales.",
        });

        setMembres([]);

      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  useEffect(() => {
    fetchFamille();
  }, [fetchFamille]);


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

    setFormData(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };


  // =========================================================
  // NEW
  // =========================================================

  const openCreateForm = () => {
    setEditingId(null);

    setFormData(
      EMPTY_FORM
    );

    setFormOpen(true);

    setMessage({
      type: "",
      text: "",
    });
  };


  // =========================================================
  // EDIT
  // =========================================================

  const openEditForm = (
    membre
  ) => {
    setEditingId(
      membre.id
    );

    setFormData({
      nom:
        membre.nom
        || "",

      prenom:
        membre.prenom
        || "",

      lien:
        membre.lien
        || "",

      telephone:
        membre.telephone
        || "",

      email:
        membre.email
        || "",

      contact_urgence:
        Boolean(
          membre.contact_urgence
        ),
    });

    setFormOpen(true);

    setMessage({
      type: "",
      text: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    setFormOpen(false);

    setEditingId(null);

    setFormData(
      EMPTY_FORM
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
      if (editingId) {
        await API.patch(
          `/api/famille/${editingId}/`,
          formData
        );

        setMessage({
          type: "success",
          text:
            "Le membre de la famille a été mis à jour.",
        });

      } else {
        await API.post(
          "/api/famille/",
          formData
        );

        setMessage({
          type: "success",
          text:
            "Le membre de la famille a été ajouté.",
        });
      }

      closeForm();

      await fetchFamille();

    } catch (error) {
      console.error(
        "FAMILLE SAVE ERROR",
        error
      );

      setMessage({
        type: "error",
        text:
          getApiError(
            error,
            "Impossible d'enregistrer ces informations."
          ),
      });

    } finally {
      setSaving(false);
    }
  };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    membre
  ) => {
    const confirmed =
      window.confirm(
        `Supprimer ${membre.prenom} ${membre.nom} de votre dossier ?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      membre.id
    );

    setMessage({
      type: "",
      text: "",
    });

    try {
      await API.delete(
        `/api/famille/${membre.id}/`
      );

      setMessage({
        type: "success",
        text:
          "Le membre a été supprimé.",
      });

      await fetchFamille();

    } catch (error) {
      console.error(
        "FAMILLE DELETE ERROR",
        error
      );

      setMessage({
        type: "error",
        text:
          getApiError(
            error,
            "Impossible de supprimer ce membre."
          ),
      });

    } finally {
      setDeletingId(null);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="famille-page">

        <div className="famille-loading">

          <Loader2
            size={30}
            className="famille-spin"
          />

          <span>
            Chargement de la famille...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="famille-page">

      <section className="famille-heading">

        <div>

          <span className="famille-eyebrow">
            Dossier salarié
          </span>

          <h1>
            Famille & contacts
          </h1>

          <p>
            Gérez les membres de votre famille
            et les personnes à contacter en cas d'urgence.
          </p>

        </div>


        <div className="famille-heading-actions">

          <button
            type="button"
            className="famille-secondary-button"
            onClick={() =>
              fetchFamille(
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
                  ? "famille-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="famille-primary-button"
            onClick={
              formOpen
                ? closeForm
                : openCreateForm
            }
          >

            {
              formOpen
                ? (
                  <>
                    <X size={17} />
                    Fermer
                  </>
                )
                : (
                  <>
                    <Plus size={17} />
                    Ajouter
                  </>
                )
            }

          </button>

        </div>

      </section>


      {
        message.text
        && (
          <div
            className={
              `famille-message famille-message-${message.type}`
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
        formOpen
        && (
          <form
            className="famille-form-card"
            onSubmit={
              handleSubmit
            }
          >

            <div className="famille-card-heading">

              <div>

                <h2>
                  {
                    editingId
                      ? "Modifier un membre"
                      : "Ajouter un membre"
                  }
                </h2>

                <p>
                  Renseignez les informations
                  du membre de votre famille.
                </p>

              </div>


              <span className="famille-card-icon">
                <UserRound
                  size={21}
                />
              </span>

            </div>


            <div className="famille-form-grid">

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
                label="Nom"
                name="nom"
                value={
                  formData.nom
                }
                onChange={
                  handleChange
                }
                required
              />


              <div className="famille-field">

                <label htmlFor="lien">
                  Lien de parenté *
                </label>

                <select
                  id="lien"
                  name="lien"
                  value={
                    formData.lien
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="">
                    Sélectionner
                  </option>

                  <option value="CONJOINT">
                    Conjoint(e)
                  </option>

                  <option value="ENFANT">
                    Enfant
                  </option>

                  <option value="PARENT">
                    Parent
                  </option>

                  <option value="FRERE_SOEUR">
                    Frère ou sœur
                  </option>

                  <option value="AUTRE">
                    Autre
                  </option>

                </select>

              </div>


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


              <div className="famille-field famille-field-full">

                <label className="famille-checkbox">

                  <input
                    type="checkbox"
                    name="contact_urgence"
                    checked={
                      formData.contact_urgence
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span className="famille-checkbox-control" />

                  <span>

                    <strong>
                      Contact d'urgence
                    </strong>

                    <small>
                      Cette personne pourra être
                      contactée en cas d'urgence.
                    </small>

                  </span>

                </label>

              </div>

            </div>


            <div className="famille-form-actions">

              <button
                type="button"
                className="famille-secondary-button"
                onClick={
                  closeForm
                }
              >
                Annuler
              </button>


              <button
                type="submit"
                className="famille-primary-button"
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
                          className="famille-spin"
                        />

                        Enregistrement...
                      </>
                    )
                    : (
                      <>
                        <Save
                          size={17}
                        />

                        {
                          editingId
                            ? "Enregistrer"
                            : "Ajouter"
                        }
                      </>
                    )
                }

              </button>

            </div>

          </form>
        )
      }


      <section className="famille-card">

        <div className="famille-card-heading">

          <div>

            <h2>
              Membres enregistrés
            </h2>

            <p>
              {
                membres.length
              } membre
              {
                membres.length > 1
                  ? "s"
                  : ""
              } dans votre dossier.
            </p>

          </div>


          <span className="famille-card-icon">

            <UsersRound
              size={21}
            />

          </span>

        </div>


        {
          membres.length > 0
            ? (
              <div className="famille-grid">

                {
                  membres.map(
                    (membre) => (
                      <article
                        className="famille-member-card"
                        key={
                          membre.id
                        }
                      >

                        <div className="famille-member-header">

                          <span className="famille-avatar">

                            {
                              getInitials(
                                membre
                              )
                            }

                          </span>


                          <div>

                            <h3>
                              {membre.prenom} {membre.nom}
                            </h3>

                            <span className="famille-relation">
                              {
                                membre.lien_display
                                || membre.lien
                              }
                            </span>

                          </div>

                        </div>


                        <div className="famille-member-info">

                          {
                            membre.telephone
                            && (
                              <div>

                                <Phone
                                  size={15}
                                />

                                <span>
                                  {
                                    membre.telephone
                                  }
                                </span>

                              </div>
                            )
                          }


                          {
                            membre.email
                            && (
                              <div>

                                <span className="famille-mail-symbol">
                                  @
                                </span>

                                <span>
                                  {
                                    membre.email
                                  }
                                </span>

                              </div>
                            )
                          }

                        </div>


                        {
                          membre.contact_urgence
                          && (
                            <span className="famille-emergency-badge">
                              Contact d'urgence
                            </span>
                          )
                        }


                        <div className="famille-member-actions">

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                membre
                              )
                            }
                          >

                            <Edit3
                              size={15}
                            />

                            Modifier

                          </button>


                          <button
                            type="button"
                            className="famille-delete-button"
                            onClick={() =>
                              handleDelete(
                                membre
                              )
                            }
                            disabled={
                              deletingId
                              === membre.id
                            }
                          >

                            {
                              deletingId
                              === membre.id
                                ? (
                                  <Loader2
                                    size={15}
                                    className="famille-spin"
                                  />
                                )
                                : (
                                  <Trash2
                                    size={15}
                                  />
                                )
                            }

                            Supprimer

                          </button>

                        </div>

                      </article>
                    )
                  )
                }

              </div>
            )
            : (
              <div className="famille-empty">

                <UsersRound
                  size={38}
                />

                <strong>
                  Aucun membre enregistré
                </strong>

                <span>
                  Ajoutez un membre de votre famille
                  ou un contact d'urgence.
                </span>

              </div>
            )
        }

      </section>

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
    <div className="famille-field">

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


function getInitials(
  membre
) {
  return (
    `${
      membre.prenom
        ?.charAt(0)
        || ""
    }${
      membre.nom
        ?.charAt(0)
        || ""
    }`
      .toUpperCase()
      || "?"
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
