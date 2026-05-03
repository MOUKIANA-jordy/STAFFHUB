from django.db import models
from apps.users.models import Salarie


class Notification(models.Model):

    TYPE_NOTIFICATION = [
        ("INFO", "Information"),
        ("ALERTE", "Alerte"),
        ("VALIDATION", "Validation"),
        ("PAIE", "Paie"),
        ("DOCUMENT", "Document"),
    ]

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    titre = models.CharField(max_length=255)
    message = models.TextField()

    type_notification = models.CharField(
        max_length=20,
        choices=TYPE_NOTIFICATION,
        default="INFO"
    )

    lien = models.CharField(max_length=255, blank=True, null=True)

    is_read = models.BooleanField(default=False)
    date_envoi = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.salarie} - {self.titre}"
