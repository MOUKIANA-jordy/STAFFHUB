import { useEffect, useState } from "react";

import API from "../Services/api";


export default function Paie() {
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // CHARGEMENT
  // =========================================================

  useEffect(() => {
    const fetchPaie = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await API.get(
          "/api/paie/"
        );

        const data = response.data;

        if (Array.isArray(data)) {
          setFiches(data);

        } else if (
          data
          && Array.isArray(data.results)
        ) {
          setFiches(data.results);

        } else {
          setFiches([]);
        }

      } catch (err) {
        console.error(
          "PAIE ERROR",
          err
        );

        setFiches([]);

        setError(
          "Impossible de charger les éléments de paie."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchPaie();

  }, []);


  // =========================================================
  // FORMATAGE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    return new Date(
      `${dateValue}T00:00:00`
    ).toLocaleDateString(
      "fr-FR"
    );
  };


  const formatMontant = (montant) => {
    if (
      montant === null
      || montant === undefined
    ) {
      return "—";
    }

    const valeur = Number(
      montant
    );

    if (
      Number.isNaN(valeur)
    ) {
      return montant;
    }

    return valeur.toLocaleString(
      "fr-FR",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page">

      <h1>
        📄 Paie
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


      {loading ? (

        <p>
          Chargement des éléments de paie...
        </p>

      ) : fiches.length > 0 ? (

        <div>

          {fiches.map((fiche) => (

            <div
              key={fiche.id}
              className="card"
              style={{
                marginBottom: "15px",
              }}
            >

              <h3>
                {
                  fiche.type_paiement_display
                  || fiche.type_paiement
                  || "Élément de paie"
                }
              </h3>


              <p>
                <strong>
                  Salarié :
                </strong>{" "}
                {
                  fiche.salarie_nom
                  || "—"
                }
              </p>


              <p>
                <strong>
                  Montant :
                </strong>{" "}
                {
                  formatMontant(
                    fiche.montant
                  )
                }{" "}
                €
              </p>


              <p>
                <strong>
                  Date :
                </strong>{" "}
                {
                  formatDate(
                    fiche.date_paiement
                  )
                }
              </p>


              {fiche.commentaire && (

                <p>
                  <strong>
                    Commentaire :
                  </strong>{" "}
                  {fiche.commentaire}
                </p>

              )}


              {fiche.preuve_pdf && (

                <a
                  href={fiche.preuve_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: "inline-block",
                    marginTop: "10px",
                  }}
                >
                  📄 Ouvrir le PDF
                </a>

              )}

            </div>

          ))}

        </div>

      ) : (

        <p>
          Aucun élément de paie disponible.
        </p>

      )}

    </div>
  );
}
