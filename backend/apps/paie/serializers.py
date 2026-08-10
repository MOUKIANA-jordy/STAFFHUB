from rest_framework import serializers

from .models import Paie


class PaieSerializer(serializers.ModelSerializer):
    salarie_nom = serializers.SerializerMethodField()

    type_paiement_display = serializers.CharField(
        source="get_type_paiement_display",
        read_only=True,
    )

    demande_type = serializers.CharField(
        source="demande.type_demande",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Paie

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "demande",
            "demande_type",
            "type_paiement",
            "type_paiement_display",
            "montant",
            "date_paiement",
            "preuve_pdf",
            "commentaire",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie_nom",
            "demande_type",
            "type_paiement_display",
            "created_at",
            "updated_at",
        ]

    def get_salarie_nom(self, obj) -> str:
        return (
            f"{obj.salarie.prenom} "
            f"{obj.salarie.nom}"
        ).strip()

    def validate_montant(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Le montant ne peut pas être négatif."
            )

        return value

    def validate(self, attrs):
        salarie = attrs.get(
            "salarie",
            getattr(self.instance, "salarie", None),
        )

        demande = attrs.get(
            "demande",
            getattr(self.instance, "demande", None),
        )

        type_paiement = attrs.get(
            "type_paiement",
            getattr(self.instance, "type_paiement", None),
        )

        if demande and salarie:
            if demande.salarie_id != salarie.id:
                raise serializers.ValidationError({
                    "demande": (
                        "La demande doit appartenir "
                        "au même salarié."
                    )
                })

        if demande:
            mapping = {
                "ACOMPTE": Paie.TypePaiement.ACOMPTE,
                "AVANCE": Paie.TypePaiement.AVANCE,
                "CET": Paie.TypePaiement.CET,
                "HEURES_SUP": Paie.TypePaiement.HEURES_SUP,
            }

            expected_type = mapping.get(
                demande.type_demande
            )

            if (
                expected_type
                and type_paiement != expected_type
            ):
                raise serializers.ValidationError({
                    "type_paiement": (
                        "Le type de paiement ne correspond pas "
                        "à la demande associée."
                    )
                })

        return attrs
