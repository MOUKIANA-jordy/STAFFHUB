import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../Services/api";


export default function DemandesAdmin() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  // =========================================================
  // CHARGEMENT DES DEMANDES
  // =========================================================

  useEffect(() => {
    const fetchDemandes = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get(
          "/api/demandes/"
        );

        const data = response.data;

        if (Array.isArray(data)) {
          setDemandes(data);

        } else if (
          data
          && Array.isArray(data.results)
        ) {
          setDemandes(data.results);

        } else {
          setDemandes([]);
        }

      } catch (err) {
        console.error(
          "DEMANDES ERROR",
          err
        );

        setDemandes([]);

        setError(
          "Impossible de charger les demandes."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();

  }, []);


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
    <div className="admin-dashboard">

      <h1 className="dashboard-title">
        📊 Demandes
      </h1>


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


      <div className="table-container">

        {loading ? (

          <p>
            Chargement des demandes...
          </p>

        ) : (

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

              {demandes.length > 0 ? (

                demandes.map((demande) => (

                  <tr
                    key={demande.id}
                    className="clickable-row"
                    onClick={() =>
                      navigate(
                        `/admin/requests/${demande.id}`
                      )
                    }
                    style={{
                      cursor: "pointer",
                    }}
                  >

                    <td>
                      {
                        demande.salarie_nom
                        || "—"
                      }
                    </td>


                    <td>
                      {
                        demande.type_demande_display
                        || demande.type_demande
                        || "—"
                      }
                    </td>


                    <td>
                      {
                        formatStatus(
                          demande.statut
                        )
                      }
                    </td>


                    <td>
                      {
                        demande.date_demande
                          ? new Date(
                              demande.date_demande
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

        )}

      </div>

    </div>
  );
}
