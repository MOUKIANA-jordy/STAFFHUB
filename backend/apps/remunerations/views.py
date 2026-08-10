from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Remuneration
from .permissions import (
    IsRemunerationOwnerOrRH,
    is_rh_or_admin,
)
from .serializers import RemunerationSerializer


class RemunerationViewSet(viewsets.ModelViewSet):
    serializer_class = RemunerationSerializer

    permission_classes = [
        IsAuthenticated,
        IsRemunerationOwnerOrRH,
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "salarie",
        "actif",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
    ]

    ordering_fields = [
        "date_debut",
        "taux_horaire",
        "salaire_mensuel_brut",
    ]

    ordering = ["-date_debut"]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            Remuneration.objects
            .select_related(
                "salarie",
                "salarie__user",
            )
            .all()
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
