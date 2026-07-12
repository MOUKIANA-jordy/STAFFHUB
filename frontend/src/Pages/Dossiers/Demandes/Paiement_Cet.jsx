import React from "react";
import RequestFormPage from "../../../Components/RequestFormPage";

export default function PaiementCet() {
  return (
    <RequestFormPage
      endpoint="/api/demandes/"
      requestType="PAIEMENT_CET"
      title="Paiement du CET"
      description="Demandez la monétisation de jours placés sur votre compte épargne-temps."
      icon="◷"
      accent="blue"
      submitLabel="Envoyer la demande de paiement CET"
      fields={[
        {
          name: "days",
          label: "Nombre de jours à payer",
          type: "number",
          min: 1,
          max: 30,
          required: true,
        },
        {
          name: "paymentMonth",
          label: "Mois de paiement souhaité",
          type: "month",
          required: true,
        },
        {
          name: "reason",
          label: "Commentaire",
          type: "textarea",
          placeholder: "Ajoutez éventuellement une précision...",
          fullWidth: true,
        },
      ]}
      information={[
        {
          title: "Solde disponible",
          text: "Vérifiez que votre CET dispose d’un nombre suffisant de jours.",
        },
        {
          title: "Règles internes",
          text: "Le nombre de jours monétisables peut être limité.",
        },
        {
          title: "Paiement",
          text: "Le montant apparaîtra sur votre bulletin de salaire.",
        },
      ]}
      history={[
        {
          id: 1,
          date: "15 janvier 2026",
          title: "Paiement CET",
          detail: "5 jours",
          status: "paid",
        },
      ]}
    />
  );
}
