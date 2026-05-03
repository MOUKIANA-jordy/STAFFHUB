from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
import uuid


def generate_matricule():
    return f"EMP-{uuid.uuid4().hex[:6].upper()}"


class Salarie(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="salarie",
        null=True,
        blank=True
    )

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)

    matricule = models.CharField(
        max_length=50,
        unique=True,
        default=generate_matricule
    )

    email_personnel = models.EmailField(default="inconnu@domaine.com")
    telephone = models.CharField(max_length=20)

    date_naissance = models.DateField(null=True, blank=True)

    type_contrat = models.CharField(
        max_length=30,
        choices=[
            ("CDI", "CDI"),
            ("CDD", "CDD"),
            ("VACATAIRE", "Vacataire"),
            ("STAGIAIRE", "Stagiaire"),
            ("ALTERNANT", "Alternant"),
        ],
        default="CDI"
    )

    ROLE_CHOICES = [
        ("SALARIE", "Salarié"),
        ("RH", "RH"),
        ("ADMIN", "Admin"),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="SALARIE")

    date_debut_contrat = models.DateField()
    date_fin_contrat = models.DateField(null=True, blank=True)

    poste = models.CharField(max_length=100)
    etablissement = models.CharField(max_length=150)

    must_change_password = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        # Création automatique du User
        if not self.user:

            email_pro = f"{self.prenom.lower()}.{self.nom.lower()}@staffhub.com"
            password_temp = get_random_string(length=10)

            user = User.objects.create_user(
                username=self.matricule,
                email=email_pro,
                password=password_temp
            )

            self.user = user

            # STOCKAGE TEMPORAIRE POUR EMAIL
            self._email = email_pro
            self._temp_password = password_temp

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"
