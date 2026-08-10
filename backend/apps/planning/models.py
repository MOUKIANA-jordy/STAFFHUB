from django.core.exceptions import ValidationError
from django.db import models

from apps.users.models import Salarie


class Planning(models.Model):
    class TypeJournee(models.TextChoices):
        BUREAU = "BUREAU", "Bureau"
        TELETRAVAIL = "TELETRAVAIL", "Télétravail"
        CONGE = "CONGE", "Congé"
        ABSENCE = "ABSENCE", "Absence"
        VACATION = "VACATION", "Vacation"
        FORMATION = "FORMATION", "Formation"

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="plannings",
    )

    date = models.DateField(
        db_index=True,
    )

    heure_debut = models.TimeField(
        blank=True,
        null=True,
    )

    heure_fin = models.TimeField(
        blank=True,
        null=True,
    )

    type_journee = models.CharField(
        max_length=20,
        choices=TypeJournee.choices,
        default=TypeJournee.BUREAU,
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
        constraints = [
            models.UniqueConstraint(
                fields=["salarie", "date"],
                name="unique_planning_salarie_date",
            )
        ]

        ordering = [
            "-date",
        ]

        indexes = [
            models.Index(
                fields=["salarie", "date"],
            ),
            models.Index(
                fields=["type_journee", "date"],
            ),
        ]

    def clean(self):
        errors = {}

        types_sans_horaires = [
            self.TypeJournee.CONGE,
            self.TypeJournee.ABSENCE,
        ]

        if self.type_journee in types_sans_horaires:
            if self.heure_debut or self.heure_fin:
                errors["heure_debut"] = (
                    "Les congés et absences ne doivent pas "
                    "contenir d’horaires."
                )

        else:
            if self.heure_debut and not self.heure_fin:
                errors["heure_fin"] = (
                    "L’heure de fin est obligatoire."
                )

            if self.heure_fin and not self.heure_debut:
                errors["heure_debut"] = (
                    "L’heure de début est obligatoire."
                )

            if (
                self.heure_debut
                and self.heure_fin
                and self.heure_fin <= self.heure_debut
            ):
                errors["heure_fin"] = (
                    "L’heure de fin doit être postérieure "
                    "à l’heure de début."
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"{self.salarie} - "
            f"{self.date} "
            f"({self.get_type_journee_display()})"
        )
