import React from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  UserRoundX,
} from "lucide-react";

import "../Styles/activites.css";


const activites = [
  {
    title: "Planning",
    description:
      "Consultez votre calendrier de travail, vos horaires et vos journées planifiées.",
    icon: CalendarDays,
    path: "/activites/planning",
    accent: "blue",
  },

  {
    title: "Absences",
    description:
      "Déclarez et suivez vos absences, congés et demandes associées.",
    icon: UserRoundX,
    path: "/activites/absences",
    accent: "purple",
  },

  {
    title: "Pointages",
    description:
      "Consultez vos entrées, sorties, pauses et heures supplémentaires.",
    icon: Clock3,
    path: "/activites/pointages",
    accent: "cyan",
  },
];


export default function Activites() {
  return (
    <main className="activites-page">

      <section className="activites-heading">

        <div>

          <span className="activites-eyebrow">
            Espace salarié
          </span>

          <h1>
            Mes activités
          </h1>

          <p>
            Retrouvez votre planning, vos absences
            et l'ensemble de vos pointages.
          </p>

        </div>


        <div
          className="activites-heading-icon"
          aria-hidden="true"
        >
          <CalendarDays
            size={24}
            strokeWidth={1.8}
          />
        </div>

      </section>


      <section className="activites-section">

        <header className="activites-section-heading">

          <div>

            <h2>
              Gestion du temps
            </h2>

            <p>
              Accédez rapidement aux informations liées
              à votre temps de travail.
            </p>

          </div>


          <span className="activites-count">
            {activites.length}
          </span>

        </header>


        <div className="activites-grid">

          {
            activites.map(
              (item) => (
                <ActiviteLink
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


function ActiviteLink({
  item,
}) {
  const Icon =
    item.icon;

  return (
    <Link
      to={item.path}
      className="activites-item"
    >

      <span
        className={
          `activites-item-icon `
          + `activites-item-icon-${item.accent}`
        }
      >
        <Icon
          size={22}
          strokeWidth={1.8}
        />
      </span>


      <div className="activites-item-content">

        <strong>
          {item.title}
        </strong>

        <p>
          {item.description}
        </p>

      </div>


      <span className="activites-item-arrow-wrapper">

        <ArrowRight
          size={18}
          strokeWidth={1.8}
        />

      </span>

    </Link>
  );
}
