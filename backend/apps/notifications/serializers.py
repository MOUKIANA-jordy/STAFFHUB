from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    salarie_nom = serializers.SerializerMethodField()

    type_notification_display = serializers.CharField(
        source="get_type_notification_display",
        read_only=True,
    )

    priorite_display = serializers.CharField(
        source="get_priorite_display",
        read_only=True,
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Notification

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "titre",
            "message",
            "type_notification",
            "type_notification_display",
            "priorite",
            "priorite_display",
            "lien",
            "is_read",
            "read_at",
            "created_by",
            "created_by_username",
            "date_envoi",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie_nom",
            "type_notification_display",
            "priorite_display",
            "is_read",
            "read_at",
            "created_by",
            "created_by_username",
            "date_envoi",
            "updated_at",
        ]

    def get_salarie_nom(self, obj):
        return str(obj.salarie)

    def validate_titre(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Le titre doit contenir au moins 3 caractères."
            )

        return value

    def validate_message(self, value):
        value = value.strip()

        if len(value) < 5:
            raise serializers.ValidationError(
                "Le message doit contenir au moins 5 caractères."
            )

        return value
