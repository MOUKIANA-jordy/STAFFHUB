import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../Services/api";
import "../Styles/admin.css";


export default function AdminDashboard() {
  const navigate = useNavigate();


  // =========================================================
  // STATES
  // =========================================================

  const [stats, setStats] = useState({
    salaries: 0,
    demandes: 0,
    demandes_en_attente: 0,
    demandes_approuvees: 0,
    demandes_refusees: 0,
    pointages: 0,
    fiches: 0,
    plannings: 0,
  });

  const [planning, setPlanning] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // HELPER PAGINATION DRF
  // =========================================================

  const extractResults = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.results)) {
      return data.results;
    }

    return [];
  };


  // =========================================================
  // CHARGEMENT DES DONNÉES
  // =========================================================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");


      // =====================================================
      // STATS
      // =====================================================

      try {
        const statsRes = await API.get(
          "/api/admin/stats/"
        );

        setStats({
          salaries:
            statsRes.data.salaries || 0,

          demandes:
            statsRes.data.demandes || 0,

          demandes_en_attente:
            statsRes.data.demandes_en_attente || 0,

          demandes_approuvees:
            statsRes.data.demandes_approuvees || 0,

          demandes_refusees:
            statsRes.data.demandes_refusees || 0,

          pointages:
            statsRes.data.pointages || 0,

          fiches:
            statsRes.data.fiches || 0,

          plannings:
            statsRes.data.plannings || 0,
        });

      } catch (err) {
        console.error(
          "STATS ERROR",
          err
        );

        setError(
          "Impossible de charger les statistiques."
        );
      }


      // =====================================================
      // PLANNING
      // =====================================================

      try {
        const planningRes = await API.get(
          "/api/planning/"
        );

        setPlanning(
          extractResults(
            planningRes.data
          )
        );

      } catch (err) {
        console.error(
          "PLANNING ERROR",
          err
        );

        setPlanning([]);
      }


      // =====================================================
      // DEMANDES
      // =====================================================

      try {
        const reqRes = await API.get(
          "/api/demandes/"
        );

        setRequests(
          extractResults(
            reqRes.data
          )
        );

      } catch (err) {
        console.error(
          "DEMANDES ERROR",
          err
        );

        setRequests([]);
      }


      setLoading(false);
    };

    fetchData();

  }, []);


  // =========================================================
  // POURCENTAGES DES DEMANDES
  // =========================================================

  const total = stats.demandes || 0;


  const percentEncours =
    total > 0
      ? (
          stats.demandes_en_attente
          / total
        ) * 100
      : 0;


  const percentAcceptees =
    total > 0
      ? (
          stats.demandes_approuvees
          / total
        ) * 100
      : 0;


  const percentRefusees =
    total > 0
      ? (
          stats.demandes_refusees
          / total
        ) * 100
      : 0;


  // =========================================================
  // FORMATAGE DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(
      `${dateValue}T00:00:00`
    );

    return date.toLocaleDateString(
      "fr-FR"
    );
  };


  // =========================================================
  // FORMATAGE TYPE DEMANDE
  // =========================================================

  const formatRequestType = (request) => {
    return (
      request.type_demande_display
      || request.type_demande
      || "—"
    );
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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-dashboard">

        <h1 className="dashboard-title">
          Dashboard RH
        </h1>

        <p>
          Chargement du dashboard...
        </p>

      </div>
    );
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-dashboard">


      {/* ===================================================
          TITRE
      =================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >

        <div>

          <h1 className="dashboard-title">
            Dashboard RH
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
            }}
          >
            Vue d'ensemble de StaffHub
          </p>

        </div>

      </div>


      {/* ===================================================
          ERREUR
      =================================================== */}

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


      {/* ===================================================
          KPI PRINCIPAUX
      =================================================== */}

      <div className="stats-grid">


        {/* SALARIÉS */}

        <div className="stat-card stat-purple">

          <h3>
            Salariés
          </h3>

          <p>
            {stats.salaries}
          </p>

        </div>


        {/* DEMANDES */}

        <div className="stat-card stat-blue">

          <h3>
            Demandes
          </h3>

          <p>
            {stats.demandes}
          </p>

        </div>


        {/* EN ATTENTE */}

        <div className="stat-card stat-yellow">

          <h3>
            En attente
          </h3>

          <p>
            {stats.demandes_en_attente}
          </p>

        </div>


        {/* APPROUVÉES */}

        <div className="stat-card stat-green">

          <h3>
            Approuvées
          </h3>

          <p>
            {stats.demandes_approuvees}
          </p>

        </div>


      </div>


      {/* ===================================================
          KPI SECONDAIRES
      =================================================== */}

      <div
        className="stats-grid"
        style={{
          marginTop: "20px",
        }}
      >


        {/* REFUSÉES */}

        <div className="stat-card">

          <h3>
            Refusées
          </h3>

          <p>
            {stats.demandes_refusees}
          </p>

        </div>


        {/* POINTAGES */}

        <div className="stat-card">

          <h3>
            Pointages
          </h3>

          <p>
            {stats.pointages}
          </p>

        </div>


        {/* FICHES DE PAIE */}

        <div className="stat-card">

          <h3>
            Fiches de paie
          </h3>

          <p>
            {stats.fiches}
          </p>

        </div>


        {/* PLANNINGS */}

        <div className="stat-card">

          <h3>
            Plannings
          </h3>

          <p>
            {stats.plannings}
          </p>

        </div>


      </div>


      {/* ===================================================
          ACTIVITÉ + RÉPARTITION
      =================================================== */}

      <div className="charts-grid">


        {/* =================================================
            ACTIVITÉ RH
        ================================================= */}

        <div className="chart-card">

          <h2>
            Activité RH
          </h2>


          <div
            style={{
              minHeight: "250px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "40px",
              flexWrap: "wrap",
            }}
          >


            {/* PLANNINGS */}

            <div
              style={{
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                {stats.plannings}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  marginTop: "5px",
                }}
              >
                Plannings
              </div>

            </div>


            {/* POINTAGES */}

            <div
              style={{
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                {stats.pointages}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  marginTop: "5px",
                }}
              >
                Pointages
              </div>

            </div>


            {/* FICHES */}

            <div
              style={{
                textAlign: "center",
              }}
            >

              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                {stats.fiches}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  marginTop: "5px",
                }}
              >
                Fiches de paie
              </div>

            </div>


          </div>

        </div>


        {/* =================================================
            RÉPARTITION DES DEMANDES
        ================================================= */}

        <div className="overview-card">

          <h3>
            Répartition des demandes
          </h3>


          {/* EN ATTENTE */}

          <div className="overview-item">

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >

              <span>
                En attente
              </span>

              <strong>
                {stats.demandes_en_attente}
              </strong>

            </div>


            <div className="bar">

              <div
                className="bar-fill bar-fill-yellow"
                style={{
                  width: `${percentEncours}%`,
                }}
              />

            </div>

          </div>


          {/* APPROUVÉES */}

          <div className="overview-item">

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >

              <span>
                Approuvées
              </span>

              <strong>
                {stats.demandes_approuvees}
              </strong>

            </div>


            <div className="bar">

              <div
                className="bar-fill bar-fill-green"
                style={{
                  width: `${percentAcceptees}%`,
                }}
              />

            </div>

          </div>


          {/* REFUSÉES */}

          <div className="overview-item">

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >

              <span>
                Refusées
              </span>

              <strong>
                {stats.demandes_refusees}
              </strong>

            </div>


            <div className="bar">

              <div
                className="bar-fill bar-fill-red"
                style={{
                  width: `${percentRefusees}%`,
                }}
              />

            </div>

          </div>


        </div>


      </div>


      {/* ===================================================
          PLANNING RÉCENT
      =================================================== */}

      <div className="chart-card">


        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          <h2>
            Planning récent
          </h2>


          <button
            className="btn-primary"
            onClick={() =>
              navigate(
                "/activites/planning"
              )
            }
          >
            Voir le planning →
          </button>

        </div>


        {planning.length > 0 ? (

          <ul>

            {planning
              .slice(0, 6)
              .map((p) => (

                <li
                  key={p.id}
                  style={{
                    marginBottom: "10px",
                  }}
                >

                  <strong>
                    {formatDate(
                      p.date
                    )}
                  </strong>


                  {" → "}


                  {(
                    p.type_journee_display
                    || p.type_journee
                    || "—"
                  )}


                  {(
                    p.heure_debut
                    && p.heure_fin
                  ) && (

                    <>

                      {" — "}

                      {p.heure_debut.slice(
                        0,
                        5
                      )}

                      {" à "}

                      {p.heure_fin.slice(
                        0,
                        5
                      )}

                    </>

                  )}


                  {p.commentaire && (

                    <span
                      style={{
                        color: "#6b7280",
                        marginLeft: "10px",
                      }}
                    >
                      {p.commentaire}
                    </span>

                  )}

                </li>

              ))}

          </ul>

        ) : (

          <p>
            Aucun planning disponible.
          </p>

        )}


      </div>


      {/* ===================================================
          DERNIÈRES DEMANDES
      =================================================== */}

      <div className="table-container">


        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          <h2>
            Dernières demandes
          </h2>


          <button
            className="btn-primary"
            onClick={() =>
              navigate(
                "/admin/requests"
              )
            }
          >
            Voir tout →
          </button>

        </div>


        <table>


          <thead>

            <tr>

              <th>
                Salarié
              </th>

              <th>
                Type
              </th>

              <th>
                Statut
              </th>

              <th>
                Date
              </th>

            </tr>

          </thead>


          <tbody>


            {requests.length > 0 ? (

              requests
                .slice(0, 5)
                .map((request) => (

                  <tr
                    key={request.id}
                    onClick={() =>
                      navigate(
                        `/admin/requests/${request.id}`
                      )
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >


                    {/* SALARIÉ */}

                    <td>

                      {(
                        request.salarie_nom
                        || "—"
                      )}

                    </td>


                    {/* TYPE */}

                    <td>

                      {formatRequestType(
                        request
                      )}

                    </td>


                    {/* STATUT */}

                    <td>

                      {formatStatus(
                        request.statut
                      )}

                    </td>


                    {/* DATE */}

                    <td>

                      {request.date_demande
                        ? new Date(
                            request.date_demande
                          ).toLocaleDateString(
                            "fr-FR"
                          )
                        : "—"
                      }

                    </td>


                  </tr>

                ))

            ) : (

              <tr>

                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  Aucune demande disponible.
                </td>

              </tr>

            )}


          </tbody>


        </table>


      </div>


    </div>
  );
}
