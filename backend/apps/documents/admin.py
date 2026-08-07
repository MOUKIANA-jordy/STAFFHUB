from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "salarie",
        "type_affichage",
        "titre",
        "statut_document",
        "date_expiration",
        "archive",
        "uploaded_at",
    ]

    list_filter = [
        "type_document",
        "archive",
        "date_expiration",
        "uploaded_at",
    ]

    search_fields = [
        "salarie__prenom",
        "salarie__nom",
        "salarie__matricule",
        "titre",
        "numero",
    ]

    readonly_fields = [
        "uploaded_at",
        "updated_at",
        "nom_fichier_admin",
        "taille_admin",
    ]

    ordering = [
        "-uploaded_at",
    ]

    list_select_related = [
        "salarie",
        "uploaded_by",
    ]

    @admin.display(
        description="Type",
        ordering="type_document",
    )
    def type_affichage(self, obj):
        return obj.get_type_document_display()

    @admin.display(
        description="Statut",
        ordering="date_expiration",
    )
    def statut_document(self, obj):
        if not obj.date_expiration:
            return format_html(
                '<span style="color:#666;">Sans expiration</span>'
            )

        if obj.date_expiration < timezone.localdate():
            return format_html(
                '<strong style="color:red;">Expiré</strong>'
            )

        return format_html(
            '<strong style="color:green;">Valide</strong>'
        )

    @admin.display(description="Nom du fichier")
    def nom_fichier_admin(self, obj):
        return obj.nom_fichier or "-"

    @admin.display(description="Taille")
    def taille_admin(self, obj):
        if not obj.taille:
            return "-"

        return f"{obj.taille / 1024:.1f} Ko"
