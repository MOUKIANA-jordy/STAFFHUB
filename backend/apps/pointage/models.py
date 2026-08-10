from calendar import monthrange
from datetime import datetime, timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models

from apps.users.models import Salarie


class Pointage(models.Model):
    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="pointages",
    )

    date = models.DateField(
        db_index=True,
    )

    heure_arrivee = models.TimeField()

    heure_depart = models.TimeField()

    heures_travaillees = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        editable=False,
    )

    heures_sup = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        editable=False,
    )

    mois_paie = models.DateField(
        blank=True,
        null=True,
        db_index=True,
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
        ordering = [
            "-date",
            "-heure_arrivee",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "salarie",
                    "date",
                    "heure_arrivee",
                ],
                name="unique_pointage_salarie_date_arrivee",
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "salarie",
                    "date",
                ],
            ),
            models.Index(
                fields=[
                    "salarie",
                    "mois_paie",
                ],
            ),
        ]

    def calculer_duree(self):
        debut = datetime.combine(
            self.date,
            self.heure_arrivee,
        )

        fin = datetime.combine(
            self.date,
            self.heure_depart,
        )

        # Travail de nuit :
        # exemple 22h00 -> 06h00
        if fin <= debut:
            fin += timedelta(days=1)

        duree = fin - debut

        heures = (
            Decimal(str(duree.total_seconds()))
            / Decimal("3600")
        )

        return heures.quantize(
            Decimal("0.01")
        )

    def calculer_mois_paie(self):
        if self.salarie.type_contrat == "CDI":
            annee = self.date.year
            mois = self.date.month
        else:
            if self.date.month == 12:
                annee = self.date.year + 1
                mois = 1
            else:
                annee = self.date.year
                mois = self.date.month + 1

        dernier_jour = monthrange(
            annee,
            mois,
        )[1]

        jour_paie = min(
            28,
            dernier_jour,
        )

        return self.date.replace(
            year=annee,
            month=mois,
            day=jour_paie,
        )

    def clean(self):
        errors = {}

        if not self.heure_arrivee:
            errors["heure_arrivee"] = (
                "L’heure d’arrivée est obligatoire."
            )

        if not self.heure_depart:
            errors["heure_depart"] = (
                "L’heure de départ est obligatoire."
            )

        if errors:
            raise ValidationError(errors)

        duree = self.calculer_duree()

        if duree > Decimal("24"):
            errors["heure_depart"] = (
                "La durée d’un pointage ne peut pas "
                "dépasser 24 heures."
            )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if self.heure_arrivee and self.heure_depart:
            self.heures_travaillees = (
                self.calculer_duree()
            )

            self.heures_sup = max(
                self.heures_travaillees
                - Decimal("8.00"),
                Decimal("0.00"),
            )

        if not self.mois_paie:
            self.mois_paie = (
                self.calculer_mois_paie()
            )

        super().save(
            *args,
            **kwargs,
        )

    def __str__(self):
        return (
            f"{self.salarie} - "
            f"{self.date} : "
            f"{self.heures_travaillees}h"
        )
