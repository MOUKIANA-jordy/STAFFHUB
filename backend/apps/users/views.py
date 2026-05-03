from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

from django.core.mail import send_mail

from .models import Salarie
from .serializers import SalarieSerializer
from .permissions import IsRHOrAdmin, IsOwnerOrRH, IsAdminOrRH

# DASHBOARD
from apps.demandes.models import Demande
from apps.pointage.models import Pointage
from apps.paie.models import Paie
from apps.planning.models import Planning


# ==============================
# 👥 SALARIE VIEWSET
# ==============================
class SalarieViewSet(viewsets.ModelViewSet):

    queryset = Salarie.objects.all()
    serializer_class = SalarieSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Filtrage
    def get_queryset(self):
        user = self.request.user

        if hasattr(user, "salarie") and user.salarie.role in ["RH", "ADMIN"]:
            return Salarie.objects.all()

        return Salarie.objects.filter(user=user)

    #  CREATE (COMPLET + EMAIL)
    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        salarie = serializer.save()

        email = getattr(salarie, "_email", "")
        password = getattr(salarie, "_temp_password", "")
        username = request.data.get("username")

        #  EMAIL
        send_mail(
            subject="Bienvenue sur StaffHub",
            message=f"""
Bonjour {salarie.prenom},

Votre compte a été créé avec succès.

🔐 Identifiant : {username}
🔑 Mot de passe temporaire : {password}

👉 Connectez-vous ici :
http://localhost:3000/login

Merci.
            """,
            from_email="noreply@staffhub.com",
            recipient_list=[email],
            fail_silently=True,
        )

        return Response({
            "message": " Salarié créé et email envoyé",
            "username": username,
            "email": email,
            "password_temporaire": password
        }, status=status.HTTP_201_CREATED)

    # 🔐 Permissions dynamiques
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

    return Response({
        "username": user.username,
        "email": user.email,
        "prenom": "Utilisateur",
        "nom": ""
    })


# ==============================
# ADMIN DASHBOARD
# ==============================
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminOrRH])
def admin_stats(request):

    return Response({
        "salaries": Salarie.objects.count(),
        "demandes": Demande.objects.count(),
        "pointages": Pointage.objects.count(),
        "fiches": Paie.objects.count(),
        "plannings": Planning.objects.count(),
    })

@api_view(["POST"])
def set_password(request):

    uid = request.data.get("uid")
    token = request.data.get("token")
    password = request.data.get("password")

    try:
        user_id = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_id)
    except:
        return Response({"error": "Invalid user"}, status=400)

    if default_token_generator.check_token(user, token):

        user.password = make_password(password)
        user.save()

        return Response({"message": "Password set"})

    return Response({"error": "Invalid token"}, status=400)
