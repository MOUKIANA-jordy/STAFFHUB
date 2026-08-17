import React from "react";
import { Link } from "react-router-dom";

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
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import "../../Styles/dossiers.css";


const demandes = [
  {
    title: "Demande d'acompte",
    description: "Demander le versement anticipé d'une partie de votre salaire.",
    icon: HandCoins,
    path: "/dossiers/demandes/acompte",
    accent: "blue",
  },
  {
    title: "Demande d'avance",
    description: "Effectuer une demande exceptionnelle d'avance sur salaire.",
    icon: WalletCards,
    path: "/dossiers/demandes/avance",
    accent: "purple",
  },
  {
    title: "Modification du calendrier",
    description: "Demander une modification de votre planning ou signaler une absence.",
    icon: CalendarDays,
    path: "/dossiers/demandes/calendrier",
    accent: "cyan",
  },
  {
    title: "Demande de fiche",
    description: "Demander ou consulter une fiche liée à votre paie.",
    icon: ReceiptText,
    path: "/dossiers/demandes/fiches",
    accent: "blue",
  },
  {
    title: "Paiement CET",
    description: "Effectuer une demande de paiement de votre compte épargne-temps.",
    icon: Banknote,
    path: "/dossiers/demandes/paiement-cet",
    accent: "purple",
  },
  {
    title: "Heures supplémentaires",
    description: "Demander le paiement de vos heures supplémentaires.",
    icon: CreditCard,
    path: "/dossiers/demandes/paiement-hsup",
    accent: "cyan",
  },
];


const informations = [
  {
    title: "État civil",
    description: "Consulter et gérer vos informations d'état civil.",
    icon: UserRound,
    path: "/dossiers/informations/etat-civil",
    accent: "blue",
  },
  {
    title: "Adresse",
    description: "Consulter et mettre à jour votre adresse personnelle.",
    icon: Home,
    path: "/dossiers/informations/adresse",
    accent: "cyan",
  },
  {
    title: "Famille & contacts",
    description: "Gérer vos informations familiales et contacts.",
    icon: UsersRound,
    path: "/dossiers/informations/famille",
    accent: "purple",
  },
  {
    title: "Coordonnées bancaires",
    description: "Consulter ou mettre à jour votre IBAN.",
    icon: Landmark,
    path: "/dossiers/informations/iban",
    accent: "blue",
  },
  {
    title: "Documents",
    description: "Consulter et ajouter vos documents administratifs.",
    icon: FileText,
    path: "/dossiers/informations/documents",
    accent: "purple",
  },
];


export default function Dossiers() {
  return (
    <div className="dossiers-page">

      {/* HEADER */}

      <section className="dossiers-heading">
        <div>
          <span className="dossiers-eyebrow">
            Espace salarié
          </span>

          <h1>Mon dossier</h1>

          <p>
            Retrouvez vos demandes RH ainsi que toutes
            les informations de votre dossier salarié.
          </p>
        </div>

        <div className="dossiers-heading-icon">
          <FolderOpen size={25} />
        </div>
      </section>


      {/* DEMANDES */}

      <section className="dossiers-section">

        <div className="dossiers-section-heading">
          <div>
            <span className="dossiers-section-icon dossiers-section-icon-blue">
              <ReceiptText size={20} />
            </span>

            <div>
              <h2>Demandes</h2>

              <p>
                Envoyez et suivez vos différentes demandes RH.
              </p>
            </div>
          </div>

          <span className="dossiers-count">
            {demandes.length}
          </span>
        </div>


        <div className="dossiers-grid">
          {demandes.map((item) => (
            <DossierLink
              key={item.path}
              item={item}
            />
          ))}
        </div>

      </section>


      {/* INFORMATIONS */}

      <section className="dossiers-section">

        <div className="dossiers-section-heading">
          <div>
            <span className="dossiers-section-icon dossiers-section-icon-purple">
              <UserRound size={20} />
            </span>

            <div>
              <h2>Informations</h2>

              <p>
                Consultez les informations administratives
                enregistrées dans votre dossier.
              </p>
            </div>
          </div>

          <span className="dossiers-count">
            {informations.length}
          </span>
        </div>


        <div className="dossiers-grid">
          {informations.map((item) => (
            <DossierLink
              key={item.path}
              item={item}
            />
          ))}
        </div>

      </section>

    </div>
  );
}


function DossierLink({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className="dossiers-item"
    >
      <span
        className={
          `dossiers-item-icon dossiers-item-icon-${item.accent}`
        }
      >
        <Icon
          size={21}
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

      <ArrowRight
        className="dossiers-item-arrow"
        size={18}
      />
    </Link>
  );
}
