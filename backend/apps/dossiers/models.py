from django.core.exceptions import ValidationError
from django.db import models

from apps.users.models import Salarie


class Dossier(models.Model):
    salarie = models.OneToOneField(
        Salarie,
        on_delete=models.CASCADE,
        related_name="dossier",
    )

    infos_complementaires = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Dossier RH - {self.salarie}"


class Adresse(models.Model):
    salarie = models.OneToOneField(
        Salarie,
        on_delete=models.CASCADE,
        related_name="adresse",
    )

    numero = models.CharField(
        max_length=10,
        blank=True,
        default="",
    )

    voie = models.CharField(
        max_length=255,
    )

    complement = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    code_postal = models.CharField(
        max_length=10,
    )

    commune = models.CharField(
        max_length=100,
    )

    pays = models.CharField(
        max_length=100,
        default="France",
    )

    telephone = models.CharField(
        max_length=20,
        blank=True,
        default="",
    )

    email = models.EmailField(
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.salarie} - {self.commune}"


class EtatCivil(models.Model):
    class Sexe(models.TextChoices):
        FEMME = "F", "Femme"
        HOMME = "M", "Homme"
        AUTRE = "AUTRE", "Autre"
        NON_RENSEIGNE = "NR", "Non renseigné"

    salarie = models.OneToOneField(
        Salarie,
        on_delete=models.CASCADE,
        related_name="etat_civil",
    )

    numero_secu = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
    )

    nom_naissance = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    nom_usage = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    prenom = models.CharField(
        max_length=100,
    )

    sexe = models.CharField(
        max_length=10,
        choices=Sexe.choices,
        default=Sexe.NON_RENSEIGNE,
    )

    date_naissance = models.DateField(
        null=True,
        blank=True,
    )

    lieu_naissance = models.CharField(
        max_length=150,
        blank=True,
        default="",
    )

    pays_naissance = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    nationalite = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"État civil - {self.salarie}"


class Famille(models.Model):
    class TypeLien(models.TextChoices):
        CONJOINT = "CONJOINT", "Conjoint(e)"
        ENFANT = "ENFANT", "Enfant"
        PARENT = "PARENT", "Parent"
        FRERE_SOEUR = "FRERE_SOEUR", "Frère ou sœur"
        AUTRE = "AUTRE", "Autre"

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="membres_famille",
    )

    nom = models.CharField(
        max_length=100,
    )

    prenom = models.CharField(
        max_length=100,
    )

    lien = models.CharField(
        max_length=20,
        choices=TypeLien.choices,
    )

    telephone = models.CharField(
        max_length=20,
        blank=True,
        default="",
    )

    email = models.EmailField(
        blank=True,
        default="",
    )

    contact_urgence = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.prenom} {self.nom} - {self.get_lien_display()}"


class Iban(models.Model):
    salarie = models.OneToOneField(
        Salarie,
        on_delete=models.CASCADE,
        related_name="coordonnees_bancaires",
    )

    iban = models.CharField(
        max_length=34,
    )

    bic = models.CharField(
        max_length=11,
        blank=True,
        default="",
    )

    titulaire = models.CharField(
        max_length=150,
    )

    nom_banque = models.CharField(
        max_length=150,
        blank=True,
        default="",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def clean(self):
        if self.iban:
            normalized_iban = (
                self.iban
                .replace(" ", "")
                .replace("-", "")
                .upper()
            )

            if len(normalized_iban) < 15 or len(normalized_iban) > 34:
                raise ValidationError({
                    "iban": "La longueur de l’IBAN est invalide."
                })

            self.iban = normalized_iban

        if self.bic:
            self.bic = self.bic.replace(" ", "").upper()

    def __str__(self):
        return f"Coordonnées bancaires - {self.salarie}"
