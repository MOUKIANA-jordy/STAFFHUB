from django.db import models
from apps.users.models import Salarie

class Document(models.Model):
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE, related_name="documents")

    TYPE_CHOICES = [
        ("CNI", "Carte d'identité"),
        ("PASSPORT", "Passeport"),
        ("CONTRAT", "Contrat"),
        ("DIPLOME", "Diplôme"),
        ("PERMIS", "Permis"),
        ("AUTRE", "Autre"),
    ]

    type_document = models.CharField(max_length=50, choices=TYPE_CHOICES)
    fichier = models.FileField(upload_to="documents/")
    date_expiration = models.DateField(null=True, blank=True)
    numero = models.CharField(max_length=100, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type_document} - {self.salarie}"
