import React from "react";

import RequestFormPage from "../../../Components/RequestFormPage";


export default function Acompte() {

  return (
    <RequestFormPage

      title="Demande d’acompte"

      endpoint="/api/demandes/"

      requestType="ACOMPTE"

      description={
        "Demandez le versement anticipé d’une partie de votre salaire."
      }

      icon="€"

      accent="blue"

      submitLabel={
        "Envoyer"
      }

      fields={[
        {
          name:
            "amount",

          apiField:
            "montant_souhaite",

          label:
            "Montant souhaité",

          type:
            "number",

          min:
            1,

          step:
            "0.01",

          placeholder:
            "Exemple : 300",

          required:
            true,
        },

        {
          name:
            "paymentDate",

          detailKey:
            "date_versement",

          label:
            "Date de versement souhaitée",

          type:
            "date",

          required:
            true,
        },

        {
          name:
            "reason",

          detailKey:
            "commentaire",

          label:
            "Commentaire",

          type:
            "textarea",

          placeholder:
            "Précisez éventuellement votre demande...",

          fullWidth:
            true,
        },
      ]}

      information={[
        {
          title:
            "Montant demandé",

          text:
            "Le montant saisi doit être supérieur à zéro.",
        },

        {
          title:
            "Traitement",

          text:
            "La demande sera transmise au service RH pour validation.",
        },

        {
          title:
            "Suivi",

          text:
            "Après l’envoi, vous retrouverez la demande et son statut dans l’historique.",
        },
      ]}

    />
  );
}
