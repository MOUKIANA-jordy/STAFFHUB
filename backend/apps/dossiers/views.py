from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.models import Salarie

from .models import (
    Adresse,
    Dossier,
    EtatCivil,
    Famille,
    Iban,
)

from .permissions import IsDossierOwnerOrRH

from .serializers import (
    AdresseSerializer,
    DossierSerializer,
    EtatCivilSerializer,
    FamilleSerializer,
    IbanSerializer,
)


def user_is_rh_or_admin(user):
    salarie = getattr(user, "salarie", None)

    return bool(
        salarie
        and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]
    )


class SalarieOwnedViewSet(viewsets.ModelViewSet):
    """
    ViewSet commun pour les objets appartenant à un salarié.
    """

    permission_classes = [
        IsAuthenticated,
        IsDossierOwnerOrRH,
    ]

    def get_queryset(self):
        user = self.request.user

        queryset = super().get_queryset()

        if user_is_rh_or_admin(user):
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

        if user_is_rh_or_admin(user):
            salarie_id = self.request.data.get("salarie")

            if salarie_id:
                try:
                    target_salarie = Salarie.objects.get(
                        pk=salarie_id
                    )
                except Salarie.DoesNotExist as error:
                    raise serializers.ValidationError({
                        "salarie": "Le salarié sélectionné n’existe pas."
                    }) from error

                serializer.save(salarie=target_salarie)
                return

        serializer.save(salarie=current_salarie)


class DossierViewSet(SalarieOwnedViewSet):
    queryset = (
        Dossier.objects
        .select_related(
            "salarie",
            "salarie__user",
            "salarie__adresse",
            "salarie__etat_civil",
            "salarie__coordonnees_bancaires",
        )
        .prefetch_related(
            "salarie__membres_famille",
        )
        .all()
    )

    serializer_class = DossierSerializer


class AdresseViewSet(SalarieOwnedViewSet):
    queryset = (
        Adresse.objects
        .select_related(
            "salarie",
            "salarie__user",
        )
        .all()
    )

    serializer_class = AdresseSerializer


class EtatCivilViewSet(SalarieOwnedViewSet):
    queryset = (
        EtatCivil.objects
        .select_related(
            "salarie",
            "salarie__user",
        )
        .all()
    )

    serializer_class = EtatCivilSerializer


class FamilleViewSet(SalarieOwnedViewSet):
    queryset = (
        Famille.objects
        .select_related(
            "salarie",
            "salarie__user",
        )
        .all()
    )

    serializer_class = FamilleSerializer


class IbanViewSet(SalarieOwnedViewSet):
    queryset = (
        Iban.objects
        .select_related(
            "salarie",
            "salarie__user",
        )
        .all()
    )

    serializer_class = IbanSerializer
