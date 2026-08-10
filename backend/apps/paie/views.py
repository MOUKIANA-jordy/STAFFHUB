from django.http import Http404, HttpResponse

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters, serializers, viewsets
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from apps.users.models import Salarie
from apps.users.permissions import IsRHOrAdmin

from .models import Paie
from .serializers import PaieSerializer


def is_rh_or_admin(user):
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    salarie = getattr(
        user,
        "salarie",
        None,
    )

    return bool(
        salarie
        and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]
    )


class PaieViewSet(viewsets.ModelViewSet):
    serializer_class = PaieSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "salarie",
        "type_paiement",
        "date_paiement",
    ]

    search_fields = [
        "salarie__nom",
        "salarie__prenom",
        "salarie__matricule",
        "salarie__email_personnel",
        "commentaire",
    ]

    ordering_fields = [
        "date_paiement",
        "montant",
        "created_at",
        "updated_at",
        "type_paiement",
    ]

    ordering = [
        "-date_paiement",
        "-created_at",
    ]

    def get_queryset(self):
        if getattr(
            self,
            "swagger_fake_view",
            False,
        ):
            return Paie.objects.none()

        user = self.request.user

        queryset = (
            Paie.objects
            .select_related(
                "salarie",
                "salarie__user",
                "demande",
            )
            .order_by(
                "-date_paiement",
                "-created_at",
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

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
        ]:
            permission_classes = [
                IsRHOrAdmin,
            ]

        else:
            permission_classes = [
                IsAuthenticated,
            ]

        return [
            permission()
            for permission in permission_classes
        ]

    def perform_create(self, serializer):
        salarie_id = self.request.data.get(
            "salarie"
        )

        if not salarie_id:
            raise serializers.ValidationError({
                "salarie": (
                    "Le salarié est obligatoire."
                )
            })

        try:
            salarie = Salarie.objects.get(
                pk=salarie_id,
            )

        except Salarie.DoesNotExist as error:
            raise serializers.ValidationError({
                "salarie": (
                    "Le salarié sélectionné n’existe pas."
                )
            }) from error

        serializer.save(
            salarie=salarie,
        )


@extend_schema(
    responses={
        (200, "application/pdf"): OpenApiTypes.BINARY,
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_fiche_paie(request, pk):
    user = request.user

    queryset = (
        Paie.objects
        .select_related(
            "salarie",
            "salarie__user",
            "demande",
        )
    )

    if not is_rh_or_admin(user):
        salarie = getattr(
            user,
            "salarie",
            None,
        )

        if not salarie:
            raise Http404

        queryset = queryset.filter(
            salarie=salarie,
        )

    try:
        fiche = queryset.get(
            pk=pk,
        )

    except Paie.DoesNotExist:
        raise Http404

    response = HttpResponse(
        content_type="application/pdf",
    )

    response["Content-Disposition"] = (
        f'inline; filename="fiche_paie_{pk}.pdf"'
    )

    doc = SimpleDocTemplate(
        response,
    )

    styles = getSampleStyleSheet()

    elements = []

    elements.append(
        Paragraph(
            "FICHE DE PAIE",
            styles["Title"],
        )
    )

    elements.append(
        Spacer(1, 20)
    )

    elements.append(
        Paragraph(
            f"Nom : {fiche.salarie.nom}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"Prénom : {fiche.salarie.prenom}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            f"Matricule : {fiche.salarie.matricule}",
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            (
                "Type : "
                f"{fiche.get_type_paiement_display()}"
            ),
            styles["Normal"],
        )
    )

    elements.append(
        Paragraph(
            (
                "Date de paiement : "
                f"{fiche.date_paiement.strftime('%d/%m/%Y')}"
            ),
            styles["Normal"],
        )
    )

    elements.append(
        Spacer(1, 20)
    )

    montant = fiche.montant or 0

    data = [
        [
            "Désignation",
            "Montant (€)",
        ],
        [
            fiche.get_type_paiement_display(),
            str(montant),
        ],
    ]

    table = Table(
        data,
        colWidths=[
            300,
            150,
        ],
    )

    table.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.grey,
            ),
            (
                "TEXTCOLOR",
                (0, 0),
                (-1, 0),
                colors.white,
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                1,
                colors.black,
            ),
            (
                "PADDING",
                (0, 0),
                (-1, -1),
                8,
            ),
            (
                "ALIGN",
                (1, 0),
                (1, -1),
                "RIGHT",
            ),
        ])
    )

    elements.append(table)

    if fiche.commentaire:
        elements.append(
            Spacer(1, 20)
        )

        elements.append(
            Paragraph(
                f"Commentaire : {fiche.commentaire}",
                styles["Normal"],
            )
        )

    doc.build(elements)

    return response
