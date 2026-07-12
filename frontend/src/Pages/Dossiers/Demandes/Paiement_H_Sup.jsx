import React from "react";
import RequestFormPage from "../../../Components/RequestFormPage";

export default function PaiementHSup() {
  return (
    <RequestFormPage
      endpoint="/api/demandes/"
      requestType="PAIEMENT_HEURES_SUP"
      title="Paiement des heures supplémentaires"
      description="Demandez le paiement d’heures supplémentaires effectuées."
      icon="＋"
      accent="green"
      submitLabel="Envoyer la demande de paiement"
      fields={[
        {
          name: "period",
          label: "Mois concerné",
          type: "month",
          required: true,
        },
        {
          name: "hours",
          label: "Nombre d’heures",
          type: "number",
          min: 0.5,
          step: "0.5",
          required: true,
        },
        {
          name: "workDate",
          label: "Date principale concernée",
          type: "date",
          required: true,
        },
        {
          name: "manager",
          label: "Responsable ayant autorisé les heures",
          type: "text",
          placeholder: "Nom du responsable",
          required: true,
        },
        {
          name: "details",
          label: "Détail des heures effectuées",
          type: "textarea",
          placeholder: "Décrivez les horaires et les tâches réalisées...",
          fullWidth: true,
          required: true,
        },
        {
          name: "document",
          label: "Justificatif",
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          fullWidth: true,
        },
      ]}
      information={[
        {
          title: "Autorisation préalable",
          text: "Les heures supplémentaires doivent être autorisées par un responsable.",
        },
        {
          title: "Contrôle",
          text: "Les horaires seront comparés aux données de pointage.",
        },
        {
          title: "Paiement",
          text: "Le paiement intervient après validation du service paie.",
        },
      ]}
      history={[
        {
          id: 1,
          date: "3 juillet 2026",
          title: "Heures supplémentaires",
          detail: "6 heures — juin 2026",
          status: "pending",
        },
        {
          id: 2,
          date: "5 juin 2026",
          title: "Heures supplémentaires",
          detail: "4,5 heures — mai 2026",
          status: "paid",
        },
      ]}
    />
  );
}
