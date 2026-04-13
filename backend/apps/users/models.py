from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string


class Salarie(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="salarie",
        null=True,   # ✅ permet création sans user
        blank=True   # ✅ évite erreur admin/forms
    )

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    matricule = models.CharField(max_length=50, unique=True)

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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # 🔥 création automatique du User si absent
        if not self.user:

            email_pro = f"{self.prenom.lower()}.{self.nom.lower()}@staffhub.fr"
            password_temp = get_random_string(length=10)

            user = User.objects.create_user(
                username=self.matricule,
                email=email_pro,
                password=password_temp
            )

            self.user = user

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"
