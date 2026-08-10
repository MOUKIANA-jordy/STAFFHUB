from datetime import date, timedelta
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone

from django_filters.rest_framework import (
    DjangoFilterBackend,
)

from rest_framework import (
    filters,
    serializers,
    status,
    viewsets,
)
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.paie.models import Paie
from apps.planning.models import Planning
from apps.remunerations.models import Remuneration
from apps.users.models import (
    CompteCET,
    Salarie,
)

from .models import Demande
from .permissions import DemandePermission
from .serializers import DemandeSerializer

from calendar import monthrange
from datetime import datetime
from io import BytesIO

from django.core.files.base import ContentFile

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ============================================================
# UTILITAIRE RH / ADMIN
# ============================================================

def is_rh_or_admin(user):
    if (
        not user
        or not user.is_authenticated
    ):
        return False

    if user.is_superuser:
        return True

    salarie = getattr(
        user,
        "salarie",
        None,
    )

    return bool(
        salarie
        and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]
    )


# ============================================================
# DEMANDES
# ============================================================

class DemandeViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeSerializer

    permission_classes = [
        IsAuthenticated,
        DemandePermission,
    ]

    # ========================================================
    # FILTRES / RECHERCHE / TRI
    # ========================================================

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "statut",
        "type_demande",
        "salarie",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "salarie__email_personnel",
        "salarie__user__username",
        "salarie__user__email",
    ]

    ordering_fields = [
        "date_demande",
        "processed_at",
        "montant_souhaite",
        "type_demande",
        "statut",
    ]

    ordering = [
        "-date_demande",
    ]

    # ========================================================
    # QUERYSET
    # ========================================================

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Demande.objects.none()

        user = self.request.user

        queryset = (
            Demande.objects
            .select_related(
                "salarie",
                "salarie__user",
            )
            .prefetch_related(
                "pointages",
            )
            .order_by(
                "-date_demande"
            )
        )

        if is_rh_or_admin(user):
            return queryset

        salarie = getattr(
            user,
            "salarie",
            None,
        )

        if not salarie:
            return queryset.none()

        return queryset.filter(
            salarie=salarie,
        )

    # ========================================================
    # CRÉATION D'UNE DEMANDE
    # ========================================================

    def perform_create(
        self,
        serializer,
    ):
        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if not salarie:
            raise serializers.ValidationError({
                "salarie": (
                    "Aucun profil salarié "
                    "n’est associé à ce compte."
                )
            })

        serializer.save(
            salarie=salarie,
            statut=Demande.Statut.EN_ATTENTE,
        )

    # ========================================================
    # VÉRIFICATION RH / ADMIN
    # ========================================================

    def _verifier_admin(
        self,
        request,
    ):
        if not is_rh_or_admin(
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "Seuls les RH ou administrateurs "
                        "peuvent traiter une demande."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return None

    # ========================================================
    # NOTIFICATIONS
    # ========================================================

    def _creer_notification(
        self,
        demande,
        titre,
        message,
        type_notification,
    ):
        return Notification.objects.create(
            salarie=demande.salarie,
            titre=titre,
            message=message,
            type_notification=type_notification,
            priorite=(
                Notification.Priorite.NORMALE
            ),
            lien=(
                f"/home/demandes/"
                f"{demande.id}"
            ),
            created_by=self.request.user,
        )

    # ========================================================
    # PAIE
    # ========================================================

    def _creer_paiement(
        self,
        demande,
    ):
        """
        Crée automatiquement une ligne de paie
        lorsqu'une demande financière est approuvée.

        Types concernés :
        - ACOMPTE
        - AVANCE
        - CET
        - HEURES_SUP
        """

        mapping = {
            Demande.TypeDemande.ACOMPTE:
                Paie.TypePaiement.ACOMPTE,

            Demande.TypeDemande.AVANCE:
                Paie.TypePaiement.AVANCE,

            Demande.TypeDemande.CET:
                Paie.TypePaiement.CET,

            Demande.TypeDemande.HEURES_SUP:
                Paie.TypePaiement.HEURES_SUP,
        }

        type_paiement = mapping.get(
            demande.type_demande
        )

        # ABSENCE / FICHE / CALENDRIER
        # ne créent pas de paiement.
        if not type_paiement:
            return None, False

        # Protection contre un double paiement.
        paiement_existant = (
            Paie.objects
            .filter(
                demande=demande,
            )
            .first()
        )

        if paiement_existant:
            return (
                paiement_existant,
                False,
            )

        montant = demande.montant_souhaite

        date_paiement = (
            timezone.localdate()
        )

        commentaire = (
            f"Paiement généré automatiquement "
            f"après approbation de la demande "
            f"#{demande.id}."
        )

        # ====================================================
        # HEURES SUPPLÉMENTAIRES
        # ====================================================

        if (
            demande.type_demande
            == Demande.TypeDemande.HEURES_SUP
        ):
            total_heures = (
                demande.total_heures_sup
            )

            if total_heures <= 0:
                raise serializers.ValidationError({
                    "pointages": (
                        "Aucune heure supplémentaire "
                        "n'est associée à cette demande."
                    )
                })

            remuneration = (
                Remuneration.objects
                .filter(
                    salarie=demande.salarie,
                    actif=True,
                )
                .order_by(
                    "-date_debut"
                )
                .first()
            )

            if not remuneration:
                raise serializers.ValidationError({
                    "remuneration": (
                        "Aucune rémunération active "
                        "n'est configurée pour ce salarié."
                    )
                })

            # heures × taux horaire × majoration
            montant = (
                remuneration
                .calculer_heures_sup(
                    total_heures
                )
            )

            pointages = list(
                demande.pointages.all()
            )

            if not pointages:
                raise serializers.ValidationError({
                    "pointages": (
                        "Aucun pointage n'est associé "
                        "à cette demande."
                    )
                })

            periodes_paie = {
                pointage.mois_paie
                for pointage in pointages
                if pointage.mois_paie
            }

            if not periodes_paie:
                raise serializers.ValidationError({
                    "pointages": (
                        "Aucune période de paie "
                        "n'a été trouvée."
                    )
                })

            if len(periodes_paie) > 1:
                raise serializers.ValidationError({
                    "pointages": (
                        "Les pointages ne correspondent "
                        "pas à la même période de paie."
                    )
                })

            date_paiement = next(
                iter(periodes_paie)
            )

            commentaire = (
                f"{total_heures} heure(s) "
                f"supplémentaire(s) à "
                f"{remuneration.taux_horaire} €/h, "
                f"majorées de "
                f"{remuneration.majoration_heures_sup} %. "
                f"Demande #{demande.id}."
            )

        # ====================================================
        # CET
        # ====================================================

        elif (
            demande.type_demande
            == Demande.TypeDemande.CET
        ):
            details = (
                demande.details
                or {}
            )

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

            if (
                heures_cet
                <= Decimal("0.00")
            ):
                raise serializers.ValidationError({
                    "details": {
                        "heures_cet": (
                            "Le nombre d'heures CET "
                            "doit être supérieur à zéro."
                        )
                    }
                })

            # Verrouillage du CET pendant la transaction.
            try:
                compte_cet = (
                    CompteCET.objects
                    .select_for_update()
                    .get(
                        salarie=demande.salarie
                    )
                )

            except CompteCET.DoesNotExist as error:
                raise serializers.ValidationError({
                    "cet": (
                        "Aucun compte CET n'est "
                        "configuré pour ce salarié."
                    )
                }) from error

            if (
                compte_cet.solde_heures
                < heures_cet
            ):
                raise serializers.ValidationError({
                    "cet": (
                        f"Solde CET insuffisant. "
                        f"Disponible : "
                        f"{compte_cet.solde_heures} h."
                    )
                })

            remuneration = (
                Remuneration.objects
                .filter(
                    salarie=demande.salarie,
                    actif=True,
                )
                .order_by(
                    "-date_debut"
                )
                .first()
            )

            if not remuneration:
                raise serializers.ValidationError({
                    "remuneration": (
                        "Aucune rémunération active "
                        "n'est configurée pour ce salarié."
                    )
                })

            # heures CET × taux horaire
            montant = (
                heures_cet
                * remuneration.taux_horaire
            ).quantize(
                Decimal("0.01")
            )

            # Déduction du CET.
            compte_cet.solde_heures = (
                compte_cet.solde_heures
                - heures_cet
            )

            compte_cet.full_clean()

            compte_cet.save(
                update_fields=[
                    "solde_heures",
                    "updated_at",
                ]
            )

            commentaire = (
                f"Paiement de "
                f"{heures_cet} heure(s) CET "
                f"à {remuneration.taux_horaire} €/h. "
                f"Montant : {montant} €. "
                f"Demande #{demande.id}."
            )

        # ====================================================
        # CRÉATION DE LA PAIE
        # ====================================================

        paiement = Paie(
            salarie=demande.salarie,
            demande=demande,
            type_paiement=type_paiement,
            montant=montant,
            date_paiement=date_paiement,
            commentaire=commentaire,
        )

        paiement.full_clean()

        paiement.save()

        return paiement, True

    # ========================================================
    # ABSENCE → PLANNING
    # ========================================================

    def _creer_planning_absence(
        self,
        demande,
    ):
        """
        Pour une demande ABSENCE approuvée,
        crée ou met à jour le planning du salarié
        pour chaque jour compris entre date_debut
        et date_fin.
        """

        if (
            demande.type_demande
            != Demande.TypeDemande.ABSENCE
        ):
            return []

        details = (
            demande.details
            or {}
        )

        date_debut_value = (
            details.get("date_debut")
        )

        date_fin_value = (
            details.get("date_fin")
        )

        motif = (
            details.get("motif")
            or ""
        ).strip()

        if not date_debut_value:
            raise serializers.ValidationError({
                "details": {
                    "date_debut": (
                        "La date de début "
                        "est obligatoire."
                    )
                }
            })

        if not date_fin_value:
            raise serializers.ValidationError({
                "details": {
                    "date_fin": (
                        "La date de fin "
                        "est obligatoire."
                    )
                }
            })

        try:
            date_debut = date.fromisoformat(
                str(date_debut_value)
            )

            date_fin = date.fromisoformat(
                str(date_fin_value)
            )

        except ValueError as error:
            raise serializers.ValidationError({
                "details": (
                    "Les dates de l'absence "
                    "sont invalides."
                )
            }) from error

        if date_fin < date_debut:
            raise serializers.ValidationError({
                "details": {
                    "date_fin": (
                        "La date de fin ne peut pas "
                        "être antérieure à "
                        "la date de début."
                    )
                }
            })

        plannings = []

        date_courante = (
            date_debut
        )

        while (
            date_courante
            <= date_fin
        ):
            planning, created = (
                Planning.objects
                .get_or_create(
                    salarie=demande.salarie,
                    date=date_courante,
                    defaults={
                        "type_journee": (
                            Planning
                            .TypeJournee
                            .ABSENCE
                        ),
                        "heure_debut": None,
                        "heure_fin": None,
                        "commentaire": (
                            motif
                            or (
                                "Absence validée "
                                f"- Demande "
                                f"#{demande.id}"
                            )
                        ),
                    },
                )
            )

            # Un planning existe déjà :
            # il devient une absence.
            if not created:
                planning.type_journee = (
                    Planning
                    .TypeJournee
                    .ABSENCE
                )

                planning.heure_debut = None
                planning.heure_fin = None

                planning.commentaire = (
                    motif
                    or (
                        "Absence validée "
                        f"- Demande "
                        f"#{demande.id}"
                    )
                )

                planning.full_clean()

                planning.save(
                    update_fields=[
                        "type_journee",
                        "heure_debut",
                        "heure_fin",
                        "commentaire",
                        "updated_at",
                    ]
                )

            plannings.append(
                planning
            )

            date_courante += (
                timedelta(days=1)
            )

        return plannings

    # ========================================================
    # APPROUVER
    # ========================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="approuver",
    )
    @transaction.atomic
    def approuver(
        self,
        request,
        pk=None,
    ):
        permission_error = (
            self._verifier_admin(
                request
            )
        )

        if permission_error:
            return permission_error

        demande = self.get_object()

        if (
            demande.statut
            != Demande.Statut.EN_ATTENTE
        ):
            return Response(
                {
                    "detail": (
                        "Cette demande a déjà "
                        "été traitée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ================================================
        # APPROBATION
        # ================================================

        demande.statut = (
            Demande.Statut.APPROUVE
        )

        demande.save(
            update_fields=[
                "statut",
                "processed_at",
            ]
        )

        # ================================================
        # PAIE
        # ================================================

        paiement, paiement_cree = (
            self._creer_paiement(
                demande
            )
        )

        # ================================================
        # ABSENCE → PLANNING
        # ================================================

        plannings_crees = (
            self._creer_planning_absence(
                demande
            )
        )

        # ================================================
        # NOTIFICATION
        # ================================================

        self._creer_notification(
            demande=demande,
            titre="Demande approuvée",
            message=(
                f"Votre demande "
                f"{demande.get_type_demande_display()} "
                "a été approuvée."
            ),
            type_notification=(
                Notification
                .TypeNotification
                .VALIDATION
            ),
        )

        serializer = (
            self.get_serializer(
                demande
            )
        )

        return Response(
            {
                "message": (
                    "La demande a été approuvée."
                ),

                "paiement_cree": (
                    paiement_cree
                ),

                "paiement_id": (
                    paiement.id
                    if paiement
                    else None
                ),

                "montant_paiement": (
                    str(paiement.montant)
                    if (
                        paiement
                        and paiement.montant
                        is not None
                    )
                    else None
                ),

                "date_paiement": (
                    paiement.date_paiement
                    if paiement
                    else None
                ),

                "plannings_crees": [
                    planning.id
                    for planning
                    in plannings_crees
                ],

                "demande": (
                    serializer.data
                ),
            },
            status=status.HTTP_200_OK,
        )

    # ========================================================
    # REFUSER
    # ========================================================

    @action(
        detail=True,
        methods=["post"],
        url_path="refuser",
    )
    @transaction.atomic
    def refuser(
        self,
        request,
        pk=None,
    ):
        permission_error = (
            self._verifier_admin(
                request
            )
        )

        if permission_error:
            return permission_error

        demande = self.get_object()

        if (
            demande.statut
            != Demande.Statut.EN_ATTENTE
        ):
            return Response(
                {
                    "detail": (
                        "Cette demande a déjà "
                        "été traitée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        demande.statut = (
            Demande.Statut.REFUSE
        )

        demande.save(
            update_fields=[
                "statut",
                "processed_at",
            ]
        )

        self._creer_notification(
            demande=demande,
            titre="Demande refusée",
            message=(
                f"Votre demande "
                f"{demande.get_type_demande_display()} "
                "a été refusée."
            ),
            type_notification=(
                Notification
                .TypeNotification
                .REFUS
            ),
        )

        serializer = (
            self.get_serializer(
                demande
            )
        )

        return Response(
            {
                "message": (
                    "La demande a été refusée."
                ),
                "demande": (
                    serializer.data
                ),
            },
            status=status.HTTP_200_OK,
        )
