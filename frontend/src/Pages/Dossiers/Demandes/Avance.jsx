import React from "react";
import RequestFormPage from "../../../Components/RequestFormPage";

export default function Avance() {
  return (
    <RequestFormPage
      endpoint="/api/demandes/"
      requestType="AVANCE"
      title="Demande d’avance"
      description="Demandez une avance exceptionnelle sur salaire."
      icon="⇄"
      accent="green"
      submitLabel="Envoyer la demande d’avance"
      fields={[
        {
          name: "amount",
          label: "Montant demandé",
          type: "number",
          min: 1,
          step: "0.01",
          placeholder: "Exemple : 500",
          required: true,
        },
        {
          name: "repaymentMonths",
          label: "Nombre de mensualités",
          type: "select",
          options: [
            { value: "1", label: "1 mensualité" },
            { value: "2", label: "2 mensualités" },
            { value: "3", label: "3 mensualités" },
            { value: "4", label: "4 mensualités" },
            { value: "6", label: "6 mensualités" },
          ],
          required: true,
        },
        {
          name: "reason",
          label: "Motif de la demande",
          type: "textarea",
          placeholder: "Expliquez brièvement votre besoin...",
          fullWidth: true,
          required: true,
        },
        {
          name: "document",
          label: "Justificatif",
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          fullWidth: true,
          help: "Formats acceptés : PDF, JPG ou PNG.",
        },
      ]}
      information={[
        {
          title: "Demande exceptionnelle",
          text: "Une avance concerne généralement un salaire qui n’est pas encore acquis.",
        },
        {
          title: "Étude du dossier",
          text: "L’entreprise peut accepter ou refuser la demande.",
        },
        {
          title: "Remboursement",
          text: "Les modalités sont définies avec le service paie.",
        },
      ]}
      history={[
        {
          id: 1,
          date: "10 février 2026",
          title: "Avance",
          detail: "600 € sur 3 mois",
          status: "approved",
        },
      ]}
    />
  );
}
