from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models

from apps.users.models import Salarie
from apps.demandes.models import Demande


class Paie(models.Model):
    class TypePaiement(models.TextChoices):
        SALAIRE = "SALAIRE", "Salaire"
        ACOMPTE = "ACOMPTE", "Acompte"
        AVANCE = "AVANCE", "Avance"
        CET = "CET", "Paiement CET"
        HEURES_SUP = "HEURES_SUP", "Heures supplémentaires"
        FICHE_PAIE = "FICHE_PAIE", "Fiche de paie"
        CALENDRIER_PAIE = "CALENDRIER_PAIE", "Calendrier de paie"

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="paiements",
    )

    demande = models.OneToOneField(
        Demande,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="paiement",
    )

    type_paiement = models.CharField(
        max_length=50,
        choices=TypePaiement.choices,
        db_index=True,
    )

    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    date_paiement = models.DateField(
        db_index=True,
    )

    preuve_pdf = models.FileField(
        upload_to="paiements/%Y/%m/",
        null=True,
        blank=True,
    )

    commentaire = models.TextField(
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-date_paiement", "-created_at"]
        indexes = [
            models.Index(
                fields=["salarie", "date_paiement"],
            ),
            models.Index(
                fields=["type_paiement", "date_paiement"],
            ),
        ]

    def clean(self):
        errors = {}

        if self.montant is not None and self.montant < Decimal("0"):
            errors["montant"] = (
                "Le montant ne peut pas être négatif."
            )

        if self.demande:
            if self.demande.salarie_id != self.salarie_id:
                errors["demande"] = (
                    "La demande doit appartenir au même salarié."
                )

            mapping = {
                "ACOMPTE": self.TypePaiement.ACOMPTE,
                "AVANCE": self.TypePaiement.AVANCE,
                "CET": self.TypePaiement.CET,
                "HEURES_SUP": self.TypePaiement.HEURES_SUP,
            }

            expected_type = mapping.get(
                self.demande.type_demande
            )

            if (
                expected_type
                and self.type_paiement != expected_type
            ):
                errors["type_paiement"] = (
                    "Le type de paiement ne correspond pas "
                    "au type de la demande."
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"{self.get_type_paiement_display()} "
            f"- {self.salarie}"
        )
