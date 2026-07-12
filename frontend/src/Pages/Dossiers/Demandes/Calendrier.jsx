import React from "react";
import RequestFormPage from "../../../Components/RequestFormPage";

export default function Calendrier() {
  return (
    <RequestFormPage
      endpoint="/api/demandes/"
      requestType="CALENDRIER"
      title="Demande de modification du calendrier"
      description="Demandez une modification exceptionnelle de vos horaires."
      icon="▦"
      accent="purple"
      submitLabel="Envoyer la demande de modification"
      fields={[
        {
          name: "date",
          label: "Date concernée",
          type: "date",
          required: true,
        },
        {
          name: "requestType",
          label: "Type de modification",
          type: "select",
          options: [
            "Modification d’horaire",
            "Changement de jour",
            "Télétravail exceptionnel",
            "Permutation",
            "Autre",
          ],
          required: true,
        },
        {
          name: "currentSchedule",
          label: "Horaire actuel",
          type: "text",
          placeholder: "Exemple : 08:30 - 17:00",
          required: true,
        },
        {
          name: "requestedSchedule",
          label: "Nouvel horaire souhaité",
          type: "text",
          placeholder: "Exemple : 10:00 - 18:30",
          required: true,
        },
        {
          name: "reason",
          label: "Motif",
          type: "textarea",
          placeholder: "Expliquez la raison de cette modification...",
          fullWidth: true,
          required: true,
        },
      ]}
      information={[
        {
          title: "Anticipation",
          text: "Envoyez votre demande dès que possible.",
        },
        {
          title: "Accord du responsable",
          text: "La modification doit être approuvée avant application.",
        },
        {
          title: "Planning",
          text: "Le planning sera mis à jour après validation.",
        },
      ]}
      history={[
        {
          id: 1,
          date: "20 juin 2026",
          title: "Modification d’horaire",
          detail: "10:00 - 18:30",
          status: "approved",
        },
        {
          id: 2,
          date: "2 mai 2026",
          title: "Télétravail exceptionnel",
          detail: "6 mai 2026",
          status: "rejected",
        },
      ]}
    />
  );
}
