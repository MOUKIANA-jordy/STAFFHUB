from calendar import monthrange
from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from io import BytesIO

from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import (
    filters,
    serializers,
    status,
    viewsets,
)
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

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
    # NOTIFICATION
    # ========================================================

    def _creer_notification(
        self,
        demande,
        titre,
        message,
        type_notification,
        lien=None,
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
                lien
                or f"/home/demandes/{demande.id}"
            ),
            created_by=self.request.user,
        )

    # ========================================================
    # PAIE : ACOMPTE / AVANCE / CET / HEURES SUP
    # ========================================================

    def _creer_paiement(
        self,
        demande,
    ):
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
        # ne passent pas par cette fonction.
        if not type_paiement:
            return None, False

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

            montant = (
                heures_cet
                * remuneration.taux_horaire
            ).quantize(
                Decimal("0.01")
            )

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
        # CRÉATION PAIE
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

        date_courante = date_debut

        while date_courante <= date_fin:
            planning, created = (
                Planning.objects
                .get_or_create(
                    salarie=demande.salarie,
                    date=date_courante,
                    defaults={
                        "type_journee": (
                            Planning.TypeJournee.ABSENCE
                        ),
                        "heure_debut": None,
                        "heure_fin": None,
                        "commentaire": (
                            motif
                            or (
                                "Absence validée "
                                f"- Demande #{demande.id}"
                            )
                        ),
                    },
                )
            )

            if not created:
                planning.type_journee = (
                    Planning.TypeJournee.ABSENCE
                )

                planning.heure_debut = None
                planning.heure_fin = None

                planning.commentaire = (
                    motif
                    or (
                        "Absence validée "
                        f"- Demande #{demande.id}"
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
    # FICHE DE PAIE → PDF
    # ========================================================

    def _creer_fiche_paie(
        self,
        demande,
    ):
        """
        Génère une fiche de paie PDF pour le mois
        demandé dans details["mois"].

        Exemple :
        {
            "mois": "2026-08"
        }
        """

        if (
            demande.type_demande
            != Demande.TypeDemande.FICHE
        ):
            return None, False

        details = (
            demande.details
            or {}
        )

        mois_value = (
            details.get("mois")
        )

        if not mois_value:
            raise serializers.ValidationError({
                "details": {
                    "mois": (
                        "Le mois de la fiche de paie "
                        "est obligatoire."
                    )
                }
            })

        try:
            mois_date = (
                datetime.strptime(
                    str(mois_value),
                    "%Y-%m",
                )
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

        annee = mois_date.year
        mois = mois_date.month

        # Empêche de générer deux fiches
        # pour la même demande.
        fiche_existante = (
            Paie.objects
            .filter(
                demande=demande,
                type_paiement=(
                    Paie.TypePaiement.FICHE_PAIE
                ),
            )
            .first()
        )

        if fiche_existante:
            return (
                fiche_existante,
                False,
            )

        # ====================================================
        # ÉLÉMENTS DE PAIE DU MOIS
        # ====================================================

        paiements = (
            Paie.objects
            .filter(
                salarie=demande.salarie,
                date_paiement__year=annee,
                date_paiement__month=mois,
            )
            .exclude(
                type_paiement=(
                    Paie.TypePaiement.FICHE_PAIE
                )
            )
            .order_by(
                "date_paiement",
                "created_at",
            )
        )

        if not paiements.exists():
            raise serializers.ValidationError({
                "fiche": (
                    "Aucun élément de paie "
                    f"n'a été trouvé pour {mois_value}."
                )
            })

        total = Decimal("0.00")

        for paiement in paiements:
            if paiement.montant is not None:
                total += paiement.montant

        total = total.quantize(
            Decimal("0.01")
        )

        # ====================================================
        # CONSTRUCTION DU PDF
        # ====================================================

        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
        )

        styles = (
            getSampleStyleSheet()
        )

        elements = []

        elements.append(
            Paragraph(
                "FICHE DE PAIE",
                styles["Title"],
            )
        )

        elements.append(
            Spacer(1, 15)
        )

        elements.append(
            Paragraph(
                (
                    f"Période : "
                    f"{mois:02d}/{annee}"
                ),
                styles["Heading2"],
            )
        )

        elements.append(
            Spacer(1, 15)
        )

        elements.append(
            Paragraph(
                (
                    f"Nom : "
                    f"{demande.salarie.nom}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Prénom : "
                    f"{demande.salarie.prenom}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Matricule : "
                    f"{demande.salarie.matricule}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Poste : "
                    f"{demande.salarie.poste}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Paragraph(
                (
                    f"Établissement : "
                    f"{demande.salarie.etablissement}"
                ),
                styles["Normal"],
            )
        )

        elements.append(
            Spacer(1, 20)
        )

        # ====================================================
        # TABLEAU DES ÉLÉMENTS
        # ====================================================

        data = [
            [
                "Désignation",
                "Date",
                "Montant (€)",
            ]
        ]

        for paiement in paiements:
            data.append([
                (
                    paiement
                    .get_type_paiement_display()
                ),
                (
                    paiement
                    .date_paiement
                    .strftime("%d/%m/%Y")
                ),
                (
                    f"{paiement.montant:.2f}"
                    if paiement.montant is not None
                    else "-"
                ),
            ])

        data.append([
            "TOTAL",
            "",
            f"{total:.2f}",
        ])

        table = Table(
            data,
            colWidths=[
                240,
                100,
                110,
            ],
        )

        table.setStyle(
            TableStyle([
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.grey,
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    1,
                    colors.black,
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "ALIGN",
                    (-1, 1),
                    (-1, -1),
                    "RIGHT",
                ),
                (
                    "FONTNAME",
                    (0, -1),
                    (-1, -1),
                    "Helvetica-Bold",
                ),
            ])
        )

        elements.append(
            table
        )

        elements.append(
            Spacer(1, 20)
        )

        elements.append(
            Paragraph(
                (
                    "Document généré automatiquement "
                    "par StaffHub."
                ),
                styles["Normal"],
            )
        )

        doc.build(
            elements
        )

        pdf_content = (
            buffer.getvalue()
        )

        buffer.close()

        # ====================================================
        # DATE DE LA FICHE
        # ====================================================

        dernier_jour = monthrange(
            annee,
            mois,
        )[1]

        date_fiche = date(
            annee,
            mois,
            dernier_jour,
        )

        # ====================================================
        # ENREGISTREMENT DANS PAIE
        # ====================================================

        fiche = Paie(
            salarie=demande.salarie,
            demande=demande,
            type_paiement=(
                Paie.TypePaiement.FICHE_PAIE
            ),
            montant=total,
            date_paiement=date_fiche,
            commentaire=(
                f"Fiche de paie "
                f"{mois:02d}/{annee}."
            ),
        )

        filename = (
            f"fiche_paie_"
            f"{demande.salarie.matricule}_"
            f"{annee}_{mois:02d}.pdf"
        )

        fiche.preuve_pdf.save(
            filename,
            ContentFile(
                pdf_content
            ),
            save=False,
        )

        fiche.full_clean()
        fiche.save()

        return fiche, True

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

        # ====================================================
        # APPROBATION
        # ====================================================

        demande.statut = (
            Demande.Statut.APPROUVE
        )

        demande.save(
            update_fields=[
                "statut",
                "processed_at",
            ]
        )

        # ====================================================
        # PAIE
        # ====================================================

        paiement, paiement_cree = (
            self._creer_paiement(
                demande
            )
        )

        # ====================================================
        # ABSENCE → PLANNING
        # ====================================================

        plannings_crees = (
            self._creer_planning_absence(
                demande
            )
        )

        # ====================================================
        # FICHE PDF
        # ====================================================

        fiche_paie, fiche_creee = (
            self._creer_fiche_paie(
                demande
            )
        )

        # ====================================================
        # NOTIFICATION
        # ====================================================

        notification_message = (
            f"Votre demande "
            f"{demande.get_type_demande_display()} "
            "a été approuvée."
        )

        notification_lien = (
            f"/home/demandes/{demande.id}"
        )

        if fiche_paie:
            notification_message = (
                "Votre fiche de paie est disponible."
            )

            notification_lien = (
                f"/api/paie/"
                f"{fiche_paie.id}/pdf/"
            )

        self._creer_notification(
            demande=demande,
            titre="Demande approuvée",
            message=notification_message,
            type_notification=(
                Notification
                .TypeNotification
                .VALIDATION
            ),
            lien=notification_lien,
        )

        serializer = (
            self.get_serializer(
                demande
            )
        )

        # ====================================================
        # RÉPONSE
        # ====================================================

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

                "fiche_creee": (
                    fiche_creee
                ),

                "fiche_paie_id": (
                    fiche_paie.id
                    if fiche_paie
                    else None
                ),

                "fiche_pdf": (
                    fiche_paie.preuve_pdf.url
                    if (
                        fiche_paie
                        and fiche_paie.preuve_pdf
                    )
                    else None
                ),

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
