from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.models import Salarie

from .models import Document
from .permissions import (
    IsDocumentOwnerOrRH,
    is_rh_or_admin,
)
from .serializers import DocumentSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer

    permission_classes = [
        IsAuthenticated,
        IsDocumentOwnerOrRH,
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "type_document",
        "archive",
        "salarie",
    ]

    search_fields = [
        "titre",
        "numero",
        "description",
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
    ]

    ordering_fields = [
        "uploaded_at",
        "updated_at",
        "date_expiration",
        "type_document",
    ]

    ordering = ["-uploaded_at"]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Document.objects
            .select_related(
                "salarie",
                "salarie__user",
                "uploaded_by",
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
        user = self.request.user
        current_salarie = getattr(user, "salarie", None)

        if not current_salarie:
            raise serializers.ValidationError({
                "salarie": (
                    "Aucun profil salarié n’est associé "
                    "à ce compte."
                )
            })

        target_salarie = current_salarie

        if is_rh_or_admin(user):
            salarie_id = self.request.data.get("salarie")

            if salarie_id:
                try:
                    target_salarie = Salarie.objects.get(
                        pk=salarie_id,
                    )
                except Salarie.DoesNotExist as error:
                    raise serializers.ValidationError({
                        "salarie": (
                            "Le salarié sélectionné n’existe pas."
                        )
                    }) from error

        serializer.save(
            salarie=target_salarie,
            uploaded_by=user,
        )
