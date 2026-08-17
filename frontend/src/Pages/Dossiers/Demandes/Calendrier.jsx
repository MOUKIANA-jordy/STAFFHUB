import React from "react";

import RequestFormPage from "../../../Components/RequestFormPage";


export default function Calendrier() {

  return (
    <RequestFormPage

      endpoint="/api/demandes/"

      requestType="CALENDRIER"

      title="Modification du calendrier"

      description="Demandez une modification exceptionnelle de votre planning."

      icon="▦"

      accent="purple"

      submitLabel="Envoyer la demande"


      fields={[

        // =====================================================
        // DATE
        // =====================================================

        {
          name: "date",

          label: "Date concernée",

          type: "date",

          required: true,
        },


        // =====================================================
        // TYPE JOURNÉE
        // =====================================================

        {
          name: "type_journee",

          label: "Type de journée souhaité",

          type: "select",

          options: [

            {
              value: "BUREAU",
              label: "Bureau",
            },

            {
              value: "TELETRAVAIL",
              label: "Télétravail",
            },

            {
              value: "CONGE",
              label: "Congé",
            },

            {
              value: "ABSENCE",
              label: "Absence",
            },

            {
              value: "VACATION",
              label: "Vacation",
            },

            {
              value: "FORMATION",
              label: "Formation",
            },

          ],

          required: true,
        },


        // =====================================================
        // HEURE DÉBUT
        // =====================================================

        {
          name: "heure_debut",

          label: "Heure de début",

          type: "time",

          hidden: (data) =>
            [
              "CONGE",
              "ABSENCE",
            ].includes(
              data.type_journee
            ),

          required: (data) =>
            Boolean(
              data.type_journee
            )
            && ![
              "CONGE",
              "ABSENCE",
            ].includes(
              data.type_journee
            ),
        },


        // =====================================================
        // HEURE FIN
        // =====================================================

        {
          name: "heure_fin",

          label: "Heure de fin",

          type: "time",

          hidden: (data) =>
            [
              "CONGE",
              "ABSENCE",
            ].includes(
              data.type_journee
            ),

          required: (data) =>
            Boolean(
              data.type_journee
            )
            && ![
              "CONGE",
              "ABSENCE",
            ].includes(
              data.type_journee
            ),
        },


        // =====================================================
        // MOTIF
        // =====================================================

        {
          name: "motif",

          label: "Motif de la modification",

          type: "textarea",

          placeholder:
            "Expliquez brièvement pourquoi vous souhaitez modifier votre planning...",

          fullWidth: true,
        },


        // =====================================================
        // JUSTIFICATIF
        // =====================================================

        {
          name: "document",

          label: "Justificatif",

          type: "file",

          accept:
            ".pdf,.jpg,.jpeg,.png",

          fullWidth: true,

          help:
            "Facultatif — PDF, JPG ou PNG.",
        },

      ]}


      information={[

        {
          title:
            "Validation RH",

          text:
            "La modification doit être approuvée avant d'être appliquée.",
        },


        {
          title:
            "Horaires",

          text:
            "Les horaires sont requis pour le bureau, le télétravail, les vacations et les formations.",
        },


        {
          title:
            "Congé / absence",

          text:
            "Pour un congé ou une absence, les champs d'horaires sont automatiquement masqués.",
        },


        {
          title:
            "Planning",

          text:
            "Après validation, votre planning pourra être mis à jour.",
        },

      ]}

    />
  );
}
