from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from apps.users.permissions import IsOwnerOrRH

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrRH]

    def get_queryset(self):
        user = self.request.user

        if not hasattr(user, "salarie"):
            return Notification.objects.none()

        salarie = user.salarie

        if salarie.role in ["RH", "ADMIN"]:
            return Notification.objects.all()

        # FIX ICI
        return Notification.objects.filter(
            salarie=salarie
        ).order_by("-date_envoi")
