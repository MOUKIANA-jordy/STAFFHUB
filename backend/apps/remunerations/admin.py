from django.contrib import admin

from .models import Remuneration


@admin.register(Remuneration)
class RemunerationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "salarie",
        "taux_horaire",
        "salaire_mensuel_brut",
        "majoration_heures_sup",
        "actif",
        "date_debut",
        "date_fin",
    )

    list_filter = (
        "actif",
        "date_debut",
    )

    search_fields = (
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
    )

    ordering = (
        "-date_debut",
    )
