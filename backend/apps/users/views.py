from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import (
    urlsafe_base64_decode,
    urlsafe_base64_encode,
)

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, status, viewsets
from rest_framework import serializers as drf_serializers
from rest_framework.decorators import (
    api_view,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import (
    FormParser,
    JSONParser,
    MultiPartParser,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response

from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
)

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
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    SalarieSerializer,
)


User = get_user_model()


# ============================================================
# SALARIE VIEWSET
# ============================================================

class SalarieViewSet(viewsets.ModelViewSet):
    serializer_class = SalarieSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "role",
        "type_contrat",
        "etablissement",
        "poste",
    ]

    search_fields = [
        "nom",
        "prenom",
        "matricule",
        "email_personnel",
        "telephone",
        "poste",
        "etablissement",
        "user__username",
        "user__email",
    ]

    ordering_fields = [
        "nom",
        "prenom",
        "matricule",
        "created_at",
        "updated_at",
        "date_debut_contrat",
        "date_fin_contrat",
    ]

    ordering = [
        "nom",
        "prenom",
    ]

    def get_queryset(self):
        # Important pour Swagger / drf-spectacular
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Salarie.objects.none()

        user = self.request.user

        queryset = (
            Salarie.objects
            .select_related("user")
            .order_by(
                "nom",
                "prenom",
            )
        )

        salarie = getattr(
            user,
            "salarie",
            None,
        )

        if (
            salarie
            and salarie.role
            in [
                Salarie.Role.RH,
                Salarie.Role.ADMIN,
            ]
        ):
            return queryset

        if not salarie:
            return queryset.none()

        return queryset.filter(
            user=user,
        )

    def get_permissions(self):
        if self.action in [
            "list",
            "create",
            "destroy",
        ]:
            permission_classes = [
                IsRHOrAdmin,
            ]

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
            permission_classes = [
                IsAuthenticated,
            ]

        return [
            permission()
            for permission
            in permission_classes
        ]

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

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
                    subject=(
                        "Bienvenue sur StaffHub"
                    ),
                    message=(
                        f"Bonjour {salarie.prenom},\n\n"
                        "Votre compte StaffHub "
                        "a été créé.\n\n"
                        f"Identifiant : "
                        f"{salarie.user.username}\n"
                        f"Adresse professionnelle : "
                        f"{email_pro}\n"
                        f"Mot de passe temporaire : "
                        f"{temp_password}\n\n"
                        "Vous devrez modifier votre "
                        "mot de passe lors de votre "
                        "première connexion."
                    ),
                    from_email=(
                        settings.DEFAULT_FROM_EMAIL
                    ),
                    recipient_list=[
                        salarie.email_personnel,
                    ],
                    fail_silently=False,
                )

                email_sent = True

            except Exception as error:
                print(
                    "ERREUR EMAIL CREATION SALARIE:",
                    error,
                )

                email_sent = False

        response_serializer = (
            self.get_serializer(
                salarie,
            )
        )

        return Response(
            {
                "message": (
                    "Le salarié et son compte "
                    "ont été créés."
                ),
                "email_envoye": email_sent,
                "data": (
                    response_serializer.data
                ),
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# CURRENT USER
# ============================================================

@extend_schema(
    methods=["GET"],
    responses=CurrentUserSerializer,
)
@extend_schema(
    methods=["PATCH"],
    request=CurrentUserSerializer,
    responses=inline_serializer(
        name="CurrentUserUpdateResponse",
        fields={
            "message": (
                drf_serializers.CharField()
            ),
            "data": (
                CurrentUserSerializer()
            ),
        },
    ),
)
@api_view([
    "GET",
    "PATCH",
])
@permission_classes([
    IsAuthenticated,
])
def current_user(request):
    salarie = getattr(
        request.user,
        "salarie",
        None,
    )

    if not salarie:
        return Response(
            {
                "detail": (
                    "Aucun profil salarié "
                    "n’est associé à ce compte."
                )
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = (
            CurrentUserSerializer(
                salarie,
            )
        )

        return Response(
            serializer.data,
        )

    serializer = CurrentUserSerializer(
        salarie,
        data=request.data,
        partial=True,
    )

    serializer.is_valid(
        raise_exception=True,
    )

    serializer.save()

    return Response(
        {
            "message": (
                "Le profil a été mis à jour."
            ),
            "data": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# ADMIN STATS
# ============================================================

@extend_schema(
    responses=inline_serializer(
        name="AdminStatsResponse",
        fields={
            "salaries": (
                drf_serializers.IntegerField()
            ),
            "demandes": (
                drf_serializers.IntegerField()
            ),
            "demandes_en_attente": (
                drf_serializers.IntegerField()
            ),
            "demandes_approuvees": (
                drf_serializers.IntegerField()
            ),
            "demandes_refusees": (
                drf_serializers.IntegerField()
            ),
            "pointages": (
                drf_serializers.IntegerField()
            ),
            "fiches": (
                drf_serializers.IntegerField()
            ),
            "plannings": (
                drf_serializers.IntegerField()
            ),
        },
    ),
)
@api_view(["GET"])
@permission_classes([
    IsAuthenticated,
    IsAdminOrRH,
])
def admin_stats(request):
    return Response(
        {
            "salaries": (
                Salarie.objects.count()
            ),

            "demandes": (
                Demande.objects.count()
            ),

            "demandes_en_attente": (
                Demande.objects.filter(
                    statut=(
                        Demande
                        .Statut
                        .EN_ATTENTE
                    ),
                ).count()
            ),

            "demandes_approuvees": (
                Demande.objects.filter(
                    statut=(
                        Demande
                        .Statut
                        .APPROUVE
                    ),
                ).count()
            ),

            "demandes_refusees": (
                Demande.objects.filter(
                    statut=(
                        Demande
                        .Statut
                        .REFUSE
                    ),
                ).count()
            ),

            "pointages": (
                Pointage.objects.count()
            ),

            "fiches": (
                Paie.objects.count()
            ),

            "plannings": (
                Planning.objects.count()
            ),
        }
    )


# ============================================================
# MOT DE PASSE OUBLIE
# ============================================================

@extend_schema(
    request=PasswordResetRequestSerializer,
    responses=inline_serializer(
        name="PasswordResetRequestResponse",
        fields={
            "message": (
                drf_serializers.CharField()
            ),
        },
    ),
)
@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    serializer = (
        PasswordResetRequestSerializer(
            data=request.data,
        )
    )

    serializer.is_valid(
        raise_exception=True,
    )

    email = (
        serializer.validated_data[
            "email"
        ]
    )

    # --------------------------------------------------------
    # Recherche uniquement par EMAIL PERSONNEL
    # --------------------------------------------------------

    salarie = (
        Salarie.objects
        .select_related("user")
        .filter(
            email_personnel__iexact=email,
        )
        .first()
    )

    # --------------------------------------------------------
    # Toujours la même réponse si le compte n'existe pas.
    # Cela évite de révéler les comptes existants.
    # --------------------------------------------------------

    success_message = (
        "Si cette adresse e-mail est associée "
        "à un compte StaffHub, un lien de "
        "réinitialisation a été envoyé."
    )

    if (
        not salarie
        or not salarie.user
    ):
        return Response(
            {
                "message": success_message,
            },
            status=status.HTTP_200_OK,
        )

    user = salarie.user

    # --------------------------------------------------------
    # UID + TOKEN DJANGO
    # --------------------------------------------------------

    uid = urlsafe_base64_encode(
        force_bytes(
            user.pk
        )
    )

    token = (
        default_token_generator
        .make_token(
            user
        )
    )

    # --------------------------------------------------------
    # URL FRONTEND
    # --------------------------------------------------------

    reset_url = (
        "http://localhost:3000"
        f"/reset-password/{uid}/{token}"
    )

    # --------------------------------------------------------
    # ENVOI SUR EMAIL PERSONNEL
    # --------------------------------------------------------

    try:
        send_mail(
            subject=(
                "Réinitialisation de votre "
                "mot de passe StaffHub"
            ),
            message=(
                f"Bonjour {salarie.prenom},\n\n"

                "Nous avons reçu une demande "
                "de réinitialisation du mot "
                "de passe de votre compte "
                "StaffHub.\n\n"

                "Pour choisir un nouveau mot "
                "de passe, cliquez sur le lien "
                "suivant :\n\n"

                f"{reset_url}\n\n"

                "Si vous n'êtes pas à l'origine "
                "de cette demande, vous pouvez "
                "ignorer cet e-mail.\n\n"

                "L'équipe StaffHub"
            ),
            from_email=(
                settings.DEFAULT_FROM_EMAIL
            ),
            recipient_list=[
                salarie.email_personnel,
            ],
            fail_silently=False,
        )

    except Exception as error:
        print(
            "ERREUR PASSWORD RESET EMAIL:",
            error,
        )

        return Response(
            {
                "detail": (
                    "Impossible d'envoyer "
                    "l'e-mail de "
                    "réinitialisation."
                )
            },
            status=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
        )

    return Response(
        {
            "message": success_message,
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# CONFIRMATION MOT DE PASSE OUBLIE
# ============================================================

@extend_schema(
    request=PasswordResetConfirmSerializer,
    responses=inline_serializer(
        name="PasswordResetConfirmResponse",
        fields={
            "message": (
                drf_serializers.CharField()
            ),
        },
    ),
)
@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    serializer = (
        PasswordResetConfirmSerializer(
            data=request.data,
        )
    )

    serializer.is_valid(
        raise_exception=True,
    )

    user = serializer.save()

    # --------------------------------------------------------
    # Le mot de passe est maintenant choisi par l'utilisateur
    # --------------------------------------------------------

    salarie = getattr(
        user,
        "salarie",
        None,
    )

    if salarie:
        salarie.must_change_password = False

        salarie.save(
            update_fields=[
                "must_change_password",
                "updated_at",
            ]
        )

    return Response(
        {
            "message": (
                "Votre mot de passe a été "
                "réinitialisé avec succès."
            )
        },
        status=status.HTTP_200_OK,
    )


# ============================================================
# SET PASSWORD EXISTANT
# ============================================================
# On conserve cet endpoint car il peut toujours servir
# pour l'activation initiale / changement imposé du mot
# de passe d'un nouveau salarié.
# ============================================================

@extend_schema(
    request=inline_serializer(
        name="SetPasswordRequest",
        fields={
            "uid": (
                drf_serializers.CharField()
            ),
            "token": (
                drf_serializers.CharField()
            ),
            "password": (
                drf_serializers.CharField(
                    write_only=True,
                )
            ),
            "password_confirmation": (
                drf_serializers.CharField(
                    write_only=True,
                )
            ),
        },
    ),
    responses=inline_serializer(
        name="SetPasswordResponse",
        fields={
            "message": (
                drf_serializers.CharField()
            ),
        },
    ),
)
@api_view(["POST"])
@permission_classes([AllowAny])
def set_password(request):
    uid = request.data.get(
        "uid"
    )

    token = request.data.get(
        "token"
    )

    password = request.data.get(
        "password"
    )

    password_confirmation = (
        request.data.get(
            "password_confirmation"
        )
    )

    errors = {}

    if not uid:
        errors["uid"] = (
            "L’identifiant utilisateur "
            "est obligatoire."
        )

    if not token:
        errors["token"] = (
            "Le token est obligatoire."
        )

    if not password:
        errors["password"] = (
            "Le mot de passe "
            "est obligatoire."
        )

    if (
        password
        != password_confirmation
    ):
        errors[
            "password_confirmation"
        ] = (
            "Les mots de passe "
            "ne correspondent pas."
        )

    if errors:
        return Response(
            errors,
            status=(
                status.HTTP_400_BAD_REQUEST
            ),
        )

    try:
        user_id = (
            urlsafe_base64_decode(
                uid
            ).decode()
        )

        user = User.objects.get(
            pk=user_id,
        )

    except (
        UnicodeDecodeError,
        ValueError,
        TypeError,
        User.DoesNotExist,
    ):
        return Response(
            {
                "detail": (
                    "Utilisateur invalide."
                )
            },
            status=(
                status.HTTP_400_BAD_REQUEST
            ),
        )

    if not (
        default_token_generator
        .check_token(
            user,
            token,
        )
    ):
        return Response(
            {
                "detail": (
                    "Le lien est invalide "
                    "ou expiré."
                )
            },
            status=(
                status.HTTP_400_BAD_REQUEST
            ),
        )

    try:
        validate_password(
            password,
            user=user,
        )

    except DjangoValidationError as error:
        return Response(
            {
                "password": list(
                    error.messages
                )
            },
            status=(
                status.HTTP_400_BAD_REQUEST
            ),
        )

    user.set_password(
        password
    )

    user.save(
        update_fields=[
            "password",
        ]
    )

    salarie = getattr(
        user,
        "salarie",
        None,
    )

    if salarie:
        salarie.must_change_password = False

        salarie.save(
            update_fields=[
                "must_change_password",
                "updated_at",
            ]
        )

    return Response(
        {
            "message": (
                "Le mot de passe "
                "a été enregistré."
            )
        },
        status=status.HTTP_200_OK,
    )
