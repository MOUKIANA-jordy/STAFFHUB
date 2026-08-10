import json
from datetime import datetime
from decimal import Decimal, InvalidOperation

from rest_framework import serializers

from apps.users.models import CompteCET

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

        return full_name or user.username

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
                "Le fichier ne doit pas dépasser 5 Mo."
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

        details = attrs.get(
            "details",
            getattr(
                instance,
                "details",
                {},
            ),
        ) or {}

        request = self.context.get(
            "request"
        )

        user = getattr(
            request,
            "user",
            None,
        )

        current_salarie = getattr(
            user,
            "salarie",
            None,
        ) if user else None

        demande_salarie = (
            instance.salarie
            if instance
            else current_salarie
        )

        # =========================================
        # DEMANDE DÉJÀ TRAITÉE
        # =========================================

        if (
            instance
            and instance.statut
            != Demande.Statut.EN_ATTENTE
        ):
            raise serializers.ValidationError(
                "Une demande déjà traitée "
                "ne peut plus être modifiée."
            )

        # =========================================
        # ACOMPTE / AVANCE
        # =========================================

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

        # =========================================
        # AVANCE : CDI UNIQUEMENT
        # =========================================

        if (
            type_demande
            == Demande.TypeDemande.AVANCE
            and demande_salarie
            and demande_salarie.type_contrat != "CDI"
        ):
            raise serializers.ValidationError({
                "type_demande": (
                    "Les avances sont réservées "
                    "aux salariés en CDI."
                )
            })

        # =========================================
        # ABSENCE
        # =========================================

        if (
            type_demande
            == Demande.TypeDemande.ABSENCE
        ):
            if montant is not None:
                raise serializers.ValidationError({
                    "montant_souhaite": (
                        "Une absence ne doit pas "
                        "avoir de montant."
                    )
                })

            date_debut = details.get(
                "date_debut"
            )

            date_fin = details.get(
                "date_fin"
            )

            if not date_debut:
                raise serializers.ValidationError({
                    "details": {
                        "date_debut": (
                            "La date de début "
                            "est obligatoire."
                        )
                    }
                })

            if not date_fin:
                raise serializers.ValidationError({
                    "details": {
                        "date_fin": (
                            "La date de fin "
                            "est obligatoire."
                        )
                    }
                })

            try:
                debut = datetime.strptime(
                    str(date_debut),
                    "%Y-%m-%d",
                ).date()

                fin = datetime.strptime(
                    str(date_fin),
                    "%Y-%m-%d",
                ).date()

            except ValueError as error:
                raise serializers.ValidationError({
                    "details": (
                        "Les dates doivent être "
                        "au format AAAA-MM-JJ."
                    )
                }) from error

            if fin < debut:
                raise serializers.ValidationError({
                    "details": {
                        "date_fin": (
                            "La date de fin ne peut pas "
                            "être antérieure à la date "
                            "de début."
                        )
                    }
                })

        # =========================================
        # CET
        # =========================================

        if (
            type_demande
            == Demande.TypeDemande.CET
        ):
            if not demande_salarie:
                raise serializers.ValidationError({
                    "details": (
                        "Aucun salarié n’est associé "
                        "à cette demande."
                    )
                })

            heures_cet = details.get(
                "heures_cet"
            )

            if heures_cet is None:
                raise serializers.ValidationError({
                    "details": {
                        "heures_cet": (
                            "Le nombre d'heures CET "
                            "est obligatoire."
                        )
                    }
                })

            try:
                heures_cet = Decimal(
                    str(heures_cet)
                )

            except (
                InvalidOperation,
                TypeError,
                ValueError,
            ) as error:
                raise serializers.ValidationError({
                    "details": {
                        "heures_cet": (
                            "Le nombre d'heures CET "
                            "est invalide."
                        )
                    }
                }) from error

            if heures_cet <= Decimal("0.00"):
                raise serializers.ValidationError({
                    "details": {
                        "heures_cet": (
                            "Le nombre d'heures CET "
                            "doit être supérieur à zéro."
                        )
                    }
                })

            compte_cet = (
                CompteCET.objects
                .filter(
                    salarie=demande_salarie
                )
                .first()
            )

            if not compte_cet:
                raise serializers.ValidationError({
                    "details": (
                        "Aucun compte CET n’est configuré "
                        "pour ce salarié."
                    )
                })

            if (
                heures_cet
                > compte_cet.solde_heures
            ):
                raise serializers.ValidationError({
                    "details": {
                        "heures_cet": (
                            f"Solde CET insuffisant. "
                            f"Disponible : "
                            f"{compte_cet.solde_heures} h."
                        )
                    }
                })

            if montant is not None:
                raise serializers.ValidationError({
                    "montant_souhaite": (
                        "Le montant d'un paiement CET "
                        "est calculé automatiquement."
                    )
                })

        # =========================================
        # FICHE DE PAIE
        # =========================================

        if (
            type_demande
            == Demande.TypeDemande.FICHE
        ):
            mois = details.get(
                "mois"
            )

            if not mois:
                raise serializers.ValidationError({
                    "details": {
                        "mois": (
                            "Le mois de la fiche de paie "
                            "est obligatoire."
                        )
                    }
                })

            try:
                datetime.strptime(
                    str(mois),
                    "%Y-%m",
                )

            except ValueError as error:
                raise serializers.ValidationError({
                    "details": {
                        "mois": (
                            "Le mois doit être au format "
                            "AAAA-MM, par exemple 2026-08."
                        )
                    }
                }) from error

            if montant is not None:
                raise serializers.ValidationError({
                    "montant_souhaite": (
                        "Une demande de fiche de paie "
                        "ne doit pas avoir de montant."
                    )
                })

        # =========================================
        # HEURES SUPPLÉMENTAIRES
        # =========================================

        if (
            type_demande
            == Demande.TypeDemande.HEURES_SUP
        ):
            if not demande_salarie:
                raise serializers.ValidationError({
                    "pointages": (
                        "Aucun profil salarié "
                        "n’est associé à cette demande."
                    )
                })

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
                periodes_paie = set()

                for pointage in pointages:
                    if (
                        pointage.salarie_id
                        != demande_salarie.id
                    ):
                        raise serializers.ValidationError({
                            "pointages": (
                                "Vous ne pouvez utiliser "
                                "que les pointages "
                                "du salarié concerné."
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

                    if not pointage.mois_paie:
                        raise serializers.ValidationError({
                            "pointages": (
                                f"Le pointage #{pointage.id} "
                                "n'a aucune période de paie."
                            )
                        })

                    periodes_paie.add(
                        pointage.mois_paie
                    )

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

                if len(periodes_paie) > 1:
                    raise serializers.ValidationError({
                        "pointages": (
                            "Tous les pointages doivent "
                            "appartenir à la même période "
                            "de paie."
                        )
                    })

        # =========================================
        # POINTAGES RÉSERVÉS AUX HEURES SUP
        # =========================================

        elif pointages:
            raise serializers.ValidationError({
                "pointages": (
                    "Les pointages sont réservés "
                    "aux demandes d’heures supplémentaires."
                )
            })

        return attrs
