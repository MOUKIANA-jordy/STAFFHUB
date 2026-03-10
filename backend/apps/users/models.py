from django.db import models
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string


class Salarie(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="salarie")
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    matricule = models.CharField(max_length=50, unique=True)
    email_personnel = models.EmailField()
    telephone = models.CharField(max_length=20)
    email_personnel = models.EmailField(default="inconnu@domaine.com")

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

    date_debut_contrat = models.DateField()
    date_fin_contrat = models.DateField(null=True, blank=True)

    poste = models.CharField(max_length=100)
    etablissement = models.CharField(max_length=150)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="SALARIE")

    def save(self, *args, **kwargs):

        # Si le compte User n'existe pas encore
        if not self.user:

            # Génération email professionnel
            email_pro = f"{self.prenom.lower()}.{self.nom.lower()}@staffhub.fr"

            # Mot de passe temporaire
            password_temp = get_random_string(length=10)

            # Création du User Django
            user = User.objects.create_user(
                username=self.matricule,
                email=email_pro,
                password=password_temp
            )

            self.user = user

            print("Compte créé")
            print("Email pro :", email_pro)
            print("Mot de passe temporaire :", password_temp)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"
