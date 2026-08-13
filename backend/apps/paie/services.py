from decimal import Decimal

from django.db.models import Q

from .models import TauxCotisation


def decimal_value(value):
    if value is None:
        return Decimal("0.00")

    return Decimal(
        str(value)
    )


def calculer_cotisations(
    brut,
    date_reference,
):
    """
    Calcule les cotisations applicables
    à une période donnée.

    V1 StaffHub :
    seules les cotisations basées directement
    sur le BRUT sont calculées.

    Les bases plafonnées ou abattues seront
    ajoutées dans une future version.
    """

    brut = decimal_value(
        brut
    ).quantize(
        Decimal("0.01")
    )

    taux_queryset = (
        TauxCotisation.objects
        .filter(
            actif=True,
            date_debut__lte=date_reference,
        )
        .filter(
            Q(date_fin__isnull=True)
            | Q(date_fin__gte=date_reference)
        )
        .order_by(
            "ordre",
            "libelle",
        )
    )

    lignes = []

    total_salarial = Decimal(
        "0.00"
    )

    total_employeur = Decimal(
        "0.00"
    )

    for taux in taux_queryset:
        # Pour cette première version,
        # on ne calcule réellement que
        # les cotisations basées sur le brut.
        if (
            taux.type_base
            != TauxCotisation.TypeBase.BRUT
        ):
            continue

        base = brut

        part_salariale = (
            taux.calculer_part_salariale(
                base
            )
        )

        part_employeur = (
            taux.calculer_part_employeur(
                base
            )
        )

        total_salarial += (
            part_salariale
        )

        total_employeur += (
            part_employeur
        )

        lignes.append({
            "code":
                taux.code,

            "libelle":
                taux.libelle,

            "type_cotisation":
                taux.type_cotisation,

            "base":
                base,

            "taux_salarial":
                taux.taux_salarial,

            "taux_employeur":
                taux.taux_employeur,

            "part_salariale":
                part_salariale,

            "part_employeur":
                part_employeur,
        })

    total_salarial = (
        total_salarial.quantize(
            Decimal("0.01")
        )
    )

    total_employeur = (
        total_employeur.quantize(
            Decimal("0.01")
        )
    )

    return {
        "brut":
            brut,

        "lignes":
            lignes,

        "total_salarial":
            total_salarial,

        "total_employeur":
            total_employeur,
    }
