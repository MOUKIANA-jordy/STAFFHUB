import React from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Banknote,
  CalendarDays,
  CreditCard,
  FileText,
  FolderOpen,
  HandCoins,
  Home,
  Landmark,
  ReceiptText,
  Settings2,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import "../../Styles/dossiers.css";


/* =========================================================
   DEMANDES RH
========================================================= */

const demandes = [
  {
    title: "Demande d'acompte",

    description:
      "Demandez le versement anticipé "
      + "d'une partie de votre salaire.",

    icon: HandCoins,

    path:
      "/dossiers/demandes/acompte",

    accent:
      "blue",
  },

  {
    title: "Demande d'avance",

    description:
      "Effectuez une demande exceptionnelle "
      + "d'avance sur salaire.",

    icon: WalletCards,

    path:
      "/dossiers/demandes/avance",

    accent:
      "purple",
  },

  {
    title: "Modification du calendrier",

    description:
      "Demandez une modification exceptionnelle "
      + "de votre planning de travail.",

    icon: CalendarDays,

    path:
      "/dossiers/demandes/calendrier",

    accent:
      "cyan",
  },

  {
    title: "Demande de fiche",

    description:
      "Demandez une fiche de paie, "
      + "un duplicata ou une attestation.",

    icon: ReceiptText,

    path:
      "/dossiers/demandes/fiches",

    accent:
      "orange",
  },

  {
    title: "Paiement CET",

    description:
      "Demandez la monétisation de jours "
      + "de votre compte épargne-temps.",

    icon: Banknote,

    path:
      "/dossiers/demandes/paiement-cet",

    accent:
      "green",
  },

  {
    title: "Heures supplémentaires",

    description:
      "Demandez le paiement des heures "
      + "supplémentaires effectuées.",

    icon: CreditCard,

    path:
      "/dossiers/demandes/paiement-hsup",

    accent:
      "purple",
  },
];


/* =========================================================
   INFORMATIONS DU DOSSIER
========================================================= */

const informations = [
  {
    title: "État civil",

    description:
      "Consultez vos informations "
      + "personnelles et administratives.",

    icon: UserRound,

    path:
      "/dossiers/informations/etat-civil",

    accent:
      "blue",
  },

  {
    title: "Adresse",

    description:
      "Consultez et gérez votre "
      + "adresse personnelle.",

    icon: Home,

    path:
      "/dossiers/informations/adresse",

    accent:
      "cyan",
  },

  {
    title: "Famille & contacts",

    description:
      "Gérez vos informations familiales "
      + "et vos contacts d'urgence.",

    icon: UsersRound,

    path:
      "/dossiers/informations/famille",

    accent:
      "purple",
  },

  {
    title: "Coordonnées bancaires",

    description:
      "Consultez les coordonnées utilisées "
      + "pour vos versements.",

    icon: Landmark,

    path:
      "/dossiers/informations/iban",

    accent:
      "green",
  },

  {
    title: "Documents",

    description:
      "Consultez vos pièces et documents "
      + "administratifs.",

    icon: FileText,

    path:
      "/dossiers/informations/documents",

    accent:
      "orange",
  },

  {
    title: "Données complémentaires",

    description:
      "Consultez les informations "
      + "complémentaires de votre dossier RH.",

    icon: Settings2,

    path:
      "/dossiers/informations/donnees-complementaires",

    accent:
      "cyan",
  },
];


export default function Dossiers() {
  return (
    <main className="dossiers-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="dossiers-heading">

        <div className="dossiers-heading-content">

          <span className="dossiers-eyebrow">
            Espace salarié
          </span>


          <h1>
            Mon dossier
          </h1>


          <p>
            Retrouvez vos demandes RH et
            l'ensemble des informations
            administratives de votre dossier salarié.
          </p>

        </div>


        <div
          className="dossiers-heading-icon"
          aria-hidden="true"
        >

          <FolderOpen
            size={24}
            strokeWidth={1.8}
          />

        </div>

      </section>


      {/* ===================================================
          DEMANDES
      =================================================== */}

      <section className="dossiers-section">

        <header className="dossiers-section-heading">

          <div className="dossiers-section-heading-main">

            <span
              className={
                "dossiers-section-icon "
                + "dossiers-section-icon-blue"
              }
            >

              <ReceiptText
                size={19}
                strokeWidth={1.8}
              />

            </span>


            <div>

              <h2>
                Demandes RH
              </h2>


              <p>
                Effectuez et suivez vos principales
                démarches auprès du service RH.
              </p>

            </div>

          </div>


          <span className="dossiers-count">
            {demandes.length}
          </span>

        </header>


        <div className="dossiers-grid">

          {
            demandes.map(
              (item) => (
                <DossierLink
                  key={item.path}
                  item={item}
                />
              )
            )
          }

        </div>

      </section>


      {/* ===================================================
          INFORMATIONS
      =================================================== */}

      <section className="dossiers-section">

        <header className="dossiers-section-heading">

          <div className="dossiers-section-heading-main">

            <span
              className={
                "dossiers-section-icon "
                + "dossiers-section-icon-purple"
              }
            >

              <UserRound
                size={19}
                strokeWidth={1.8}
              />

            </span>


            <div>

              <h2>
                Informations du dossier
              </h2>


              <p>
                Consultez les informations
                personnelles et administratives
                enregistrées dans StaffHub.
              </p>

            </div>

          </div>


          <span className="dossiers-count">
            {informations.length}
          </span>

        </header>


        <div className="dossiers-grid">

          {
            informations.map(
              (item) => (
                <DossierLink
                  key={item.path}
                  item={item}
                />
              )
            )
          }

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   CARTE DOSSIER
========================================================= */

function DossierLink({
  item,
}) {
  const Icon =
    item.icon;


  return (
    <Link
      to={item.path}
      className="dossiers-item"
    >

      <span
        className={
          `dossiers-item-icon `
          + `dossiers-item-icon-${item.accent}`
        }
      >

        <Icon
          size={20}
          strokeWidth={1.8}
        />

      </span>


      <div className="dossiers-item-content">

        <strong>
          {item.title}
        </strong>


        <p>
          {item.description}
        </p>

      </div>


      <span className="dossiers-item-arrow-wrapper">

        <ArrowRight
          className="dossiers-item-arrow"
          size={17}
          strokeWidth={1.8}
        />

      </span>

    </Link>
  );
}
