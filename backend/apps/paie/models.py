from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from apps.users.models import Salarie
from apps.demandes.models import Demande


# ============================================================
# PAIE
# ============================================================

class Paie(models.Model):

    class TypePaiement(models.TextChoices):
        SALAIRE = "SALAIRE", "Salaire"
        ACOMPTE = "ACOMPTE", "Acompte"
        AVANCE = "AVANCE", "Avance"
        CET = "CET", "Paiement CET"
        HEURES_SUP = (
            "HEURES_SUP",
            "Heures supplémentaires",
        )
        FICHE_PAIE = (
            "FICHE_PAIE",
            "Fiche de paie",
        )
        CALENDRIER_PAIE = (
            "CALENDRIER_PAIE",
            "Calendrier de paie",
        )

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
        ordering = [
            "-date_paiement",
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "salarie",
                    "date_paiement",
                ],
            ),
            models.Index(
                fields=[
                    "type_paiement",
                    "date_paiement",
                ],
            ),
        ]

    def clean(self):
        errors = {}

        if (
            self.montant is not None
            and self.montant < Decimal("0.00")
        ):
            errors["montant"] = (
                "Le montant ne peut pas être négatif."
            )

        if self.demande:
            if (
                self.demande.salarie_id
                != self.salarie_id
            ):
                errors["demande"] = (
                    "La demande doit appartenir "
                    "au même salarié."
                )

            mapping = {
                "ACOMPTE":
                    self.TypePaiement.ACOMPTE,

                "AVANCE":
                    self.TypePaiement.AVANCE,

                "CET":
                    self.TypePaiement.CET,

                "HEURES_SUP":
                    self.TypePaiement.HEURES_SUP,
            }

            expected_type = mapping.get(
                self.demande.type_demande
            )

            if (
                expected_type
                and self.type_paiement
                != expected_type
            ):
                errors["type_paiement"] = (
                    "Le type de paiement "
                    "ne correspond pas au type "
                    "de la demande."
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"{self.get_type_paiement_display()} "
            f"- {self.salarie}"
        )


# ============================================================
# TAUX DE COTISATION
# ============================================================

class TauxCotisation(models.Model):

    class TypeCotisation(models.TextChoices):
        SANTE = (
            "SANTE",
            "Assurance santé",
        )

        ATMP = (
            "ATMP",
            "Accidents du travail",
        )

        RETRAITE = (
            "RETRAITE",
            "Assurance retraite",
        )

        RETRAITE_COMPLEMENTAIRE = (
            "RETRAITE_COMPLEMENTAIRE",
            "Retraite complémentaire",
        )

        CHOMAGE = (
            "CHOMAGE",
            "Assurance chômage",
        )

        CSG_CRDS = (
            "CSG_CRDS",
            "CSG / CRDS",
        )

        AUTRE = (
            "AUTRE",
            "Autre cotisation",
        )

    class TypeBase(models.TextChoices):
        BRUT = (
            "BRUT",
            "Salaire brut",
        )

        BRUT_ABATTU = (
            "BRUT_ABATTU",
            "Salaire brut abattu",
        )

        PLAFOND = (
            "PLAFOND",
            "Base plafonnée",
        )

    code = models.CharField(
        max_length=50,
        db_index=True,
    )

    libelle = models.CharField(
        max_length=150,
    )

    type_cotisation = models.CharField(
        max_length=40,
        choices=TypeCotisation.choices,
        default=TypeCotisation.AUTRE,
        db_index=True,
    )

    type_base = models.CharField(
        max_length=30,
        choices=TypeBase.choices,
        default=TypeBase.BRUT,
    )

    taux_salarial = models.DecimalField(
        max_digits=7,
        decimal_places=4,
        default=Decimal("0.0000"),
        validators=[
            MinValueValidator(
                Decimal("0.0000")
            )
        ],
    )

    taux_employeur = models.DecimalField(
        max_digits=7,
        decimal_places=4,
        default=Decimal("0.0000"),
        validators=[
            MinValueValidator(
                Decimal("0.0000")
            )
        ],
    )

    date_debut = models.DateField(
        db_index=True,
    )

    date_fin = models.DateField(
        null=True,
        blank=True,
        db_index=True,
    )

    actif = models.BooleanField(
        default=True,
        db_index=True,
    )

    ordre = models.PositiveIntegerField(
        default=0,
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
            "ordre",
            "libelle",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "code",
                    "date_debut",
                ],
                name=(
                    "unique_taux_cotisation_"
                    "code_date_debut"
                ),
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "code",
                    "actif",
                ],
            ),
            models.Index(
                fields=[
                    "type_cotisation",
                    "actif",
                ],
            ),
            models.Index(
                fields=[
                    "date_debut",
                    "date_fin",
                ],
            ),
        ]

    def clean(self):
        errors = {}

        if (
            self.date_fin
            and self.date_debut
            and self.date_fin < self.date_debut
        ):
            errors["date_fin"] = (
                "La date de fin ne peut pas être "
                "antérieure à la date de début."
            )

        if (
            self.taux_salarial
            > Decimal("100.0000")
        ):
            errors["taux_salarial"] = (
                "Le taux salarial ne peut pas "
                "dépasser 100 %."
            )

        if (
            self.taux_employeur
            > Decimal("100.0000")
        ):
            errors["taux_employeur"] = (
                "Le taux employeur ne peut pas "
                "dépasser 100 %."
            )

        if errors:
            raise ValidationError(errors)

    def calculer_part_salariale(
        self,
        base,
    ):
        base = Decimal(
            str(base)
        )

        montant = (
            base
            * self.taux_salarial
            / Decimal("100")
        )

        return montant.quantize(
            Decimal("0.01")
        )

    def calculer_part_employeur(
        self,
        base,
    ):
        base = Decimal(
            str(base)
        )

        montant = (
            base
            * self.taux_employeur
            / Decimal("100")
        )

        return montant.quantize(
            Decimal("0.01")
        )

    def __str__(self):
        return (
            f"{self.libelle} "
            f"- salarié {self.taux_salarial}% "
            f"- employeur {self.taux_employeur}%"
        )
