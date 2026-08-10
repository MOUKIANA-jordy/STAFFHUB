from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.users.models import Salarie


class Demande(models.Model):
    class TypeDemande(models.TextChoices):
        ACOMPTE = "ACOMPTE", "Acompte"
        AVANCE = "AVANCE", "Avance"
        CALENDRIER = "CALENDRIER", "Modification du calendrier"
        FICHE = "FICHE", "Demande de fiche"
        CET = "CET", "Paiement CET"
        HEURES_SUP = "HEURES_SUP", "Paiement heures supplémentaires"
        ABSENCE = "ABSENCE", "Absence"

    class Statut(models.TextChoices):
        EN_ATTENTE = "EN_ATTENTE", "En attente"
        APPROUVE = "APPROUVE", "Approuvé"
        REFUSE = "REFUSE", "Refusé"

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="demandes",
    )

    type_demande = models.CharField(
        max_length=50,
        choices=TypeDemande.choices,
        db_index=True,
    )

    montant_souhaite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    # Pointages concernés par une demande d'heures supplémentaires.
    pointages = models.ManyToManyField(
        "pointage.Pointage",
        related_name="demandes_heures_sup",
        blank=True,
    )

    details = models.JSONField(
        default=dict,
        blank=True,
    )

    document = models.FileField(
        upload_to="demandes/justificatifs/%Y/%m/",
        null=True,
        blank=True,
    )

    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE,
        db_index=True,
    )

    date_demande = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    processed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-date_demande"]

        indexes = [
            models.Index(
                fields=["salarie", "statut"],
            ),
            models.Index(
                fields=["type_demande", "statut"],
            ),
        ]

    @property
    def total_heures_sup(self):
        if self.type_demande != self.TypeDemande.HEURES_SUP:
            return Decimal("0.00")

        total = sum(
            (
                pointage.heures_sup or Decimal("0.00")
                for pointage in self.pointages.all()
            ),
            Decimal("0.00"),
        )

        return total.quantize(
            Decimal("0.01")
        )

    def clean(self):
        errors = {}

        if not self.salarie_id:
            errors["salarie"] = (
                "Le salarié est obligatoire."
            )

        elif (
            self.type_demande
            == self.TypeDemande.AVANCE
            and self.salarie.type_contrat != "CDI"
        ):
            errors["type_demande"] = (
                "Les avances sont réservées "
                "aux salariés en CDI."
            )

        if self.type_demande in [
            self.TypeDemande.ACOMPTE,
            self.TypeDemande.AVANCE,
        ]:
            if self.montant_souhaite is None:
                errors["montant_souhaite"] = (
                    "Le montant est obligatoire "
                    "pour cette demande."
                )

            elif (
                self.montant_souhaite
                <= Decimal("0")
            ):
                errors["montant_souhaite"] = (
                    "Le montant doit être "
                    "supérieur à zéro."
                )

        if (
            self.type_demande
            == self.TypeDemande.ABSENCE
            and self.montant_souhaite is not None
        ):
            errors["montant_souhaite"] = (
                "Une demande d’absence ne doit "
                "pas contenir de montant."
            )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if self.statut in [
            self.Statut.APPROUVE,
            self.Statut.REFUSE,
        ]:
            if self.processed_at is None:
                self.processed_at = timezone.now()

        else:
            self.processed_at = None

        super().save(
            *args,
            **kwargs,
        )

    def __str__(self):
        return (
            f"{self.get_type_demande_display()} "
            f"- {self.salarie} "
            f"- {self.get_statut_display()}"
        )
