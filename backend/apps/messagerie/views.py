from django.db.models import Count, Max, Q
from django.utils import timezone

from rest_framework import filters, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.models import Notification

from .models import (
    Conversation,
    ConversationParticipant,
    Message,
    PieceJointe,
)

from .permissions import (
    IsConversationParticipant,
    IsMessageOwnerOrParticipant,
)

from .serializers import (
    ConversationCreateSerializer,
    ConversationDetailSerializer,
    ConversationListSerializer,
    MessageSerializer,
    PieceJointeSerializer,
)


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "sujet",
        "messages__contenu",
        "participants__salarie__nom",
        "participants__salarie__prenom",
    ]

    ordering_fields = [
        "created_at",
        "updated_at",
    ]

    ordering = ["-updated_at"]

    def get_queryset(self):
        user = self.request.user
        salarie = getattr(user, "salarie", None)

        if not salarie:
            return Conversation.objects.none()

        return (
            Conversation.objects
            .filter(
                participants__salarie=salarie,
                active=True,
            )
            .select_related("cree_par")
            .prefetch_related(
                "participants__salarie",
                "messages__auteur",
                "messages__pieces_jointes",
            )
            .annotate(
                participants_count=Count(
                    "participants",
                    distinct=True,
                ),
                dernier_message_date=Max(
                    "messages__created_at",
                ),
            )
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ConversationCreateSerializer

        if self.action == "retrieve":
            return ConversationDetailSerializer

        return ConversationListSerializer

    def get_permissions(self):
        if self.action in [
            "retrieve",
            "update",
            "partial_update",
            "destroy",
            "messages",
            "marquer_lue",
        ]:
            permission_classes = [
                IsAuthenticated,
                IsConversationParticipant,
            ]
        else:
            permission_classes = [
                IsAuthenticated,
            ]

        return [
            permission()
            for permission in permission_classes
        ]

    @action(
        detail=True,
        methods=["get"],
        url_path="messages",
    )
    def messages(self, request, pk=None):
        conversation = self.get_object()

        queryset = (
            conversation.messages
            .select_related("auteur")
            .prefetch_related("pieces_jointes")
            .order_by("created_at")
        )

        serializer = MessageSerializer(
            queryset,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        url_path="marquer-lue",
    )
    def marquer_lue(self, request, pk=None):
        conversation = self.get_object()

        salarie = getattr(
            request.user,
            "salarie",
            None,
        )

        if not salarie:
            return Response(
                {
                    "detail": (
                        "Aucun profil salarié associé "
                        "à ce compte."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            participant = ConversationParticipant.objects.get(
                conversation=conversation,
                salarie=salarie,
            )

        except ConversationParticipant.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Vous ne participez pas "
                        "à cette conversation."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        participant.last_read_at = timezone.now()

        participant.save(
            update_fields=[
                "last_read_at",
            ]
        )

        return Response(
            {
                "message": (
                    "Conversation marquée comme lue."
                ),
                "last_read_at": participant.last_read_at,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="quitter",
    )
    def quitter(self, request, pk=None):
        conversation = self.get_object()

        salarie = getattr(
            request.user,
            "salarie",
            None,
        )

        if not salarie:
            return Response(
                {
                    "detail": (
                        "Aucun profil salarié associé "
                        "à ce compte."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        participant = ConversationParticipant.objects.filter(
            conversation=conversation,
            salarie=salarie,
        ).first()

        if not participant:
            return Response(
                {
                    "detail": (
                        "Vous ne participez pas "
                        "à cette conversation."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if conversation.cree_par_id == salarie.id:
            return Response(
                {
                    "detail": (
                        "Le créateur ne peut pas quitter "
                        "la conversation pour le moment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        participant.delete()

        return Response(
            {
                "message": "Vous avez quitté la conversation."
            },
            status=status.HTTP_200_OK,
        )


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer

    permission_classes = [
        IsAuthenticated,
        IsMessageOwnerOrParticipant,
    ]

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "contenu",
        "auteur__nom",
        "auteur__prenom",
    ]

    ordering_fields = [
        "created_at",
        "updated_at",
    ]

    ordering = ["created_at"]

    def get_queryset(self):
        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if not salarie:
            return Message.objects.none()

        return (
            Message.objects
            .filter(
                conversation__participants__salarie=salarie,
            )
            .select_related(
                "conversation",
                "auteur",
            )
            .prefetch_related(
                "pieces_jointes",
            )
            .distinct()
        )

    def perform_create(self, serializer):
        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if not salarie:
            raise serializers.ValidationError(
                "Aucun profil salarié n’est associé à ce compte."
            )

        conversation = serializer.validated_data[
            "conversation"
        ]

        if not ConversationParticipant.objects.filter(
            conversation=conversation,
            salarie=salarie,
        ).exists():
            raise serializers.ValidationError({
                "conversation": (
                    "Vous ne participez pas "
                    "à cette conversation."
                )
            })

        if not conversation.active:
            raise serializers.ValidationError({
                "conversation": (
                    "Cette conversation est inactive."
                )
            })

        message = serializer.save(
            auteur=salarie,
        )

        Conversation.objects.filter(
            pk=conversation.pk
        ).update(
            updated_at=timezone.now(),
        )

        recipients = (
            ConversationParticipant.objects
            .filter(
                conversation=conversation,
            )
            .exclude(
                salarie=salarie,
            )
            .select_related("salarie")
        )

        notifications = []

        for participant in recipients:
            notifications.append(
                Notification(
                    salarie=participant.salarie,
                    titre="Nouveau message",
                    message=(
                        f"{salarie.prenom} {salarie.nom} "
                        "vous a envoyé un message."
                    ),
                    type_notification=(
                        Notification.TypeNotification.INFO
                    ),
                    priorite=(
                        Notification.Priorite.NORMALE
                    ),
                    lien=(
                        f"/home/messagerie"
                        f"?conversation={conversation.id}"
                    ),
                    created_by=self.request.user,
                )
            )

        if notifications:
            Notification.objects.bulk_create(
                notifications
            )

        return message

    def perform_update(self, serializer):
        message = self.get_object()

        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if message.auteur_id != getattr(
            salarie,
            "id",
            None,
        ):
            raise serializers.ValidationError(
                "Vous ne pouvez modifier que vos propres messages."
            )

        serializer.save(
            is_edited=True,
        )

    def perform_destroy(self, instance):
        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if instance.auteur_id != getattr(
            salarie,
            "id",
            None,
        ):
            raise serializers.ValidationError(
                "Vous ne pouvez supprimer que vos propres messages."
            )

        instance.delete()


class PieceJointeViewSet(viewsets.ModelViewSet):
    serializer_class = PieceJointeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if not salarie:
            return PieceJointe.objects.none()

        return (
            PieceJointe.objects
            .filter(
                message__conversation__participants__salarie=salarie,
            )
            .select_related(
                "message",
                "message__conversation",
                "message__auteur",
            )
            .distinct()
        )

    def perform_create(self, serializer):
        message_id = self.request.data.get(
            "message"
        )

        if not message_id:
            raise serializers.ValidationError({
                "message": "Le message est obligatoire."
            })

        salarie = getattr(
            self.request.user,
            "salarie",
            None,
        )

        if not salarie:
            raise serializers.ValidationError(
                "Aucun profil salarié n’est associé à ce compte."
            )

        try:
            message = (
                Message.objects
                .select_related("conversation")
                .get(pk=message_id)
            )

        except Message.DoesNotExist as error:
            raise serializers.ValidationError({
                "message": "Le message n’existe pas."
            }) from error

        participant_exists = (
            ConversationParticipant.objects
            .filter(
                conversation=message.conversation,
                salarie=salarie,
            )
            .exists()
        )

        if not participant_exists:
            raise serializers.ValidationError({
                "message": (
                    "Vous n’avez pas accès "
                    "à ce message."
                )
            })

        if message.auteur_id != salarie.id:
            raise serializers.ValidationError({
                "message": (
                    "Vous pouvez ajouter une pièce jointe "
                    "uniquement à votre propre message."
                )
            })

        serializer.save(
            message=message,
        )
