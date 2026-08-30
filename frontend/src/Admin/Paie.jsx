import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  CalendarDays,
  Download,
  FileText,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";

import API from "../Services/api";

import "../Styles/paie.css";


export default function Paie() {

  // =========================================================
  // STATES
  // =========================================================

  const [
    fiches,
    setFiches,
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
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("TOUS");


  // =========================================================
  // DRF HELPER
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


    return [];
  };


  // =========================================================
  // FETCH
  // =========================================================

  const fetchPaie =
    useCallback(
      async (
        isRefresh = false
      ) => {

        if (
          isRefresh
        ) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }


        setError("");


        try {

          const response =
            await API.get(
              "/api/paie/"
            );


          setFiches(
            extractResults(
              response.data
            )
          );


        } catch (err) {

          console.error(
            "PAIE ERROR",
            err
          );


          setFiches([]);


          setError(
            err.response?.data?.detail
            || "Impossible de charger les éléments de paie."
          );


        } finally {

          setLoading(false);
          setRefreshing(false);

        }
      },
      []
    );


  useEffect(() => {
    fetchPaie();
  }, [fetchPaie]);


  // =========================================================
  // TYPES DISPONIBLES
  // =========================================================

  const paymentTypes =
    useMemo(
      () => {

        return [
          ...new Set(
            fiches
              .map(
                (fiche) =>
                  fiche.type_paiement
              )
              .filter(Boolean)
          ),
        ];

      },
      [fiches]
    );


  // =========================================================
  // FILTRAGE
  // =========================================================

  const filteredFiches =
    useMemo(
      () => {

        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return fiches.filter(
          (fiche) => {

            const searchable =
              [
                fiche.salarie_nom,
                fiche.type_paiement,
                fiche.type_paiement_display,
                fiche.commentaire,
                fiche.montant,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
              !normalizedSearch
              || searchable.includes(
                normalizedSearch
              );


            const matchesType =
              typeFilter
              === "TOUS"
              || fiche.type_paiement
              === typeFilter;


            return (
              matchesSearch
              && matchesType
            );
          }
        );

      },
      [
        fiches,
        search,
        typeFilter,
      ]
    );


  // =========================================================
  // STATS
  // =========================================================

  const totalMontant =
    useMemo(
      () => {

        return fiches.reduce(
          (
            total,
            fiche
          ) => {

            const montant =
              Number(
                fiche.montant
              );


            if (
              Number.isNaN(
                montant
              )
            ) {
              return total;
            }


            return (
              total
              + montant
            );
          },
          0
        );

      },
      [fiches]
    );


  const pdfCount =
    useMemo(
      () =>
        fiches.filter(
          (fiche) =>
            Boolean(
              fiche.preuve_pdf
            )
        ).length,
      [fiches]
    );


  const currentMonthCount =
    useMemo(
      () => {

        const today =
          new Date();

        return fiches.filter(
          (fiche) => {

            if (
              !fiche.date_paiement
            ) {
              return false;
            }


            const date =
              new Date(
                `${fiche.date_paiement}T12:00:00`
              );


            return (
              date.getMonth()
                === today.getMonth()
              && date.getFullYear()
                === today.getFullYear()
            );

          }
        ).length;

      },
      [fiches]
    );


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    dateValue
  ) => {

    if (
      !dateValue
    ) {
      return "—";
    }


    const date =
      new Date(
        `${dateValue}T12:00:00`
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateValue;
    }


    return date
      .toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
  };


  // =========================================================
  // FORMAT MONTANT
  // =========================================================

  const formatMontant = (
    montant
  ) => {

    if (
      montant === null
      || montant === undefined
    ) {
      return "—";
    }


    const value =
      Number(
        montant
      );


    if (
      Number.isNaN(
        value
      )
    ) {
      return montant;
    }


    return value
      .toLocaleString(
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
    <main className="paie-admin-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="paie-admin-header">

        <div>

          <span className="paie-admin-eyebrow">
            Administration RH
          </span>

          <h1>
            Gestion de la paie
          </h1>

          <p>
            Consultez les paiements enregistrés,
            les montants versés et les justificatifs associés.
          </p>

        </div>


        <button
          type="button"
          className="paie-refresh-button"
          onClick={() =>
            fetchPaie(
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
                ? "paie-spin"
                : ""
            }
          />

          Actualiser

        </button>

      </header>


      {/* ===================================================
          ERROR
      =================================================== */}

      {
        error
        && (
          <div className="paie-error">
            {error}
          </div>
        )
      }


      {/* ===================================================
          STATS
      =================================================== */}

      <section className="paie-summary-grid">


        <SummaryCard
          icon={
            <WalletCards
              size={21}
            />
          }
          value={
            fiches.length
          }
          label="Éléments de paie"
          type="blue"
        />


        <SummaryCard
          icon={
            <Banknote
              size={21}
            />
          }
          value={
            `${formatMontant(
              totalMontant
            )} €`
          }
          label="Montant total"
          type="green"
        />


        <SummaryCard
          icon={
            <CalendarDays
              size={21}
            />
          }
          value={
            currentMonthCount
          }
          label="Ce mois"
          type="purple"
        />


        <SummaryCard
          icon={
            <FileText
              size={21}
            />
          }
          value={
            pdfCount
          }
          label="Justificatifs PDF"
          type="orange"
        />

      </section>


      {/* ===================================================
          CARD PRINCIPALE
      =================================================== */}

      <section className="paie-admin-card">


        <header className="paie-card-header">

          <div>

            <h2>
              Éléments de paie
            </h2>

            <p>
              {filteredFiches.length} résultat
              {filteredFiches.length > 1 ? "s" : ""}
            </p>

          </div>


          <div className="paie-toolbar">


            <div className="paie-search">

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


              {
                paymentTypes.map(
                  (type) => (

                    <option
                      key={
                        type
                      }
                      value={
                        type
                      }
                    >
                      {type}
                    </option>

                  )
                )
              }

            </select>

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        {
          loading
            ? (

              <div className="paie-loading">

                <RefreshCw
                  size={28}
                  className="paie-spin"
                />

                <span>
                  Chargement des éléments de paie...
                </span>

              </div>

            )
            : filteredFiches.length > 0
              ? (

                <div className="paie-table-wrapper">

                  <table className="paie-table">

                    <thead>

                      <tr>

                        <th>
                          Salarié
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          Montant
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Commentaire
                        </th>

                        <th>
                          Document
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {
                        filteredFiches.map(
                          (fiche) => (

                            <tr
                              key={
                                fiche.id
                              }
                            >

                              {/* SALARIÉ */}

                              <td>

                                <div className="paie-user">

                                  <span className="paie-avatar">

                                    {
                                      getInitials(
                                        fiche.salarie_nom
                                      )
                                    }

                                  </span>


                                  <strong>

                                    {
                                      fiche.salarie_nom
                                      || "Salarié"
                                    }

                                  </strong>

                                </div>

                              </td>


                              {/* TYPE */}

                              <td>

                                <span className="paie-type">

                                  {
                                    fiche.type_paiement_display
                                    || fiche.type_paiement
                                    || "Élément de paie"
                                  }

                                </span>

                              </td>


                              {/* MONTANT */}

                              <td>

                                <strong className="paie-amount">

                                  {
                                    formatMontant(
                                      fiche.montant
                                    )
                                  } €

                                </strong>

                              </td>


                              {/* DATE */}

                              <td>

                                <span className="paie-date">

                                  {
                                    formatDate(
                                      fiche.date_paiement
                                    )
                                  }

                                </span>

                              </td>


                              {/* COMMENTAIRE */}

                              <td>

                                <span className="paie-comment">

                                  {
                                    fiche.commentaire
                                    || "—"
                                  }

                                </span>

                              </td>


                              {/* PDF */}

                              <td>

                                {
                                  fiche.preuve_pdf
                                    ? (

                                      <a
                                        href={
                                          fiche.preuve_pdf
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="paie-pdf-button"
                                      >

                                        <Download
                                          size={15}
                                        />

                                        PDF

                                      </a>

                                    )
                                    : (

                                      <span className="paie-no-document">
                                        Aucun
                                      </span>

                                    )
                                }

                              </td>

                            </tr>

                          )
                        )
                      }

                    </tbody>

                  </table>

                </div>

              )
              : (

                <div className="paie-empty">

                  <FileText
                    size={38}
                  />

                  <strong>
                    Aucun élément de paie
                  </strong>

                  <span>
                    Aucun résultat ne correspond
                    aux filtres sélectionnés.
                  </span>

                </div>

              )
        }

      </section>

    </main>
  );
}


// =========================================================
// SUMMARY
// =========================================================

function SummaryCard({
  icon,
  value,
  label,
  type,
}) {

  return (
    <article className="paie-summary-card">

      <span
        className={
          `paie-summary-icon paie-summary-icon-${type}`
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


// =========================================================
// INITIALS
// =========================================================

function getInitials(
  name
) {

  if (
    !name
  ) {
    return "?";
  }


  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (item) =>
        item
          .charAt(0)
          .toUpperCase()
    )
    .join("");
}
