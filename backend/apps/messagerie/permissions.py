from rest_framework import permissions

from .models import ConversationParticipant


class IsConversationParticipant(permissions.BasePermission):
    """
    Seuls les participants peuvent voir une conversation.
    """

    def has_object_permission(self, request, view, obj):

        salarie = getattr(request.user, "salarie", None)

        if not salarie:
            return False

        return ConversationParticipant.objects.filter(
            conversation=obj,
            salarie=salarie,
        ).exists()


class IsMessageOwnerOrParticipant(permissions.BasePermission):
    """
    Les participants lisent les messages.
    Seul l'auteur peut modifier/supprimer son message.
    """

    def has_object_permission(self, request, view, obj):

        salarie = getattr(request.user, "salarie", None)

        if not salarie:
            return False

        if request.method in permissions.SAFE_METHODS:

            return ConversationParticipant.objects.filter(
                conversation=obj.conversation,
                salarie=salarie,
            ).exists()

        return obj.auteur == salarie
