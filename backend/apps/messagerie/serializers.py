import os

from django.db import transaction
from rest_framework import serializers

from apps.users.models import Salarie

from .models import (
    Conversation,
    ConversationParticipant,
    Message,
    PieceJointe,
)


class ParticipantSerializer(serializers.ModelSerializer):
    salarie_nom = serializers.SerializerMethodField()
    matricule = serializers.CharField(
        source="salarie.matricule",
        read_only=True,
    )
    role = serializers.CharField(
        source="salarie.role",
        read_only=True,
    )

    class Meta:
        model = ConversationParticipant

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "matricule",
            "role",
            "is_admin",
            "last_read_at",
            "joined_at",
        ]

        read_only_fields = [
            "id",
            "salarie_nom",
            "matricule",
            "role",
            "last_read_at",
            "joined_at",
        ]

    def get_salarie_nom(self, obj):
        return f"{obj.salarie.prenom} {obj.salarie.nom}".strip()


class PieceJointeSerializer(serializers.ModelSerializer):
    nom_fichier = serializers.SerializerMethodField()
    extension = serializers.SerializerMethodField()
    taille = serializers.IntegerField(read_only=True)

    class Meta:
        model = PieceJointe

        fields = [
            "id",
            "message",
            "fichier",
            "nom_fichier",
            "extension",
            "taille",
            "uploaded_at",
        ]

        read_only_fields = [
            "id",
            "message",
            "nom_fichier",
            "extension",
            "taille",
            "uploaded_at",
        ]

    def get_nom_fichier(self, obj):
        if not obj.fichier:
            return ""

        return os.path.basename(obj.fichier.name)

    def get_extension(self, obj):
        if not obj.fichier:
            return ""

        return os.path.splitext(obj.fichier.name)[1].lower()

    def validate_fichier(self, fichier):
        max_size = 10 * 1024 * 1024

        if fichier.size > max_size:
            raise serializers.ValidationError(
                "La pièce jointe ne doit pas dépasser 10 Mo."
            )

        extension = os.path.splitext(
            fichier.name
        )[1].lower()

        allowed_extensions = {
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".txt",
        }

        if extension not in allowed_extensions:
            raise serializers.ValidationError(
                "Formats autorisés : PDF, JPG, PNG, DOC, DOCX, "
                "XLS, XLSX et TXT."
            )

        return fichier


