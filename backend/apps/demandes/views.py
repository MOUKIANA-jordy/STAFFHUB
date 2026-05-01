from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Demande
from .serializers import DemandeSerializer
from apps.users.permissions import IsOwnerOrRH
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

class DemandeViewSet(viewsets.ModelViewSet):
    queryset = Demande.objects.all()
    serializer_class = DemandeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrRH]

    def get_queryset(self):
        user = self.request.user

        if not hasattr(user, "salarie"):
            return Demande.objects.none()

        salarie = user.salarie

        if salarie.role in ["RH", "ADMIN"]:
            return Demande.objects.all()

        return Demande.objects.filter(salarie=salarie)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def absences_stats(request):

    data = (
        Demande.objects
        .filter(type="ABSENCE")  # 🔥 important
        .annotate(month=TruncMonth("created_at"))
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
