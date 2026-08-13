from decimal import Decimal

from django.db.models import Q

from .models import TauxCotisation


# ============================================================
# OUTILS
# ============================================================

def decimal_value(value):
    if value is None:
        return Decimal("0.00")

    return Decimal(
        str(value)
    )


def arrondir(value):
    return decimal_value(
        value
    ).quantize(
        Decimal("0.01")
    )


# ============================================================
# BASES DE COTISATION
# ============================================================

def calculer_base_cotisation(
    brut,
    type_base,
    plafond_ss=None,
    coefficient_brut_abattu=Decimal("0.9825"),
):
    """
    Détermine la base utilisée pour une cotisation.

    BRUT :
        utilise directement le salaire brut.

    PLAFOND :
        utilise le brut dans la limite du plafond
        fourni à la fonction.

    BRUT_ABATTU :
        utilise une base réduite.

    Pour notre jeu de test StaffHub,
    le coefficient 0.9825 reproduit la base
    CSG/CRDS observée sur le bulletin de référence.

    Ce coefficient reste paramétrable.
    """

    brut = arrondir(
        brut
    )

    # ========================================================
    # BRUT
    # ========================================================

    if (
        type_base
        == TauxCotisation.TypeBase.BRUT
    ):
        return brut

    # ========================================================
    # BASE PLAFONNÉE
    # ========================================================

    if (
        type_base
        == TauxCotisation.TypeBase.PLAFOND
    ):
        if plafond_ss is None:
            # Tant qu'aucun plafond n'est fourni,
            # on utilise le brut.
            return brut

        plafond_ss = decimal_value(
            plafond_ss
        )

        return arrondir(
            min(
                brut,
                plafond_ss,
            )
        )

    # ========================================================
    # BRUT ABATTU
    # ========================================================

    if (
        type_base
        == TauxCotisation.TypeBase.BRUT_ABATTU
    ):
        coefficient = decimal_value(
            coefficient_brut_abattu
        )

        base = (
            brut
            * coefficient
        )

        return arrondir(
            base
        )

    return brut


# ============================================================
# MOTEUR DE COTISATIONS
# ============================================================

def calculer_cotisations(
    brut,
    date_reference,
    plafond_ss=None,
    coefficient_brut_abattu=Decimal("0.9825"),
):
    """
    Calcule les cotisations actives applicables
    à la date donnée.

    Retour :
    {
        "brut": ...,
        "lignes": [...],
        "total_salarial": ...,
        "total_employeur": ...,
        "cout_employeur": ...
    }
    """

    brut = arrondir(
        brut
    )

    # ========================================================
    # TAUX APPLICABLES À LA DATE
    # ========================================================

    taux_queryset = (
        TauxCotisation.objects
        .filter(
            actif=True,
            date_debut__lte=date_reference,
        )
        .filter(
            Q(date_fin__isnull=True)
            | Q(
                date_fin__gte=date_reference
            )
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

    # ========================================================
    # CALCUL DE CHAQUE COTISATION
    # ========================================================

    for taux in taux_queryset:
        base = calculer_base_cotisation(
            brut=brut,
            type_base=taux.type_base,
            plafond_ss=plafond_ss,
            coefficient_brut_abattu=(
                coefficient_brut_abattu
            ),
        )

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
            "id":
                taux.id,

            "code":
                taux.code,

            "libelle":
                taux.libelle,

            "type_cotisation":
                taux.type_cotisation,

            "type_base":
                taux.type_base,

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

    # ========================================================
    # TOTAUX
    # ========================================================

    total_salarial = arrondir(
        total_salarial
    )

    total_employeur = arrondir(
        total_employeur
    )

    cout_employeur = arrondir(
        brut
        + total_employeur
    )

    net_apres_cotisations = arrondir(
        brut
        - total_salarial
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

        "net_apres_cotisations":
            net_apres_cotisations,

        "cout_employeur":
            cout_employeur,
    }
