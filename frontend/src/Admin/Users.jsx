import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";

import API from "../Services/api";

import "../Styles/users.css";


export default function Users() {
  const navigate =
    useNavigate();


  // =========================================================
  // STATES
  // =========================================================

  const [
    users,
    setUsers,
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
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  // =========================================================
  // HELPERS
  // =========================================================

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


  // =========================================================
  // FETCH
  // =========================================================

  const loadUsers = async (
    refresh = false
  ) => {
    if (
      refresh
    ) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response =
        await API.get(
          "/api/salaries/"
        );

      setUsers(
        extractResults(
          response.data
        )
      );

    } catch (error) {
      console.error(
        "USERS ERROR",
        error
      );

      setUsers([]);

      setError(
        error.response?.data?.detail
        || "Impossible de charger les salariés."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadUsers();
  }, []);


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    user
  ) => {
    const fullName =
      `${user.prenom || ""} ${user.nom || ""}`.trim()
      || "ce salarié";

    const confirmed =
      window.confirm(
        `Supprimer définitivement ${fullName} ?`
      );

    if (
      !confirmed
    ) {
      return;
    }


    try {
      setDeletingId(
        user.id
      );

      setError("");

      await API.delete(
        `/api/salaries/${user.id}/`
      );

      setUsers(
        (currentUsers) =>
          currentUsers.filter(
            (item) =>
              item.id
              !== user.id
          )
      );

    } catch (error) {
      console.error(
        "DELETE USER ERROR",
        error
      );

      setError(
        error.response?.data?.detail
        || "Impossible de supprimer ce salarié."
      );

    } finally {
      setDeletingId(
        null
      );
    }
  };


  // =========================================================
  // FILTER
  // =========================================================

  const filteredUsers =
    useMemo(
      () => {
        const value =
          search
            .trim()
            .toLowerCase();

        if (
          !value
        ) {
          return users;
        }

        return users.filter(
          (user) => {
            const searchable =
              [
                user.nom,
                user.prenom,
                user.poste,
                user.etablissement,
                user.matricule,
                user.email_pro,
                user.email_personnel,
                user.type_contrat,
                user.role,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchable.includes(
              value
            );
          }
        );
      },
      [
        users,
        search,
      ]
    );


  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (
    user
  ) => {
    const first =
      user?.prenom
        ?.charAt(0)
        ?.toUpperCase()
      || "";

    const last =
      user?.nom
        ?.charAt(0)
        ?.toUpperCase()
      || "";

    return (
      `${first}${last}`
      || "U"
    );
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="users-admin-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="users-admin-header">

        <div>

          <span className="users-admin-eyebrow">
            Administration
          </span>

          <h1>
            Gestion des salariés
          </h1>

          <p>
            Consultez, ajoutez et gérez les profils
            salariés de votre organisation.
          </p>

        </div>


        <div className="users-admin-header-actions">

          <button
            type="button"
            className="users-refresh-button"
            onClick={() =>
              loadUsers(
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
                  ? "users-spin"
                  : ""
              }
            />

            Actualiser

          </button>


          <button
            type="button"
            className="users-add-button"
            onClick={() =>
              navigate(
                "/admin/salarie/create"
              )
            }
          >

            <Plus
              size={18}
            />

            Ajouter un salarié

          </button>

        </div>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {
        error
        && (
          <div className="users-admin-error">
            {error}
          </div>
        )
      }


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="users-admin-summary">

        <article>

          <span className="users-summary-icon users-summary-icon-blue">

            <UsersRound
              size={21}
            />

          </span>

          <div>

            <strong>
              {users.length}
            </strong>

            <span>
              Salariés
            </span>

          </div>

        </article>


        <article>

          <span className="users-summary-icon users-summary-icon-green">

            <UserRound
              size={21}
            />

          </span>

          <div>

            <strong>
              {
                users.filter(
                  (user) =>
                    user.type_contrat
                    === "CDI"
                ).length
              }
            </strong>

            <span>
              CDI
            </span>

          </div>

        </article>


        <article>

          <span className="users-summary-icon users-summary-icon-purple">

            <UsersRound
              size={21}
            />

          </span>

          <div>

            <strong>
              {
                users.filter(
                  (user) =>
                    [
                      "RH",
                      "ADMIN",
                    ].includes(
                      user.role
                    )
                ).length
              }
            </strong>

            <span>
              RH / Admin
            </span>

          </div>

        </article>

      </section>


      {/* ===================================================
          CARD
      =================================================== */}

      <section className="users-admin-card">

        <header className="users-admin-card-header">

          <div>

            <h2>
              Liste des salariés
            </h2>

            <p>
              {filteredUsers.length} résultat
              {filteredUsers.length > 1 ? "s" : ""}
            </p>

          </div>


          <div className="users-search">

            <Search
              size={17}
            />

            <input
              type="search"
              value={
                search
              }
              onChange={
                (event) =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Rechercher un salarié..."
            />

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        {
          loading
            ? (
              <div className="users-admin-loading">

                <RefreshCw
                  size={26}
                  className="users-spin"
                />

                <span>
                  Chargement des salariés...
                </span>

              </div>
            )
            : filteredUsers.length === 0
              ? (
                <div className="users-admin-empty">

                  <UsersRound
                    size={38}
                  />

                  <strong>
                    Aucun salarié
                  </strong>

                  <span>
                    Aucun résultat ne correspond
                    à votre recherche.
                  </span>

                </div>
              )
              : (
                <div className="users-table-wrapper">

                  <table className="users-table">

                    <thead>

                      <tr>

                        <th>
                          Salarié
                        </th>

                        <th>
                          Poste
                        </th>

                        <th>
                          Établissement
                        </th>

                        <th>
                          Contrat
                        </th>

                        <th>
                          Rôle
                        </th>

                        <th className="users-actions-column">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {
                        filteredUsers.map(
                          (user) => (
                            <tr
                              key={
                                user.id
                              }
                              className="users-clickable-row"
                              onClick={() =>
                                navigate(
                                  `/admin/salarie/${user.id}`
                                )
                              }
                            >

                              {/* SALARIÉ */}

                              <td>

                                <div className="users-employee">

                                  <span className="users-avatar">

                                    {
                                      getInitials(
                                        user
                                      )
                                    }

                                  </span>


                                  <div>

                                    <strong>
                                      {
                                        `${user.prenom || ""} ${user.nom || ""}`.trim()
                                        || "Salarié"
                                      }
                                    </strong>

                                    <span>
                                      {
                                        user.matricule
                                        || user.email_pro
                                        || "—"
                                      }
                                    </span>

                                  </div>

                                </div>

                              </td>


                              {/* POSTE */}

                              <td>

                                <span className="users-main-value">
                                  {
                                    user.poste
                                    || "Non renseigné"
                                  }
                                </span>

                              </td>


                              {/* ETABLISSEMENT */}

                              <td>

                                <span className="users-secondary-value">
                                  {
                                    user.etablissement
                                    || "Non renseigné"
                                  }
                                </span>

                              </td>


                              {/* CONTRAT */}

                              <td>

                                <span className="users-contract-badge">
                                  {
                                    user.type_contrat
                                    || "—"
                                  }
                                </span>

                              </td>


                              {/* ROLE */}

                              <td>

                                <span
                                  className={
                                    `users-role-badge users-role-${(
                                      user.role
                                      || "SALARIE"
                                    ).toLowerCase()}`
                                  }
                                >

                                  {
                                    user.role
                                    || "SALARIE"
                                  }

                                </span>

                              </td>


                              {/* ACTIONS */}

                              <td
                                className="users-row-actions"
                                onClick={
                                  (event) =>
                                    event.stopPropagation()
                                }
                              >

                                <button
                                  type="button"
                                  className="users-action-button users-action-view"
                                  title="Voir"
                                  onClick={() =>
                                    navigate(
                                      `/admin/salarie/${user.id}`
                                    )
                                  }
                                >

                                  <Eye
                                    size={16}
                                  />

                                </button>


                                <button
                                  type="button"
                                  className="users-action-button users-action-edit"
                                  title="Modifier"
                                  onClick={() =>
                                    navigate(
                                      `/admin/salarie/edit/${user.id}`
                                    )
                                  }
                                >

                                  <Pencil
                                    size={15}
                                  />

                                </button>


                                <button
                                  type="button"
                                  className="users-action-button users-action-delete"
                                  title="Supprimer"
                                  disabled={
                                    deletingId
                                    === user.id
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      user
                                    )
                                  }
                                >

                                  {
                                    deletingId
                                    === user.id
                                      ? (
                                        <RefreshCw
                                          size={15}
                                          className="users-spin"
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

    </main>
  );
}
