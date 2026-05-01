from django.db import models
from apps.users.models import Salarie
from django.core.exceptions import ValidationError
from django.utils import timezone


class Demande(models.Model):

    TYPE_CHOICES = [
        ("ACOMPTE", "Acompte"),
        ("AVANCE", "Avance"),
        ("CET", "Paiement CET"),
        ("HEURES_SUP", "Paiement heures sup"),
        ("ABSENCE", "Absence"),
    ]

    STATUT_CHOICES = [
        ("EN_ATTENTE", "En attente"),
        ("APPROUVE", "Approuvé"),
        ("REFUSE", "Refusé"),
    ]

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="demandes"
    )

    type_demande = models.CharField(max_length=50, choices=TYPE_CHOICES)

    montant_souhaite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default="EN_ATTENTE"
    )

    date_demande = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    # AUTO DATE TRAITEMENT
    def save(self, *args, **kwargs):
        if self.statut in ["APPROUVE", "REFUSE"] and not self.processed_at:
            self.processed_at = timezone.now()

        super().save(*args, **kwargs)

    # VALIDATION MÉTIER
    def clean(self):

        # Avance uniquement CDI
        if self.type_demande == "AVANCE" and self.salarie.type_contrat != "CDI":
            raise ValidationError("Les avances sont réservées aux salariés CDI.")

        # montant obligatoire
        if self.type_demande in ["ACOMPTE", "AVANCE"] and not self.montant_souhaite:
            raise ValidationError("Le montant est obligatoire pour ce type de demande.")

        # absence ne doit pas avoir montant
        if self.type_demande == "ABSENCE" and self.montant_souhaite:
            raise ValidationError("Une absence ne doit pas avoir de montant.")

    def __str__(self):
        return f"{self.get_type_demande_display()} - {self.salarie}"
