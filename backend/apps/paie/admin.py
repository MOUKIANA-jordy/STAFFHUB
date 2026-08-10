from django.contrib import admin

from .models import Paie


@admin.register(Paie)
class PaieAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "salarie",
        "type_affichage",
        "montant",
        "date_paiement",
        "demande",
        "created_at",
    )

    list_filter = (
        "type_paiement",
        "date_paiement",
        "created_at",
    )

    search_fields = (
        "salarie__prenom",
        "salarie__nom",
        "salarie__matricule",
        "salarie__email_personnel",
    )

    ordering = (
        "-date_paiement",
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_select_related = (
        "salarie",
        "demande",
    )

    @admin.display(
        description="Type de paiement",
        ordering="type_paiement",
    )
    def type_affichage(self, obj):
        return obj.get_type_paiement_display()
