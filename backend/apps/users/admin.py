from django.contrib import admin

from .models import Salarie, CompteCET


@admin.register(Salarie)
class SalarieAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "matricule",
        "prenom",
        "nom",
        "email_personnel",
        "email_pro",
        "poste",
        "etablissement",
        "type_contrat",
        "role",
        "date_debut_contrat",
        "date_fin_contrat",
    )

    list_filter = (
        "role",
        "type_contrat",
        "etablissement",
    )

    search_fields = (
        "matricule",
        "prenom",
        "nom",
        "email_personnel",
        "user__email",
        "user__username",
        "poste",
        "etablissement",
    )

    ordering = (
        "nom",
        "prenom",
    )

    list_select_related = (
        "user",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    @admin.display(
        description="Email professionnel",
        ordering="user__email",
    )
    def email_pro(self, obj):
        if not obj.user:
            return "-"

        return obj.user.email or "-"


@admin.register(CompteCET)
class CompteCETAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "salarie",
        "solde_heures",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
    )

    ordering = (
        "salarie__nom",
        "salarie__prenom",
    )

    list_select_related = (
        "salarie",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )
