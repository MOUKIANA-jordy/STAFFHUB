import React from "react";

import RequestFormPage from "../../../Components/RequestFormPage";


export default function Avance() {

  return (
    <RequestFormPage

      title="Demande d’avance"

      endpoint="/api/demandes/"

      requestType="AVANCE"

      description={
        "Demandez une avance exceptionnelle sur salaire."
      }

      icon="⇄"

      accent="green"

      submitLabel={
        "Envoyer la demande d’avance"
      }

      fields={[
        {
          name:
            "amount",

          apiField:
            "montant_souhaite",

          label:
            "Montant demandé",

          type:
            "number",

          min:
            1,

          step:
            "0.01",

          placeholder:
            "Exemple : 500",

          required:
            true,
        },

        {
          name:
            "repaymentMonths",

          detailKey:
            "nombre_mensualites",

          label:
            "Nombre de mensualités",

          type:
            "select",

          options: [
            {
              value: "1",
              label: "1 mensualité",
            },

            {
              value: "2",
              label: "2 mensualités",
            },

            {
              value: "3",
              label: "3 mensualités",
            },

            {
              value: "4",
              label: "4 mensualités",
            },

            {
              value: "6",
              label: "6 mensualités",
            },
          ],

          required:
            true,
        },

        {
          name:
            "reason",

          detailKey:
            "motif",

          label:
            "Motif de la demande",

          type:
            "textarea",

          placeholder:
            "Expliquez brièvement votre besoin...",

          fullWidth:
            true,

          required:
            true,
        },

        {
          name:
            "document",

          apiField:
            "document",

          label:
            "Justificatif",

          type:
            "file",

          accept:
            ".pdf,.jpg,.jpeg,.png",

          fullWidth:
            true,

          help:
            "Formats acceptés : PDF, JPG ou PNG. Taille maximale : 5 Mo.",
        },
      ]}

      information={[
        {
          title:
            "Réservée aux CDI",

          text:
            "Une avance sur salaire ne peut être demandée que par un salarié en CDI.",
        },

        {
          title:
            "Étude du dossier",

          text:
            "Le service RH peut accepter ou refuser la demande après étude.",
        },

        {
          title:
            "Remboursement",

          text:
            "Le nombre de mensualités demandé est transmis au service RH avec votre demande.",
        },
      ]}

    />
  );
}
