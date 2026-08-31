import React from "react";

import RequestFormPage from "../../../Components/RequestFormPage";


export default function PaiementCet() {
  return (
    <RequestFormPage

      endpoint="/api/demandes/"

      requestType="CET"

      title="Paiement du CET"

      description="Demandez la monétisation d'heures disponibles sur votre compte épargne-temps."

      icon="◷"

      accent="blue"

      submitLabel="Envoyer"


      fields={[

        // =====================================================
        // HEURES CET
        // =====================================================

        {
          name: "heures_cet",

          label: "Nombre d'heures CET à payer",

          type: "number",

          min: 0.5,

          step: "0.5",

          required: true,

          help:
            "Indiquez le nombre d'heures de votre CET que vous souhaitez monétiser.",
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
            "Solde CET",

          text:
            "Le nombre d'heures demandé ne peut pas dépasser votre solde CET disponible.",
        },


        {
          title:
            "Calcul automatique",

          text:
            "Le montant du paiement est calculé automatiquement à partir du nombre d'heures CET et de votre taux horaire actif.",
        },


        {
          title:
            "Validation RH",

          text:
            "Le solde CET n'est débité qu'après approbation de la demande par un RH ou un administrateur.",
        },


        {
          title:
            "Paiement",

          text:
            "Après validation, StaffHub crée automatiquement l'élément de paiement correspondant.",
        },

      ]}

    />
  );
}
