import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../Services/api";

import "../Styles/admin-demandes.css";


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


export default function DemandesAdmin() {
  const [
    demandes,
    setDemandes,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("TOUS");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("TOUS");

  const navigate =
    useNavigate();


  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    const fetchDemandes =
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await API.get(
              "/api/demandes/",
              {
                params: {
                  ordering:
                    "-date_demande",
                },
              }
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

          setError(
            err.response?.data?.detail
            || "Impossible de charger les demandes."
          );

        } finally {
          setLoading(false);
        }
      };


    fetchDemandes();
  }, []);


  // =========================================================
  // STATS
  // =========================================================

  const stats =
    useMemo(
      () => ({
        total:
          demandes.length,

        pending:
          demandes.filter(
            (item) =>
              item.statut
              === "EN_ATTENTE"
          ).length,

        approved:
          demandes.filter(
            (item) =>
              item.statut
              === "APPROUVE"
          ).length,

        rejected:
          demandes.filter(
            (item) =>
              item.statut
              === "REFUSE"
          ).length,
      }),
      [demandes]
    );


  // =========================================================
  // FILTER
  // =========================================================

  const filteredDemandes =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return demandes.filter(
          (demande) => {
            const matchesSearch =
              !normalizedSearch
              || String(
                demande.salarie_nom
                || ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
              || String(
                demande.type_demande_display
                || demande.type_demande
                || ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch
                );

            const matchesStatus =
              statusFilter
              === "TOUS"
              || demande.statut
              === statusFilter;

            const matchesType =
              typeFilter
              === "TOUS"
              || demande.type_demande
              === typeFilter;

            return (
              matchesSearch
              && matchesStatus
              && matchesType
            );
          }
        );
      },
      [
        demandes,
        search,
        statusFilter,
        typeFilter,
      ]
    );


  // =========================================================
  // TYPES
  // =========================================================

  const demandeTypes =
    useMemo(
      () => {
        return [
          ...new Set(
            demandes
              .map(
                (item) =>
                  item.type_demande
              )
              .filter(Boolean)
          ),
        ];
      },
      [demandes]
    );


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-demandes-page">

      <section className="admin-demandes-heading">

        <div>
          <span className="admin-demandes-eyebrow">
            Administration RH
          </span>

          <h1>
            Gestion des demandes
          </h1>

          <p>
            Consultez les demandes des salariés et ouvrez
            une demande pour l'approuver ou la refuser.
          </p>
        </div>

      </section>


      {error && (
        <div className="admin-demandes-error">
          {error}
        </div>
      )}


      <section className="admin-demandes-stats">

        <StatCard
          icon={
            <FileText
              size={21}
            />
          }
          value={
            stats.total
          }
          label="Demandes"
          type="blue"
        />

        <StatCard
          icon={
            <Clock3
              size={21}
            />
          }
          value={
            stats.pending
          }
          label="En attente"
          type="orange"
        />

        <StatCard
          icon={
            <CheckCircle2
              size={21}
            />
          }
          value={
            stats.approved
          }
          label="Approuvées"
          type="green"
        />

        <StatCard
          icon={
            <XCircle
              size={21}
            />
          }
          value={
            stats.rejected
          }
          label="Refusées"
          type="red"
        />

      </section>


      <section className="admin-demandes-card">

        <div className="admin-demandes-toolbar">

          <div className="admin-demandes-search">

            <Search
              size={17}
            />

            <input
              type="search"
              value={search}
              onChange={
                (event) =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Rechercher un salarié ou un type de demande..."
            />

          </div>


          <select
            value={
              statusFilter
            }
            onChange={
              (event) =>
                setStatusFilter(
                  event.target.value
                )
            }
          >
            <option value="TOUS">
              Tous les statuts
            </option>

            <option value="EN_ATTENTE">
              En attente
            </option>

            <option value="APPROUVE">
              Approuvées
            </option>

            <option value="REFUSE">
              Refusées
            </option>
          </select>


          <select
            value={
              typeFilter
            }
            onChange={
              (event) =>
                setTypeFilter(
                  event.target.value
                )
            }
          >
            <option value="TOUS">
              Tous les types
            </option>

            {demandeTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {getTypeLabel(type)}
                </option>
              )
            )}
          </select>

        </div>


        {loading ? (
          <div className="admin-demandes-loading">
            Chargement des demandes...
          </div>
        ) : filteredDemandes.length > 0 ? (

          <div className="admin-demandes-table-wrapper">

            <table className="admin-demandes-table">

              <thead>
                <tr>
                  <th>Salarié</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>


              <tbody>

                {filteredDemandes.map(
                  (demande) => (

                    <tr
                      key={
                        demande.id
                      }
                      onClick={() =>
                        navigate(
                          `/admin/demandes/${demande.id}`
                        )
                      }
                    >

                      <td>
                        <div className="admin-demandes-user">

                          <span className="admin-demandes-avatar">
                            {
                              getInitials(
                                demande.salarie_nom
                              )
                            }
                          </span>

                          <strong>
                            {
                              demande.salarie_nom
                              || "Salarié"
                            }
                          </strong>

                        </div>
                      </td>


                      <td>
                        {
                          demande.type_demande_display
                          || getTypeLabel(
                            demande.type_demande
                          )
                        }
                      </td>


                      <td>
                        {
                          formatDate(
                            demande.date_demande
                          )
                        }
                      </td>


                      <td>
                        <StatusBadge
                          status={
                            demande.statut
                          }
                        />
                      </td>


                      <td className="admin-demandes-open">
                        Ouvrir →
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="admin-demandes-empty">
            Aucune demande trouvée.
          </div>

        )}

      </section>

    </div>
  );
}


function StatCard({
  icon,
  value,
  label,
  type,
}) {
  return (
    <article className="admin-demandes-stat-card">

      <span
        className={
          `admin-demandes-stat-icon admin-demandes-stat-icon-${type}`
        }
      >
        {icon}
      </span>

      <div>
        <strong>
          {value}
        </strong>

        <p>
          {label}
        </p>
      </div>

    </article>
  );
}


function StatusBadge({
  status,
}) {
  const config = {
    EN_ATTENTE: {
      label:
        "En attente",
      css:
        "pending",
    },

    APPROUVE: {
      label:
        "Approuvée",
      css:
        "approved",
    },

    REFUSE: {
      label:
        "Refusée",
      css:
        "rejected",
    },
  };


  const current =
    config[status]
    || {
      label:
        status || "—",
      css:
        "pending",
    };


  return (
    <span
      className={
        `admin-demandes-status admin-demandes-status-${current.css}`
      }
    >
      {current.label}
    </span>
  );
}


function getTypeLabel(
  type
) {
  const labels = {
    ACOMPTE:
      "Acompte",

    AVANCE:
      "Avance",

    CALENDRIER:
      "Modification du calendrier",

    FICHE:
      "Demande de fiche",

    CET:
      "Paiement CET",

    HEURES_SUP:
      "Heures supplémentaires",

    ABSENCE:
      "Absence",
  };

  return (
    labels[type]
    || type
    || "—"
  );
}


function getInitials(
  name
) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .toUpperCase();
}


function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}
