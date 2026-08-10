from django.db.models import Count
from django.db.models.functions import TruncMonth

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, serializers, viewsets
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
)

from rest_framework import serializers as drf_serializers

from apps.demandes.models import Demande
from apps.users.models import Salarie

from .models import Planning
from .permissions import (
    IsPlanningOwnerOrRH,
    is_rh_or_admin,
)
from .serializers import PlanningSerializer


class PlanningViewSet(viewsets.ModelViewSet):
    serializer_class = PlanningSerializer

    permission_classes = [
        IsAuthenticated,
        IsPlanningOwnerOrRH,
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "salarie",
        "type_journee",
        "date",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "commentaire",
    ]

    ordering_fields = [
        "date",
        "heure_debut",
        "heure_fin",
        "type_journee",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "-date",
    ]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Planning.objects.none()

        user = self.request.user

        queryset = (
            Planning.objects
            .select_related(
                "salarie",
                "salarie__user",
            )
            .order_by("-date")
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
        user = self.request.user
        current_salarie = getattr(
            user,
            "salarie",
            None,
        )

        if not current_salarie:
            raise serializers.ValidationError({
                "salarie": (
                    "Aucun profil salarié n’est associé "
                    "à ce compte."
                )
            })

        target_salarie = current_salarie

        if is_rh_or_admin(user):
            salarie_id = self.request.data.get(
                "salarie"
            )

            if salarie_id:
                try:
                    target_salarie = Salarie.objects.get(
                        pk=salarie_id,
                    )

                except Salarie.DoesNotExist as error:
                    raise serializers.ValidationError({
                        "salarie": (
                            "Le salarié sélectionné "
                            "n’existe pas."
                        )
                    }) from error

        serializer.save(
            salarie=target_salarie,
        )


@extend_schema(
    responses=inline_serializer(
        name="AbsenceStatsItem",
        fields={
            "month": drf_serializers.CharField(),
            "value": drf_serializers.IntegerField(),
        },
        many=True,
    ),
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def absences_stats(request):
    data = (
        Demande.objects
        .filter(
            type_demande=Demande.TypeDemande.ABSENCE,
        )
        .annotate(
            month=TruncMonth("date_demande"),
        )
        .values("month")
        .annotate(
            total=Count("id"),
        )
        .order_by("month")
    )

    return Response([
        {
            "month": item["month"].strftime("%b"),
            "value": item["total"],
        }
        for item in data
        if item["month"]
    ])
