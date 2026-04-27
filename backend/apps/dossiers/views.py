from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Dossier
from .serializers import DossierSerializer
from apps.users.permissions import IsOwnerOrRH
from .models import Adresse, EtatCivil, Famille, Iban
from .serializers import *

class DossierViewSet(viewsets.ModelViewSet):
    queryset = Dossier.objects.all()
    serializer_class = DossierSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrRH]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["RH", "ADMIN"]:
            return Dossier.objects.all()
        return Dossier.objects.filter(salarie=user)

class AdresseViewSet(viewsets.ModelViewSet):
    queryset = Adresse.objects.all()
    serializer_class = AdresseSerializer
    permission_classes = [IsAuthenticated]

class EtatCivilViewSet(viewsets.ModelViewSet):
    queryset = EtatCivil.objects.all()
    serializer_class = EtatCivilSerializer
    permission_classes = [IsAuthenticated]

class FamilleViewSet(viewsets.ModelViewSet):
    queryset = Famille.objects.all()
    serializer_class = FamilleSerializer
    permission_classes = [IsAuthenticated]

class IbanViewSet(viewsets.ModelViewSet):
    queryset = Iban.objects.all()
    serializer_class = IbanSerializer
    permission_classes = [IsAuthenticated]
