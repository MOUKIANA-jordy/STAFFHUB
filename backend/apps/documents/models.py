import os
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.users.models import Salarie


def document_upload_path(
    instance,
    filename,
):
    extension = (
        os.path.splitext(filename)[1]
        .lower()
    )

    unique_name = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    return (
        f"documents/"
        f"{instance.salarie.matricule}/"
        f"{timezone.now():%Y/%m}/"
        f"{unique_name}"
    )


class Document(models.Model):

    class TypeDocument(
        models.TextChoices
    ):
        CNI = (
            "CNI",
            "Carte nationale d’identité",
        )

        PASSEPORT = (
            "PASSEPORT",
            "Passeport",
        )

        CONTRAT = (
            "CONTRAT",
            "Contrat",
        )

        DIPLOME = (
            "DIPLOME",
            "Diplôme",
        )

        PERMIS = (
            "PERMIS",
            "Permis",
        )

        RIB = (
            "RIB",
            "RIB",
        )

        JUSTIFICATIF_DOMICILE = (
            "JUSTIFICATIF_DOMICILE",
            "Justificatif de domicile",
        )

        CERTIFICAT_MEDICAL = (
            "CERTIFICAT_MEDICAL",
            "Certificat médical",
        )

        AUTRE = (
            "AUTRE",
            "Autre",
        )

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="documents",
    )

    type_document = models.CharField(
        max_length=50,
        choices=TypeDocument.choices,
        db_index=True,
    )

    titre = models.CharField(
        max_length=150,
        blank=True,
        default="",
    )

    fichier = models.FileField(
        upload_to=document_upload_path,
    )

    numero = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    date_emission = models.DateField(
        null=True,
        blank=True,
    )

    date_expiration = models.DateField(
        null=True,
        blank=True,
        db_index=True,
    )

    description = models.TextField(
        blank=True,
        default="",
    )

    archive = models.BooleanField(
        default=False,
        db_index=True,
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents_importes",
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-uploaded_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "salarie",
                    "type_document",
                ],
            ),
            models.Index(
                fields=[
                    "salarie",
                    "archive",
                ],
            ),
        ]

    @property
    def nom_fichier(self):
        if not self.fichier:
            return ""

        return os.path.basename(
            self.fichier.name
        )

    @property
    def extension(self):
        return (
            os.path.splitext(
                self.nom_fichier
            )[1]
            .lower()
        )

    @property
    def taille(self):
        if not self.fichier:
            return 0

        try:
            return self.fichier.size

        except (
            OSError,
            ValueError,
        ):
            return 0

    @property
    def est_expire(self):
        return bool(
            self.date_expiration
            and self.date_expiration
            < timezone.localdate()
        )

    def __str__(self):
        return (
            f"{self.get_type_document_display()} "
            f"- {self.salarie}"
        )
