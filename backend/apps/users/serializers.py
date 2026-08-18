from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils.crypto import get_random_string
from django.utils.text import slugify

from rest_framework import serializers

from .models import Salarie


User = get_user_model()


def generate_password():
    return get_random_string(
        length=12,
        allowed_chars=(
            "abcdefghjkmnpqrstuvwxyz"
            "ABCDEFGHJKLMNPQRSTUVWXYZ"
            "23456789"
            "!@$%"
        ),
    )


def generate_professional_email(prenom, nom):
    prenom_slug = slugify(prenom)
    nom_slug = slugify(nom)

    base_email = f"{prenom_slug}.{nom_slug}"
    email = f"{base_email}@staffhub.com"

    counter = 2

    while User.objects.filter(email__iexact=email).exists():
        email = f"{base_email}{counter}@staffhub.com"
        counter += 1

    return email


class SalarieSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
    )

    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
        min_length=8,
        style={"input_type": "password"},
    )

    email_pro = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    username_compte = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    nom_complet = serializers.SerializerMethodField()

    class Meta:
        model = Salarie

        fields = [
            "id",
            "user",
            "username",
            "username_compte",
            "password",
            "nom",
            "prenom",
            "nom_complet",
            "matricule",
            "email_pro",
            "email_personnel",
            "telephone",
            "date_naissance",
            "type_contrat",
            "nationalite",
            "adresse",
            "code_postal",
            "ville",
            "contact_urgence_nom",
            "contact_urgence_lien",
            "contact_urgence_telephone",
            "photo",
            "role",
            "date_debut_contrat",
            "date_fin_contrat",
            "poste",
            "etablissement",
            "must_change_password",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "username_compte",
            "nom_complet",
            "matricule",
            "email_pro",
            "must_change_password",
            "created_at",
            "updated_at",
        ]

    def get_nom_complet(self, obj):
        return f"{obj.prenom} {obj.nom}".strip()

    def validate_email_personnel(self, value):
        queryset = Salarie.objects.filter(
            email_personnel__iexact=value,
        )

        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError(
                "Cette adresse e-mail personnelle est déjà utilisée."
            )

        return value.lower()

    def validate(self, attrs):
        date_debut = attrs.get(
            "date_debut_contrat",
            getattr(self.instance, "date_debut_contrat", None),
        )

        date_fin = attrs.get(
            "date_fin_contrat",
            getattr(self.instance, "date_fin_contrat", None),
        )

        type_contrat = attrs.get(
            "type_contrat",
            getattr(self.instance, "type_contrat", None),
        )

        if date_debut and date_fin and date_fin < date_debut:
            raise serializers.ValidationError({
                "date_fin_contrat": (
                    "La date de fin ne peut pas être antérieure "
                    "à la date de début."
                )
            })

        if type_contrat == Salarie.TypeContrat.CDI and date_fin:
            raise serializers.ValidationError({
                "date_fin_contrat": (
                    "Un contrat CDI ne doit pas avoir de date de fin."
                )
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        requested_username = validated_data.pop("username", None)
        requested_password = validated_data.pop("password", None)

        nom = validated_data["nom"].strip()
        prenom = validated_data["prenom"].strip()

        validated_data["nom"] = nom
        validated_data["prenom"] = prenom

        # On crée d’abord le salarié afin d’obtenir son matricule.
        salarie = Salarie.objects.create(**validated_data)

        username = requested_username or salarie.matricule

        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({
                "username": (
                    "Un compte possède déjà ce nom d’utilisateur."
                )
            })

        password = requested_password or generate_password()
        email_pro = generate_professional_email(prenom, nom)

        user = User(
            username=username,
            email=email_pro,
            first_name=prenom,
            last_name=nom,
        )

        user.set_password(password)

        # Le rôle applicatif reste stocké dans Salarie.
        # is_staff peut servir à certaines vues administratives.
        user.is_staff = salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]

        user.save()

        salarie.user = user
        salarie.save(update_fields=["user", "updated_at"])

        # Valeurs temporaires utilisées pour l’envoi de l’e-mail.
        salarie._temp_password = password
        salarie._email_pro = email_pro

        return salarie

    @transaction.atomic
    def update(self, instance, validated_data):
        validated_data.pop("username", None)
        validated_data.pop("password", None)

        instance = super().update(instance, validated_data)

        if instance.user:
            instance.user.first_name = instance.prenom
            instance.user.last_name = instance.nom
            instance.user.is_staff = instance.role in [
                Salarie.Role.RH,
                Salarie.Role.ADMIN,
            ]

            instance.user.save(
                update_fields=[
                    "first_name",
                    "last_name",
                    "is_staff",
                ]
            )

        return instance


class CurrentUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    email_pro = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    class Meta:
        model = Salarie

        fields = [
            "id",
            "username",
            "email_pro",
            "nom",
            "prenom",
            "matricule",
            "email_personnel",
            "telephone",
            "date_naissance",
            "nationalite",
            "adresse",
            "code_postal",
            "ville",
            "contact_urgence_nom",
            "contact_urgence_lien",
            "contact_urgence_telephone",
            "photo",
            "type_contrat",
            "role",
            "date_debut_contrat",
            "date_fin_contrat",
            "poste",
            "etablissement",
            "must_change_password",
        ]

        read_only_fields = [
            "id",
            "username",
            "email_pro",
            "matricule",
            "type_contrat",
            "role",
            "date_debut_contrat",
            "date_fin_contrat",
            "poste",
            "etablissement",
            "must_change_password",
        ]

    def validate_photo(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "La photo ne doit pas dépasser 5 Mo."
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        content_type = getattr(value, "content_type", "")
        if content_type not in allowed_types:
            raise serializers.ValidationError(
                "Utilisez une image JPG, PNG ou WebP."
            )

        return value


    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)

        if instance.user:
            instance.user.first_name = instance.prenom
            instance.user.last_name = instance.nom

            instance.user.save(
                update_fields=["first_name", "last_name"]
            )

        return instance
