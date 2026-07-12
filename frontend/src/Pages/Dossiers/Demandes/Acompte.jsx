import React from "react";
import RequestFormPage from "../../../Components/RequestFormPage";

export default function Acompte() {
  return (
    <RequestFormPage
      endpoint="/api/demandes/"
      requestType="ACOMPTE"
      description="Demandez le versement anticipé d’une partie de votre salaire."
      icon="€"
      accent="blue"
      submitLabel="Envoyer la demande d’acompte"
      fields={[
        {
          name: "amount",
          label: "Montant souhaité",
          type: "number",
          min: 1,
          step: "0.01",
          placeholder: "Exemple : 300",
          required: true,
        },
        {
          name: "paymentDate",
          label: "Date de versement souhaitée",
          type: "date",
          required: true,
        },
        {
          name: "reason",
          label: "Commentaire",
          type: "textarea",
          placeholder: "Précisez éventuellement votre demande...",
          fullWidth: true,
        },
      ]}
      information={[
        {
          title: "Montant autorisé",
          text: "Le montant dépend du salaire déjà acquis pendant le mois.",
        },
        {
          title: "Délai de traitement",
          text: "La demande est généralement traitée sous quelques jours.",
        },
        {
          title: "Validation",
          text: "La demande doit être validée par le service paie.",
        },
      ]}
      history={[
        {
          id: 1,
          date: "5 juin 2026",
          title: "Acompte",
          detail: "300 €",
          status: "paid",
        },
        {
          id: 2,
          date: "8 avril 2026",
          title: "Acompte",
          detail: "250 €",
          status: "approved",
        },
      ]}
    />
  );
}