class MessageSerializer(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()

    auteur_matricule = serializers.CharField(
        source="auteur.matricule",
        read_only=True,
    )

    pieces_jointes = PieceJointeSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Message

        fields = [
            "id",
            "conversation",
            "auteur",
            "auteur_nom",
            "auteur_matricule",
            "contenu",
            "is_edited",
            "pieces_jointes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "auteur",
            "auteur_nom",
            "auteur_matricule",
            "is_edited",
            "pieces_jointes",
            "created_at",
            "updated_at",
        ]

    def get_auteur_nom(self, obj):
        return f"{obj.auteur.prenom} {obj.auteur.nom}".strip()

    def validate_contenu(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Le message ne peut pas être vide."
            )

        if len(value) > 5000:
            raise serializers.ValidationError(
                "Le message ne doit pas dépasser 5 000 caractères."
            )

        return value

    def validate(self, attrs):
        request = self.context.get("request")
        conversation = attrs.get(
            "conversation",
            getattr(self.instance, "conversation", None),
        )

        if not request or not request.user.is_authenticated:
            return attrs

        salarie = getattr(request.user, "salarie", None)

        if not salarie:
            raise serializers.ValidationError(
                "Aucun profil salarié n’est associé à ce compte."
            )

        if conversation and not conversation.participants.filter(
            salarie=salarie
        ).exists():
            raise serializers.ValidationError({
                "conversation": (
                    "Vous ne participez pas à cette conversation."
                )
            })

        if conversation and not conversation.active:
            raise serializers.ValidationError({
                "conversation": (
                    "Cette conversation est inactive."
                )
            })

        return attrs


class ConversationListSerializer(serializers.ModelSerializer):
    cree_par_nom = serializers.SerializerMethodField()
    participants_count = serializers.IntegerField(
        read_only=True,
    )
    dernier_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation

        fields = [
            "id",
            "sujet",
            "type_conversation",
            "cree_par",
            "cree_par_nom",
            "active",
            "participants_count",
            "dernier_message",
            "messages_non_lus",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "cree_par",
            "cree_par_nom",
            "participants_count",
            "dernier_message",
            "created_at",
            "updated_at",
        ]

    def get_cree_par_nom(self, obj):
        if not obj.cree_par:
            return None

        return f"{obj.cree_par.prenom} {obj.cree_par.nom}".strip()

    def get_dernier_message(self, obj):
        message = obj.messages.order_by("-created_at").first()

        if not message:
            return None

        return {
            "id": message.id,
            "contenu": message.contenu[:120],
            "auteur": (
                f"{message.auteur.prenom} "
                f"{message.auteur.nom}"
            ).strip(),
            "created_at": message.created_at,
        }


class ConversationDetailSerializer(serializers.ModelSerializer):
    cree_par_nom = serializers.SerializerMethodField()

    participants = ParticipantSerializer(
        many=True,
        read_only=True,
    )

    messages = MessageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Conversation

        fields = [
            "id",
            "sujet",
            "type_conversation",
            "cree_par",
            "cree_par_nom",
            "active",
            "participants",
            "messages",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "cree_par",
            "cree_par_nom",
            "participants",
            "messages",
            "created_at",
            "updated_at",
        ]

    def get_cree_par_nom(self, obj):
        if not obj.cree_par:
            return None

        return f"{obj.cree_par.prenom} {obj.cree_par.nom}".strip()


class ConversationCreateSerializer(serializers.ModelSerializer):
    participants_ids = serializers.PrimaryKeyRelatedField(
        queryset=Salarie.objects.all(),
        many=True,
        write_only=True,
    )

    class Meta:
        model = Conversation

        fields = [
            "id",
            "sujet",
            "type_conversation",
            "participants_ids",
            "active",
        ]

        read_only_fields = [
            "id",
            "active",
        ]

    def validate_participants_ids(self, participants):
        if not participants:
            raise serializers.ValidationError(
                "Sélectionnez au moins un participant."
            )

        participant_ids = [
            participant.id
            for participant in participants
        ]

        if len(participant_ids) != len(set(participant_ids)):
            raise serializers.ValidationError(
                "Un participant ne peut pas être ajouté plusieurs fois."
            )

        return participants

    def validate(self, attrs):
        request = self.context.get("request")
        participants = attrs.get("participants_ids", [])
        type_conversation = attrs.get(
            "type_conversation",
            Conversation.TypeConversation.PRIVE,
        )

        current_salarie = getattr(
            request.user,
            "salarie",
            None,
        ) if request else None

        if not current_salarie:
            raise serializers.ValidationError(
                "Aucun profil salarié n’est associé à ce compte."
            )

        total_participants = {
            participant.id
            for participant in participants
        }

        total_participants.add(current_salarie.id)

        if (
            type_conversation == Conversation.TypeConversation.PRIVE
            and len(total_participants) != 2
        ):
            raise serializers.ValidationError({
                "participants_ids": (
                    "Une conversation privée doit contenir "
                    "exactement deux participants."
                )
            })

        if (
            type_conversation == Conversation.TypeConversation.GROUPE
            and len(total_participants) < 3
        ):
            raise serializers.ValidationError({
                "participants_ids": (
                    "Une conversation de groupe doit contenir "
                    "au moins trois participants."
                )
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        participants = validated_data.pop(
            "participants_ids"
        )

        request = self.context["request"]
        createur = request.user.salarie

        conversation = Conversation.objects.create(
            cree_par=createur,
            **validated_data,
        )

        participant_ids = {
            participant.id
            for participant in participants
        }

        participant_ids.add(createur.id)

        salaries = Salarie.objects.filter(
            id__in=participant_ids
        )

        ConversationParticipant.objects.bulk_create([
            ConversationParticipant(
                conversation=conversation,
                salarie=salarie,
                is_admin=salarie.id == createur.id,
            )
            for salarie in salaries
        ])

        return conversation
