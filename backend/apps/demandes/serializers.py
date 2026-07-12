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

    class Meta:
        model = Demande
        fields = [
            "id",
            "salarie",
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
            "statut",
            "date_demande",
            "processed_at",
        ]

    def validate_details(self, value):
        """
        Avec multipart/form-data, React peut envoyer details
        comme une chaîne JSON.
        """
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError as error:
                raise serializers.ValidationError(
                    "Le champ details contient un JSON invalide."
                ) from error

        return value

    def validate(self, attrs):
        type_demande = attrs.get(
            "type_demande",
            getattr(self.instance, "type_demande", None),
        )

        montant = attrs.get(
            "montant_souhaite",
            getattr(self.instance, "montant_souhaite", None),
        )

        if (
            type_demande in ["ACOMPTE", "AVANCE"]
            and not montant
        ):
            raise serializers.ValidationError({
                "montant_souhaite": (
                    "Le montant est obligatoire."
                )
            })

        return attrs
