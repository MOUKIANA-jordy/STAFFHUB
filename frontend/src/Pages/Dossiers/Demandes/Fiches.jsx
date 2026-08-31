import React from "react";

import RequestFormPage from "../../../Components/RequestFormPage";


export default function Fiches() {
  return (
    <RequestFormPage

      endpoint="/api/demandes/"

      requestType="FICHE"

      title="Demande de fiche"

      description="Demandez une fiche de paie ou un duplicata pour un mois précis."

      icon="▤"

      accent="orange"

      submitLabel="Envoyer"


      fields={[

        // =====================================================
        // MOIS
        // =====================================================

        {
          name: "mois",

          label: "Mois concerné",

          type: "month",

          required: true,

          help:
            "Sélectionnez le mois pour lequel vous souhaitez obtenir la fiche.",
        },


        // =====================================================
        // TYPE DE DOCUMENT
        // =====================================================

        {
          name: "document_type",

          label: "Type de document",

          type: "select",

          options: [

            {
              value: "FICHE_PAIE",
              label: "Fiche de paie",
            },

            {
              value: "DUPLICATA_PAIE",
              label: "Duplicata de fiche de paie",
            },

            {
              value: "ATTESTATION_SALAIRE",
              label: "Attestation de salaire",
            },

            {
              value: "RELEVE_ANNUEL",
              label: "Relevé annuel",
            },

            {
              value: "AUTRE",
              label: "Autre document",
            },

          ],

          required: true,
        },


        // =====================================================
        // MODE DE RECEPTION
        // =====================================================

        {
          name: "mode_reception",

          label: "Mode de réception",

          type: "select",

          options: [

            {
              value: "ESPACE_SALARIE",
              label: "Téléchargement dans l'espace salarié",
            },

            {
              value: "EMAIL",
              label: "Envoi par e-mail",
            },

            {
              value: "MAIN_PROPRE",
              label: "Remise en main propre",
            },

          ],

          required: true,
        },


        // =====================================================
        // COMMENTAIRE
        // =====================================================

        {
          name: "commentaire",

          label: "Commentaire",

          type: "textarea",

          placeholder:
            "Ajoutez éventuellement une précision concernant votre demande...",

          fullWidth: true,

          rows: 4,
        },

      ]}


      information={[

        {
          title:
            "Mois obligatoire",

          text:
            "La demande doit indiquer précisément le mois concerné afin de générer le bon document.",
        },


        {
          title:
            "Génération automatique",

          text:
            "Après validation par un RH ou un administrateur, StaffHub peut générer automatiquement la fiche correspondante.",
        },


        {
          title:
            "Confidentialité",

          text:
            "Les fiches de paie sont des documents confidentiels accessibles uniquement aux personnes autorisées.",
        },


        {
          title:
            "Espace salarié",

          text:
            "Le document généré pourra être consulté depuis votre espace salarié selon le mode de réception choisi.",
        },

      ]}

    />
  );
}
