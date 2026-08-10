from django.contrib import admin

from .models import Pointage


@admin.register(Pointage)
class PointageAdmin(
    admin.ModelAdmin
):
    list_display = (
        "id",
        "salarie",
        "date",
        "heure_arrivee",
        "heure_depart",
        "heures_travaillees",
        "heures_sup",
        "mois_paie",
    )

    list_filter = (
        "date",
        "mois_paie",
        "salarie__type_contrat",
    )

    search_fields = (
        "salarie__prenom",
        "salarie__nom",
        "salarie__matricule",
        "commentaire",
    )

    ordering = (
        "-date",
        "-heure_arrivee",
    )

    readonly_fields = (
        "heures_travaillees",
        "heures_sup",
        "mois_paie",
        "created_at",
        "updated_at",
    )

    list_select_related = (
        "salarie",
    )
