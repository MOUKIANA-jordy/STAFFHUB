from django_filters.rest_framework import (
    DjangoFilterBackend,
)

from rest_framework import (
    filters,
    serializers,
    viewsets,
)
from rest_framework.permissions import (
    IsAuthenticated,
)

from apps.users.models import Salarie

from .models import Pointage
from .permissions import (
    IsPointageOwnerOrRH,
    is_rh_or_admin,
)
from .serializers import (
    PointageSerializer,
)


class PointageViewSet(
    viewsets.ModelViewSet
):
    serializer_class = PointageSerializer

    permission_classes = [
        IsAuthenticated,
        IsPointageOwnerOrRH,
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "salarie",
        "date",
        "mois_paie",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "commentaire",
    ]

    ordering_fields = [
        "date",
        "heure_arrivee",
        "heure_depart",
        "heures_travaillees",
        "heures_sup",
        "mois_paie",
        "created_at",
    ]

    ordering = [
        "-date",
        "-heure_arrivee",
    ]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Pointage.objects.none()

        user = self.request.user

        queryset = (
            Pointage.objects
            .select_related(
                "salarie",
                "salarie__user",
            )
            .order_by(
                "-date",
                "-heure_arrivee",
            )
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

        if not current_salarie:
            raise serializers.ValidationError({
                "salarie": (
                    "Aucun profil salarié "
                    "n’est associé à ce compte."
                )
            })

        target_salarie = (
            current_salarie
        )

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
                            pk=salarie_id
                        )
                    )

                except (
                    Salarie.DoesNotExist
                ) as error:
                    raise (
                        serializers.ValidationError({
                            "salarie": (
                                "Le salarié sélectionné "
                                "n’existe pas."
                            )
                        })
                    ) from error

        serializer.save(
            salarie=target_salarie,
        )
