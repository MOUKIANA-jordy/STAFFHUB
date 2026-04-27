from django.db import models
from apps.users.models import Salarie



class Dossier(models.Model):
    salarie = models.OneToOneField(Salarie, on_delete=models.CASCADE, related_name="dossier")

    # Etat civil
    date_naissance = models.DateField(null=True, blank=True)
    lieu_naissance = models.CharField(max_length=150, blank=True)

    # Numéro sécurité sociale
    numero_secu = models.CharField(max_length=20, unique=True)

    # Adresse
    adresse = models.TextField()
    ville = models.CharField(max_length=100, default="Paris")
    pays = models.CharField(max_length=100, default="France")

    # Banque
    iban = models.CharField(max_length=34)

    # Famille / contact urgence
    contact_nom = models.CharField(max_length=100, blank=True)
    contact_telephone = models.CharField(max_length=20, blank=True)
    lien_familial = models.CharField(max_length=50, blank=True)

    # Données complémentaires
    infos_complementaires = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dossier RH - {self.salarie}"


class Adresse(models.Model):
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE)

    numero = models.CharField(max_length=10)
    voie = models.CharField(max_length=255)
    code_postal = models.CharField(max_length=10)
    commune = models.CharField(max_length=100)
    pays = models.CharField(max_length=100)

    telephone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return f"{self.salarie} - {self.commune}"


class EtatCivil(models.Model):
    salarie = models.OneToOneField(Salarie, on_delete=models.CASCADE)

    numero_secu = models.CharField(max_length=20)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    sexe = models.CharField(max_length=10)
    date_naissance = models.DateField()

    def __str__(self):
        return self.nom


class Famille(models.Model):
    salarie = models.ForeignKey(Salarie, on_delete=models.CASCADE)

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    lien = models.CharField(max_length=50)
    telephone = models.CharField(max_length=20)


class Iban(models.Model):
    salarie = models.OneToOneField(Salarie, on_delete=models.CASCADE)

    iban = models.CharField(max_length=34)
    bic = models.CharField(max_length=20)
    titulaire = models.CharField(max_length=100)
