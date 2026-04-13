from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Salarie
from .serializers import SalarieSerializer
from .permissions import IsRHOrAdmin, IsOwnerOrRH


class SalarieViewSet(viewsets.ModelViewSet):
    queryset = Salarie.objects.all()
    serializer_class = SalarieSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "salarie") and user.salarie.role in ["RH", "ADMIN"]:
            return Salarie.objects.all()

        return Salarie.objects.filter(user=user)

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsRHOrAdmin]
        elif self.action in ["destroy", "update", "partial_update"]:
            permission_classes = [IsOwnerOrRH]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]


@api_view(["GET"])
def current_user(request):
    user = request.user

    if hasattr(user, "salarie"):
        salarie = user.salarie

        return Response({
            "username": user.username,
            "email": user.email,
            "nom": salarie.nom,
            "prenom": salarie.prenom,
            "matricule": salarie.matricule,
            "role": salarie.role,
            "poste": salarie.poste,
            "etablissement": salarie.etablissement,
        })

    return Response({"error": "Aucun profil salarié"})
