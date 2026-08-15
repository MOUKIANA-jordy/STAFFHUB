from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import (
    filters,
    serializers,
    viewsets,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import (
    FormParser,
    MultiPartParser,
)
from apps.users.models import Salarie

from .models import Document
from .permissions import (
    IsDocumentOwnerOrRH,
    is_rh_or_admin,
)
from .serializers import DocumentSerializer


class DocumentViewSet(
    viewsets.ModelViewSet
):
    serializer_class = DocumentSerializer

    parser_classes = [
    MultiPartParser,
    FormParser,
]

    permission_classes = [
        IsAuthenticated,
        IsDocumentOwnerOrRH,
    ]

    # ========================================================
    # FILTRES / RECHERCHE / TRI
    # ========================================================

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
        "salarie__email_personnel",
        "salarie__user__username",
        "salarie__user__email",
    ]

    ordering_fields = [
        "uploaded_at",
        "updated_at",
        "date_emission",
        "date_expiration",
        "type_document",
        "titre",
    ]

    ordering = [
        "-uploaded_at",
    ]

    # ========================================================
    # QUERYSET
    # ========================================================

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Document.objects.none()

        user = self.request.user

        queryset = (
            Document.objects
            .select_related(
                "salarie",
                "salarie__user",
                "uploaded_by",
            )
            .order_by(
                "-uploaded_at"
            )
        )

        # RH / ADMIN :
        # accès à tous les documents.
        if is_rh_or_admin(user):
            return queryset

        # SALARIÉ :
        # uniquement ses propres documents.
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

    # ========================================================
    # CRÉATION
    # ========================================================

    def perform_create(
        self,
        serializer,
    ):
        user = self.request.user

        current_salarie = getattr(
            user,
            "salarie",
            None,
        )

        # Un superuser peut éventuellement ne pas
        # avoir de profil Salarie.
        if (
            not current_salarie
            and not user.is_superuser
        ):
            raise serializers.ValidationError({
                "salarie": (
                    "Aucun profil salarié "
                    "n’est associé à ce compte."
                )
            })

        target_salarie = (
            current_salarie
        )

        # ====================================================
        # RH / ADMIN
        # Peut sélectionner le salarié cible.
        # ====================================================

        if is_rh_or_admin(user):
            salarie_id = (
                self.request.data.get(
                    "salarie"
                )
            )

            if salarie_id:
                try:
                    target_salarie = (
                        Salarie.objects.get(
                            pk=salarie_id,
                        )
                    )

                except (
                    Salarie.DoesNotExist
                ) as error:
                    raise serializers.ValidationError({
                        "salarie": (
                            "Le salarié sélectionné "
                            "n’existe pas."
                        )
                    }) from error

            elif not target_salarie:
                raise serializers.ValidationError({
                    "salarie": (
                        "Le salarié est obligatoire "
                        "pour ajouter ce document."
                    )
                })

        # ====================================================
        # SALARIÉ
        # Il ne peut ajouter que pour lui-même.
        # ====================================================

        elif not target_salarie:
            raise serializers.ValidationError({
                "salarie": (
                    "Impossible de déterminer "
                    "le salarié associé."
                )
            })

        serializer.save(
            salarie=target_salarie,
            uploaded_by=user,
        )

    # ========================================================
    # MODIFICATION
    # ========================================================

    def perform_update(
        self,
        serializer,
    ):
        document = self.get_object()

        # Le salarié reste propriétaire du document.
        # Les champs salarie et uploaded_by sont déjà
        # read_only dans le serializer.
        serializer.save(
            salarie=document.salarie,
            uploaded_by=document.uploaded_by,
        )
