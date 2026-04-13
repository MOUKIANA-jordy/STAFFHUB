from django.contrib import admin
from .models import Salarie


@admin.register(Salarie)
class SalarieAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "prenom",
        "nom",
        "matricule",
        "email_personnel_affichage",
        "email_pro_affichage",
        "poste",
        "etablissement",
        "contrat_affichage",
        "role_affichage",
        "date_debut_contrat",
        "date_fin_contrat",
    )

    list_filter = (
        "type_contrat",
        "role",
        "etablissement",
    )

    search_fields = (
        "prenom",
        "nom",
        "matricule",
        "user__email",
        "email_personnel",
        "poste",
    )

    ordering = ("nom", "prenom")

    # ----------- AFFICHAGES -----------

    def role_affichage(self, obj):
        return obj.get_role_display()
    role_affichage.short_description = "Rôle"

    def contrat_affichage(self, obj):
        return obj.get_type_contrat_display()
    contrat_affichage.short_description = "Type de contrat"

    def email_pro_affichage(self, obj):
        return obj.user.email if obj.user else "-"
    email_pro_affichage.short_description = "Email pro"

    def email_personnel_affichage(self, obj):
        return obj.email_personnel
    email_personnel_affichage.short_description = "Email perso"
