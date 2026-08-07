from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.models import Salarie

from .models import Notification
from .permissions import (
    IsNotificationOwnerOrRH,
    is_rh_or_admin,
)
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated,
        IsNotificationOwnerOrRH,
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "is_read",
        "type_notification",
        "priorite",
        "salarie",
    ]

    search_fields = [
        "titre",
        "message",
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
    ]

    ordering_fields = [
        "date_envoi",
        "read_at",
        "priorite",
    ]

    ordering = ["-date_envoi"]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Notification.objects
            .select_related(
                "salarie",
                "salarie__user",
                "created_by",
            )
            .all()
        )

        if is_rh_or_admin(user):
            return queryset

        salarie = getattr(user, "salarie", None)

        if not salarie:
            return queryset.none()

        return queryset.filter(salarie=salarie)

    def perform_create(self, serializer):
        if not is_rh_or_admin(self.request.user):
            raise serializers.ValidationError(
                "Seuls les RH et administrateurs peuvent "
                "créer une notification."
            )

        salarie_id = self.request.data.get("salarie")

        if not salarie_id:
            raise serializers.ValidationError({
                "salarie": "Le salarié est obligatoire."
            })

        try:
            salarie = Salarie.objects.get(pk=salarie_id)
        except Salarie.DoesNotExist as error:
            raise serializers.ValidationError({
                "salarie": "Le salarié sélectionné n’existe pas."
            }) from error

        serializer.save(
            salarie=salarie,
            created_by=self.request.user,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="marquer-lue",
    )
    def marquer_lue(self, request, pk=None):
        notification = self.get_object()

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()

            notification.save(
                update_fields=[
                    "is_read",
                    "read_at",
                    "updated_at",
                ]
            )

        serializer = self.get_serializer(notification)

        return Response(
            {
                "message": "Notification marquée comme lue.",
                "notification": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="marquer-non-lue",
    )
    def marquer_non_lue(self, request, pk=None):
        notification = self.get_object()

        notification.is_read = False
        notification.read_at = None

        notification.save(
            update_fields=[
                "is_read",
                "read_at",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(notification)

        return Response(
            {
                "message": "Notification marquée comme non lue.",
                "notification": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="tout-marquer-lu",
    )
    def tout_marquer_lu(self, request):
        now = timezone.now()

        queryset = self.get_queryset().filter(
            is_read=False,
        )

        updated_count = queryset.update(
            is_read=True,
            read_at=now,
            updated_at=now,
        )

        return Response(
            {
                "message": (
                    f"{updated_count} notification(s) "
                    "marquée(s) comme lue(s)."
                ),
                "updated_count": updated_count,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="non-lues",
    )
    def non_lues(self, request):
        queryset = self.get_queryset().filter(
            is_read=False,
        )

        return Response(
            {
                "count": queryset.count(),
                "results": self.get_serializer(
                    queryset,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="compteur",
    )
    def compteur(self, request):
        queryset = self.get_queryset()

        return Response(
            {
                "total": queryset.count(),
                "non_lues": queryset.filter(
                    is_read=False,
                ).count(),
                "lues": queryset.filter(
                    is_read=True,
                ).count(),
            },
            status=status.HTTP_200_OK,
        )
