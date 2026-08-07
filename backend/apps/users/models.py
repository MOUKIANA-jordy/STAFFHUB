from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth import get_user_model

import uuid


User = get_user_model()


def generate_matricule():
    return f"EMP-{uuid.uuid4().hex[:6].upper()}"


class Salarie(models.Model):
    class TypeContrat(models.TextChoices):
        CDI = "CDI", "CDI"
        CDD = "CDD", "CDD"
        VACATAIRE = "VACATAIRE", "Vacataire"
        STAGIAIRE = "STAGIAIRE", "Stagiaire"
        ALTERNANT = "ALTERNANT", "Alternant"

    class Role(models.TextChoices):
        SALARIE = "SALARIE", "Salarié"
        RH = "RH", "Ressources humaines"
        ADMIN = "ADMIN", "Administrateur"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="salarie",
        null=True,
        blank=True,
    )

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)

    matricule = models.CharField(
        max_length=50,
        unique=True,
        default=generate_matricule,
        db_index=True,
    )

    email_personnel = models.EmailField()
    telephone = models.CharField(
        max_length=20,
        blank=True,
        default="",
    )

    date_naissance = models.DateField(
        null=True,
        blank=True,
    )

    type_contrat = models.CharField(
        max_length=30,
        choices=TypeContrat.choices,
        default=TypeContrat.CDI,
        db_index=True,
    )

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.SALARIE,
        db_index=True,
    )

    date_debut_contrat = models.DateField()

    date_fin_contrat = models.DateField(
        null=True,
        blank=True,
    )

    poste = models.CharField(max_length=100)
    etablissement = models.CharField(max_length=150)

    must_change_password = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nom", "prenom"]
        indexes = [
            models.Index(fields=["role", "etablissement"]),
            models.Index(fields=["type_contrat", "etablissement"]),
        ]

    def clean(self):
        errors = {}

        if (
            self.date_fin_contrat
            and self.date_debut_contrat
            and self.date_fin_contrat < self.date_debut_contrat
        ):
            errors["date_fin_contrat"] = (
                "La date de fin du contrat ne peut pas être "
                "antérieure à la date de début."
            )

        if (
            self.type_contrat == self.TypeContrat.CDI
            and self.date_fin_contrat
        ):
            errors["date_fin_contrat"] = (
                "Un contrat CDI ne doit normalement pas avoir "
                "de date de fin."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"
