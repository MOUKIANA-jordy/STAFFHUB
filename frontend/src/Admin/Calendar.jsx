import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import API from "../Services/api";

import "../Styles/calendar.css";


const TYPE_OPTIONS = [
  {
    value: "BUREAU",
    label: "Bureau",
  },
  {
    value: "TELETRAVAIL",
    label: "Télétravail",
  },
  {
    value: "CONGE",
    label: "Congé",
  },
  {
    value: "ABSENCE",
    label: "Absence",
  },
  {
    value: "VACATION",
    label: "Vacation",
  },
  {
    value: "FORMATION",
    label: "Formation",
  },
];


const EMPTY_FORM = {
  salarie: "",
  date: "",
  type_journee: "BUREAU",
  heure_debut: "",
  heure_fin: "",
  commentaire: "",
};


export default function CalendarPage() {
  const [
    plannings,
    setPlannings,
  ] = useState([]);

  const [
    salaries,
    setSalaries,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
  );

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    editingPlanning,
    setEditingPlanning,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );


  /* =========================================================
     HELPERS
  ========================================================= */

  const extractResults = (
    data
  ) => {
    if (
      Array.isArray(data)
    ) {
      return data;
    }

    if (
      data
      && Array.isArray(
        data.results
      )
    ) {
      return data.results;
    }

    if (
      data
      && Array.isArray(
        data.data
      )
    ) {
      return data.data;
    }

    return [];
  };


  const formatDate = (
    dateString
  ) => {
    if (!dateString) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(
      new Date(
        `${dateString}T12:00:00`
      )
    );
  };


  const formatTime = (
    value
  ) => {
    if (!value) {
      return "";
    }

    return value.slice(
      0,
      5
    );
  };


  const monthLabel =
    useMemo(
      () =>
        new Intl.DateTimeFormat(
          "fr-FR",
          {
            month: "long",
            year: "numeric",
          }
        ).format(
          selectedMonth
        ),
      [
        selectedMonth,
      ]
    );


  const getPlanningTypeLabel = (
    planning
  ) => {
    if (
      planning
        ?.type_journee_display
    ) {
      return (
        planning
          .type_journee_display
      );
    }

    const option =
      TYPE_OPTIONS.find(
        (item) =>
          item.value
          === planning?.type_journee
      );

    return (
      option?.label
      || planning?.type_journee
      || "Planning"
    );
  };


  const getEmployeeName = (
    employee
  ) => {
    return (
      `${employee?.prenom || ""} ${employee?.nom || ""}`.trim()
      || employee?.matricule
      || "Salarié"
    );
  };


  const getInitials = (
    planning
  ) => {
    const name =
      planning?.salarie_nom
      || "";

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (
      parts.length === 0
    ) {
      return "S";
    }

    return parts
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0)
            .toUpperCase()
      )
      .join("");
  };


  const getApiError = (
    apiError
  ) => {
    const data =
      apiError?.response?.data;

    if (!data) {
      return (
        "Une erreur est survenue."
      );
    }

    if (
      typeof data.detail
      === "string"
    ) {
      return data.detail;
    }

    if (
      typeof data
      === "string"
    ) {
      return data;
    }

    if (
      typeof data
      === "object"
    ) {
      const firstKey =
        Object.keys(data)[0];

      if (firstKey) {
        const value =
          data[firstKey];

        if (
          Array.isArray(value)
        ) {
          return value.join(" ");
        }

        if (
          typeof value
          === "string"
        ) {
          return value;
        }
      }
    }

    return (
      "Impossible d'effectuer cette opération."
    );
  };


  /* =========================================================
     FETCH
  ========================================================= */

  const loadData =
    useCallback(
      async (
        refresh = false
      ) => {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          const [
            planningResponse,
            salariesResponse,
          ] =
            await Promise.all([
              API.get(
                "/api/planning/"
              ),

              API.get(
                "/api/salaries/"
              ),
            ]);

          setPlannings(
            extractResults(
              planningResponse.data
            )
          );

          setSalaries(
            extractResults(
              salariesResponse.data
            )
          );

        } catch (apiError) {
          console.error(
            "ADMIN PLANNING ERROR",
            apiError
          );

          setError(
            getApiError(
              apiError
            )
          );

        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );


  useEffect(
    () => {
      loadData();
    },
    [
      loadData,
    ]
  );


  /* =========================================================
     FILTER
  ========================================================= */

  const visiblePlannings =
    useMemo(
      () => {
        const month =
          selectedMonth.getMonth();

        const year =
          selectedMonth.getFullYear();

        const query =
          search
            .trim()
            .toLowerCase();

        return plannings
          .filter(
            (planning) => {
              if (
                !planning.date
              ) {
                return false;
              }

              const date =
                new Date(
                  `${planning.date}T12:00:00`
                );

              const sameMonth =
                date.getMonth()
                  === month
                && date.getFullYear()
                  === year;

              if (
                !sameMonth
              ) {
                return false;
              }

              if (
                !query
              ) {
                return true;
              }

              const searchable =
                [
                  planning.salarie_nom,
                  planning.type_journee,
                  planning.type_journee_display,
                  planning.commentaire,
                  planning.date,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase();

              return (
                searchable.includes(
                  query
                )
              );
            }
          )
          .sort(
            (a, b) =>
              new Date(
                `${a.date}T${a.heure_debut || "00:00"}`
              )
              -
              new Date(
                `${b.date}T${b.heure_debut || "00:00"}`
              )
          );
      },
      [
        plannings,
        search,
        selectedMonth,
      ]
    );


  /* =========================================================
     STATS
  ========================================================= */

  const monthStats =
    useMemo(
      () => {
        const total =
          visiblePlannings.length;

        const bureau =
          visiblePlannings.filter(
            (planning) =>
              planning.type_journee
              === "BUREAU"
          ).length;

        const teletravail =
          visiblePlannings.filter(
            (planning) =>
              planning.type_journee
              === "TELETRAVAIL"
          ).length;

        const absences =
          visiblePlannings.filter(
            (planning) =>
              [
                "CONGE",
                "ABSENCE",
              ].includes(
                planning.type_journee
              )
          ).length;

        return {
          total,
          bureau,
          teletravail,
          absences,
        };
      },
      [
        visiblePlannings,
      ]
    );


  /* =========================================================
     MODAL
  ========================================================= */

  const openCreateModal = (
    date = ""
  ) => {
    setEditingPlanning(
      null
    );

    setForm({
      ...EMPTY_FORM,
      date,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };


  const openEditModal = (
    planning
  ) => {
    setEditingPlanning(
      planning
    );

    setForm({
      salarie:
        String(
          planning.salarie
          || ""
        ),

      date:
        planning.date
        || "",

      type_journee:
        planning.type_journee
        || "BUREAU",

      heure_debut:
        formatTime(
          planning.heure_debut
        ),

      heure_fin:
        formatTime(
          planning.heure_fin
        ),

      commentaire:
        planning.commentaire
        || "",
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };


  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingPlanning(null);
    setForm(
      EMPTY_FORM
    );
  };


  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    if (
      name
      === "type_journee"
      && [
        "CONGE",
        "ABSENCE",
      ].includes(value)
    ) {
      setForm(
        (current) => ({
          ...current,
          type_journee: value,
          heure_debut: "",
          heure_fin: "",
        })
      );

      return;
    }

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };


  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !form.salarie
      ) {
        setError(
          "Sélectionnez un salarié."
        );

        return;
      }

      if (
        !form.date
      ) {
        setError(
          "Sélectionnez une date."
        );

        return;
      }

      const withoutHours =
        [
          "CONGE",
          "ABSENCE",
        ].includes(
          form.type_journee
        );

      if (
        !withoutHours
        && (
          !form.heure_debut
          || !form.heure_fin
        )
      ) {
        setError(
          "Renseignez l'heure de début et l'heure de fin."
        );

        return;
      }

      if (
        !withoutHours
        && form.heure_debut
        >= form.heure_fin
      ) {
        setError(
          "L'heure de fin doit être postérieure à l'heure de début."
        );

        return;
      }

      const payload = {
        salarie:
          Number(
            form.salarie
          ),

        date:
          form.date,

        type_journee:
          form.type_journee,

        heure_debut:
          withoutHours
            ? null
            : form.heure_debut,

        heure_fin:
          withoutHours
            ? null
            : form.heure_fin,

        commentaire:
          form.commentaire
            .trim(),
      };

      try {
        setSaving(true);

        if (
          editingPlanning
        ) {
          await API.patch(
            `/api/planning/${editingPlanning.id}/`,
            payload
          );

          setSuccess(
            "Le planning a été modifié."
          );

        } else {
          await API.post(
            "/api/planning/",
            payload
          );

          setSuccess(
            "Le planning a été attribué au salarié."
          );
        }

        await loadData(
          true
        );

        setModalOpen(false);
        setEditingPlanning(null);
        setForm(
          EMPTY_FORM
        );

      } catch (apiError) {
        console.error(
          "SAVE PLANNING ERROR",
          apiError
        );

        const responseData =
          apiError?.response?.data;

        if (
          responseData?.non_field_errors
        ) {
          setError(
            "Ce salarié possède déjà un planning pour cette date."
          );

        } else {
          setError(
            getApiError(
              apiError
            )
          );
        }

      } finally {
        setSaving(false);
      }
    };


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete =
    async (
      planning
    ) => {
      const confirmed =
        window.confirm(
          `Supprimer le planning de ${planning.salarie_nom || "ce salarié"} du ${formatDate(planning.date)} ?`
        );

      if (
        !confirmed
      ) {
        return;
      }

      try {
        setDeletingId(
          planning.id
        );

        setError("");
        setSuccess("");

        await API.delete(
          `/api/planning/${planning.id}/`
        );

        setPlannings(
          (current) =>
            current.filter(
              (item) =>
                item.id
                !== planning.id
            )
        );

        setSuccess(
          "Le planning a été supprimé."
        );

      } catch (apiError) {
        console.error(
          "DELETE PLANNING ERROR",
          apiError
        );

        setError(
          getApiError(
            apiError
          )
        );

      } finally {
        setDeletingId(
          null
        );
      }
    };


  /* =========================================================
     MONTH
  ========================================================= */

  const previousMonth = () => {
    setSelectedMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1
        )
    );
  };


  const nextMonth = () => {
    setSelectedMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1
        )
    );
  };


  const currentMonth = () => {
    const today =
      new Date();

    setSelectedMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="admin-calendar-page">

      {/* HEADER */}

      <header className="admin-calendar-header">

        <div>

          <span className="admin-calendar-eyebrow">
            Administration
          </span>

          <h1>
            Gestion des plannings
          </h1>

          <p>
            Attribuez et gérez les horaires,
            absences, congés et formations
            de vos salariés.
          </p>

        </div>


        <div className="admin-calendar-header-actions">

          <button
            type="button"
            className="calendar-secondary-button"
            onClick={() =>
              loadData(
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
                  ? "calendar-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="calendar-primary-button"
            onClick={() =>
              openCreateModal()
            }
          >

            <Plus
              size={18}
            />

            Ajouter un planning

          </button>

        </div>

      </header>


      {/* MESSAGES */}

      {
        error
        && (
          <div className="admin-calendar-message admin-calendar-error">
            {error}
          </div>
        )
      }

      {
        success
        && (
          <div className="admin-calendar-message admin-calendar-success">
            {success}
          </div>
        )
      }


      {/* STATS */}

      <section className="admin-calendar-stats">

        <article>

          <span className="calendar-stat-icon calendar-stat-blue">
            <CalendarDays
              size={21}
            />
          </span>

          <div>
            <strong>
              {monthStats.total}
            </strong>

            <span>
              Journées planifiées
            </span>
          </div>

        </article>


        <article>

          <span className="calendar-stat-icon calendar-stat-green">
            <Clock3
              size={21}
            />
          </span>

          <div>
            <strong>
              {monthStats.bureau}
            </strong>

            <span>
              Bureau
            </span>
          </div>

        </article>


        <article>

          <span className="calendar-stat-icon calendar-stat-purple">
            <UserRound
              size={21}
            />
          </span>

          <div>
            <strong>
              {monthStats.teletravail}
            </strong>

            <span>
              Télétravail
            </span>
          </div>

        </article>


        <article>

          <span className="calendar-stat-icon calendar-stat-orange">
            <CalendarDays
              size={21}
            />
          </span>

          <div>
            <strong>
              {monthStats.absences}
            </strong>

            <span>
              Congés / absences
            </span>
          </div>

        </article>

      </section>


      {/* PLANNING CARD */}

      <section className="admin-calendar-card">

        <header className="admin-calendar-toolbar">

          <div className="calendar-month-navigation">

            <button
              type="button"
              onClick={
                previousMonth
              }
              aria-label="Mois précédent"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            <button
              type="button"
              className="calendar-today-button"
              onClick={
                currentMonth
              }
            >
              Aujourd'hui
            </button>

            <button
              type="button"
              onClick={
                nextMonth
              }
              aria-label="Mois suivant"
            >
              <ChevronRight
                size={18}
              />
            </button>

          </div>


          <h2>
            {
              monthLabel
                .charAt(0)
                .toUpperCase()
              + monthLabel.slice(1)
            }
          </h2>


          <div className="admin-calendar-search">

            <Search
              size={17}
            />

            <input
              type="search"
              placeholder="Rechercher un salarié..."
              value={
                search
              }
              onChange={
                (event) =>
                  setSearch(
                    event.target.value
                  )
              }
            />

          </div>

        </header>


        {
          loading
            ? (
              <div className="admin-calendar-loading">

                <RefreshCw
                  size={28}
                  className="calendar-spin"
                />

                <span>
                  Chargement des plannings...
                </span>

              </div>
            )

            : visiblePlannings.length
              === 0

              ? (
                <div className="admin-calendar-empty">

                  <CalendarDays
                    size={42}
                  />

                  <strong>
                    Aucun planning
                  </strong>

                  <span>
                    Aucun planning n'est enregistré
                    pour cette période.
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      openCreateModal()
                    }
                  >
                    <Plus
                      size={17}
                    />

                    Ajouter un planning
                  </button>

                </div>
              )

              : (
                <div className="admin-calendar-table-wrapper">

                  <table className="admin-calendar-table">

                    <thead>

                      <tr>

                        <th>
                          Date
                        </th>

                        <th>
                          Salarié
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          Horaires
                        </th>

                        <th>
                          Commentaire
                        </th>

                        <th className="calendar-actions-heading">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {
                        visiblePlannings.map(
                          (planning) => (
                            <tr
                              key={
                                planning.id
                              }
                            >

                              <td>

                                <strong className="calendar-date-value">
                                  {
                                    formatDate(
                                      planning.date
                                    )
                                  }
                                </strong>

                              </td>


                              <td>

                                <div className="calendar-employee">

                                  <span className="calendar-avatar">
                                    {
                                      getInitials(
                                        planning
                                      )
                                    }
                                  </span>

                                  <div>

                                    <strong>
                                      {
                                        planning.salarie_nom
                                        || "Salarié"
                                      }
                                    </strong>

                                    <span>
                                      Salarié #{planning.salarie}
                                    </span>

                                  </div>

                                </div>

                              </td>


                              <td>

                                <span
                                  className={
                                    `calendar-type-badge calendar-type-${(
                                      planning.type_journee
                                      || "BUREAU"
                                    ).toLowerCase()}`
                                  }
                                >
                                  {
                                    getPlanningTypeLabel(
                                      planning
                                    )
                                  }
                                </span>

                              </td>


                              <td>

                                {
                                  planning.heure_debut
                                  && planning.heure_fin
                                    ? (
                                      <span className="calendar-hours">

                                        <Clock3
                                          size={15}
                                        />

                                        {
                                          formatTime(
                                            planning.heure_debut
                                          )
                                        }

                                        {" — "}

                                        {
                                          formatTime(
                                            planning.heure_fin
                                          )
                                        }

                                      </span>
                                    )

                                    : (
                                      <span className="calendar-no-hours">
                                        —
                                      </span>
                                    )
                                }

                              </td>


                              <td>

                                <span className="calendar-comment">
                                  {
                                    planning.commentaire
                                    || "—"
                                  }
                                </span>

                              </td>


                              <td className="calendar-row-actions">

                                <button
                                  type="button"
                                  className="calendar-action-button calendar-edit-button"
                                  title="Modifier"
                                  onClick={() =>
                                    openEditModal(
                                      planning
                                    )
                                  }
                                >
                                  <Pencil
                                    size={15}
                                  />
                                </button>


                                <button
                                  type="button"
                                  className="calendar-action-button calendar-delete-button"
                                  title="Supprimer"
                                  disabled={
                                    deletingId
                                    === planning.id
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      planning
                                    )
                                  }
                                >

                                  {
                                    deletingId
                                    === planning.id
                                      ? (
                                        <RefreshCw
                                          size={15}
                                          className="calendar-spin"
                                        />
                                      )
                                      : (
                                        <Trash2
                                          size={15}
                                        />
                                      )
                                  }

                                </button>

                              </td>

                            </tr>
                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>
              )
        }

      </section>


      {/* MODAL */}

      {
        modalOpen
        && (
          <div
            className="calendar-modal-overlay"
            role="presentation"
            onMouseDown={
              (event) => {
                if (
                  event.target
                  === event.currentTarget
                ) {
                  closeModal();
                }
              }
            }
          >

            <div
              className="calendar-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="calendar-modal-title"
            >

              <header className="calendar-modal-header">

                <div>

                  <span>
                    Planning salarié
                  </span>

                  <h2 id="calendar-modal-title">
                    {
                      editingPlanning
                        ? "Modifier le planning"
                        : "Ajouter un planning"
                    }
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  aria-label="Fermer"
                >
                  <X
                    size={20}
                  />
                </button>

              </header>


              <form
                onSubmit={
                  handleSubmit
                }
                className="calendar-form"
              >

                <div className="calendar-form-group calendar-form-full">

                  <label htmlFor="planning-salarie">
                    Salarié
                  </label>

                  <select
                    id="planning-salarie"
                    name="salarie"
                    value={
                      form.salarie
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Sélectionner un salarié
                    </option>

                    {
                      salaries.map(
                        (employee) => (
                          <option
                            key={
                              employee.id
                            }
                            value={
                              employee.id
                            }
                          >
                            {
                              employee.matricule
                                ? `${employee.matricule} — `
                                : ""
                            }
                            {
                              getEmployeeName(
                                employee
                              )
                            }
                          </option>
                        )
                      )
                    }

                  </select>

                </div>


                <div className="calendar-form-grid">

                  <div className="calendar-form-group">

                    <label htmlFor="planning-date">
                      Date
                    </label>

                    <input
                      id="planning-date"
                      type="date"
                      name="date"
                      value={
                        form.date
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>


                  <div className="calendar-form-group">

                    <label htmlFor="planning-type">
                      Type de journée
                    </label>

                    <select
                      id="planning-type"
                      name="type_journee"
                      value={
                        form.type_journee
                      }
                      onChange={
                        handleChange
                      }
                    >

                      {
                        TYPE_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )
                      }

                    </select>

                  </div>

                </div>


                {
                  ![
                    "CONGE",
                    "ABSENCE",
                  ].includes(
                    form.type_journee
                  )
                  && (
                    <div className="calendar-form-grid">

                      <div className="calendar-form-group">

                        <label htmlFor="planning-start">
                          Heure de début
                        </label>

                        <input
                          id="planning-start"
                          type="time"
                          name="heure_debut"
                          value={
                            form.heure_debut
                          }
                          onChange={
                            handleChange
                          }
                          required
                        />

                      </div>


                      <div className="calendar-form-group">

                        <label htmlFor="planning-end">
                          Heure de fin
                        </label>

                        <input
                          id="planning-end"
                          type="time"
                          name="heure_fin"
                          value={
                            form.heure_fin
                          }
                          onChange={
                            handleChange
                          }
                          required
                        />

                      </div>

                    </div>
                  )
                }


                <div className="calendar-form-group calendar-form-full">

                  <label htmlFor="planning-comment">
                    Commentaire
                  </label>

                  <textarea
                    id="planning-comment"
                    name="commentaire"
                    rows="4"
                    value={
                      form.commentaire
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Exemple : Siège - Service informatique"
                  />

                </div>


                {
                  error
                  && (
                    <div className="calendar-form-error">
                      {error}
                    </div>
                  )
                }


                <footer className="calendar-form-actions">

                  <button
                    type="button"
                    className="calendar-cancel-button"
                    onClick={
                      closeModal
                    }
                    disabled={
                      saving
                    }
                  >
                    Annuler
                  </button>


                  <button
                    type="submit"
                    className="calendar-save-button"
                    disabled={
                      saving
                    }
                  >

                    {
                      saving
                        ? (
                          <>
                            <RefreshCw
                              size={17}
                              className="calendar-spin"
                            />

                            Enregistrement...
                          </>
                        )
                        : (
                          <>
                            {
                              editingPlanning
                                ? (
                                  <Pencil
                                    size={17}
                                  />
                                )
                                : (
                                  <Plus
                                    size={18}
                                  />
                                )
                            }

                            {
                              editingPlanning
                                ? "Enregistrer les modifications"
                                : "Attribuer le planning"
                            }
                          </>
                        )
                    }

                  </button>

                </footer>

              </form>

            </div>

          </div>
        )
      }

    </main>
  );
}
