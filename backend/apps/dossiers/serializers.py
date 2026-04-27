from rest_framework import serializers
from .models import Adresse, EtatCivil, Famille, Iban
from .models import Dossier

class DossierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dossier
        fields = "__all__"

class AdresseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Adresse
        fields = "__all__"

class EtatCivilSerializer(serializers.ModelSerializer):
    class Meta:
        model = EtatCivil
        fields = "__all__"

class FamilleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Famille
        fields = "__all__"

class IbanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Iban
        fields = "__all__"
