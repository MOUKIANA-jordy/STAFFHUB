from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.demandes.models import Demande
from apps.paie.models import Paie
from apps.planning.models import Planning
from apps.pointage.models import Pointage

from .models import Salarie
from .permissions import (
    IsAdminOrRH,
    IsOwnerOrRH,
    IsRHOrAdmin,
)
from .serializers import (
    CurrentUserSerializer,
    SalarieSerializer,
)


User = get_user_model()


class SalarieViewSet(viewsets.ModelViewSet):
    serializer_class = SalarieSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Salarie.objects
            .select_related("user")
            .order_by("nom", "prenom")
        )

        salarie = getattr(user, "salarie", None)

        if salarie and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]:
            return queryset

        return queryset.filter(user=user)

    def get_permissions(self):
        if self.action in [
            "list",
            "create",
            "destroy",
        ]:
            permission_classes = [IsRHOrAdmin]

        elif self.action in [
            "retrieve",
            "update",
            "partial_update",
        ]:
            permission_classes = [
                IsAuthenticated,
                IsOwnerOrRH,
            ]

        else:
            permission_classes = [IsAuthenticated]

        return [
            permission()
            for permission in permission_classes
        ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(raise_exception=True)
        salarie = serializer.save()

        temp_password = getattr(
            salarie,
            "_temp_password",
            None,
        )

        email_pro = getattr(
            salarie,
            "_email_pro",
            salarie.user.email,
        )

        email_sent = False

        if temp_password:
            try:
                send_mail(
                    subject="Bienvenue sur StaffHub",
                    message=(
                        f"Bonjour {salarie.prenom},\n\n"
                        "Votre compte StaffHub a été créé.\n\n"
                        f"Identifiant : {salarie.user.username}\n"
                        f"Adresse professionnelle : {email_pro}\n"
                        f"Mot de passe temporaire : {temp_password}\n\n"
                        "Vous devrez modifier votre mot de passe "
                        "lors de votre première connexion."
                    ),
                    from_email="noreply@staffhub.com",
                    recipient_list=[
                        salarie.email_personnel,
                    ],
                    fail_silently=False,
                )

                email_sent = True

            except Exception:
                # À remplacer plus tard par un vrai logger.
                email_sent = False

        response_serializer = self.get_serializer(salarie)

        return Response(
            {
                "message": (
                    "Le salarié et son compte ont été créés."
                ),
                "email_envoye": email_sent,
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def current_user(request):
    salarie = getattr(request.user, "salarie", None)

    if not salarie:
        return Response(
            {
                "detail": (
                    "Aucun profil salarié n’est associé "
                    "à ce compte."
                )
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = CurrentUserSerializer(salarie)
        return Response(serializer.data)

    serializer = CurrentUserSerializer(
        salarie,
        data=request.data,
        partial=True,
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response({
        "message": "Le profil a été mis à jour.",
        "data": serializer.data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminOrRH])
def admin_stats(request):
    return Response({
        "salaries": Salarie.objects.count(),
        "demandes": Demande.objects.count(),
        "demandes_en_attente": Demande.objects.filter(
            statut=Demande.Statut.EN_ATTENTE,
        ).count(),
        "demandes_approuvees": Demande.objects.filter(
            statut=Demande.Statut.APPROUVE,
        ).count(),
        "demandes_refusees": Demande.objects.filter(
            statut=Demande.Statut.REFUSE,
        ).count(),
        "pointages": Pointage.objects.count(),
        "fiches": Paie.objects.count(),
        "plannings": Planning.objects.count(),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def set_password(request):
    uid = request.data.get("uid")
    token = request.data.get("token")
    password = request.data.get("password")
    password_confirmation = request.data.get(
        "password_confirmation"
    )

    errors = {}

    if not uid:
        errors["uid"] = "L’identifiant utilisateur est obligatoire."

    if not token:
        errors["token"] = "Le token est obligatoire."

    if not password:
        errors["password"] = "Le mot de passe est obligatoire."

    if password != password_confirmation:
        errors["password_confirmation"] = (
            "Les mots de passe ne correspondent pas."
        )

    if errors:
        return Response(
            errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user_id = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_id)

    except (
        UnicodeDecodeError,
        ValueError,
        TypeError,
        User.DoesNotExist,
    ):
        return Response(
            {"detail": "Utilisateur invalide."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not default_token_generator.check_token(user, token):
        return Response(
            {"detail": "Le lien est invalide ou expiré."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(password, user=user)

    except DjangoValidationError as error:
        return Response(
            {"password": list(error.messages)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(password)
    user.save(update_fields=["password"])

    salarie = getattr(user, "salarie", None)

    if salarie:
        salarie.must_change_password = False
        salarie.save(
            update_fields=[
                "must_change_password",
                "updated_at",
            ]
        )

    return Response({
        "message": "Le mot de passe a été enregistré."
    })
