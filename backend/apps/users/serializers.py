from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
import random
import string

from .models import Salarie
from apps.dossiers.models import EtatCivil, Adresse, Famille, Iban
from apps.documents.models import Document


def generate_password():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))


class SalarieSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)

    email_pro = serializers.SerializerMethodField()

    class Meta:
        model = Salarie
        fields = "__all__"

    def get_email_pro(self, obj):
        return obj.user.email

    def create(self, validated_data):

        username = validated_data.pop("username")
        password = validated_data.pop("password", None)

        prenom = validated_data.get("prenom", "").lower()
        nom = validated_data.get("nom", "").lower()

        email = f"{prenom}.{nom}@staffhub.com"
        temp_password = password or generate_password()

        # =========================
        # USER
        # =========================
        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(temp_password)
        )

        # =========================
        # SALARIE
        # =========================
        salarie = Salarie.objects.create(
            user=user,
            **validated_data
        )

        # =========================
        # ETAT CIVIL
        # =========================
        EtatCivil.objects.create(
            salarie=salarie,
            numeroSecu=validated_data.get("numeroSecu"),
            civilite=validated_data.get("civilite"),
            nomUsuel=validated_data.get("nomUsuel"),
            prenom=validated_data.get("prenom"),
        )

        # =========================
        # ADRESSE
        # =========================
        Adresse.objects.create(
            salarie=salarie,
            numero=validated_data.get("numero"),
            voie=validated_data.get("voie"),
            codePostal=validated_data.get("codePostal"),
            commune=validated_data.get("commune"),
        )

        # =========================
        # IBAN
        # =========================
        Iban.objects.create(
            salarie=salarie,
            ibanComplet=validated_data.get("ibanComplet"),
            bicComplet=validated_data.get("bicComplet"),
        )

        # =========================
        # FAMILLE
        # =========================
        Famille.objects.create(
            salarie=salarie,
            nom=validated_data.get("nom"),
            prenom=validated_data.get("prenom"),
        )

        # =========================
        # DOCUMENT
        # =========================
        Document.objects.create(
            salarie=salarie,
            typeDocument=validated_data.get("typeDocument"),
            numeroDocument=validated_data.get("numeroDocument"),
        )

        # stockage temporaire pour email
        salarie._temp_password = temp_password
        salarie._email = email

        return salarie
