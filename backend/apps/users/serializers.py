from rest_framework import serializers
from .models import Salarie


class SalarieSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email_pro = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Salarie
        fields = [
            "id",
            "nom",
            "prenom",
            "matricule",
            "email_personnel",
            "telephone",
            "poste",
            "etablissement",
            "role",
            "username",
            "email_pro",
        ]
