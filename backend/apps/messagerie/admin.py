from django.contrib import admin

from .models import (
    Conversation,
    ConversationParticipant,
    Message,
    PieceJointe,
)


class ParticipantInline(admin.TabularInline):
    model = ConversationParticipant
    extra = 0


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "sujet",
        "type_conversation",
        "cree_par",
        "active",
        "created_at",
        "updated_at",
    ]

    list_filter = [
        "type_conversation",
        "active",
        "created_at",
    ]

    search_fields = [
        "sujet",
        "cree_par__nom",
        "cree_par__prenom",
    ]

    ordering = [
        "-updated_at",
    ]

    inlines = [
        ParticipantInline,
    ]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "conversation",
        "auteur",
        "contenu_court",
        "is_edited",
        "created_at",
    ]

    list_filter = [
        "is_edited",
        "created_at",
    ]

    search_fields = [
        "contenu",
        "auteur__nom",
        "auteur__prenom",
        "conversation__sujet",
    ]

    ordering = [
        "-created_at",
    ]

    def contenu_court(self, obj):
        if len(obj.contenu) <= 60:
            return obj.contenu

        return f"{obj.contenu[:60]}..."

    contenu_court.short_description = "Message"


@admin.register(PieceJointe)
class PieceJointeAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "message",
        "fichier",
        "taille",
        "uploaded_at",
    ]

    ordering = [
        "-uploaded_at",
    ]
