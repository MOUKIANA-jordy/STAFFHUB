from rest_framework import serializers

from .models import Pointage


class PointageSerializer(
    serializers.ModelSerializer
):
    salarie_nom = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Pointage

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "date",
            "heure_arrivee",
            "heure_depart",
            "heures_travaillees",
            "heures_sup",
            "mois_paie",
            "commentaire",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie_nom",
            "heures_travaillees",
            "heures_sup",
            "mois_paie",
            "created_at",
            "updated_at",
        ]

    def get_salarie_nom(
        self,
        obj,
    ) -> str:
        return (
            f"{obj.salarie.prenom} "
            f"{obj.salarie.nom}"
        ).strip()

    def validate(self, attrs):
        instance = self.instance

        date = attrs.get(
            "date",
            getattr(
                instance,
                "date",
                None,
            ),
        )

        heure_arrivee = attrs.get(
            "heure_arrivee",
            getattr(
                instance,
                "heure_arrivee",
                None,
            ),
        )

        heure_depart = attrs.get(
            "heure_depart",
            getattr(
                instance,
                "heure_depart",
                None,
            ),
        )

        if not date:
            raise serializers.ValidationError({
                "date": (
                    "La date est obligatoire."
                )
            })

        if not heure_arrivee:
            raise serializers.ValidationError({
                "heure_arrivee": (
                    "L’heure d’arrivée est obligatoire."
                )
            })

        if not heure_depart:
            raise serializers.ValidationError({
                "heure_depart": (
                    "L’heure de départ est obligatoire."
                )
            })

        return attrs
