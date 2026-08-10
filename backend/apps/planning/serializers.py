from rest_framework import serializers

from .models import Planning


class PlanningSerializer(serializers.ModelSerializer):
    salarie_nom = serializers.SerializerMethodField()

    type_journee_display = serializers.CharField(
        source="get_type_journee_display",
        read_only=True,
    )

    class Meta:
        model = Planning

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "date",
            "heure_debut",
            "heure_fin",
            "type_journee",
            "type_journee_display",
            "commentaire",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie_nom",
            "type_journee_display",
            "created_at",
            "updated_at",
        ]

    def get_salarie_nom(self, obj) -> str:
        return (
            f"{obj.salarie.prenom} "
            f"{obj.salarie.nom}"
        ).strip()

    def validate(self, attrs):
        instance = self.instance

        type_journee = attrs.get(
            "type_journee",
            getattr(instance, "type_journee", None),
        )

        heure_debut = attrs.get(
            "heure_debut",
            getattr(instance, "heure_debut", None),
        )

        heure_fin = attrs.get(
            "heure_fin",
            getattr(instance, "heure_fin", None),
        )

        if type_journee in [
            Planning.TypeJournee.CONGE,
            Planning.TypeJournee.ABSENCE,
        ]:
            if heure_debut or heure_fin:
                raise serializers.ValidationError({
                    "heure_debut": (
                        "Les congés et absences "
                        "ne doivent pas contenir d’horaires."
                    )
                })

        else:
            if heure_debut and not heure_fin:
                raise serializers.ValidationError({
                    "heure_fin": (
                        "L’heure de fin est obligatoire."
                    )
                })

            if heure_fin and not heure_debut:
                raise serializers.ValidationError({
                    "heure_debut": (
                        "L’heure de début est obligatoire."
                    )
                })

            if (
                heure_debut
                and heure_fin
                and heure_fin <= heure_debut
            ):
                raise serializers.ValidationError({
                    "heure_fin": (
                        "L’heure de fin doit être postérieure "
                        "à l’heure de début."
                    )
                })

        return attrs
