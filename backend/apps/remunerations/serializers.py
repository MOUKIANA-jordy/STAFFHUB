from rest_framework import serializers

from .models import Remuneration


class RemunerationSerializer(serializers.ModelSerializer):
    salarie_nom = serializers.SerializerMethodField()

    class Meta:
        model = Remuneration

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "salaire_mensuel_brut",
            "taux_horaire",
            "majoration_heures_sup",
            "majoration_nuit",
            "majoration_dimanche",
            "majoration_ferie",
            "actif",
            "date_debut",
            "date_fin",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie_nom",
            "created_at",
            "updated_at",
        ]

    def get_salarie_nom(self, obj) -> str:
        return f"{obj.salarie.prenom} {obj.salarie.nom}"

    def validate(self, attrs):
        date_debut = attrs.get(
            "date_debut",
            getattr(self.instance, "date_debut", None),
        )

        date_fin = attrs.get(
            "date_fin",
            getattr(self.instance, "date_fin", None),
        )

        if (
            date_debut
            and date_fin
            and date_fin < date_debut
        ):
            raise serializers.ValidationError({
                "date_fin": (
                    "La date de fin ne peut pas être "
                    "antérieure à la date de début."
                )
            })

        return attrs
