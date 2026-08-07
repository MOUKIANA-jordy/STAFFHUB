from django.db import models

from apps.users.models import Salarie


class Notification(models.Model):
    class TypeNotification(models.TextChoices):
        INFO = "INFO", "Information"
        ALERTE = "ALERTE", "Alerte"
        VALIDATION = "VALIDATION", "Validation"
        REFUS = "REFUS", "Refus"
        PAIE = "PAIE", "Paie"
        DOCUMENT = "DOCUMENT", "Document"
        DEMANDE = "DEMANDE", "Demande"
        PLANNING = "PLANNING", "Planning"
        POINTAGE = "POINTAGE", "Pointage"

    class Priorite(models.TextChoices):
        BASSE = "BASSE", "Basse"
        NORMALE = "NORMALE", "Normale"
        HAUTE = "HAUTE", "Haute"
        URGENTE = "URGENTE", "Urgente"

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    titre = models.CharField(
        max_length=255,
    )

    message = models.TextField()

    type_notification = models.CharField(
        max_length=20,
        choices=TypeNotification.choices,
        default=TypeNotification.INFO,
        db_index=True,
    )

    priorite = models.CharField(
        max_length=10,
        choices=Priorite.choices,
        default=Priorite.NORMALE,
        db_index=True,
    )

    lien = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    is_read = models.BooleanField(
        default=False,
        db_index=True,
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications_creees",
    )

    date_envoi = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-date_envoi"]
        indexes = [
            models.Index(
                fields=["salarie", "is_read"],
            ),
            models.Index(
                fields=["salarie", "type_notification"],
            ),
        ]

    def __str__(self):
        return f"{self.salarie} - {self.titre}"
