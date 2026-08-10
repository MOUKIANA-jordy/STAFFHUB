import json
from decimal import Decimal

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

    total_heures_sup = serializers.SerializerMethodField()

    class Meta:
        model = Demande

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "type_demande",
            "type_demande_display",
            "montant_souhaite",
            "pointages",
            "total_heures_sup",
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
            "total_heures_sup",
            "statut",
            "date_demande",
            "processed_at",
        ]

    def get_salarie_nom(self, obj) -> str:
        user = getattr(
            obj.salarie,
            "user",
            None,
        )

        if not user:
            return str(obj.salarie)

        full_name = user.get_full_name()

        return (
            full_name
            or user.username
        )

    def get_total_heures_sup(self, obj) -> float:
        return float(
            obj.total_heures_sup
        )

    def validate_details(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)

            except json.JSONDecodeError as error:
                raise serializers.ValidationError(
                    "Le champ details contient "
                    "un JSON invalide."
                ) from error

        if value is None:
            return {}

        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Le champ details doit être "
                "un objet JSON."
            )

        return value

    def validate_document(self, document):
        if not document:
            return document

        max_size = 5 * 1024 * 1024

        if document.size > max_size:
            raise serializers.ValidationError(
                "Le fichier ne doit pas "
                "dépasser 5 Mo."
            )

        allowed_types = [
            "application/pdf",
            "image/jpeg",
            "image/png",
        ]

        content_type = getattr(
            document,
            "content_type",
            None,
        )

        if (
            content_type
            and content_type not in allowed_types
        ):
            raise serializers.ValidationError(
                "Formats acceptés : PDF, JPG et PNG."
            )

        return document

    def validate(self, attrs):
        instance = self.instance

        type_demande = attrs.get(
            "type_demande",
            getattr(
                instance,
                "type_demande",
                None,
            ),
        )

        montant = attrs.get(
            "montant_souhaite",
            getattr(
                instance,
                "montant_souhaite",
                None,
            ),
        )

        pointages = attrs.get(
            "pointages",
            None,
        )

        request = self.context.get(
            "request"
        )

        user = getattr(
            request,
            "user",
            None,
        )

        salarie = getattr(
            user,
            "salarie",
            None,
        ) if user else None

        # =============================
        # DEMANDE DÉJÀ TRAITÉE
        # =============================

        if (
            instance
            and instance.statut
            != Demande.Statut.EN_ATTENTE
            and not (
                user
                and (
                    user.is_staff
                    or user.is_superuser
                )
            )
        ):
            raise serializers.ValidationError(
                "Une demande déjà traitée "
                "ne peut plus être modifiée."
            )

        # =============================
        # ACOMPTE / AVANCE
        # =============================

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

            if montant <= Decimal("0"):
                raise serializers.ValidationError({
                    "montant_souhaite": (
                        "Le montant doit être "
                        "supérieur à zéro."
                    )
                })

        # =============================
        # ABSENCE
        # =============================

        if (
            type_demande
            == Demande.TypeDemande.ABSENCE
            and montant is not None
        ):
            raise serializers.ValidationError({
                "montant_souhaite": (
                    "Une absence ne doit pas "
                    "avoir de montant."
                )
            })

        # =============================
        # AVANCE CDI
        # =============================

        if (
            type_demande
            == Demande.TypeDemande.AVANCE
            and salarie
            and not (
                user.is_staff
                or user.is_superuser
            )
        ):
            if salarie.type_contrat != "CDI":
                raise serializers.ValidationError({
                    "type_demande": (
                        "Les avances sont réservées "
                        "aux salariés en CDI."
                    )
                })

        # =============================
        # HEURES SUP
        # =============================

        if (
            type_demande
            == Demande.TypeDemande.HEURES_SUP
        ):
            if not salarie:
                raise serializers.ValidationError({
                    "pointages": (
                        "Aucun profil salarié "
                        "n’est associé à ce compte."
                    )
                })

            # Création : au moins un pointage obligatoire.
            if (
                not instance
                and not pointages
            ):
                raise serializers.ValidationError({
                    "pointages": (
                        "Sélectionnez au moins "
                        "un pointage contenant "
                        "des heures supplémentaires."
                    )
                })

            if pointages is not None:
                total = Decimal("0.00")

                for pointage in pointages:
                    # Le pointage doit appartenir
                    # au salarié connecté.
                    if (
                        pointage.salarie_id
                        != salarie.id
                    ):
                        raise serializers.ValidationError({
                            "pointages": (
                                "Vous ne pouvez utiliser "
                                "que vos propres pointages."
                            )
                        })

                    heures_sup = (
                        pointage.heures_sup
                        or Decimal("0.00")
                    )

                    if heures_sup <= 0:
                        raise serializers.ValidationError({
                            "pointages": (
                                f"Le pointage #{pointage.id} "
                                "ne contient aucune heure "
                                "supplémentaire."
                            )
                        })

                    # Empêche qu'un pointage soit
                    # réutilisé dans une autre demande
                    # non refusée.
                    demandes_existantes = (
                        pointage
                        .demandes_heures_sup
                        .exclude(
                            statut=Demande.Statut.REFUSE
                        )
                    )

                    if instance:
                        demandes_existantes = (
                            demandes_existantes.exclude(
                                pk=instance.pk
                            )
                        )

                    if demandes_existantes.exists():
                        raise serializers.ValidationError({
                            "pointages": (
                                f"Le pointage #{pointage.id} "
                                "est déjà utilisé dans "
                                "une autre demande."
                            )
                        })

                    total += heures_sup

                if total <= Decimal("0.00"):
                    raise serializers.ValidationError({
                        "pointages": (
                            "Aucune heure supplémentaire "
                            "n’a été trouvée."
                        )
                    })

        # Un autre type de demande ne doit pas
        # utiliser de pointages.
        elif pointages:
            raise serializers.ValidationError({
                "pointages": (
                    "Les pointages sont réservés "
                    "aux demandes d’heures supplémentaires."
                )
            })

        return attrs
