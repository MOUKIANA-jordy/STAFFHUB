from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django.db.models import Count
from django.db.models.functions import TruncMonth

from .models import Planning
from .serializers import PlanningSerializer

from apps.users.permissions import IsOwnerOrRH
from apps.demandes.models import Demande


class PlanningViewSet(viewsets.ModelViewSet):
    queryset = Planning.objects.all()
    serializer_class = PlanningSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrRH]

    def get_queryset(self):
        user = self.request.user

        # sécurité
        if not hasattr(user, "salarie"):
            return Planning.objects.none()

        salarie = user.salarie

        if salarie.role in ["RH", "ADMIN"]:
            return Planning.objects.all()

        return Planning.objects.filter(salarie=salarie)


# STATS ABSENCES
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def absences_stats(request):

    data = (
        Demande.objects
        .filter(type_demande="ABSENCE")
        .annotate(month=TruncMonth("date_demande"))
        .values("month")
        .annotate(total=Count("id"))
        .order_by("month")
    )

    return Response([
        {
            "month": d["month"].strftime("%b"),
            "value": d["total"]
        }
        for d in data
    ])
