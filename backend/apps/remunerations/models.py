from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

from apps.users.models import Salarie


class Remuneration(models.Model):
    salarie = models.OneToOneField(
        Salarie,
        on_delete=models.CASCADE,
        related_name="remuneration",
    )

    salaire_mensuel_brut = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    taux_horaire = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    # Pourcentages de majoration
    majoration_heures_sup = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("25.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    majoration_nuit = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    majoration_dimanche = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    majoration_ferie = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    actif = models.BooleanField(default=True)

    date_debut = models.DateField()

    date_fin = models.DateField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-date_debut"]

    def calculer_heures_sup(self, nombre_heures):
        """
        Calcule le montant des heures supplémentaires.

        Exemple :
        4 heures × 15 € × 1,25 = 75 €
        """

        heures = Decimal(str(nombre_heures))

        coefficient = (
            Decimal("1.00")
            + (self.majoration_heures_sup / Decimal("100"))
        )

        montant = (
            heures
            * self.taux_horaire
            * coefficient
        )

        return montant.quantize(Decimal("0.01"))

    def __str__(self):
        return (
            f"{self.salarie} - "
            f"{self.taux_horaire} €/h"
        )
