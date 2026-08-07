from rest_framework import serializers

from .models import (
    Adresse,
    Dossier,
    EtatCivil,
    Famille,
    Iban,
)


def mask_social_security_number(value):
    if not value:
        return None

    cleaned = value.replace(" ", "")

    if len(cleaned) <= 4:
        return "****"

    return f"{cleaned[:3]}********{cleaned[-2:]}"


def mask_iban(value):
    if not value:
        return None

    cleaned = value.replace(" ", "")

    if len(cleaned) <= 8:
        return "********"

    return f"{cleaned[:4]} **** **** **** {cleaned[-4:]}"


class AdresseSerializer(serializers.ModelSerializer):
    salarie_nom = serializers.CharField(
        source="salarie.__str__",
        read_only=True,
    )

    class Meta:
        model = Adresse

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "numero",
            "voie",
            "complement",
            "code_postal",
            "commune",
            "pays",
            "telephone",
            "email",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie",
            "salarie_nom",
            "created_at",
            "updated_at",
        ]


class EtatCivilSerializer(serializers.ModelSerializer):
    numero_secu_masque = serializers.SerializerMethodField()

    class Meta:
        model = EtatCivil

        fields = [
            "id",
            "salarie",
            "numero_secu",
            "numero_secu_masque",
            "nom_naissance",
            "nom_usage",
            "prenom",
            "sexe",
            "date_naissance",
            "lieu_naissance",
            "pays_naissance",
            "nationalite",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie",
            "numero_secu_masque",
            "created_at",
            "updated_at",
        ]

        extra_kwargs = {
            "numero_secu": {
                "write_only": True,
                "required": False,
                "allow_null": True,
            }
        }

    def get_numero_secu_masque(self, obj):
        return mask_social_security_number(obj.numero_secu)

    def validate_numero_secu(self, value):
        if not value:
            return value

        normalized = value.replace(" ", "")

        if not normalized.isdigit():
            raise serializers.ValidationError(
                "Le numéro de sécurité sociale doit contenir "
                "uniquement des chiffres."
            )

        return normalized


class FamilleSerializer(serializers.ModelSerializer):
    lien_display = serializers.CharField(
        source="get_lien_display",
        read_only=True,
    )

    class Meta:
        model = Famille

        fields = [
            "id",
            "salarie",
            "nom",
            "prenom",
            "lien",
            "lien_display",
            "telephone",
            "email",
            "contact_urgence",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie",
            "lien_display",
            "created_at",
            "updated_at",
        ]


class IbanSerializer(serializers.ModelSerializer):
    iban_masque = serializers.SerializerMethodField()

    class Meta:
        model = Iban

        fields = [
            "id",
            "salarie",
            "iban",
            "iban_masque",
            "bic",
            "titulaire",
            "nom_banque",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie",
            "iban_masque",
            "created_at",
            "updated_at",
        ]

        extra_kwargs = {
            "iban": {
                "write_only": True,
            }
        }

    def get_iban_masque(self, obj):
        return mask_iban(obj.iban)

    def validate_iban(self, value):
        normalized = (
            value
            .replace(" ", "")
            .replace("-", "")
            .upper()
        )

        if len(normalized) < 15 or len(normalized) > 34:
            raise serializers.ValidationError(
                "La longueur de l’IBAN est invalide."
            )

        if not normalized.isalnum():
            raise serializers.ValidationError(
                "L’IBAN contient des caractères invalides."
            )

        return normalized

    def validate_bic(self, value):
        if not value:
            return value

        normalized = value.replace(" ", "").upper()

        if len(normalized) not in [8, 11]:
            raise serializers.ValidationError(
                "Le BIC doit contenir 8 ou 11 caractères."
            )

        return normalized


class DossierSerializer(serializers.ModelSerializer):
    salarie_nom = serializers.SerializerMethodField()

    adresse = AdresseSerializer(
        source="salarie.adresse",
        read_only=True,
    )

    etat_civil = EtatCivilSerializer(
        source="salarie.etat_civil",
        read_only=True,
    )

    coordonnees_bancaires = IbanSerializer(
        source="salarie.coordonnees_bancaires",
        read_only=True,
    )

    famille = FamilleSerializer(
        source="salarie.membres_famille",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Dossier

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "infos_complementaires",
            "adresse",
            "etat_civil",
            "coordonnees_bancaires",
            "famille",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie",
            "salarie_nom",
            "created_at",
            "updated_at",
        ]

    def get_salarie_nom(self, obj):
        return str(obj.salarie)
