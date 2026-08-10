from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification
from apps.users.models import Salarie

from .models import Demande
from .permissions import DemandePermission
from .serializers import DemandeSerializer


def is_rh_or_admin(user):
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    salarie = getattr(user, "salarie", None)

    return bool(
        salarie
        and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]
    )


class DemandeViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeSerializer

    permission_classes = [
        IsAuthenticated,
        DemandePermission,
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "statut",
        "type_demande",
        "salarie",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "salarie__email_personnel",
        "salarie__user__username",
        "salarie__user__email",
    ]

    ordering_fields = [
        "date_demande",
        "processed_at",
        "montant_souhaite",
        "type_demande",
        "statut",
    ]

    ordering = [
        "-date_demande",
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Demande.objects
            .select_related(
                "salarie",
                "salarie__user",
            )
            .order_by("-date_demande")
        )

        if is_rh_or_admin(user):
            return queryset

        salarie = getattr(
            user,
            "salarie",
            None,
        )

        if not salarie:
            return queryset.none()

        return queryset.filter(
            salarie=salarie,
        )

    def perform_create(self, serializer):
        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if not salarie:
            raise serializers.ValidationError({
                "salarie": (
                    "Aucun profil salarié n’est associé "
                    "à ce compte."
                )
            })

        serializer.save(
            salarie=salarie,
            statut=Demande.Statut.EN_ATTENTE,
        )

    def _verifier_admin(self, request):
        if not is_rh_or_admin(request.user):
            return Response(
                {
                    "detail": (
                        "Seuls les RH ou administrateurs "
                        "peuvent traiter une demande."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        return None

    def _creer_notification(
        self,
        demande,
        titre,
        message,
        type_notification,
    ):
        Notification.objects.create(
            salarie=demande.salarie,
            titre=titre,
            message=message,
            type_notification=type_notification,
            priorite=Notification.Priorite.NORMALE,
            lien=f"/home/demandes/{demande.id}",
            created_by=self.request.user,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="approuver",
    )
    def approuver(self, request, pk=None):
        permission_error = self._verifier_admin(request)

        if permission_error:
            return permission_error

        demande = self.get_object()

        if demande.statut != Demande.Statut.EN_ATTENTE:
            return Response(
                {
                    "detail": (
                        "Cette demande a déjà été traitée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        demande.statut = Demande.Statut.APPROUVE

        demande.save(
            update_fields=[
                "statut",
                "processed_at",
            ]
        )

        self._creer_notification(
            demande=demande,
            titre="Demande approuvée",
            message=(
                f"Votre demande "
                f"{demande.get_type_demande_display()} "
                "a été approuvée."
            ),
            type_notification=(
                Notification.TypeNotification.VALIDATION
            ),
        )

        serializer = self.get_serializer(
            demande,
        )

        return Response(
            {
                "message": (
                    "La demande a été approuvée."
                ),
                "demande": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="refuser",
    )
    def refuser(self, request, pk=None):
        permission_error = self._verifier_admin(request)

        if permission_error:
            return permission_error

        demande = self.get_object()

        if demande.statut != Demande.Statut.EN_ATTENTE:
            return Response(
                {
                    "detail": (
                        "Cette demande a déjà été traitée."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        demande.statut = Demande.Statut.REFUSE

        demande.save(
            update_fields=[
                "statut",
                "processed_at",
            ]
        )

        self._creer_notification(
            demande=demande,
            titre="Demande refusée",
            message=(
                f"Votre demande "
                f"{demande.get_type_demande_display()} "
                "a été refusée."
            ),
            type_notification=(
                Notification.TypeNotification.REFUS
            ),
        )

        serializer = self.get_serializer(
            demande,
        )

        return Response(
            {
                "message": (
                    "La demande a été refusée."
                ),
                "demande": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
