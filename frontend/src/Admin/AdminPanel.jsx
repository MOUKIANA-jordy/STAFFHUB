import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "../Styles/adminpanel.css";
import API from "../Services/api";


export default function AdminPanel() {
  const navigate = useNavigate();

  // =========================================================
  // STATES
  // =========================================================

  const [tab, setTab] = useState("stats");

  const [users, setUsers] = useState([]);

  const [demandes, setDemandes] = useState([]);

  const [stats, setStats] = useState(null);

  const [loadingUsers, setLoadingUsers] = useState(true);

  const [loadingDemandes, setLoadingDemandes] = useState(true);

  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");


  // =========================================================
  // HELPER PAGINATION DRF
  // =========================================================

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


  // =========================================================
  // STATS
  // =========================================================

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get(
          "/api/admin/stats/"
        );

        setStats(
          response.data
        );

      } catch (err) {
        console.error(
          "STATS ERROR",
          err
        );

        setError(
          "Impossible de charger les statistiques."
        );
      }
    };

    fetchStats();

  }, []);


  // =========================================================
  // USERS
  // =========================================================

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);

      try {
        const response = await API.get(
          "/api/salaries/"
        );

        setUsers(
          extractResults(
            response.data
          )
        );

      } catch (err) {
        console.error(
          "USERS ERROR",
          err
        );

        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();

  }, []);


  // =========================================================
  // DEMANDES
  // =========================================================

  useEffect(() => {
    const fetchDemandes = async () => {
      setLoadingDemandes(true);

      try {
        const response = await API.get(
          "/api/demandes/"
        );

        setDemandes(
          extractResults(
            response.data
          )
        );

      } catch (err) {
        console.error(
          "DEMANDES ERROR",
          err
        );

        setDemandes([]);
      } finally {
        setLoadingDemandes(false);
      }
    };

    fetchDemandes();

  }, []);


  // =========================================================
  // APPROUVER
  // =========================================================

  const approuverDemande = async (id) => {
    try {
      setActionLoading(id);
      setError("");

      const response = await API.post(
        `/api/demandes/${id}/approuver/`
      );

      const demandeMiseAJour = (
        response.data?.demande
      );

      setDemandes((prev) =>
        prev.map((demande) => {
          if (demande.id !== id) {
            return demande;
          }

          if (demandeMiseAJour) {
            return {
              ...demande,
              ...demandeMiseAJour,
            };
          }

          return {
            ...demande,
            statut: "APPROUVE",
            statut_display: "Approuvé",
          };
        })
      );

      // Actualiser les stats
      try {
        const statsResponse = await API.get(
          "/api/admin/stats/"
        );

        setStats(
          statsResponse.data
        );

      } catch (statsErr) {
        console.error(
          "REFRESH STATS ERROR",
          statsErr
        );
      }

    } catch (err) {
      console.error(
        "APPROBATION ERROR",
        err
      );

      const message = (
        err.response?.data?.detail
        || err.response?.data?.message
        || "Impossible d'approuver la demande."
      );

      setError(message);

    } finally {
      setActionLoading(null);
    }
  };


  // =========================================================
  // REFUSER
  // =========================================================

  const refuserDemande = async (id) => {
    try {
      setActionLoading(id);
      setError("");

      const response = await API.post(
        `/api/demandes/${id}/refuser/`
      );

      const demandeMiseAJour = (
        response.data?.demande
      );

      setDemandes((prev) =>
        prev.map((demande) => {
          if (demande.id !== id) {
            return demande;
          }

          if (demandeMiseAJour) {
            return {
              ...demande,
              ...demandeMiseAJour,
            };
          }

          return {
            ...demande,
            statut: "REFUSE",
            statut_display: "Refusé",
          };
        })
      );

      // Actualiser les stats
      try {
        const statsResponse = await API.get(
          "/api/admin/stats/"
        );

        setStats(
          statsResponse.data
        );

      } catch (statsErr) {
        console.error(
          "REFRESH STATS ERROR",
          statsErr
        );
      }

    } catch (err) {
      console.error(
        "REFUS ERROR",
        err
      );

      const message = (
        err.response?.data?.detail
        || err.response?.data?.message
        || "Impossible de refuser la demande."
      );

      setError(message);

    } finally {
      setActionLoading(null);
    }
  };


  // =========================================================
  // FORMATAGE STATUT
  // =========================================================

  const formatStatus = (statut) => {
    const statuses = {
      EN_ATTENTE: "🕐 En attente",
      APPROUVE: "✅ Approuvé",
      REFUSE: "❌ Refusé",
    };

    return (
      statuses[statut]
      || statut
      || "—"
    );
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-panel">

      <h2>
        Admin Panel
      </h2>


      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}


      <div className="admin-container">


        {/* =================================================
            MENU
        ================================================= */}

        <div className="admin-menu">

          <div
            onClick={() =>
              setTab("stats")
            }
            className={
              tab === "stats"
                ? "active"
                : ""
            }
          >
            📊 Dashboard
          </div>


          <div
            onClick={() =>
              setTab("users")
            }
            className={
              tab === "users"
                ? "active"
                : ""
            }
          >
            👥 Salariés
          </div>


          <div
            onClick={() =>
              setTab("demandes")
            }
            className={
              tab === "demandes"
                ? "active"
                : ""
            }
          >
            📁 Demandes
          </div>

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="admin-content">


          {/* ===============================================
              STATS
          =============================================== */}

          {tab === "stats" && (
            <>

              <h3>
                Statistiques
              </h3>


              {stats ? (

                <div className="stats-grid">


                  <div className="stat-card">

                    <div>
                      👥 Salariés
                    </div>

                    <strong>
                      {stats.salaries || 0}
                    </strong>

                  </div>


                  <div className="stat-card">

                    <div>
                      📁 Demandes
                    </div>

                    <strong>
                      {stats.demandes || 0}
                    </strong>

                  </div>


                  <div className="stat-card">

                    <div>
                      🕐 En attente
                    </div>

                    <strong>
                      {
                        stats.demandes_en_attente
                        || 0
                      }
                    </strong>

                  </div>


                  <div className="stat-card">

                    <div>
                      ✅ Approuvées
                    </div>

                    <strong>
                      {
                        stats.demandes_approuvees
                        || 0
                      }
                    </strong>

                  </div>


                  <div className="stat-card">

                    <div>
                      ❌ Refusées
                    </div>

                    <strong>
                      {
                        stats.demandes_refusees
                        || 0
                      }
                    </strong>

                  </div>


                  <div className="stat-card">

                    <div>
                      📄 Fiches
                    </div>

                    <strong>
                      {stats.fiches || 0}
                    </strong>

                  </div>


                  <div className="stat-card">

                    <div>
                      📅 Plannings
                    </div>

                    <strong>
                      {stats.plannings || 0}
                    </strong>

                  </div>


                  <div className="stat-card">

                    <div>
                      🕒 Pointages
                    </div>

                    <strong>
                      {stats.pointages || 0}
                    </strong>

                  </div>


                </div>

              ) : (

                <p>
                  Chargement...
                </p>

              )}

            </>
          )}


          {/* ===============================================
              USERS
          =============================================== */}

          {tab === "users" && (
            <>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >

                <h3>
                  Salariés
                </h3>


                <button
                  className="btn-primary"
                  onClick={() =>
                    navigate(
                      "/admin/salarie/create"
                    )
                  }
                >
                  ➕ Ajouter un salarié
                </button>

              </div>


              {loadingUsers ? (

                <p>
                  Chargement des salariés...
                </p>

              ) : users.length > 0 ? (

                <table className="admin-table">

                  <thead>

                    <tr>
                      <th>
                        Nom
                      </th>

                      <th>
                        Matricule
                      </th>

                      <th>
                        Poste
                      </th>

                      <th>
                        Établissement
                      </th>

                      <th>
                        Rôle
                      </th>
                    </tr>

                  </thead>


                  <tbody>

                    {users.map((user) => (

                      <tr
                        key={user.id}
                      >

                        <td>
                          {user.prenom}{" "}
                          {user.nom}
                        </td>

                        <td>
                          {
                            user.matricule
                            || "—"
                          }
                        </td>

                        <td>
                          {
                            user.poste
                            || "—"
                          }
                        </td>

                        <td>
                          {
                            user.etablissement
                            || "—"
                          }
                        </td>

                        <td>
                          {
                            user.role
                            || "—"
                          }
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              ) : (

                <p>
                  Aucun salarié disponible.
                </p>

              )}

            </>
          )}


          {/* ===============================================
              DEMANDES
          =============================================== */}

          {tab === "demandes" && (
            <>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >

                <h3>
                  Demandes
                </h3>


                <button
                  className="btn-primary"
                  onClick={() =>
                    navigate(
                      "/admin/requests"
                    )
                  }
                >
                  Voir toutes les demandes →
                </button>

              </div>


              {loadingDemandes ? (

                <p>
                  Chargement des demandes...
                </p>

              ) : demandes.length > 0 ? (

                <div>

                  {demandes.map((demande) => (

                    <div
                      key={demande.id}
                      className="card"
                      style={{
                        marginBottom: "15px",
                      }}
                    >


                      {/* TYPE */}

                      <p>

                        <strong>
                          {
                            demande.type_demande_display
                            || demande.type_demande
                          }
                        </strong>

                      </p>


                      {/* SALARIÉ */}

                      <p>
                        Salarié :{" "}
                        <strong>
                          {
                            demande.salarie_nom
                            || "—"
                          }
                        </strong>
                      </p>


                      {/* STATUT */}

                      <p>
                        {
                          formatStatus(
                            demande.statut
                          )
                        }
                      </p>


                      {/* ACTIONS */}

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                        }}
                      >


                        {/* DÉTAIL */}

                        <button
                          className="btn-primary"
                          onClick={() =>
                            navigate(
                              `/admin/requests/${demande.id}`
                            )
                          }
                        >
                          Voir le détail
                        </button>


                        {/* APPROUVER / REFUSER
                            uniquement si encore en attente */}

                        {(
                          demande.statut
                          === "EN_ATTENTE"
                        ) && (
                          <>

                            <button
                              onClick={() =>
                                approuverDemande(
                                  demande.id
                                )
                              }
                              disabled={
                                actionLoading
                                === demande.id
                              }
                            >
                              {
                                actionLoading
                                === demande.id
                                  ? "Traitement..."
                                  : "✔️ Approuver"
                              }
                            </button>


                            <button
                              onClick={() =>
                                refuserDemande(
                                  demande.id
                                )
                              }
                              disabled={
                                actionLoading
                                === demande.id
                              }
                            >
                              {
                                actionLoading
                                === demande.id
                                  ? "Traitement..."
                                  : "❌ Refuser"
                              }
                            </button>

                          </>
                        )}

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <p>
                  Aucune demande disponible.
                </p>

              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}
