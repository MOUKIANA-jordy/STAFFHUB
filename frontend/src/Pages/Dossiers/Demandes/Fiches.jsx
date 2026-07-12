import React from "react";
import RequestFormPage from "../../../Components/RequestFormPage";

export default function Fiches() {
  return (
    <RequestFormPage
      endpoint="/api/demandes/"
      requestType="FICHE"
      title="Demande de fiche"
      description="Demandez une fiche de paie ou un document lié à votre rémunération."
      icon="▤"
      accent="orange"
      submitLabel="Envoyer la demande de fiche"
      fields={[
        {
          name: "documentType",
          label: "Document demandé",
          type: "select",
          options: [
            "Fiche de paie",
            "Duplicata de fiche de paie",
            "Attestation de salaire",
            "Relevé annuel",
            "Autre document",
          ],
          required: true,
        },
        {
          name: "period",
          label: "Période concernée",
          type: "month",
          required: true,
        },
        {
          name: "deliveryMethod",
          label: "Mode de réception",
          type: "select",
          options: [
            "Téléchargement dans l’espace salarié",
            "Envoi par e-mail",
            "Remise en main propre",
          ],
          required: true,
        },
        {
          name: "comment",
          label: "Commentaire",
          type: "textarea",
          placeholder: "Ajoutez une précision si nécessaire...",
          fullWidth: true,
        },
      ]}
      information={[
        {
          title: "Documents disponibles",
          text: "Certaines fiches sont déjà accessibles dans la rubrique Documents.",
        },
        {
          title: "Duplicata",
          text: "Un duplicata peut être généré pour une période passée.",
        },
        {
          title: "Confidentialité",
          text: "Les documents sont accessibles uniquement depuis votre compte.",
        },
      ]}
      history={[
        {
          id: 1,
          date: "1 juillet 2026",
          title: "Fiche de paie",
          detail: "Juin 2026",
          status: "approved",
        },
        {
          id: 2,
          date: "4 mars 2026",
          title: "Attestation de salaire",
          detail: "Année 2025",
          status: "approved",
        },
      ]}
    />
  );
}
