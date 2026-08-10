from django.contrib import admin

from .models import Planning


@admin.register(Planning)
class PlanningAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "salarie",
        "date",
        "type_affichage",
        "heure_debut",
        "heure_fin",
        "commentaire_court",
    )

    list_filter = (
        "type_journee",
        "date",
        "created_at",
    )

    search_fields = (
        "salarie__prenom",
        "salarie__nom",
        "salarie__matricule",
        "commentaire",
    )

    ordering = (
        "-date",
    )

    list_select_related = (
        "salarie",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    @admin.display(
        description="Type de journée",
        ordering="type_journee",
    )
    def type_affichage(self, obj):
        return obj.get_type_journee_display()

    @admin.display(
        description="Commentaire",
    )
    def commentaire_court(self, obj):
        if not obj.commentaire:
            return "-"

        if len(obj.commentaire) <= 50:
            return obj.commentaire

        return f"{obj.commentaire[:50]}..."
