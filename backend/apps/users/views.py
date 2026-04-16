from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Salarie
from .serializers import SalarieSerializer
from .permissions import IsRHOrAdmin, IsOwnerOrRH

# 🔥 IMPORTS POUR DASHBOARD
from apps.demandes.models import Demande
from apps.pointage.models import Pointage


# ==============================
# 👥 SALARIE VIEWSET
# ==============================
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


# ==============================
# 👤 CURRENT USER
# ==============================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
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

    # fallback si pas de profil salarié
    return Response({
        "username": user.username,
        "email": user.email,
        "prenom": "Utilisateur",
        "nom": ""
    })


# ==============================
# 📊 ADMIN DASHBOARD
# ==============================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_stats(request):

    # 🔐 sécurité (ADMIN + superuser)
    if not request.user.is_superuser:
        if not hasattr(request.user, "salarie") or request.user.salarie.role != "ADMIN":
            return Response({"error": "Accès refusé"}, status=403)

    total_salaries = Salarie.objects.count()
    total_demandes = Demande.objects.count()
    total_pointages = Pointage.objects.count()

    return Response({
        "salaries": total_salaries,
        "demandes": total_demandes,
        "pointages": total_pointages,
    })
