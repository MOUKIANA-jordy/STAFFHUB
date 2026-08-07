from django.contrib import admin
from django.utils.html import format_html

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "salarie",
        "titre",
        "type_affichage",
        "priorite_affichage",
        "statut_lecture",
        "date_envoi",
    ]

    list_filter = [
        "type_notification",
        "priorite",
        "is_read",
        "date_envoi",
    ]

    search_fields = [
        "salarie__prenom",
        "salarie__nom",
        "salarie__matricule",
        "titre",
        "message",
    ]

    ordering = [
        "-date_envoi",
    ]

    readonly_fields = [
        "date_envoi",
        "updated_at",
        "read_at",
    ]

    list_select_related = [
        "salarie",
        "created_by",
    ]

    @admin.display(
        description="Type",
        ordering="type_notification",
    )
    def type_affichage(self, obj):
        return obj.get_type_notification_display()

    @admin.display(
        description="Priorité",
        ordering="priorite",
    )
    def priorite_affichage(self, obj):
        colors = {
            Notification.Priorite.BASSE: "#6b7280",
            Notification.Priorite.NORMALE: "#2563eb",
            Notification.Priorite.HAUTE: "#f59e0b",
            Notification.Priorite.URGENTE: "#dc2626",
        }

        color = colors.get(obj.priorite, "#2563eb")

        return format_html(
            '<strong style="color:{};">{}</strong>',
            color,
            obj.get_priorite_display(),
        )

    @admin.display(
        description="Statut",
        boolean=False,
        ordering="is_read",
    )
    def statut_lecture(self, obj):
        if obj.is_read:
            return format_html(
                '<span style="color:green;">Lu</span>'
            )

        return format_html(
            '<strong style="color:red;">Non lu</strong>'
        )
