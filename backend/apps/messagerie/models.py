from django.db import models
from django.utils import timezone

from apps.users.models import Salarie


class Conversation(models.Model):

    class TypeConversation(models.TextChoices):
        PRIVE = "PRIVE", "Privée"
        GROUPE = "GROUPE", "Groupe"
        RH = "RH", "RH"

    sujet = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    type_conversation = models.CharField(
        max_length=20,
        choices=TypeConversation.choices,
        default=TypeConversation.PRIVE,
    )

    cree_par = models.ForeignKey(
        Salarie,
        on_delete=models.SET_NULL,
        null=True,
        related_name="conversations_creees",
    )

    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.sujet or f"Conversation {self.id}"


class ConversationParticipant(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="participants",
    )

    salarie = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="conversations",
    )

    is_admin = models.BooleanField(default=False)

    last_read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "conversation",
            "salarie",
        )

    def __str__(self):
        return f"{self.salarie} - {self.conversation}"


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    auteur = models.ForeignKey(
        Salarie,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    contenu = models.TextField()

    is_edited = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return self.contenu[:50]


class PieceJointe(models.Model):

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name="pieces_jointes",
    )

    fichier = models.FileField(
        upload_to="messagerie/",
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    @property
    def taille(self):
        try:
            return self.fichier.size
        except Exception:
            return 0

    def __str__(self):
        return self.fichier.name
