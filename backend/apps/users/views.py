from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view
from .models import Salarie
from .serializers import SalarieSerializer
from .permissions import IsRHOrAdmin
from django.contrib.auth import authenticate
from rest_framework.response import Response


class SalarieViewSet(viewsets.ModelViewSet):
    serializer_class = SalarieSerializer
    queryset = Salarie.objects.all()

    def get_queryset(self):
        user = self.request.user

        # RH ou ADMIN → accès à tous les salariés
        if user.salarie.role in ["RH", "ADMIN"]:
            return Salarie.objects.all()

        # Sinon → accès uniquement à son propre profil
        return Salarie.objects.filter(user=user)

    def get_permissions(self):
        if self.action in ["list", "destroy"]:
            permission_classes = [IsRHOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]


@api_view(["POST"])
def login_view(request):

    identifiant = request.data.get("identifiant")
    password = request.data.get("password")

    user = authenticate(username=identifiant, password=password)

    if user is not None:
        return Response({
            "message": "Connexion réussie",
            "user": {
                "username": user.username
            }
        })

    return Response(
        {"error": "Identifiant ou mot de passe incorrect"},
        status=status.HTTP_401_UNAUTHORIZED
    )
