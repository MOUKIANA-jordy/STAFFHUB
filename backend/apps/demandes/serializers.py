import json

from rest_framework import serializers

from .models import Demande


class DemandeSerializer(serializers.ModelSerializer):
    type_demande_display = serializers.CharField(
        source="get_type_demande_display",
        read_only=True,
    )

    statut_display = serializers.CharField(
        source="get_statut_display",
        read_only=True,
    )

    salarie_nom = serializers.SerializerMethodField()

    class Meta:
        model = Demande

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "type_demande",
            "type_demande_display",
            "montant_souhaite",
            "details",
            "document",
            "statut",
            "statut_display",
            "date_demande",
            "processed_at",
        ]

        read_only_fields = [
            "id",
            "salarie",
            "salarie_nom",
            "statut",
            "date_demande",
            "processed_at",
        ]

    def get_salarie_nom(self, obj):
        user = getattr(obj.salarie, "user", None)

        if not user:
            return str(obj.salarie)

        full_name = user.get_full_name()

        return full_name or user.username

    def validate_details(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError as error:
                raise serializers.ValidationError(
                    "Le champ details contient un JSON invalide."
                ) from error

        if value is None:
            return {}

        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Le champ details doit être un objet JSON."
            )

        return value

    def validate_document(self, document):
        if not document:
            return document

        max_size = 5 * 1024 * 1024

        if document.size > max_size:
            raise serializers.ValidationError(
                "Le fichier ne doit pas dépasser 5 Mo."
            )

        allowed_types = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ]

        content_type = getattr(document, "content_type", None)

        if content_type and content_type not in allowed_types:
            raise serializers.ValidationError(
                "Formats acceptés : PDF, JPG et PNG."
            )

        return document

    def validate(self, attrs):
        instance = self.instance

        type_demande = attrs.get(
            "type_demande",
            getattr(instance, "type_demande", None),
        )

        montant = attrs.get(
            "montant_souhaite",
            getattr(instance, "montant_souhaite", None),
        )

        request = self.context.get("request")
        user = getattr(request, "user", None)

        if (
            instance
            and instance.statut != Demande.Statut.EN_ATTENTE
            and not (
                user
                and (
                    user.is_staff
                    or user.is_superuser
                )
            )
        ):
            raise serializers.ValidationError(
                "Une demande déjà traitée ne peut plus être modifiée."
            )

        if type_demande in [
            Demande.TypeDemande.ACOMPTE,
            Demande.TypeDemande.AVANCE,
        ]:
            if montant is None:
                raise serializers.ValidationError({
                    "montant_souhaite": (
                        "Le montant est obligatoire."
                    )
                })

            if montant <= 0:
                raise serializers.ValidationError({
                    "montant_souhaite": (
                        "Le montant doit être supérieur à zéro."
                    )
                })

        if (
            type_demande == Demande.TypeDemande.ABSENCE
            and montant is not None
        ):
            raise serializers.ValidationError({
                "montant_souhaite": (
                    "Une absence ne doit pas avoir de montant."
                )
            })

        if (
            type_demande == Demande.TypeDemande.AVANCE
            and user
            and not user.is_staff
            and not user.is_superuser
        ):
            salarie = getattr(user, "salarie", None)

            if not salarie:
                raise serializers.ValidationError(
                    "Aucun profil salarié n’est associé à ce compte."
                )

            if salarie.type_contrat != "CDI":
                raise serializers.ValidationError({
                    "type_demande": (
                        "Les avances sont réservées aux salariés en CDI."
                    )
                })

        return attrs
