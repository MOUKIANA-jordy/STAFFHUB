from django.contrib import admin

from .models import (
    Adresse,
    Dossier,
    EtatCivil,
    Famille,
    Iban,
)


@admin.register(Dossier)
class DossierAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "salarie",
        "commune",
        "pays",
        "created_at",
        "updated_at",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "salarie__adresse__commune",
    ]

    list_filter = [
        "created_at",
        "updated_at",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]

    def commune(self, obj):
        adresse = getattr(obj.salarie, "adresse", None)

        if adresse:
            return adresse.commune

        return "-"

    commune.short_description = "Commune"

    def pays(self, obj):
        adresse = getattr(obj.salarie, "adresse", None)

        if adresse:
            return adresse.pays

        return "-"

    pays.short_description = "Pays"


@admin.register(Adresse)
class AdresseAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "salarie",
        "commune",
        "code_postal",
        "pays",
        "updated_at",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "commune",
        "code_postal",
    ]

    list_filter = [
        "pays",
        "commune",
    ]


@admin.register(EtatCivil)
class EtatCivilAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "salarie",
        "prenom",
        "nom_naissance",
        "sexe",
        "date_naissance",
        "nationalite",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "nom_naissance",
        "prenom",
        "numero_secu",
    ]

    list_filter = [
        "sexe",
        "nationalite",
    ]


@admin.register(Famille)
class FamilleAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "salarie",
        "prenom",
        "nom",
        "lien",
        "contact_urgence",
        "telephone",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "nom",
        "prenom",
        "telephone",
    ]

    list_filter = [
        "lien",
        "contact_urgence",
    ]


@admin.register(Iban)
class IbanAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "salarie",
        "titulaire",
        "nom_banque",
        "iban_masque",
        "updated_at",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "titulaire",
        "nom_banque",
        "iban",
    ]

    def iban_masque(self, obj):
        if not obj.iban:
            return "-"

        iban = obj.iban.replace(" ", "")

        if len(iban) <= 8:
            return "********"

        return f"{iban[:4]} **** **** {iban[-4:]}"

    iban_masque.short_description = "IBAN"
