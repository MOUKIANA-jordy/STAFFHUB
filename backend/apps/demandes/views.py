from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.models import Salarie

from .models import Demande
from .serializers import DemandeSerializer


class DemandeViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = Demande.objects.select_related(
            "salarie"
        ).order_by("-date_demande")

        if user.is_staff or user.is_superuser:
            return queryset

        try:
            return queryset.filter(salarie=user.salarie)
        except Salarie.DoesNotExist:
            return queryset.none()

    def perform_create(self, serializer):
        serializer.save(salarie=self.request.user.salarie)
